# frozen_string_literal: true
# encoding: utf-8

# Ensure UTF-8 encoding
Encoding.default_external = Encoding::UTF_8 if defined?(Encoding)

require "static_site_builder"

require "importmap-rails"

# Load page helpers
require_relative "page_helpers"

# Configure the builder for your stack
builder = StaticSiteBuilder::Builder.new(
  root: Dir.pwd,
  template_engine: "erb",
  js_bundler: "importmap",
  importmap_config: "config/importmap.rb",

)

# Build the site
builder.build

# Copy vendor JavaScript files to dist/assets/javascripts/
require "fileutils"
vendor_js_dir = File.join(Dir.pwd, "vendor", "javascript")
dist_js_dir = File.join(Dir.pwd, "dist", "assets", "javascripts")
if Dir.exist?(vendor_js_dir) && Dir.exist?(dist_js_dir)
  Dir.glob(File.join(vendor_js_dir, "*.js")).each do |vendor_file|
    filename = File.basename(vendor_file)
    dest_file = File.join(dist_js_dir, filename)
    FileUtils.cp(vendor_file, dest_file)
    puts "  ✓ Copied #{filename} to dist/assets/javascripts/"
  end
end

# Generate sitemap
begin
  require "sitemap_generator"
  load File.join(Dir.pwd, "config", "sitemap.rb")
  puts "\n✓ Sitemap generated"
rescue LoadError
  puts "\n⚠️  sitemap_generator not available, skipping sitemap generation"
rescue => e
  puts "\n⚠️  Error generating sitemap: #{e.message}"
end

# Generate RSS feed
begin
  require "fileutils"
  load File.join(Dir.pwd, "config", "rss.rb")
rescue => e
  puts "\n⚠️  Error generating RSS feed: #{e.message}"
end
