# frozen_string_literal: true

module ApplicationHelper
  def default_meta_tags
    {
      site: 'Lukasz Czapiewski',
      title: 'Full Stack Developer',
      description: 'Full stack developer passionate about Ruby on Rails and building things that matter. Based in Cheltenham, UK.',
      keywords: 'Ruby on Rails, Full Stack Developer, Web Development, Lukasz Czapiewski',
      separator: '&mdash;'.html_safe,
      reverse: true,
      og: {
        type: 'website',
        url: 'https://lukaszczapiewski.com',
        image: 'https://lukaszczapiewski.com/images/profile.jpeg'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@lc_ancez'
      }
    }
  end
end

