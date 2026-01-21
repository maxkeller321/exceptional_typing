use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub instruction: String,
    pub target_text: String,
    pub time_limit: Option<u32>, // seconds
    pub min_accuracy: f32,       // 0.0 - 1.0
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lesson {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: LessonCategory,
    pub difficulty: Difficulty,
    pub tasks: Vec<Task>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LessonCategory {
    HomeRow,
    TopRow,
    BottomRow,
    Numbers,
    Symbols,
    Words,
    Sentences,
    Code,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum Difficulty {
    Beginner,
    Intermediate,
    Advanced,
    Expert,
}

// Static lesson data
pub fn get_all_lessons() -> Vec<Lesson> {
    vec![
        // Home Row Lessons
        Lesson {
            id: "home-row-basics".to_string(),
            name: "Home Row Basics".to_string(),
            description: "Master the foundation of touch typing with the home row keys.".to_string(),
            category: LessonCategory::HomeRow,
            difficulty: Difficulty::Beginner,
            tasks: vec![
                Task {
                    id: "hr-1".to_string(),
                    instruction: "Place your fingers on the home row. Type the left hand keys.".to_string(),
                    target_text: "asdf asdf asdf asdf".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "hr-2".to_string(),
                    instruction: "Now practice the right hand home row keys.".to_string(),
                    target_text: "jkl; jkl; jkl; jkl;".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "hr-3".to_string(),
                    instruction: "Combine both hands on the home row.".to_string(),
                    target_text: "asdf jkl; asdf jkl; asdf jkl;".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "hr-4".to_string(),
                    instruction: "Practice alternating between hands.".to_string(),
                    target_text: "aj sk dl f; aj sk dl f; aj sk dl f;".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "hr-5".to_string(),
                    instruction: "Type common home row patterns.".to_string(),
                    target_text: "sad dad fall salad flask ask lads".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
            ],
        },
        Lesson {
            id: "home-row-words".to_string(),
            name: "Home Row Words".to_string(),
            description: "Practice real words using only home row keys.".to_string(),
            category: LessonCategory::HomeRow,
            difficulty: Difficulty::Beginner,
            tasks: vec![
                Task {
                    id: "hrw-1".to_string(),
                    instruction: "Type these simple home row words.".to_string(),
                    target_text: "as a sad lad adds salads".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "hrw-2".to_string(),
                    instruction: "Continue with more home row vocabulary.".to_string(),
                    target_text: "all fall flask lass ska".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "hrw-3".to_string(),
                    instruction: "Practice longer home row phrases.".to_string(),
                    target_text: "a sad lad falls as a lass asks dad".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
            ],
        },
        // Top Row
        Lesson {
            id: "top-row-intro".to_string(),
            name: "Top Row Introduction".to_string(),
            description: "Learn to reach up to the top row while maintaining home position.".to_string(),
            category: LessonCategory::TopRow,
            difficulty: Difficulty::Beginner,
            tasks: vec![
                Task {
                    id: "tr-1".to_string(),
                    instruction: "Practice the left hand top row keys.".to_string(),
                    target_text: "qwer qwer qwer qwer".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
                Task {
                    id: "tr-2".to_string(),
                    instruction: "Practice the right hand top row keys.".to_string(),
                    target_text: "uiop uiop uiop uiop".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
                Task {
                    id: "tr-3".to_string(),
                    instruction: "Combine top row with home row.".to_string(),
                    target_text: "we are quite ripe to type".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
            ],
        },
        // Common Words
        Lesson {
            id: "common-words-100".to_string(),
            name: "Top 100 Words".to_string(),
            description: "Practice the most frequently used English words.".to_string(),
            category: LessonCategory::Words,
            difficulty: Difficulty::Intermediate,
            tasks: vec![
                Task {
                    id: "cw-1".to_string(),
                    instruction: "Type these common words accurately.".to_string(),
                    target_text: "the be to of and a in that have I".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "cw-2".to_string(),
                    instruction: "Continue with more common words.".to_string(),
                    target_text: "it for not on with he as you do at".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
            ],
        },
        // Sentences
        Lesson {
            id: "simple-sentences".to_string(),
            name: "Simple Sentences".to_string(),
            description: "Practice typing complete sentences with proper punctuation.".to_string(),
            category: LessonCategory::Sentences,
            difficulty: Difficulty::Intermediate,
            tasks: vec![
                Task {
                    id: "ss-1".to_string(),
                    instruction: "Type this sentence with correct capitalization.".to_string(),
                    target_text: "The quick brown fox jumps over the lazy dog.".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
                Task {
                    id: "ss-2".to_string(),
                    instruction: "Practice sentences with commas.".to_string(),
                    target_text: "Hello, how are you doing today?".to_string(),
                    time_limit: None,
                    min_accuracy: 0.9,
                },
            ],
        },
        // Code - JavaScript
        Lesson {
            id: "code-javascript".to_string(),
            name: "JavaScript Basics".to_string(),
            description: "Practice typing common JavaScript code patterns.".to_string(),
            category: LessonCategory::Code,
            difficulty: Difficulty::Advanced,
            tasks: vec![
                Task {
                    id: "js-1".to_string(),
                    instruction: "Type a function declaration.".to_string(),
                    target_text: "function greet(name) { return \"Hello, \" + name; }".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
                Task {
                    id: "js-2".to_string(),
                    instruction: "Practice arrow functions.".to_string(),
                    target_text: "const add = (a, b) => a + b;".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
            ],
        },
        // Code - Rust
        Lesson {
            id: "code-rust".to_string(),
            name: "Rust Basics".to_string(),
            description: "Practice typing common Rust code patterns.".to_string(),
            category: LessonCategory::Code,
            difficulty: Difficulty::Expert,
            tasks: vec![
                Task {
                    id: "rs-1".to_string(),
                    instruction: "Type a function definition.".to_string(),
                    target_text: "fn main() { println!(\"Hello, world!\"); }".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
                Task {
                    id: "rs-2".to_string(),
                    instruction: "Practice variable declarations.".to_string(),
                    target_text: "let mut count: i32 = 0;".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
                Task {
                    id: "rs-3".to_string(),
                    instruction: "Type a struct definition.".to_string(),
                    target_text: "struct Point { x: f64, y: f64 }".to_string(),
                    time_limit: None,
                    min_accuracy: 0.85,
                },
            ],
        },
        // Speed Drill
        Lesson {
            id: "speed-drill-easy".to_string(),
            name: "Speed Drill - Easy".to_string(),
            description: "Build speed with simple, repetitive patterns.".to_string(),
            category: LessonCategory::Words,
            difficulty: Difficulty::Intermediate,
            tasks: vec![
                Task {
                    id: "sde-1".to_string(),
                    instruction: "Type as fast as you can!".to_string(),
                    target_text: "the the the the the the the the the the".to_string(),
                    time_limit: Some(30),
                    min_accuracy: 0.95,
                },
                Task {
                    id: "sde-2".to_string(),
                    instruction: "Keep up the speed!".to_string(),
                    target_text: "and and and and and and and and and and".to_string(),
                    time_limit: Some(30),
                    min_accuracy: 0.95,
                },
            ],
        },
    ]
}

pub fn get_lesson_by_id(id: &str) -> Option<Lesson> {
    get_all_lessons().into_iter().find(|l| l.id == id)
}

pub fn get_lessons_by_category(category: &str) -> Vec<Lesson> {
    let target_category = match category {
        "home_row" => LessonCategory::HomeRow,
        "top_row" => LessonCategory::TopRow,
        "bottom_row" => LessonCategory::BottomRow,
        "numbers" => LessonCategory::Numbers,
        "symbols" => LessonCategory::Symbols,
        "words" => LessonCategory::Words,
        "sentences" => LessonCategory::Sentences,
        "code" => LessonCategory::Code,
        _ => return vec![],
    };

    get_all_lessons()
        .into_iter()
        .filter(|l| l.category == target_category)
        .collect()
}

#[allow(dead_code)]
pub fn get_lessons_by_difficulty(difficulty: &str) -> Vec<Lesson> {
    let target_difficulty = match difficulty {
        "beginner" => Difficulty::Beginner,
        "intermediate" => Difficulty::Intermediate,
        "advanced" => Difficulty::Advanced,
        "expert" => Difficulty::Expert,
        _ => return vec![],
    };

    get_all_lessons()
        .into_iter()
        .filter(|l| l.difficulty == target_difficulty)
        .collect()
}
