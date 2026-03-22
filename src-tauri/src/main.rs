// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod keyboard;
mod lessons;
mod metrics;
mod models;
mod storage;

use lessons::Lesson;
use metrics::{MetricsCalculator, TaskResult};
use models::*;
use storage::{Database, StorageError};
use std::sync::Mutex;
use tauri::{Manager, State};

// Application state
struct AppState {
    db: Mutex<Database>,
}

/// Convert any error to a JSON string for the frontend
fn map_err(e: impl std::fmt::Display) -> String {
    e.to_string()
}

fn map_storage_err(e: impl Into<StorageError>) -> String {
    let err: StorageError = e.into();
    serde_json::to_string(&err).unwrap_or_else(|_| err.to_string())
}

fn lock_db<'a>(state: &'a State<AppState>) -> Result<std::sync::MutexGuard<'a, Database>, String> {
    state.db.lock().map_err(|e| map_err(e))
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
    let db = lock_db(&state)?;
    db.get_all_users().map_err(map_storage_err)
}

#[tauri::command]
fn create_user(
    state: State<AppState>,
    id: i64,
    name: String,
    avatar: String,
    created_at: String,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.create_user(id, &name, &avatar, &created_at)
        .map_err(map_storage_err)
}

#[tauri::command]
fn update_user(
    state: State<AppState>,
    user_id: i64,
    name: Option<String>,
    avatar: Option<String>,
    last_active_at: Option<String>,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.update_user(
        user_id,
        name.as_deref(),
        avatar.as_deref(),
        last_active_at.as_deref(),
    )
    .map_err(map_storage_err)
}

#[tauri::command]
fn delete_user(state: State<AppState>, user_id: i64) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.delete_user(user_id).map_err(map_storage_err)
}

// ── Settings commands ────────────────────────────────────────────────

#[tauri::command]
fn get_settings(state: State<AppState>, user_id: i64) -> Result<Option<String>, String> {
    let db = lock_db(&state)?;
    db.get_settings(user_id).map_err(map_storage_err)
}

#[tauri::command]
fn save_settings(
    state: State<AppState>,
    user_id: i64,
    settings_json: String,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_settings(user_id, &settings_json)
        .map_err(map_storage_err)
}

// ── User Stats commands ──────────────────────────────────────────────

#[tauri::command]
fn get_user_stats(
    state: State<AppState>,
    user_id: i64,
) -> Result<Option<UserStatsRow>, String> {
    let db = lock_db(&state)?;
    db.get_user_stats(user_id).map_err(map_storage_err)
}

#[tauri::command]
fn save_user_stats(
    state: State<AppState>,
    user_id: i64,
    stats: UserStatsRow,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_user_stats(user_id, &stats)
        .map_err(map_storage_err)
}

// ── Lesson Progress commands ─────────────────────────────────────────

#[tauri::command]
fn get_all_lesson_progress(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<LessonProgressRow>, String> {
    let db = lock_db(&state)?;
    db.get_all_lesson_progress(user_id)
        .map_err(map_storage_err)
}

#[tauri::command]
fn save_lesson_progress(
    state: State<AppState>,
    user_id: i64,
    progress: Vec<LessonProgressRow>,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_lesson_progress(user_id, &progress)
        .map_err(map_storage_err)
}

// ── Course Progress commands ─────────────────────────────────────────

#[tauri::command]
fn get_all_course_progress(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<CourseProgressRow>, String> {
    let db = lock_db(&state)?;
    db.get_all_course_progress(user_id)
        .map_err(map_storage_err)
}

#[tauri::command]
fn save_course_progress(
    state: State<AppState>,
    user_id: i64,
    progress: Vec<CourseProgressRow>,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_course_progress(user_id, &progress)
        .map_err(map_storage_err)
}

#[tauri::command]
fn delete_course_progress(
    state: State<AppState>,
    user_id: i64,
    course_id: String,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.delete_course_progress(user_id, &course_id)
        .map_err(map_storage_err)
}

#[tauri::command]
fn delete_all_course_progress(state: State<AppState>, user_id: i64) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.delete_all_course_progress(user_id)
        .map_err(map_storage_err)
}

// ── Custom Snippets commands ─────────────────────────────────────────

#[tauri::command]
fn get_snippets(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<CustomSnippetRow>, String> {
    let db = lock_db(&state)?;
    db.get_snippets(user_id).map_err(map_storage_err)
}

#[tauri::command]
fn save_snippets(
    state: State<AppState>,
    user_id: i64,
    snippets: Vec<CustomSnippetRow>,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_snippets(user_id, &snippets)
        .map_err(map_storage_err)
}

// ── Daily Test Results commands ──────────────────────────────────────

#[tauri::command]
fn get_daily_results(state: State<AppState>) -> Result<Vec<DailyTestResultRow>, String> {
    let db = lock_db(&state)?;
    db.get_daily_results().map_err(map_storage_err)
}

#[tauri::command]
fn save_daily_results(
    state: State<AppState>,
    results: Vec<DailyTestResultRow>,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_daily_results(&results)
        .map_err(map_storage_err)
}

// ── Daily Activity commands ──────────────────────────────────────────

#[tauri::command]
fn get_activity(
    state: State<AppState>,
    user_id: i64,
) -> Result<Vec<DailyActivityRow>, String> {
    let db = lock_db(&state)?;
    db.get_activity(user_id).map_err(map_storage_err)
}

#[tauri::command]
fn save_activity(
    state: State<AppState>,
    user_id: i64,
    activity: Vec<DailyActivityRow>,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.save_activity(user_id, &activity)
        .map_err(map_storage_err)
}

#[tauri::command]
fn delete_activity(state: State<AppState>, user_id: i64) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.delete_activity(user_id).map_err(map_storage_err)
}

// ── Migration commands ───────────────────────────────────────────────

#[tauri::command]
fn is_migration_needed(state: State<AppState>) -> Result<bool, String> {
    let db = lock_db(&state)?;
    db.is_migration_needed().map_err(map_storage_err)
}

#[tauri::command]
fn migrate_from_localstorage(
    state: State<AppState>,
    payload: MigrationPayload,
) -> Result<(), String> {
    let db = lock_db(&state)?;
    db.migrate_from_localstorage(&payload)
        .map_err(map_storage_err)
}

// ── Keyboard Layout command ──────────────────────────────────────────

#[tauri::command]
fn get_keyboard_input_source() -> Option<String> {
    keyboard::get_current_input_source()
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
            // Keyboard
            get_keyboard_input_source,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                if let Some(state) = app.try_state::<AppState>() {
                    if let Ok(db) = state.db.lock() {
                        let _: Result<(), _> = db.checkpoint();
                    }
                }
            }
        });
}
