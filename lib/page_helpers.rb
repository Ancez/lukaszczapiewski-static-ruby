# frozen_string_literal: true

module PageHelpers
  # Page metadata configuration
  PAGES = {
    '/' => {
      title: 'Lukasz Czapiewski - Full Stack Developer',
      description: 'Full stack developer passionate about Ruby on Rails and building things that matter. Based in Cheltenham, UK.',
      url: 'https://lukaszczapiewski.com',
      image: 'https://lukaszczapiewski.com/images/profile.jpeg',
      priority: 1.0,
      changefreq: 'daily'
    },
    '/projects' => {
      title: 'Projects - Lukasz Czapiewski',
      description: 'A collection of things I\'ve built.',
      url: 'https://lukaszczapiewski.com/projects',
      image: 'https://lukaszczapiewski.com/images/profile.jpeg',
      priority: 0.8,
      changefreq: 'weekly'
    },
    '/privacy-cookies' => {
      title: 'Privacy & Cookies Policy - Lukasz Czapiewski',
      description: 'Privacy and cookies policy for lukaszczapiewski.com. This website uses cookies for theme preference and localStorage for game high scores only.',
      url: 'https://lukaszczapiewski.com/privacy-cookies',
      image: 'https://lukaszczapiewski.com/images/profile.jpeg',
      priority: 0.5,
      changefreq: 'monthly'
    }
  }.freeze

  # Blog posts configuration
  BLOG_POSTS = [
    {
      slug: 'introducing-sprintflint',
      title: 'Introducing SprintFlint',
      date: Date.new(2025, 12, 31),
      description: 'Announcing SprintFlint—simple sprint ticketing software that helps agile teams understand their velocity and ship on time. Track story points, manage sprints, and hit more deadlines.',
      tags: ['Product Launch', 'Agile', 'Rails', 'SaaS']
    },
    {
      slug: 'getting-started-with-static-site-builders',
      title: 'Getting Started with Static Site Builder',
      date: Date.new(2025, 11, 22),
      description: 'A comprehensive guide to building static sites with the static-site-builder gem. Learn installation, configuration, creating pages, working with layouts, JavaScript integration, styling, and deployment.',
      tags: ['Ruby', 'Static Sites', 'Web Development', 'Tutorial']
    },
    {
      slug: 'building-modern-interfaces-with-hotwire',
      title: 'Building Modern Interfaces with Hotwire',
      date: Date.new(2025, 11, 22),
      description: 'How Hotwire revolutionises Rails development by bringing modern interactivity without the complexity of heavy JavaScript frameworks. Learn how Turbo and Stimulus work together to create seamless user experiences.',
      tags: ['Rails', 'Hotwire', 'Stimulus']
    },
    {
      slug: 'the-art-of-simple-code',
      title: 'The Art of Simple Code',
      date: Date.new(2025, 11, 22),
      description: 'Why simplicity beats cleverness every time. A reflection on writing code that your future self will thank you for, with practical examples and principles for maintaining readable, maintainable codebases.',
      tags: ['Programming', 'Best Practices', 'Code Quality']
    }
  ].freeze

  def page_title(path = nil)
    path ||= @current_page
    PAGES[path]&.fetch(:title) || 'Lukasz Czapiewski - Full Stack Developer'
  end

  def page_description(path = nil)
    path ||= @current_page
    PAGES[path]&.fetch(:description) || 'Full stack developer passionate about Ruby on Rails and building things that matter. Based in Cheltenham, UK.'
  end

  def page_url(path = nil)
    path ||= @current_page
    PAGES[path]&.fetch(:url) || 'https://lukaszczapiewski.com'
  end

  def page_image(path = nil)
    path ||= @current_page
    PAGES[path]&.fetch(:image) || 'https://lukaszczapiewski.com/images/profile.jpeg'
  end

  module_function

  def reading_time(text_or_file_path)
    text = if text_or_file_path.is_a?(String) && File.exist?(text_or_file_path)
      # If it's a file path, read and extract text from ERB
      content = File.read(text_or_file_path)
      # Remove ERB tags (including multi-line) and extract text content
      content.gsub(/<%.*?%>/m, ' ')
             .gsub(/<[^>]*>/, ' ')
             .gsub(/\s+/, ' ')
             .strip
    else
      # If it's text content, strip HTML tags
      text_or_file_path.to_s.gsub(/<[^>]*>/, ' ').gsub(/\s+/, ' ').strip
    end
    
    return 1 if text.nil? || text.empty?
    
    word_count = text.split(/\s+/).length
    
    # Average reading speed: 200 words per minute
    minutes = (word_count / 200.0).ceil
    minutes = 1 if minutes < 1
    minutes
  end
end

