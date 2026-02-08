use crate::models::*;
use rusqlite::{params, Connection, Result as SqliteResult};
use serde_json;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new() -> Result<Self, StorageError> {
        let db_path = Self::get_db_path()?;
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        let conn = Connection::open(&db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
        let db = Database { conn };
        db.migrate()?;
        Ok(db)
    }

    #[cfg(test)]
    pub fn in_memory() -> Result<Self, StorageError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch("PRAGMA foreign_keys=ON;")?;
        let db = Database { conn };
        db.migrate()?;
        Ok(db)
    }

    fn get_db_path() -> Result<PathBuf, StorageError> {
        let data_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("exceptional-typing");
        Ok(data_dir.join("data.db"))
    }

    // ── Schema Migration ──────────────────────────────────────────

    fn get_schema_version(&self) -> i64 {
        self.conn
            .query_row(
                "SELECT version FROM schema_version ORDER BY version DESC LIMIT 1",
                [],
                |row| row.get(0),
            )
            .unwrap_or(0)
    }

    fn migrate(&self) -> SqliteResult<()> {
        // Create version table if not exists
        self.conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER NOT NULL,
                applied_at TEXT DEFAULT (datetime('now'))
            );"
        )?;

        let version = self.get_schema_version();

        if version < 1 {
            self.migrate_to_v1()?;
        }

        Ok(())
    }

    fn migrate_to_v1(&self) -> SqliteResult<()> {
        self.conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                avatar TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_active_at TEXT
            );

            CREATE TABLE IF NOT EXISTS user_settings (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                settings_json TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS user_stats (
                user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                total_practice_time INTEGER DEFAULT 0,
                total_words_typed INTEGER DEFAULT 0,
                average_wpm REAL DEFAULT 0,
                average_accuracy REAL DEFAULT 0,
                average_true_accuracy REAL DEFAULT 0,
                total_keystrokes INTEGER DEFAULT 0,
                total_backspaces INTEGER DEFAULT 0,
                total_correct_keystrokes INTEGER DEFAULT 0,
                lessons_completed INTEGER DEFAULT 0,
                current_streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                last_practice_date TEXT
            );

            CREATE TABLE IF NOT EXISTS problem_keys (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                key_char TEXT NOT NULL,
                error_count INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, key_char)
            );

            CREATE TABLE IF NOT EXISTS lesson_progress (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL,
                completed_tasks INTEGER DEFAULT 0,
                total_tasks INTEGER DEFAULT 0,
                best_wpm REAL DEFAULT 0,
                average_accuracy REAL DEFAULT 0,
                last_task_index INTEGER,
                task_results_json TEXT DEFAULT '[]',
                PRIMARY KEY (user_id, lesson_id)
            );

            CREATE TABLE IF NOT EXISTS course_progress (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                course_id TEXT NOT NULL,
                current_stage_id TEXT,
                completed_stages_json TEXT DEFAULT '[]',
                skipped_stages_json TEXT DEFAULT '[]',
                enrolled_at TEXT NOT NULL,
                completed_at TEXT,
                PRIMARY KEY (user_id, course_id)
            );

            CREATE TABLE IF NOT EXISTS custom_snippets (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                language TEXT,
                mode TEXT DEFAULT 'text',
                created_at TEXT NOT NULL,
                practice_count INTEGER DEFAULT 0,
                best_wpm REAL,
                best_accuracy REAL
            );

            CREATE TABLE IF NOT EXISTS daily_test_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                wpm REAL NOT NULL,
                accuracy REAL NOT NULL,
                true_accuracy REAL NOT NULL,
                duration INTEGER NOT NULL,
                completed_at INTEGER NOT NULL,
                UNIQUE(user_id, date)
            );

            CREATE TABLE IF NOT EXISTS daily_activity (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                practice_time INTEGER DEFAULT 0,
                characters INTEGER DEFAULT 0,
                sessions INTEGER DEFAULT 0,
                PRIMARY KEY (user_id, date)
            );

            CREATE INDEX IF NOT EXISTS idx_snippets_user ON custom_snippets(user_id);
            CREATE INDEX IF NOT EXISTS idx_daily_results_user ON daily_test_results(user_id);

            INSERT INTO schema_version (version) VALUES (1);
            "
        )
    }

    // ── Users ─────────────────────────────────────────────────────

    pub fn get_all_users(&self) -> SqliteResult<Vec<UserProfile>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, name, avatar, created_at, last_active_at FROM users ORDER BY id"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(UserProfile {
                id: row.get(0)?,
                name: row.get(1)?,
                avatar: row.get(2)?,
                created_at: row.get(3)?,
                last_active_at: row.get(4)?,
            })
        })?;
        rows.collect()
    }

    pub fn create_user(&self, id: i64, name: &str, avatar: &str, created_at: &str) -> SqliteResult<()> {
        self.conn.execute(
            "INSERT INTO users (id, name, avatar, created_at) VALUES (?1, ?2, ?3, ?4)",
            params![id, name, avatar, created_at],
        )?;
        Ok(())
    }

    pub fn update_user(&self, user_id: i64, name: Option<&str>, avatar: Option<&str>, last_active_at: Option<&str>) -> SqliteResult<()> {
        if let Some(n) = name {
            self.conn.execute("UPDATE users SET name = ?1 WHERE id = ?2", params![n, user_id])?;
        }
        if let Some(a) = avatar {
            self.conn.execute("UPDATE users SET avatar = ?1 WHERE id = ?2", params![a, user_id])?;
        }
        if let Some(t) = last_active_at {
            self.conn.execute("UPDATE users SET last_active_at = ?1 WHERE id = ?2", params![t, user_id])?;
        }
        Ok(())
    }

    pub fn delete_user(&self, user_id: i64) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM users WHERE id = ?1", params![user_id])?;
        Ok(())
    }

    // ── Settings ──────────────────────────────────────────────────

    pub fn get_settings(&self, user_id: i64) -> SqliteResult<Option<String>> {
        match self.conn.query_row(
            "SELECT settings_json FROM user_settings WHERE user_id = ?1",
            params![user_id],
            |row| row.get::<_, String>(0),
        ) {
            Ok(json) => Ok(Some(json)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn save_settings(&self, user_id: i64, settings_json: &str) -> SqliteResult<()> {
        self.conn.execute(
            "INSERT INTO user_settings (user_id, settings_json) VALUES (?1, ?2)
             ON CONFLICT(user_id) DO UPDATE SET settings_json = excluded.settings_json",
            params![user_id, settings_json],
        )?;
        Ok(())
    }

    // ── User Stats ────────────────────────────────────────────────

    pub fn get_user_stats(&self, user_id: i64) -> SqliteResult<Option<UserStatsRow>> {
        let stats = match self.conn.query_row(
            "SELECT total_practice_time, total_words_typed, average_wpm, average_accuracy,
                    average_true_accuracy, total_keystrokes, total_backspaces, total_correct_keystrokes,
                    lessons_completed, current_streak, longest_streak, last_practice_date
             FROM user_stats WHERE user_id = ?1",
            params![user_id],
            |row| {
                Ok(UserStatsRow {
                    total_practice_time: row.get(0)?,
                    total_words_typed: row.get(1)?,
                    average_wpm: row.get(2)?,
                    average_accuracy: row.get(3)?,
                    average_true_accuracy: row.get(4)?,
                    total_keystrokes: row.get(5)?,
                    total_backspaces: row.get(6)?,
                    total_correct_keystrokes: row.get(7)?,
                    lessons_completed: row.get(8)?,
                    current_streak: row.get(9)?,
                    longest_streak: row.get(10)?,
                    last_practice_date: row.get(11)?,
                    problem_keys: vec![], // filled below
                })
            },
        ) {
            Ok(mut s) => {
                s.problem_keys = self.get_problem_keys(user_id)?;
                Some(s)
            }
            Err(rusqlite::Error::QueryReturnedNoRows) => None,
            Err(e) => return Err(e),
        };
        Ok(stats)
    }

    pub fn save_user_stats(&self, user_id: i64, stats: &UserStatsRow) -> SqliteResult<()> {
        self.conn.execute(
            "INSERT INTO user_stats (user_id, total_practice_time, total_words_typed, average_wpm,
                average_accuracy, average_true_accuracy, total_keystrokes, total_backspaces,
                total_correct_keystrokes, lessons_completed, current_streak, longest_streak, last_practice_date)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
             ON CONFLICT(user_id) DO UPDATE SET
                total_practice_time = excluded.total_practice_time,
                total_words_typed = excluded.total_words_typed,
                average_wpm = excluded.average_wpm,
                average_accuracy = excluded.average_accuracy,
                average_true_accuracy = excluded.average_true_accuracy,
                total_keystrokes = excluded.total_keystrokes,
                total_backspaces = excluded.total_backspaces,
                total_correct_keystrokes = excluded.total_correct_keystrokes,
                lessons_completed = excluded.lessons_completed,
                current_streak = excluded.current_streak,
                longest_streak = excluded.longest_streak,
                last_practice_date = excluded.last_practice_date",
            params![
                user_id,
                stats.total_practice_time,
                stats.total_words_typed,
                stats.average_wpm,
                stats.average_accuracy,
                stats.average_true_accuracy,
                stats.total_keystrokes,
                stats.total_backspaces,
                stats.total_correct_keystrokes,
                stats.lessons_completed,
                stats.current_streak,
                stats.longest_streak,
                stats.last_practice_date,
            ],
        )?;

        // Save problem keys
        self.save_problem_keys(user_id, &stats.problem_keys)?;

        Ok(())
    }

    fn get_problem_keys(&self, user_id: i64) -> SqliteResult<Vec<(String, i64)>> {
        let mut stmt = self.conn.prepare(
            "SELECT key_char, error_count FROM problem_keys WHERE user_id = ?1 ORDER BY error_count DESC"
        )?;
        let rows = stmt.query_map(params![user_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
        })?;
        rows.collect()
    }

    fn save_problem_keys(&self, user_id: i64, keys: &[(String, i64)]) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM problem_keys WHERE user_id = ?1", params![user_id])?;
        let mut stmt = self.conn.prepare(
            "INSERT INTO problem_keys (user_id, key_char, error_count) VALUES (?1, ?2, ?3)"
        )?;
        for (key, count) in keys {
            stmt.execute(params![user_id, key, count])?;
        }
        Ok(())
    }

    // ── Lesson Progress ───────────────────────────────────────────

    pub fn get_all_lesson_progress(&self, user_id: i64) -> SqliteResult<Vec<LessonProgressRow>> {
        let mut stmt = self.conn.prepare(
            "SELECT lesson_id, completed_tasks, total_tasks, best_wpm, average_accuracy,
                    last_task_index, task_results_json
             FROM lesson_progress WHERE user_id = ?1"
        )?;
        let rows = stmt.query_map(params![user_id], |row| {
            Ok(LessonProgressRow {
                lesson_id: row.get(0)?,
                completed_tasks: row.get(1)?,
                total_tasks: row.get(2)?,
                best_wpm: row.get(3)?,
                average_accuracy: row.get(4)?,
                last_task_index: row.get(5)?,
                task_results_json: row.get(6)?,
            })
        })?;
        rows.collect()
    }

    pub fn save_lesson_progress(&self, user_id: i64, progress: &[LessonProgressRow]) -> SqliteResult<()> {
        // Replace all progress for this user
        self.conn.execute("DELETE FROM lesson_progress WHERE user_id = ?1", params![user_id])?;
        let mut stmt = self.conn.prepare(
            "INSERT INTO lesson_progress (user_id, lesson_id, completed_tasks, total_tasks,
                best_wpm, average_accuracy, last_task_index, task_results_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
        )?;
        for p in progress {
            stmt.execute(params![
                user_id,
                p.lesson_id,
                p.completed_tasks,
                p.total_tasks,
                p.best_wpm,
                p.average_accuracy,
                p.last_task_index,
                p.task_results_json,
            ])?;
        }
        Ok(())
    }

    // ── Course Progress ───────────────────────────────────────────

    pub fn get_all_course_progress(&self, user_id: i64) -> SqliteResult<Vec<CourseProgressRow>> {
        let mut stmt = self.conn.prepare(
            "SELECT course_id, current_stage_id, completed_stages_json, skipped_stages_json,
                    enrolled_at, completed_at
             FROM course_progress WHERE user_id = ?1"
        )?;
        let rows = stmt.query_map(params![user_id], |row| {
            Ok(CourseProgressRow {
                course_id: row.get(0)?,
                current_stage_id: row.get(1)?,
                completed_stages_json: row.get(2)?,
                skipped_stages_json: row.get(3)?,
                enrolled_at: row.get(4)?,
                completed_at: row.get(5)?,
            })
        })?;
        rows.collect()
    }

    pub fn save_course_progress(&self, user_id: i64, progress: &[CourseProgressRow]) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM course_progress WHERE user_id = ?1", params![user_id])?;
        let mut stmt = self.conn.prepare(
            "INSERT INTO course_progress (user_id, course_id, current_stage_id, completed_stages_json,
                skipped_stages_json, enrolled_at, completed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
        )?;
        for p in progress {
            stmt.execute(params![
                user_id,
                p.course_id,
                p.current_stage_id,
                p.completed_stages_json,
                p.skipped_stages_json,
                p.enrolled_at,
                p.completed_at,
            ])?;
        }
        Ok(())
    }

    pub fn delete_course_progress(&self, user_id: i64, course_id: &str) -> SqliteResult<()> {
        self.conn.execute(
            "DELETE FROM course_progress WHERE user_id = ?1 AND course_id = ?2",
            params![user_id, course_id],
        )?;
        Ok(())
    }

    pub fn delete_all_course_progress(&self, user_id: i64) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM course_progress WHERE user_id = ?1", params![user_id])?;
        Ok(())
    }

    // ── Custom Snippets ───────────────────────────────────────────

    pub fn get_snippets(&self, user_id: i64) -> SqliteResult<Vec<CustomSnippetRow>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, user_id, name, content, language, mode, created_at,
                    practice_count, best_wpm, best_accuracy
             FROM custom_snippets WHERE user_id = ?1 ORDER BY created_at"
        )?;
        let rows = stmt.query_map(params![user_id], |row| {
            Ok(CustomSnippetRow {
                id: row.get(0)?,
                user_id: row.get(1)?,
                name: row.get(2)?,
                content: row.get(3)?,
                language: row.get(4)?,
                mode: row.get(5)?,
                created_at: row.get(6)?,
                practice_count: row.get(7)?,
                best_wpm: row.get(8)?,
                best_accuracy: row.get(9)?,
            })
        })?;
        rows.collect()
    }

    pub fn save_snippets(&self, user_id: i64, snippets: &[CustomSnippetRow]) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM custom_snippets WHERE user_id = ?1", params![user_id])?;
        let mut stmt = self.conn.prepare(
            "INSERT INTO custom_snippets (id, user_id, name, content, language, mode,
                created_at, practice_count, best_wpm, best_accuracy)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)"
        )?;
        for s in snippets {
            stmt.execute(params![
                s.id, s.user_id, s.name, s.content, s.language, s.mode,
                s.created_at, s.practice_count, s.best_wpm, s.best_accuracy,
            ])?;
        }
        Ok(())
    }

    // ── Daily Test Results ────────────────────────────────────────

    pub fn get_daily_results(&self) -> SqliteResult<Vec<DailyTestResultRow>> {
        let mut stmt = self.conn.prepare(
            "SELECT user_id, date, wpm, accuracy, true_accuracy, duration, completed_at
             FROM daily_test_results ORDER BY date, user_id"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(DailyTestResultRow {
                user_id: row.get(0)?,
                date: row.get(1)?,
                wpm: row.get(2)?,
                accuracy: row.get(3)?,
                true_accuracy: row.get(4)?,
                duration: row.get(5)?,
                completed_at: row.get(6)?,
            })
        })?;
        rows.collect()
    }

    pub fn save_daily_results(&self, results: &[DailyTestResultRow]) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM daily_test_results", [])?;
        let mut stmt = self.conn.prepare(
            "INSERT INTO daily_test_results (user_id, date, wpm, accuracy, true_accuracy, duration, completed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
        )?;
        for r in results {
            stmt.execute(params![
                r.user_id, r.date, r.wpm, r.accuracy, r.true_accuracy, r.duration, r.completed_at,
            ])?;
        }
        Ok(())
    }

    // ── Daily Activity ────────────────────────────────────────────

    pub fn get_activity(&self, user_id: i64) -> SqliteResult<Vec<DailyActivityRow>> {
        let mut stmt = self.conn.prepare(
            "SELECT date, practice_time, characters, sessions
             FROM daily_activity WHERE user_id = ?1 ORDER BY date"
        )?;
        let rows = stmt.query_map(params![user_id], |row| {
            Ok(DailyActivityRow {
                date: row.get(0)?,
                practice_time: row.get(1)?,
                characters: row.get(2)?,
                sessions: row.get(3)?,
            })
        })?;
        rows.collect()
    }

    pub fn save_activity(&self, user_id: i64, activity: &[DailyActivityRow]) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM daily_activity WHERE user_id = ?1", params![user_id])?;
        let mut stmt = self.conn.prepare(
            "INSERT INTO daily_activity (user_id, date, practice_time, characters, sessions)
             VALUES (?1, ?2, ?3, ?4, ?5)"
        )?;
        for a in activity {
            stmt.execute(params![user_id, a.date, a.practice_time, a.characters, a.sessions])?;
        }
        Ok(())
    }

    pub fn delete_activity(&self, user_id: i64) -> SqliteResult<()> {
        self.conn.execute("DELETE FROM daily_activity WHERE user_id = ?1", params![user_id])?;
        Ok(())
    }

    // ── Migration ─────────────────────────────────────────────────

    pub fn is_migration_needed(&self) -> SqliteResult<bool> {
        let count: i64 = self.conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))?;
        Ok(count == 0)
    }

    pub fn migrate_from_localstorage(&self, payload: &MigrationPayload) -> Result<(), StorageError> {
        let tx = self.conn.unchecked_transaction()?;

        // Insert users
        for user in &payload.users {
            tx.execute(
                "INSERT OR IGNORE INTO users (id, name, avatar, created_at, last_active_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![user.id, user.name, user.avatar, user.created_at, user.last_active_at],
            )?;
        }

        // Insert settings
        for (user_id_str, json_opt) in &payload.settings {
            if let (Ok(user_id), Some(json)) = (user_id_str.parse::<i64>(), json_opt) {
                tx.execute(
                    "INSERT OR IGNORE INTO user_settings (user_id, settings_json) VALUES (?1, ?2)",
                    params![user_id, json],
                )?;
            }
        }

        // Insert stats (stored as JSON strings from localStorage)
        for (user_id_str, json_opt) in &payload.stats {
            if let (Ok(user_id), Some(json)) = (user_id_str.parse::<i64>(), json_opt) {
                // Parse the JSON stats and insert into the structured table
                if let Ok(stats) = serde_json::from_str::<serde_json::Value>(json) {
                    let problem_keys_val = stats.get("problemKeys");
                    tx.execute(
                        "INSERT OR IGNORE INTO user_stats (user_id, total_practice_time, total_words_typed,
                            average_wpm, average_accuracy, average_true_accuracy, total_keystrokes,
                            total_backspaces, total_correct_keystrokes, lessons_completed,
                            current_streak, longest_streak, last_practice_date)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                        params![
                            user_id,
                            stats.get("totalPracticeTime").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("totalWordsTyped").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("averageWpm").and_then(|v| v.as_f64()).unwrap_or(0.0),
                            stats.get("averageAccuracy").and_then(|v| v.as_f64()).unwrap_or(0.0),
                            stats.get("averageTrueAccuracy").and_then(|v| v.as_f64()).unwrap_or(0.0),
                            stats.get("totalKeystrokes").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("totalBackspaces").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("totalCorrectKeystrokes").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("lessonsCompleted").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("currentStreak").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("longestStreak").and_then(|v| v.as_i64()).unwrap_or(0),
                            stats.get("lastPracticeDate").and_then(|v| v.as_str()),
                        ],
                    )?;

                    // Insert problem keys
                    if let Some(keys) = problem_keys_val.and_then(|v| v.as_array()) {
                        for entry in keys {
                            if let Some(arr) = entry.as_array() {
                                if arr.len() == 2 {
                                    if let (Some(key), Some(count)) = (arr[0].as_str(), arr[1].as_i64()) {
                                        tx.execute(
                                            "INSERT OR IGNORE INTO problem_keys (user_id, key_char, error_count)
                                             VALUES (?1, ?2, ?3)",
                                            params![user_id, key, count],
                                        )?;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Insert lesson progress (stored as Map entries array)
        for (user_id_str, json_opt) in &payload.progress {
            if let (Ok(user_id), Some(json)) = (user_id_str.parse::<i64>(), json_opt) {
                if let Ok(entries) = serde_json::from_str::<Vec<(String, serde_json::Value)>>(json) {
                    for (lesson_id, val) in entries {
                        tx.execute(
                            "INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id, completed_tasks,
                                total_tasks, best_wpm, average_accuracy, last_task_index, task_results_json)
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                            params![
                                user_id,
                                lesson_id,
                                val.get("completedTasks").and_then(|v| v.as_i64()).unwrap_or(0),
                                val.get("totalTasks").and_then(|v| v.as_i64()).unwrap_or(0),
                                val.get("bestWpm").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                val.get("averageAccuracy").and_then(|v| v.as_f64()).unwrap_or(0.0),
                                val.get("lastTaskIndex").and_then(|v| v.as_i64()),
                                val.get("taskResults").map(|v| v.to_string()).unwrap_or_else(|| "[]".to_string()),
                            ],
                        )?;
                    }
                }
            }
        }

        // Insert course progress (stored as Map entries array)
        for (user_id_str, json_opt) in &payload.courses {
            if let (Ok(user_id), Some(json)) = (user_id_str.parse::<i64>(), json_opt) {
                if let Ok(entries) = serde_json::from_str::<Vec<(String, serde_json::Value)>>(json) {
                    for (course_id, val) in entries {
                        tx.execute(
                            "INSERT OR IGNORE INTO course_progress (user_id, course_id, current_stage_id,
                                completed_stages_json, skipped_stages_json, enrolled_at, completed_at)
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                            params![
                                user_id,
                                course_id,
                                val.get("currentStageId").and_then(|v| v.as_str()),
                                val.get("completedStages").map(|v| v.to_string()).unwrap_or_else(|| "[]".to_string()),
                                val.get("skippedStages").map(|v| v.to_string()).unwrap_or_else(|| "[]".to_string()),
                                val.get("enrolledAt").and_then(|v| v.as_str()).unwrap_or(""),
                                val.get("completedAt").and_then(|v| v.as_str()),
                            ],
                        )?;
                    }
                }
            }
        }

        // Insert snippets (stored as JSON arrays)
        for (user_id_str, json_opt) in &payload.snippets {
            if let (Ok(user_id), Some(json)) = (user_id_str.parse::<i64>(), json_opt) {
                if let Ok(snippets) = serde_json::from_str::<Vec<serde_json::Value>>(json) {
                    for s in snippets {
                        tx.execute(
                            "INSERT OR IGNORE INTO custom_snippets (id, user_id, name, content, language,
                                mode, created_at, practice_count, best_wpm, best_accuracy)
                             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                            params![
                                s.get("id").and_then(|v| v.as_str()).unwrap_or(""),
                                user_id,
                                s.get("name").and_then(|v| v.as_str()).unwrap_or(""),
                                s.get("content").and_then(|v| v.as_str()).unwrap_or(""),
                                s.get("language").and_then(|v| v.as_str()),
                                s.get("mode").and_then(|v| v.as_str()).unwrap_or("text"),
                                s.get("createdAt").and_then(|v| v.as_str()).unwrap_or(""),
                                s.get("practiceCount").and_then(|v| v.as_i64()).unwrap_or(0),
                                s.get("bestWpm").and_then(|v| v.as_f64()),
                                s.get("bestAccuracy").and_then(|v| v.as_f64()),
                            ],
                        )?;
                    }
                }
            }
        }

        // Insert activity (stored as Map entries array)
        for (user_id_str, json_opt) in &payload.activity {
            if let (Ok(user_id), Some(json)) = (user_id_str.parse::<i64>(), json_opt) {
                if let Ok(entries) = serde_json::from_str::<Vec<(String, serde_json::Value)>>(json) {
                    for (date, val) in entries {
                        tx.execute(
                            "INSERT OR IGNORE INTO daily_activity (user_id, date, practice_time, characters, sessions)
                             VALUES (?1, ?2, ?3, ?4, ?5)",
                            params![
                                user_id,
                                date,
                                val.get("practiceTime").and_then(|v| v.as_i64()).unwrap_or(0),
                                val.get("characters").and_then(|v| v.as_i64()).unwrap_or(0),
                                val.get("sessions").and_then(|v| v.as_i64()).unwrap_or(0),
                            ],
                        )?;
                    }
                }
            }
        }

        // Insert daily test results
        for r in &payload.daily_results {
            tx.execute(
                "INSERT OR IGNORE INTO daily_test_results (user_id, date, wpm, accuracy, true_accuracy, duration, completed_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![r.user_id, r.date, r.wpm, r.accuracy, r.true_accuracy, r.duration, r.completed_at],
            )?;
        }

        tx.commit()?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_schema_creation() {
        let db = Database::in_memory().unwrap();
        assert_eq!(db.get_schema_version(), 1);
    }

    #[test]
    fn test_user_crud() {
        let db = Database::in_memory().unwrap();

        db.create_user(1, "Alice", "cat", "2024-01-01T00:00:00Z").unwrap();
        db.create_user(2, "Bob", "dog", "2024-01-02T00:00:00Z").unwrap();

        let users = db.get_all_users().unwrap();
        assert_eq!(users.len(), 2);
        assert_eq!(users[0].name, "Alice");
        assert_eq!(users[1].name, "Bob");

        db.update_user(1, Some("Alice Updated"), None, None).unwrap();
        let users = db.get_all_users().unwrap();
        assert_eq!(users[0].name, "Alice Updated");

        db.delete_user(1).unwrap();
        let users = db.get_all_users().unwrap();
        assert_eq!(users.len(), 1);
        assert_eq!(users[0].name, "Bob");
    }

    #[test]
    fn test_settings() {
        let db = Database::in_memory().unwrap();
        db.create_user(1, "Test", "cat", "2024-01-01").unwrap();

        assert!(db.get_settings(1).unwrap().is_none());

        db.save_settings(1, r#"{"fontSize":24}"#).unwrap();
        let settings = db.get_settings(1).unwrap().unwrap();
        assert!(settings.contains("fontSize"));

        // Update
        db.save_settings(1, r#"{"fontSize":32}"#).unwrap();
        let settings = db.get_settings(1).unwrap().unwrap();
        assert!(settings.contains("32"));
    }

    #[test]
    fn test_user_stats() {
        let db = Database::in_memory().unwrap();
        db.create_user(1, "Test", "cat", "2024-01-01").unwrap();

        assert!(db.get_user_stats(1).unwrap().is_none());

        let stats = UserStatsRow {
            total_practice_time: 3600000,
            total_words_typed: 1000,
            average_wpm: 50.0,
            average_accuracy: 95.0,
            average_true_accuracy: 92.0,
            total_keystrokes: 5000,
            total_backspaces: 100,
            total_correct_keystrokes: 4900,
            lessons_completed: 5,
            current_streak: 3,
            longest_streak: 7,
            last_practice_date: Some("2024-06-01".to_string()),
            problem_keys: vec![("q".to_string(), 10), ("z".to_string(), 5)],
        };
        db.save_user_stats(1, &stats).unwrap();

        let loaded = db.get_user_stats(1).unwrap().unwrap();
        assert_eq!(loaded.total_practice_time, 3600000);
        assert_eq!(loaded.average_wpm, 50.0);
        assert_eq!(loaded.problem_keys.len(), 2);
        assert_eq!(loaded.problem_keys[0].0, "q");
    }

    #[test]
    fn test_cascade_delete() {
        let db = Database::in_memory().unwrap();
        db.create_user(1, "Test", "cat", "2024-01-01").unwrap();
        db.save_settings(1, r#"{"fontSize":24}"#).unwrap();

        let stats = UserStatsRow {
            total_practice_time: 100, total_words_typed: 10, average_wpm: 50.0,
            average_accuracy: 95.0, average_true_accuracy: 92.0, total_keystrokes: 50,
            total_backspaces: 5, total_correct_keystrokes: 45, lessons_completed: 1,
            current_streak: 1, longest_streak: 1, last_practice_date: None,
            problem_keys: vec![("a".to_string(), 1)],
        };
        db.save_user_stats(1, &stats).unwrap();

        // Delete user should cascade
        db.delete_user(1).unwrap();
        assert!(db.get_settings(1).unwrap().is_none());
        assert!(db.get_user_stats(1).unwrap().is_none());
    }

    #[test]
    fn test_migration_needed() {
        let db = Database::in_memory().unwrap();
        assert!(db.is_migration_needed().unwrap());

        db.create_user(1, "Test", "cat", "2024-01-01").unwrap();
        assert!(!db.is_migration_needed().unwrap());
    }
}
