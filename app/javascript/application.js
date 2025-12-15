import { Application } from '@hotwired/stimulus'
import SmoothScrollController from './controllers/smooth_scroll_controller'
import TypingController from './controllers/typing_controller'
import ParticlesController from './controllers/particles_controller'
import TooltipController from './controllers/tooltip_controller'
import MobileMenuController from './controllers/mobile_menu_controller'
import ScrollTrackerController from './controllers/scroll_tracker_controller'
import ThemeSwitcherController from './controllers/theme_switcher_controller'
import SpaceShooterController from './controllers/space_shooter_controller'
import EasterEggController from './controllers/easter_egg_controller'
import CookiesController from './controllers/cookies_controller'

window.Stimulus = Application.start()

// Register your controllers here
Stimulus.register('smooth-scroll', SmoothScrollController)
Stimulus.register('typing', TypingController)
Stimulus.register('particles', ParticlesController)
Stimulus.register('tooltip', TooltipController)
Stimulus.register('mobile-menu', MobileMenuController)
Stimulus.register('scroll-tracker', ScrollTrackerController)
Stimulus.register('theme-switcher', ThemeSwitcherController)
Stimulus.register('space-shooter', SpaceShooterController)
Stimulus.register('easter-egg', EasterEggController)
Stimulus.register('cookies', CookiesController)

