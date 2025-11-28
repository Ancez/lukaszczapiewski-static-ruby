import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['menu', 'button', 'hamburger', 'close']

  connect() {
    this.isOpen = false
  }

  toggle(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    this.isOpen = !this.isOpen
    this.updateMenu()
  }

  close() {
    this.isOpen = false
    this.updateMenu()
  }

  updateMenu() {
    if (this.isOpen) {
      // Show menu with animation
      this.menuTarget.style.display = 'flex'
      this.menuTarget.classList.remove('hidden', 'mobile-menu-exit')
      this.menuTarget.classList.add('mobile-menu-enter')
      this.buttonTarget.setAttribute('aria-expanded', 'true')
      this.hamburgerTarget.classList.add('hidden')
      this.closeTarget.classList.remove('hidden')
    } else {
      // Hide menu with animation
      this.menuTarget.classList.remove('mobile-menu-enter')
      this.menuTarget.classList.add('mobile-menu-exit')
      this.buttonTarget.setAttribute('aria-expanded', 'false')
      this.hamburgerTarget.classList.remove('hidden')
      this.closeTarget.classList.add('hidden')
      
      // Wait for animation to complete before hiding
      setTimeout(() => {
        if (!this.isOpen) {
          this.menuTarget.classList.remove('mobile-menu-exit')
          this.menuTarget.classList.add('hidden')
          this.menuTarget.style.display = ''
        }
      }, 250)
    }
  }
}

