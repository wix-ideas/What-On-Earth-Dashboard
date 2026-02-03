#!/bin/bash

# Flutter Web Build Script for Vercel

echo "🚀 Starting Flutter web build for Vercel..."

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Installing Flutter..."
    
    # Download and install Flutter
    git clone https://github.com/flutter/flutter.git -b stable --depth 1
    export PATH="$PATH:`pwd`/flutter/bin"
    
    # Pre-download development binaries
    flutter precache --web
fi

# Get Flutter version
echo "📱 Flutter version:"
flutter --version

# Install dependencies
echo "📦 Installing dependencies..."
flutter pub get

# Build for web with HTML renderer (better compatibility)
echo "🔨 Building Flutter web app..."
flutter build web --release --web-renderer html --base-href /

echo "✅ Build complete! Output in build/web/"

# List build contents
echo "📁 Build contents:"
ls -la build/web/