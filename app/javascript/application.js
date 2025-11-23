import { Application } from "@hotwired/stimulus"
import SmoothScrollController from "controllers/smooth_scroll"
import TypingController from "controllers/typing"
import ParticlesController from "controllers/particles"
import TooltipController from "controllers/tooltip"
import MobileMenuController from "controllers/mobile_menu"
import ScrollTrackerController from "controllers/scroll_tracker"
import ThemeSwitcherController from "controllers/theme_switcher"

window.Stimulus = Application.start()

// Register your controllers here
Stimulus.register("smooth-scroll", SmoothScrollController)
Stimulus.register("typing", TypingController)
Stimulus.register("particles", ParticlesController)
Stimulus.register("tooltip", TooltipController)
Stimulus.register("mobile-menu", MobileMenuController)
Stimulus.register("scroll-tracker", ScrollTrackerController)
Stimulus.register("theme-switcher", ThemeSwitcherController)
