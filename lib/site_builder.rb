# frozen_string_literal: true

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
