import { Application } from "@hotwired/stimulus"
import SmoothScrollController from "./controllers/smooth_scroll_controller"
import TypingController from "./controllers/typing_controller"
import ParticlesController from "./controllers/particles_controller"
import TooltipController from "./controllers/tooltip_controller"
import MobileMenuController from "./controllers/mobile_menu_controller"
import ScrollTrackerController from "./controllers/scroll_tracker_controller"
import ThemeSwitcherController from "./controllers/theme_switcher_controller"
import SpaceShooterController from "./controllers/space_shooter_controller"
import EasterEggController from "./controllers/easter_egg_controller"
import CookiesController from "./controllers/cookies_controller"
import HeaderScrollController from "./controllers/header_scroll_controller"

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
Stimulus.register("header-scroll", HeaderScrollController)

// View Transitions - Cross-document navigation types
if ('navigation' in window && navigation && 'viewTransition' in document) {
  // Determine transition type based on navigation direction
  const determineTransitionType = (fromURL, toURL) => {
    if (fromURL.pathname === toURL.pathname) {
      return 'reload'
    }
    
    // Simple heuristic: if navigating deeper (more path segments), it's forward
    const fromDepth = fromURL.pathname.split('/').filter(Boolean).length
    const toDepth = toURL.pathname.split('/').filter(Boolean).length
    
    if (toDepth > fromDepth) {
      return 'forwards'
    } else if (toDepth < fromDepth) {
      return 'backwards'
    }
    
    // Check if navigating to home
    if (toURL.pathname === '/' || toURL.pathname === '') {
      return 'backwards'
    }
    
    return 'forwards'
  }

  // Set transition type on page reveal
  window.addEventListener('pagereveal', async (e) => {
    if (e.viewTransition && navigation.activation && navigation.activation.from && navigation.activation.entry) {
      const fromURL = new URL(navigation.activation.from.url)
      const toURL = new URL(navigation.activation.entry.url)
      const transitionType = determineTransitionType(fromURL, toURL)
      
      e.viewTransition.types.add(transitionType)
    }
  })

  // Also handle pageswap for the old page
  window.addEventListener('pageswap', async (e) => {
    if (e.viewTransition && navigation.activation && navigation.activation.from && navigation.activation.entry) {
      const fromURL = new URL(navigation.activation.from.url)
      const toURL = new URL(navigation.activation.entry.url)
      const transitionType = determineTransitionType(fromURL, toURL)
      
      e.viewTransition.types.add(transitionType)
    }
  })
}
