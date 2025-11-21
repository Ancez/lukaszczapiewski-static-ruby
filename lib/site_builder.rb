# frozen_string_literal: true

require "static_site_builder"

require "importmap-rails"

# Configure the builder for your stack
builder = StaticSiteBuilder::Builder.new(
  root: Dir.pwd,
  template_engine: "erb",
  js_bundler: "importmap",
  importmap_config: "config/importmap.rb",

)

# Build the site
builder.build
