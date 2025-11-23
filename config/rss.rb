# frozen_string_literal: true

require 'rss'
require 'rss/maker'
require 'fileutils'
require_relative '../lib/page_helpers'

# RSS feed configuration
rss_feed_path = File.join(Dir.pwd, 'dist', 'feed.xml')
base_url = 'https://lukaszczapiewski.com'

# Create RSS feed
rss = RSS::Maker.make('2.0') do |maker|
  maker.channel.title = 'Lukasz Czapiewski - Blog'
  maker.channel.link = "#{base_url}/blog"
  maker.channel.description = 'Thoughts, tutorials, and insights on development, technology, and building things.'
  maker.channel.language = 'en'
  maker.channel.updated = Time.now.to_s
  maker.channel.author = 'Lukasz Czapiewski'
  
  # Add blog posts (sorted by date, newest first)
  PageHelpers::BLOG_POSTS.sort_by { |post| -post[:date].to_time.to_i }.each do |post|
    maker.items.new_item do |item|
      item.link = "#{base_url}/blog/#{post[:slug]}"
      item.title = post[:title]
      item.description = post[:description]
      item.pubDate = post[:date].to_time
      item.guid.content = "#{base_url}/blog/#{post[:slug]}"
      item.guid.isPermaLink = true
    end
  end
end

# Ensure dist directory exists
FileUtils.mkdir_p(File.dirname(rss_feed_path))

# Write RSS feed to file
File.write(rss_feed_path, rss.to_s)
puts "✓ RSS feed generated at #{rss_feed_path}"

