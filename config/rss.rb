# frozen_string_literal: true

require 'fileutils'
require 'cgi'
require_relative '../lib/page_helpers'

# RSS feed configuration
rss_feed_path = File.join(Dir.pwd, 'dist', 'feed.xml')
base_url = 'https://lukaszczapiewski.com'

# Helper method to escape XML content
def escape_xml(text)
  CGI.escapeHTML(text.to_s)
end

# Helper method to format RSS date
def rss_date(date)
  date.to_time.utc.strftime('%a, %d %b %Y %H:%M:%S %z')
end

# Build RSS feed XML manually
channel_title = 'Lukasz Czapiewski - Blog'
channel_link = "#{base_url}/blog"
channel_description = 'Thoughts, tutorials, and insights on development, technology, and building things.'
channel_language = 'en'
channel_updated = Time.now

# Build RSS items
items_xml = PageHelpers::BLOG_POSTS.sort_by { |post| -post[:date].to_time.to_i }.map do |post|
  item_link = "#{base_url}/blog/#{post[:slug]}"
  item_title = escape_xml(post[:title])
  item_description = escape_xml(post[:description])
  item_pub_date = rss_date(post[:date])
  item_guid = item_link
  
  <<ITEM
    <item>
      <title>#{item_title}</title>
      <link>#{item_link}</link>
      <description>#{item_description}</description>
      <pubDate>#{item_pub_date}</pubDate>
      <guid isPermaLink="true">#{item_guid}</guid>
    </item>
ITEM
end.join("\n")

# Build complete RSS feed
rss_xml = <<RSS
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:trackback="http://madskills.com/public/xml/rss/module/trackback/">
  <channel>
    <title>#{escape_xml(channel_title)}</title>
    <link>#{channel_link}</link>
    <description>#{escape_xml(channel_description)}</description>
    <language>#{channel_language}</language>
    <pubDate>#{rss_date(channel_updated)}</pubDate>
#{items_xml}
    <dc:date>#{channel_updated.utc.iso8601}</dc:date>
  </channel>
</rss>
RSS

# Ensure dist directory exists
FileUtils.mkdir_p(File.dirname(rss_feed_path))

# Write RSS feed to file
File.write(rss_feed_path, rss_xml)
puts "✓ RSS feed generated at #{rss_feed_path}"

