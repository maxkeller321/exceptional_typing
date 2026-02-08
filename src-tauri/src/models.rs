use serde::{Deserialize, Serialize};

// All structs use camelCase serialization to match TypeScript interfaces

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserProfile {
    pub id: i64,
    pub name: String,
    pub avatar: String,
    pub created_at: String,
    pub last_active_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStatsRow {
    pub total_practice_time: i64,
    pub total_words_typed: i64,
    pub average_wpm: f64,
    pub average_accuracy: f64,
    pub average_true_accuracy: f64,
    pub total_keystrokes: i64,
    pub total_backspaces: i64,
    pub total_correct_keystrokes: i64,
    pub lessons_completed: i64,
    pub current_streak: i64,
    pub longest_streak: i64,
    pub last_practice_date: Option<String>,
    pub problem_keys: Vec<(String, i64)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LessonProgressRow {
    pub lesson_id: String,
    pub completed_tasks: i64,
    pub total_tasks: i64,
    pub best_wpm: f64,
    pub average_accuracy: f64,
    pub last_task_index: Option<i64>,
    pub task_results_json: String, // JSON array of TaskResult
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressRow {
    pub course_id: String,
    pub current_stage_id: Option<String>,
    pub completed_stages_json: String,
    pub skipped_stages_json: String,
    pub enrolled_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomSnippetRow {
    pub id: String,
    pub user_id: i64,
    pub name: String,
    pub content: String,
    pub language: Option<String>,
    pub mode: String,
    pub created_at: String,
    pub practice_count: i64,
    pub best_wpm: Option<f64>,
    pub best_accuracy: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyTestResultRow {
    pub user_id: i64,
    pub date: String,
    pub wpm: f64,
    pub accuracy: f64,
    pub true_accuracy: f64,
    pub duration: i64,
    pub completed_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyActivityRow {
    pub date: String,
    pub practice_time: i64,
    pub characters: i64,
    pub sessions: i64,
}

/// Payload for one-time localStorage → SQLite migration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MigrationPayload {
    pub users: Vec<UserProfile>,
    pub settings: std::collections::HashMap<String, Option<String>>,
    pub stats: std::collections::HashMap<String, Option<String>>,
    pub progress: std::collections::HashMap<String, Option<String>>,
    pub courses: std::collections::HashMap<String, Option<String>>,
    pub snippets: std::collections::HashMap<String, Option<String>>,
    pub activity: std::collections::HashMap<String, Option<String>>,
    pub daily_results: Vec<DailyTestResultRow>,
}
