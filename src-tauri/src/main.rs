// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lessons;
mod metrics;
mod models;
mod storage;

use lessons::Lesson;
use metrics::{MetricsCalculator, TaskResult};
use models::*;
use storage::Database;
use std::sync::Mutex;
use tauri::State;

// Application state
struct AppState {
    db: Mutex<Database>,
}

// ── Lesson commands (unchanged) ──────────────────────────────────────

#[tauri::command]
fn get_all_lessons() -> Vec<Lesson> {
    lessons::get_all_lessons()
}

#[tauri::command]
fn get_lesson(id: &str) -> Option<Lesson> {
    lessons::get_lesson_by_id(id)
}

#[tauri::command]
fn get_lessons_by_category(category: &str) -> Vec<Lesson> {
    lessons::get_lessons_by_category(category)
}

#[tauri::command]
fn calculate_result(
    task_id: String,
    target_text: String,
    typed_text: String,
    start_time: i64,
    end_time: i64,
    errors: Vec<(usize, char, char)>,
) -> TaskResult {
    MetricsCalculator::calculate_result(
        task_id,
        &target_text,
        &typed_text,
        start_time,
        end_time,
        errors,
    )
}

// ── User commands ────────────────────────────────────────────────────

#[tauri::command]
fn get_all_users(state: State<AppState>) -> Result<Vec<UserProfile>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_users().map_err(|e| e.to_string())
}

#[tauri::command]
fn create_user(
    state: State<AppState>,
    id: i64,
    name: String,
    avatar: String,
    created_at: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.create_user(id, &name, &avatar, &created_at)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn update_user(
    state: State<AppState>,
    user_id: i64,
    name: Option<String>,
    avatar: Option<String>,
    last_active_at: Option<String>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.update_user(
        user_id,
        name.as_deref(),
        avatar.as_deref(),
        last_active_at.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_user(state: State<AppState>, user_id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_user(user_id).map_err(|e| e.to_string())
}

// ── Settings commands ────────────────────────────────────────────────

#[tauri::command]
fn get_settings(state: State<AppState>, user_id: i64) -> Result<Option<String>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_settings(user_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_settings(
    state: State<AppState>,
    user_id: i64,
    settings_json: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_settings(user_id, &settings_json)
        .map_err(|e| e.to_string())
}

// ── User Stats commands ──────────────────────────────────────────────

#[tauri::command]
fn get_user_stats(
    state: State<AppState>,
    user_id: i64,
) -> Result<Option<UserStatsRow>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_user_stats(user_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_user_stats(
    state: State<AppState>,
    user_id: i64,
    stats: UserStatsRow,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_user_stats(user_id, &stats)
        .map_err(|e| e.to_string())
}

// ── Lesson Progress commands ─────────────────────────────────────────

#[tauri::command]
fn get_all_lesson_progress(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<LessonProgressRow>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_lesson_progress(user_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_lesson_progress(
    state: State<AppState>,
    user_id: i64,
    progress: Vec<LessonProgressRow>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_lesson_progress(user_id, &progress)
        .map_err(|e| e.to_string())
}

// ── Course Progress commands ─────────────────────────────────────────

#[tauri::command]
fn get_all_course_progress(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<CourseProgressRow>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_all_course_progress(user_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_course_progress(
    state: State<AppState>,
    user_id: i64,
    progress: Vec<CourseProgressRow>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_course_progress(user_id, &progress)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_course_progress(
    state: State<AppState>,
    user_id: i64,
    course_id: String,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_course_progress(user_id, &course_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_all_course_progress(state: State<AppState>, user_id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_all_course_progress(user_id)
        .map_err(|e| e.to_string())
}

// ── Custom Snippets commands ─────────────────────────────────────────

#[tauri::command]
fn get_snippets(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<CustomSnippetRow>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_snippets(user_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_snippets(
    state: State<AppState>,
    user_id: i64,
    snippets: Vec<CustomSnippetRow>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_snippets(user_id, &snippets)
        .map_err(|e| e.to_string())
}

// ── Daily Test Results commands ──────────────────────────────────────

#[tauri::command]
fn get_daily_results(state: State<AppState>) -> Result<Vec<DailyTestResultRow>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_daily_results().map_err(|e| e.to_string())
}

#[tauri::command]
fn save_daily_results(
    state: State<AppState>,
    results: Vec<DailyTestResultRow>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_daily_results(&results)
        .map_err(|e| e.to_string())
}

// ── Daily Activity commands ──────────────────────────────────────────

#[tauri::command]
fn get_activity(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<DailyActivityRow>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_activity(user_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_activity(
    state: State<AppState>,
    user_id: i64,
    activity: Vec<DailyActivityRow>,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_activity(user_id, &activity)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_activity(state: State<AppState>, user_id: i64) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.delete_activity(user_id).map_err(|e| e.to_string())
}

// ── Migration commands ───────────────────────────────────────────────

#[tauri::command]
fn is_migration_needed(state: State<AppState>) -> Result<bool, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.is_migration_needed().map_err(|e| e.to_string())
}

#[tauri::command]
fn migrate_from_localstorage(
    state: State<AppState>,
    payload: MigrationPayload,
) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.migrate_from_localstorage(&payload)
        .map_err(|e| e.to_string())
}

fn main() {
    // Initialize database
    let db = Database::new().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            db: Mutex::new(db),
        })
        .invoke_handler(tauri::generate_handler![
            // Lessons
            get_all_lessons,
            get_lesson,
            get_lessons_by_category,
            calculate_result,
            // Users
            get_all_users,
            create_user,
            update_user,
            delete_user,
            // Settings
            get_settings,
            save_settings,
            // User Stats
            get_user_stats,
            save_user_stats,
            // Lesson Progress
            get_all_lesson_progress,
            save_lesson_progress,
            // Course Progress
            get_all_course_progress,
            save_course_progress,
            delete_course_progress,
            delete_all_course_progress,
            // Custom Snippets
            get_snippets,
            save_snippets,
            // Daily Test Results
            get_daily_results,
            save_daily_results,
            // Daily Activity
            get_activity,
            save_activity,
            delete_activity,
            // Migration
            is_migration_needed,
            migrate_from_localstorage,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
