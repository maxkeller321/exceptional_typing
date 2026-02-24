/// Returns the current keyboard input source identifier from macOS.
/// Example return values:
///   "com.apple.keylayout.US"
///   "com.apple.keylayout.German"
///   "com.apple.keylayout.Dvorak"
///   "com.apple.keylayout.French"
///   "com.apple.keylayout.Colemak"
///   "com.apple.keylayout.British"

#[cfg(target_os = "macos")]
pub fn get_current_input_source() -> Option<String> {
    use core_foundation::base::{CFRelease, TCFType};
    use core_foundation::string::CFString;
    use std::ffi::c_void;

    // Carbon/HIToolbox bindings
    extern "C" {
        fn TISCopyCurrentKeyboardInputSource() -> *mut c_void;
        fn TISGetInputSourceProperty(
            source: *mut c_void,
            property_key: *const c_void,
        ) -> *const c_void;
        static kTISPropertyInputSourceID: *const c_void;
    }

    unsafe {
        let source = TISCopyCurrentKeyboardInputSource();
        if source.is_null() {
            return None;
        }

        let property = TISGetInputSourceProperty(source, kTISPropertyInputSourceID);
        let result = if !property.is_null() {
            let cf_str = CFString::wrap_under_get_rule(property as _);
            Some(cf_str.to_string())
        } else {
            None
        };

        CFRelease(source);
        result
    }
}

#[cfg(not(target_os = "macos"))]
pub fn get_current_input_source() -> Option<String> {
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_current_input_source() {
        let result = get_current_input_source();
        println!("Detected keyboard input source: {:?}", result);
        // On macOS, this should always return something
        #[cfg(target_os = "macos")]
        assert!(result.is_some(), "Should detect input source on macOS");
    }
}
