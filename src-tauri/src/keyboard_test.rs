#[test]
fn test_get_input_source() {
    let result = super::keyboard::get_current_input_source();
    println!("Detected input source: {:?}", result);
    assert!(result.is_some(), "Should detect an input source on macOS");
}
