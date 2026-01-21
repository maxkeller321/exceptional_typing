use crate::metrics::TaskResult;
use rusqlite::{Connection, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStats {
    pub total_practice_time: i64, // milliseconds
    pub total_words_typed: i32,
    pub average_wpm: f32,
    pub average_accuracy: f32,
    pub lessons_completed: i32,
    pub current_streak: i32,
    pub longest_streak: i32,
    pub last_practice_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LessonProgress {
    pub lesson_id: String,
    pub completed_tasks: i32,
    pub total_tasks: i32,
    pub best_wpm: f32,
    pub average_accuracy: f32,
    pub last_attempted: String,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self, StorageError> {
        let db_path = Self::get_db_path()?;

        // Ensure parent directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(&db_path)?;
        let db = Database { conn };
        db.initialize_schema()?;
        Ok(db)
    }

    fn get_db_path() -> Result<PathBuf, StorageError> {
        let data_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("exceptional-typing");
        Ok(data_dir.join("data.db"))
    }

    fn initialize_schema(&self) -> SqliteResult<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS task_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id TEXT NOT NULL,
                lesson_id TEXT,
                wpm REAL NOT NULL,
                raw_wpm REAL NOT NULL,
                accuracy REAL NOT NULL,
                error_count INTEGER NOT NULL,
                duration INTEGER NOT NULL,
                completed_at INTEGER NOT NULL,
                passed INTEGER NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS problem_keys (
                key_char TEXT PRIMARY KEY,
                error_count INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS user_stats (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                total_practice_time INTEGER NOT NULL DEFAULT 0,
                total_words_typed INTEGER NOT NULL DEFAULT 0,
                total_sessions INTEGER NOT NULL DEFAULT 0,
                sum_wpm REAL NOT NULL DEFAULT 0,
                sum_accuracy REAL NOT NULL DEFAULT 0,
                lessons_completed INTEGER NOT NULL DEFAULT 0,
                current_streak INTEGER NOT NULL DEFAULT 0,
                longest_streak INTEGER NOT NULL DEFAULT 0,
                last_practice_date TEXT
            );

            CREATE TABLE IF NOT EXISTS lesson_progress (
                lesson_id TEXT PRIMARY KEY,
                completed_task_ids TEXT NOT NULL DEFAULT '',
                best_wpm REAL NOT NULL DEFAULT 0,
                sum_accuracy REAL NOT NULL DEFAULT 0,
                attempt_count INTEGER NOT NULL DEFAULT 0,
                last_attempted TEXT
            );

            INSERT OR IGNORE INTO user_stats (id) VALUES (1);

            CREATE INDEX IF NOT EXISTS idx_task_results_task ON task_results(task_id);
            CREATE INDEX IF NOT EXISTS idx_task_results_date ON task_results(completed_at);
            "
        )
    }

    pub fn save_result(&self, result: &TaskResult) -> SqliteResult<()> {
        // Insert task result
        self.conn.execute(
            "INSERT INTO task_results (task_id, wpm, raw_wpm, accuracy, error_count, duration, completed_at, passed)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            (
                &result.task_id,
                result.wpm,
                result.raw_wpm,
                result.accuracy,
                result.errors.len() as i32,
                result.duration,
                result.completed_at,
                result.passed as i32,
            ),
        )?;

        // Update problem keys
        for error in &result.errors {
            self.conn.execute(
                "INSERT INTO problem_keys (key_char, error_count) VALUES (?1, 1)
                 ON CONFLICT(key_char) DO UPDATE SET error_count = error_count + 1",
                [error.expected.to_string()],
            )?;
        }

        // Update user stats
        let word_count = (result.duration as f32 / 60000.0 * result.wpm) as i32;
        self.conn.execute(
            "UPDATE user_stats SET
                total_practice_time = total_practice_time + ?1,
                total_words_typed = total_words_typed + ?2,
                total_sessions = total_sessions + 1,
                sum_wpm = sum_wpm + ?3,
                sum_accuracy = sum_accuracy + ?4,
                last_practice_date = date('now')
             WHERE id = 1",
            (result.duration, word_count, result.wpm, result.accuracy),
        )?;

        Ok(())
    }

    pub fn get_user_stats(&self) -> SqliteResult<UserStats> {
        self.conn.query_row(
            "SELECT total_practice_time, total_words_typed, total_sessions, sum_wpm, sum_accuracy,
                    lessons_completed, current_streak, longest_streak, last_practice_date
             FROM user_stats WHERE id = 1",
            [],
            |row| {
                let total_sessions: i32 = row.get(2)?;
                let sum_wpm: f32 = row.get(3)?;
                let sum_accuracy: f32 = row.get(4)?;

                Ok(UserStats {
                    total_practice_time: row.get(0)?,
                    total_words_typed: row.get(1)?,
                    average_wpm: if total_sessions > 0 { sum_wpm / total_sessions as f32 } else { 0.0 },
                    average_accuracy: if total_sessions > 0 { sum_accuracy / total_sessions as f32 } else { 0.0 },
                    lessons_completed: row.get(5)?,
                    current_streak: row.get(6)?,
                    longest_streak: row.get(7)?,
                    last_practice_date: row.get(8)?,
                })
            },
        )
    }

    pub fn get_lesson_progress(&self, lesson_id: &str) -> SqliteResult<Option<LessonProgress>> {
        match self.conn.query_row(
            "SELECT lesson_id, completed_task_ids, best_wpm, sum_accuracy, attempt_count, last_attempted
             FROM lesson_progress WHERE lesson_id = ?1",
            [lesson_id],
            |row| {
                let completed_task_ids: String = row.get(1)?;
                let completed_count = if completed_task_ids.is_empty() {
                    0
                } else {
                    completed_task_ids.split(',').count() as i32
                };
                let attempt_count: i32 = row.get(4)?;
                let sum_accuracy: f32 = row.get(3)?;

                Ok(LessonProgress {
                    lesson_id: row.get(0)?,
                    completed_tasks: completed_count,
                    total_tasks: 0, // Will be filled in by caller
                    best_wpm: row.get(2)?,
                    average_accuracy: if attempt_count > 0 { sum_accuracy / attempt_count as f32 } else { 0.0 },
                    last_attempted: row.get::<_, Option<String>>(5)?.unwrap_or_default(),
                })
            },
        ) {
            Ok(progress) => Ok(Some(progress)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn get_problem_keys(&self, limit: usize) -> SqliteResult<Vec<(String, i32)>> {
        let mut stmt = self.conn.prepare(
            "SELECT key_char, error_count FROM problem_keys ORDER BY error_count DESC LIMIT ?1"
        )?;

        let rows = stmt.query_map([limit as i32], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?;

        rows.collect()
    }

    #[allow(dead_code)]
    pub fn get_recent_results(&self, limit: usize) -> SqliteResult<Vec<TaskResult>> {
        let mut stmt = self.conn.prepare(
            "SELECT task_id, wpm, raw_wpm, accuracy, error_count, duration, completed_at, passed
             FROM task_results ORDER BY completed_at DESC LIMIT ?1"
        )?;

        let rows = stmt.query_map([limit as i32], |row| {
            Ok(TaskResult {
                task_id: row.get(0)?,
                wpm: row.get(1)?,
                raw_wpm: row.get(2)?,
                accuracy: row.get(3)?,
                errors: vec![], // Not stored individually for performance
                duration: row.get(5)?,
                completed_at: row.get(6)?,
                passed: row.get::<_, i32>(7)? != 0,
            })
        })?;

        rows.collect()
    }
}
