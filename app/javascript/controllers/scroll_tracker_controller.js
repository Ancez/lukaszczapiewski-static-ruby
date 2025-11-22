import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['navItem']

  connect() {
    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll() // Check initial state
  }

  disconnect() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const heroSection = document.querySelector('section:first-of-type')
    const aboutSection = document.getElementById('about')
    const contactSection = document.getElementById('contact')

    if (!heroSection) return

    const viewportMiddle = window.innerHeight / 2
    let activeSection = 'home'

    // Check sections from bottom to top (most specific first)
    if (contactSection) {
      const contactRect = contactSection.getBoundingClientRect()
      if (contactRect.top <= viewportMiddle) {
        activeSection = 'contact'
      } else if (aboutSection) {
        const aboutRect = aboutSection.getBoundingClientRect()
        if (aboutRect.top <= viewportMiddle) {
          activeSection = 'about'
        }
      }
    } else if (aboutSection) {
      const aboutRect = aboutSection.getBoundingClientRect()
      if (aboutRect.top <= viewportMiddle) {
        activeSection = 'about'
      }
    }

    this.updateActiveNav(activeSection)
  }

  updateActiveNav(activeSection) {
    this.navItemTargets.forEach(item => {
      const href = item.getAttribute('href')
      const isActive = 
        (activeSection === 'home' && href === '/') ||
        (activeSection === 'about' && href === '/#about') ||
        (activeSection === 'contact' && href === '/#contact')

      if (isActive) {
        item.classList.remove('text-slate-300')
        item.classList.add('text-white')
        const indicator = item.querySelector('span.absolute')
        if (indicator) {
          indicator.classList.remove('w-0')
          indicator.classList.add('w-full')
        }
      } else {
        // Only update if it's one of the scroll-tracked items
        if (href === '/' || href === '/#about' || href === '/#contact') {
          item.classList.remove('text-white')
          item.classList.add('text-slate-300')
          const indicator = item.querySelector('span.absolute')
          if (indicator) {
            indicator.classList.remove('w-full')
            indicator.classList.add('w-0')
          }
        }
      }
    })
  }
}

