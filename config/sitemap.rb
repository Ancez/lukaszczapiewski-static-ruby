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

  # Add blog posts
  PageHelpers::BLOG_POSTS.each do |post|
    add "/blog/#{post[:slug]}",
        lastmod: Time.now,
        priority: 0.7,
        changefreq: 'monthly'
  end

  # Add project pages - automatically discover from filesystem
  projects_dir = File.join(Dir.pwd, 'app', 'views', 'pages', 'projects')
  if Dir.exist?(projects_dir)
    Dir.glob(File.join(projects_dir, '*.html.erb')).each do |file|
      slug = File.basename(file, '.html.erb')
      next if slug.start_with?('_') # Skip partials
      add "/projects/#{slug}",
          lastmod: Time.now,
          priority: 0.7,
          changefreq: 'monthly'
    end
  end
end

