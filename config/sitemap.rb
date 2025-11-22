# frozen_string_literal: true

require 'sitemap_generator'
require_relative '../lib/page_helpers'

SitemapGenerator::Sitemap.default_host = 'https://lukaszczapiewski.com'
SitemapGenerator::Sitemap.sitemaps_path = 'sitemaps'
SitemapGenerator::Sitemap.public_path = 'dist'

SitemapGenerator::Sitemap.create do
  PageHelpers::PAGES.each do |path, metadata|
    add path,
        lastmod: Time.now,
        priority: metadata[:priority] || 0.5,
        changefreq: metadata[:changefreq] || 'weekly'
  end
end

