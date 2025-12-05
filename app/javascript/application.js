import { Application } from "@hotwired/stimulus"
import SmoothScrollController from "controllers/smooth_scroll"
import TypingController from "controllers/typing"
import ParticlesController from "controllers/particles"
import TooltipController from "controllers/tooltip"
import MobileMenuController from "controllers/mobile_menu"
import ScrollTrackerController from "controllers/scroll_tracker"
import ThemeSwitcherController from "controllers/theme_switcher"
import SpaceShooterController from "controllers/space_shooter"
import EasterEggController from "controllers/easter_egg"
import CookiesController from "controllers/cookies"

window.Stimulus = Application.start()

// Register your controllers here
Stimulus.register("smooth-scroll", SmoothScrollController)
Stimulus.register("typing", TypingController)
Stimulus.register("particles", ParticlesController)
Stimulus.register("tooltip", TooltipController)
Stimulus.register("mobile-menu", MobileMenuController)
Stimulus.register("scroll-tracker", ScrollTrackerController)
Stimulus.register("theme-switcher", ThemeSwitcherController)
Stimulus.register("space-shooter", SpaceShooterController)
Stimulus.register("easter-egg", EasterEggController)
Stimulus.register("cookies", CookiesController)

// View Transitions - Set view-transition-name for title morphing
if ('startViewTransition' in document && 'navigation' in window && navigation) {
  const extractSlug = (url, prefix) => {
    const match = url.pathname.match(new RegExp(`^/${prefix}/([^/]+)`))
    return match ? match[1] : null
  }

  // Set view-transition-name on card title when clicked
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return

    try {
      const url = new URL(href, window.location.origin)
      if (url.origin !== window.location.origin) return
      
      const blogSlug = extractSlug(url, 'blog')
      const projectSlug = extractSlug(url, 'projects')
      
      if (blogSlug || projectSlug) {
        const slug = blogSlug || projectSlug
        const prefix = blogSlug ? 'blog' : 'project'
        const titleElement = link.querySelector(`[data-view-transition-title="${prefix}-${slug}"]`)
        if (titleElement) {
          titleElement.style.viewTransitionName = `${prefix}-${slug}`
        }
      }
    } catch (err) {
      // Invalid URL, ignore
    }
  }, true)

  // Set view-transition-name on detail page title
  window.addEventListener('pagereveal', async (e) => {
    if (e.viewTransition && navigation.activation?.entry) {
      const toURL = new URL(navigation.activation.entry.url)
      const blogSlug = extractSlug(toURL, 'blog')
      const projectSlug = extractSlug(toURL, 'projects')
      
      if (blogSlug || projectSlug) {
        const slug = blogSlug || projectSlug
        const prefix = blogSlug ? 'blog' : 'project'
        const titleElement = document.querySelector(`[data-view-transition-title="${prefix}-${slug}"]`)
        if (titleElement) {
          titleElement.style.viewTransitionName = `${prefix}-${slug}`
        }
      }
    }
  })
}
