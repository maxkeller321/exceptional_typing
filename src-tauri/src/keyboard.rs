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

/// Returns the current keyboard layout identifier from Windows.
/// Uses GetKeyboardLayout to get the HKL (input locale identifier).
/// The low word of HKL is the language ID, the high word is the device handle.
/// We return a string like "windows:0409" (US English) or "windows:0407" (German).
///
/// Common Windows keyboard layout language IDs:
///   0409 = English (US)
///   0809 = English (UK)
///   0407 = German
///   0807 = German (Swiss)
///   100C = French (Swiss)
///   040C = French
///   080C = French (Belgian)
///   0C0A = Spanish
///   0410 = Italian
///   0816 = Portuguese (Portugal)
///   0416 = Portuguese (Brazil)
///   041D = Swedish
///   0414 = Norwegian (Bokmål)
///   0406 = Danish
///   041F = Turkish
///   00010409 = Dvorak
#[cfg(target_os = "windows")]
pub fn get_current_input_source() -> Option<String> {
    use winapi::um::winuser::GetKeyboardLayout;

    unsafe {
        let hkl = GetKeyboardLayout(0);
        if hkl.is_null() {
            return None;
        }

        // The low word of HKL is the language identifier
        let lang_id = (hkl as usize) & 0xFFFF;
        // The high word is the keyboard layout/device handle
        let layout_id = ((hkl as usize) >> 16) & 0xFFFF;

        // Dvorak has a specific layout handle
        // Standard US Dvorak: layout_id = 0x0001, lang_id = 0x0409
        if layout_id == 0x0001 && lang_id == 0x0409 {
            return Some("windows:dvorak".to_string());
        }

        Some(format!("windows:{:04x}", lang_id))
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
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
        // On Windows, this should always return something
        #[cfg(target_os = "windows")]
        assert!(result.is_some(), "Should detect input source on Windows");
    }
}
