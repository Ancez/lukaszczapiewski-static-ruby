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
    }
  }.freeze

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

