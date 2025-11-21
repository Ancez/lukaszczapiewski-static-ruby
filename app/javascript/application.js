import { Application } from "@hotwired/stimulus"
import SmoothScrollController from "controllers/smooth_scroll"
import TypingController from "controllers/typing"
import ParticlesController from "controllers/particles"
import TooltipController from "controllers/tooltip"

window.Stimulus = Application.start()

// Register your controllers here
Stimulus.register("smooth-scroll", SmoothScrollController)
Stimulus.register("typing", TypingController)
Stimulus.register("particles", ParticlesController)
Stimulus.register("tooltip", TooltipController)
