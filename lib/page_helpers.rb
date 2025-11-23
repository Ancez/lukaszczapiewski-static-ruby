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
    '/privacy' => {
      title: 'Privacy Policy - Lukasz Czapiewski',
      description: 'Privacy policy for lukaszczapiewski.com. This website does not use cookies or tracking.',
      url: 'https://lukaszczapiewski.com/privacy',
      image: 'https://lukaszczapiewski.com/images/profile.jpeg',
      priority: 0.5,
      changefreq: 'monthly'
    }
  }.freeze

  # Blog posts configuration
  BLOG_POSTS = [
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
end

