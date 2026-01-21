// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod lessons;
mod metrics;
mod storage;

use lessons::Lesson;
use metrics::{MetricsCalculator, TaskResult};
use storage::Database;
use std::sync::Mutex;
use tauri::State;

// Application state
struct AppState {
    db: Mutex<Database>,
}

// Commands exposed to the frontend

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

#[tauri::command]
fn save_result(state: State<AppState>, result: TaskResult) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.save_result(&result).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_user_stats(state: State<AppState>) -> Result<storage::UserStats, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_user_stats().map_err(|e| e.to_string())
}

#[tauri::command]
fn get_lesson_progress(state: State<AppState>, lesson_id: &str) -> Result<Option<storage::LessonProgress>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_lesson_progress(lesson_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_problem_keys(state: State<AppState>, limit: usize) -> Result<Vec<(String, i32)>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    db.get_problem_keys(limit).map_err(|e| e.to_string())
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
            get_all_lessons,
            get_lesson,
            get_lessons_by_category,
            calculate_result,
            save_result,
            get_user_stats,
            get_lesson_progress,
            get_problem_keys,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
