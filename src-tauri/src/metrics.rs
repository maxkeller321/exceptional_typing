use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorInfo {
    pub index: usize,
    pub expected: char,
    pub typed: char,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskResult {
    pub task_id: String,
    pub wpm: f32,
    pub raw_wpm: f32,
    pub accuracy: f32,
    pub errors: Vec<ErrorInfo>,
    pub duration: i64, // milliseconds
    pub completed_at: i64,
    pub passed: bool,
}

pub struct MetricsCalculator;

impl MetricsCalculator {
    /// Calculate typing metrics from a completed task
    pub fn calculate_result(
        task_id: String,
        target_text: &str,
        _typed_text: &str,
        start_time: i64,
        end_time: i64,
        errors: Vec<(usize, char, char)>,
    ) -> TaskResult {
        let duration = end_time - start_time;
        let minutes = duration as f32 / 60000.0;

        // Standard: 5 characters = 1 word
        let total_chars = target_text.len();
        let word_count = total_chars as f32 / 5.0;
        let error_count = errors.len();

        // Raw WPM: total words / time
        let raw_wpm = if minutes > 0.0 {
            word_count / minutes
        } else {
            0.0
        };

        // Net WPM: (words - errors) / time
        let wpm = if minutes > 0.0 {
            ((word_count - error_count as f32).max(0.0)) / minutes
        } else {
            0.0
        };

        // Accuracy: correct characters / total characters
        let accuracy = if total_chars > 0 {
            ((total_chars - error_count) as f32 / total_chars as f32).max(0.0)
        } else {
            1.0
        };

        let error_infos: Vec<ErrorInfo> = errors
            .into_iter()
            .map(|(index, expected, typed)| ErrorInfo {
                index,
                expected,
                typed,
                timestamp: 0, // Would need to be passed in for accurate timestamps
            })
            .collect();

        TaskResult {
            task_id,
            wpm: round_to_decimals(wpm, 1),
            raw_wpm: round_to_decimals(raw_wpm, 1),
            accuracy: round_to_decimals(accuracy, 3),
            errors: error_infos,
            duration,
            completed_at: end_time,
            passed: accuracy >= 0.85, // Default passing threshold
        }
    }

    /// Calculate WPM from character count and duration
    #[allow(dead_code)]
    pub fn calculate_wpm(char_count: usize, duration_ms: i64) -> f32 {
        let minutes = duration_ms as f32 / 60000.0;
        let words = char_count as f32 / 5.0;

        if minutes > 0.0 {
            round_to_decimals(words / minutes, 1)
        } else {
            0.0
        }
    }

    /// Calculate accuracy from correct and total characters
    #[allow(dead_code)]
    pub fn calculate_accuracy(correct: usize, total: usize) -> f32 {
        if total > 0 {
            round_to_decimals(correct as f32 / total as f32, 3)
        } else {
            1.0
        }
    }

    /// Identify the most problematic keys from error data
    #[allow(dead_code)]
    pub fn analyze_problem_keys(errors: &[ErrorInfo]) -> Vec<(char, usize)> {
        use std::collections::HashMap;

        let mut key_errors: HashMap<char, usize> = HashMap::new();

        for error in errors {
            *key_errors.entry(error.expected).or_insert(0) += 1;
        }

        let mut sorted: Vec<_> = key_errors.into_iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(&a.1));
        sorted
    }
}

fn round_to_decimals(value: f32, decimals: u32) -> f32 {
    let multiplier = 10_f32.powi(decimals as i32);
    (value * multiplier).round() / multiplier
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wpm_calculation() {
        // 50 characters in 1 minute = 10 WPM (50/5 words)
        let wpm = MetricsCalculator::calculate_wpm(50, 60000);
        assert_eq!(wpm, 10.0);

        // 100 characters in 30 seconds = 40 WPM
        let wpm = MetricsCalculator::calculate_wpm(100, 30000);
        assert_eq!(wpm, 40.0);
    }

    #[test]
    fn test_accuracy_calculation() {
        let accuracy = MetricsCalculator::calculate_accuracy(95, 100);
        assert_eq!(accuracy, 0.95);

        let accuracy = MetricsCalculator::calculate_accuracy(100, 100);
        assert_eq!(accuracy, 1.0);
    }

    #[test]
    fn test_full_result_calculation() {
        let result = MetricsCalculator::calculate_result(
            "test-task".to_string(),
            "hello world", // 11 chars
            "hello world",
            0,
            60000, // 1 minute
            vec![], // no errors
        );

        assert_eq!(result.accuracy, 1.0);
        assert!(result.passed);
        assert_eq!(result.errors.len(), 0);
    }
}
