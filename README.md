# lukaszczapiewski-static-ruby

Personal portfolio and blog website built with a custom Ruby static site generator.

## About

This is the source code for [lukaszczapiewski.com](https://lukaszczapiewski.com), a static website showcasing my work, blog posts, and projects. The site is built using a custom Ruby static site generator gem (`static-site-builder`) that compiles ERB templates into static HTML files.

## Tech Stack

- **Static Site Generator**: Custom Ruby gem (`static-site-builder`)
- **Templates**: ERB (Embedded Ruby)
- **JavaScript**: Stimulus controllers with importmap
- **CSS**: Tailwind CSS
- **Build Tools**: Rake tasks for building and development
- **Sitemap**: Automatic sitemap generation

## Project Structure

```
app/
  assets/
    stylesheets/          # Tailwind CSS source files
  javascript/
    application.js        # Main JavaScript entry point
    controllers/          # Stimulus controllers
  views/
    layouts/              # ERB layout templates
    pages/                # Page templates (blog, projects, index)
    shared/               # Shared partials (header, footer, layouts)

config/
  importmap.rb            # JavaScript module mapping
  sitemap.rb              # Sitemap configuration

lib/
  site_builder.rb         # Site build configuration
  page_helpers.rb         # Page metadata and helper methods

dist/                     # Generated static site (output directory)
```

## Development

### Prerequisites

- Ruby (with Bundler)
- Node.js and npm (for Tailwind CSS)

### Setup

1. Install Ruby dependencies:
```bash
bundle install
```

2. Install Node dependencies:
```bash
npm install
```

### Development Server

Start the development server with live reload:

```bash
rake dev:server
```

This will:
- Build the site to the `dist/` directory
- Start a local web server on `http://localhost:3000`
- Watch for file changes and automatically rebuild
- Enable live reload via WebSocket

### Building

Build the static site:

```bash
rake build:all
```

This compiles all pages to HTML and processes CSS.

Build for production (cleans dist directory first):

```bash
rake build:production
```

### Available Rake Tasks

- `rake build:all` - Build HTML and CSS
- `rake build:html` - Build HTML pages only
- `rake build:css` - Build CSS only
- `rake build:production` - Clean and build for production
- `rake build:clean` - Clean the dist directory
- `rake dev:server` - Start development server with live reload

## Adding Content

### Blog Posts

Add blog posts by:
1. Creating a new ERB file in `app/views/pages/blog/`
2. Adding the post metadata to `lib/page_helpers.rb` in the `BLOG_POSTS` array

### Projects

Add project pages by:
1. Creating a new ERB file in `app/views/pages/projects/`
2. The project will automatically appear in the projects listing

## Author

**Lukasz Czapiewski**

- GitHub: [@Ancez](https://github.com/Ancez)
- Twitter: [@lc_ancez](https://twitter.com/lc_ancez)
- Website: [mmtm.io](https://mmtm.io)
- Location: Cheltenham, UK
- Company: mmtm

## Copyright

Copyright © 2025 Lukasz Czapiewski.

**You may:**
- Use this codebase as a starting point for your own projects
- Use this repository as a demo or reference for building static sites
- Adapt the code structure, templates, and build configuration for your own use

**You may not:**
- Copy or reproduce any of my written content (blog posts, project descriptions, personal information)
- Use any images from this repository (including profile photos and other assets)
- Claim ownership of my content or present it as your own

The code and structure are available for learning and adaptation, but all content and images remain my intellectual property.