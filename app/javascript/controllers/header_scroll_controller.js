import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    this.lastScrollY = window.scrollY
    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll()
  }

  disconnect() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll() {
    const currentScrollY = window.scrollY
    
    if (currentScrollY > 100) {
      if (currentScrollY > this.lastScrollY) {
        this.element.classList.add('-translate-y-full', 'opacity-0')
        this.element.classList.remove('translate-y-0', 'opacity-100')
      } else {
        this.element.classList.remove('-translate-y-full', 'opacity-0')
        this.element.classList.add('translate-y-0', 'opacity-100')
      }
    } else {
      this.element.classList.remove('-translate-y-full', 'opacity-0')
      this.element.classList.add('translate-y-0', 'opacity-100')
    }
    
    this.lastScrollY = currentScrollY
  }
}

