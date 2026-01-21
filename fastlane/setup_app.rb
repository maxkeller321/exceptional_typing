#!/usr/bin/env ruby
# Fastlane Setup Script for Exceptional Typing
# This script helps automate the App Store Connect setup

require 'json'

APP_NAME = "Exceptional Typing"
BUNDLE_ID = "com.exceptionaltyping.app"
SKU = "exceptional-typing"

puts "\n" + "=" * 60
puts "  Exceptional Typing - App Store Setup"
puts "=" * 60
puts "\nThis script will help you set up your app in App Store Connect."
puts "Make sure you have your Apple Developer credentials ready.\n\n"

# Check for required environment variables
required_vars = %w[APPLE_ID APPLE_TEAM_ID]
missing_vars = required_vars.select { |var| ENV[var].nil? || ENV[var].empty? }

if missing_vars.any?
  puts "❌ Missing required environment variables:"
  missing_vars.each { |var| puts "   - #{var}" }
  puts "\nPlease set these in fastlane/.env or export them:"
  puts "  export APPLE_ID=\"your-email@example.com\""
  puts "  export APPLE_TEAM_ID=\"XXXXXXXXXX\""
  exit 1
end

puts "✅ Environment variables configured"
puts "   APPLE_ID: #{ENV['APPLE_ID']}"
puts "   APPLE_TEAM_ID: #{ENV['APPLE_TEAM_ID']}"

puts "\n" + "-" * 60
puts "Step 1: Create App in App Store Connect"
puts "-" * 60

puts "\nThis will use Fastlane's 'produce' to create the app."
puts "App Name: #{APP_NAME}"
puts "Bundle ID: #{BUNDLE_ID}"
puts "SKU: #{SKU}"

print "\nProceed? (y/n): "
response = gets.chomp.downcase

if response == 'y'
  # Run produce command
  system("bundle exec fastlane produce create " \
         "--app_identifier '#{BUNDLE_ID}' " \
         "--app_name '#{APP_NAME}' " \
         "--sku '#{SKU}' " \
         "--language 'English' " \
         "--app_version '0.1.0' " \
         "--platforms 'osx'")

  if $?.success?
    puts "\n✅ App created successfully in App Store Connect!"
  else
    puts "\n⚠️  There was an issue. The app may already exist, which is fine."
    puts "   Check App Store Connect to verify: https://appstoreconnect.apple.com"
  end
else
  puts "Skipped."
end

puts "\n" + "-" * 60
puts "Step 2: Generate Signing Certificates"
puts "-" * 60

puts "\nWould you like to generate/sync signing certificates using Match?"
puts "This requires a private Git repository for storing certificates."

print "\nProceed with certificate setup? (y/n): "
response = gets.chomp.downcase

if response == 'y'
  if ENV['MATCH_GIT_URL'].nil? || ENV['MATCH_GIT_URL'].empty?
    puts "\n⚠️  MATCH_GIT_URL not set."
    puts "Please create a PRIVATE Git repository for certificates and set:"
    puts "  export MATCH_GIT_URL=\"git@github.com:your-org/certificates.git\""
  else
    puts "\nGenerating Mac App Store certificates..."
    system("bundle exec fastlane match appstore --platform macos")

    puts "\nGenerating Developer ID certificates (for direct distribution)..."
    system("bundle exec fastlane match developer_id --platform macos")
  end
else
  puts "Skipped."
end

puts "\n" + "-" * 60
puts "Step 3: App Store Connect API Key"
puts "-" * 60

puts "\nTo enable automated uploads, you need an App Store Connect API key."
puts "\n📋 Manual steps required:"
puts "   1. Go to: https://appstoreconnect.apple.com/access/api"
puts "   2. Click '+' to create a new key"
puts "   3. Name: 'Fastlane CI'"
puts "   4. Access: 'App Manager'"
puts "   5. Download the .p8 file (you can only download once!)"
puts "   6. Copy it to: fastlane/AuthKey_XXXXXX.p8"
puts "   7. Note the Key ID and Issuer ID"
puts "\nThen update your .env file with:"
puts "   APP_STORE_CONNECT_API_KEY_KEY_ID=\"your-key-id\""
puts "   APP_STORE_CONNECT_API_KEY_ISSUER_ID=\"your-issuer-id\""
puts "   APP_STORE_CONNECT_API_KEY_KEY_FILEPATH=\"./AuthKey_XXXXXX.p8\""

puts "\n" + "=" * 60
puts "  Setup Complete!"
puts "=" * 60
puts "\n📝 Next steps:"
puts "   1. Complete the API key setup (Step 3 above)"
puts "   2. Fill in app metadata in App Store Connect"
puts "   3. Add screenshots to fastlane/screenshots/en-US/"
puts "   4. Test with: bundle exec fastlane mac build_release"
puts "   5. Upload beta: bundle exec fastlane mac beta"
puts "\n🔗 Useful links:"
puts "   - App Store Connect: https://appstoreconnect.apple.com"
puts "   - Developer Portal: https://developer.apple.com/account"
puts "   - Fastlane Docs: https://docs.fastlane.tools"
puts "\n"
