#!/bin/bash

# Exceptional Typing - Setup Script
# This script sets up the development environment

set -e

echo "🎹 Setting up Exceptional Typing..."
echo ""

# Check for Rust
if ! command -v cargo &> /dev/null; then
    echo "📦 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "✓ Rust is installed"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
else
    echo "✓ Node.js is installed ($(node --version))"
fi

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Install Tauri CLI if not present
if ! command -v cargo-tauri &> /dev/null; then
    echo ""
    echo "📦 Installing Tauri CLI..."
    cargo install tauri-cli
fi

# macOS-specific setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🍎 macOS detected - checking Xcode..."

    if ! xcode-select -p &> /dev/null; then
        echo "   Installing Xcode Command Line Tools..."
        xcode-select --install
    else
        echo "✓ Xcode Command Line Tools installed"
    fi
fi

# Windows-specific info
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo ""
    echo "🪟 Windows detected"
    echo "   Make sure you have:"
    echo "   - Microsoft Visual Studio C++ Build Tools"
    echo "   - WebView2 (usually pre-installed on Windows 10/11)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run tauri:dev"
echo ""
echo "To build for production:"
echo "  npm run tauri:build"
echo ""
