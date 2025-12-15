# frozen_string_literal: true
# encoding: utf-8

# Set default external encoding to UTF-8
Encoding.default_external = Encoding::UTF_8

require "fileutils"
require "pathname"
require "json"

namespace :build do
  desc "Build everything (HTML + CSS)"
  task :all => [:html, :assets, :css] do
    puts "\n✓ Build complete!"
  end

  desc "Build JavaScript assets"
  task :assets do
    if File.exist?("package.json")
      package_json = JSON.parse(File.read("package.json"))
      build_script = package_json.dig("scripts", "build")
      # Only run if build script exists and doesn't include CSS (CSS handled separately)
      if build_script && !build_script.include?("build:css") && build_script != "echo 'No JS bundling needed'"
        sh "npm run build"
      end
    end
  end

  desc "Compile all pages to static HTML"
  task :html do
    load "lib/site_builder.rb"
  end

  desc "Build CSS (runs after HTML so dist directory exists)"
  task :css do
    if File.exist?("package.json")
      package_json = JSON.parse(File.read("package.json"))
      if package_json.dig("scripts", "build:css")
        # Always build CSS to ensure it's processed
        sh "npm run build:css"
      end
    elsif File.exist?("tailwind.config.js")
      # Build CSS even if no package.json (standalone Tailwind)
      if system("which tailwindcss > /dev/null 2>&1")
        FileUtils.mkdir_p("dist/assets/stylesheets")
        sh "tailwindcss -i ./app/assets/stylesheets/application.css -o ./dist/assets/stylesheets/application.css --minify"
      end
    end
  end

  desc "Clean dist directory"
  task :clean do
    dist_dir = Pathname.new(Dir.pwd).join("dist")
    FileUtils.rm_rf(dist_dir) if dist_dir.exist?
    puts "Cleaned #{dist_dir}"
  end

  desc "Build for production/release (cleans dist directory first)"
  task :production do
    ENV["PRODUCTION"] = "true"
    Rake::Task["build:all"].invoke
  end
end

namespace :dev do
  desc "Start development server with auto-rebuild and live reload"
  task :server do
    require "webrick"
    require "fileutils"
    require "static_site_builder/websocket_server"
    require "json"

    port = ENV["PORT"] || 3000
    ws_port = ENV["WS_PORT"] || 3001
    dist_dir = Pathname.new(Dir.pwd).join("dist")
    reload_file = Pathname.new(Dir.pwd).join(".reload")

    # Start WebSocket server for live reload (before first build)
    ws_server = StaticSiteBuilder::WebSocketServer.new(port: ws_port, reload_file: reload_file)
    ws_server.start

    # Build once before starting (with live reload enabled)
    ENV["LIVE_RELOAD"] = "true"
    ENV["WS_PORT"] = ws_port.to_s
    Rake::Task["build:all"].invoke

    # Check if we need to run Tailwind CSS watch (after initial build)
    tailwind_pid = nil
    package_json_path = Pathname.new(Dir.pwd).join("package.json")
    if package_json_path.exist?
      package_json = JSON.parse(File.read(package_json_path))
      if package_json.dig("scripts", "watch:css")
        puts "🎨 Starting Tailwind CSS watch mode..."
        tailwind_pid = spawn("npm", "run", "watch:css", :err => File::NULL, :out => File::NULL)
        # Touch the source file to trigger Tailwind watch to process CSS immediately
        css_source = Pathname.new(Dir.pwd).join("app", "assets", "stylesheets", "application.css")
        if css_source.exist?
          FileUtils.touch(css_source)
        end
        # Give Tailwind a moment to process CSS
        sleep 1.5
      end
    end

    puts "\n🚀 Starting development server at http://localhost:#{port}"
    puts "📡 WebSocket server at ws://localhost:#{ws_port}"
    puts "📝 Watching for changes... (Ctrl+C to stop)"
    puts "🔄 Live reload enabled - pages will auto-refresh on changes\n"

    # Simple file watcher - rebuild HTML when non-CSS files change
    # CSS changes are handled by Tailwind watch, so we skip rebuild for CSS files
    # When HTML rebuilds, it cleans dist, so we need to rebuild CSS immediately after
    # Exclude .readmes directory (generated files) and increase sleep to reduce reload frequency
    watcher_code = %q{watched = ['app', 'config']; exts = ['.erb', '.rb', '.js']; mtimes = {}; last_build = Time.now; loop do; changed = false; watched.each do |dir|; Dir.glob(File.join(dir, '**', '*')).each do |f|; next unless File.file?(f); next if f.end_with?('.css'); next if f.include?('.readmes'); next if f.include?('/dist/'); next unless exts.any? { |e| f.end_with?(e) }; mtime = File.mtime(f); if mtimes[f] != mtime; mtimes[f] = mtime; changed = true; end; end; end; if changed && (Time.now - last_build) > 2; system('rake build:all > /dev/null 2>&1'); last_build = Time.now; end; sleep 1; end}
    watcher_pid = spawn("ruby", "-e", watcher_code, :err => File::NULL)

    # Start web server with custom handler for clean URLs
    server = WEBrick::HTTPServer.new(
      Port: port,
      BindAddress: "127.0.0.1"
    )

    # Mount assets directory normally
    server.mount('/assets', WEBrick::HTTPServlet::FileHandler, File.join(dist_dir.to_s, 'assets'))
    server.mount('/images', WEBrick::HTTPServlet::FileHandler, File.join(dist_dir.to_s, 'images'))

    # Custom handler for HTML pages (supports clean URLs)
    server.mount_proc('/') do |req, res|
      path = req.path
      
      # Handle root path
      if path == '/'
        index_path = File.join(dist_dir.to_s, 'index.html')
        if File.exist?(index_path)
          res.status = 200
          res['Content-Type'] = 'text/html'
          res.body = File.read(index_path)
          next
        end
      end
      
      # Remove leading slash for path operations
      clean_path = path.start_with?('/') ? path[1..-1] : path
      
      # Handle paths without extension (try adding .html)
      # Check for nested paths like /projects/static-site-builder
      if !path.include?('.') && !path.end_with?('/')
        html_path = File.join(dist_dir.to_s, "#{clean_path}.html")
        if File.exist?(html_path)
          res.status = 200
          res['Content-Type'] = 'text/html'
          res.body = File.read(html_path)
          next
        end
      end
      
      # Try direct file path
      file_path = File.join(dist_dir.to_s, clean_path)
      if File.directory?(file_path)
        index_path = File.join(file_path, 'index.html')
        if File.exist?(index_path)
          res.status = 200
          res['Content-Type'] = 'text/html'
          res.body = File.read(index_path)
          next
        end
      elsif File.exist?(file_path) && File.file?(file_path)
        res.status = 200
        res['Content-Type'] = WEBrick::HTTPUtils.mime_type(file_path, WEBrick::HTTPUtils::DefaultMimeTypes)
        res.body = File.read(file_path)
        next
      end
      
      # Not found
      res.status = 404
      res['Content-Type'] = 'text/html'
      res.body = "Not Found\n'#{req.path}' not found.\n"
    end

    trap("INT") do
      puts "\n\nShutting down..."
      Process.kill("TERM", watcher_pid) if watcher_pid
      Process.kill("TERM", tailwind_pid) if tailwind_pid
      ws_server.stop
      server.shutdown
    end

    server.start
  end
end

task default: "build:all"
