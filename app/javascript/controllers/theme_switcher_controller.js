import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static values = {
    theme: String
  }

  connect() {
    this.loadTheme()
    this.handleScroll = this.handleScroll.bind(this)
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll()
  }

  disconnect() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  loadTheme() {
    const savedTheme = this.getCookie('theme') || 'dark'
    this.setTheme(savedTheme)
  }

  toggle() {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    
    // Add switching animation
    const button = this.element.querySelector('button')
    if (button) {
      button.classList.add('theme-switcher-switching')
      setTimeout(() => {
        button.classList.remove('theme-switcher-switching')
      }, 600)
    }
    
    this.setTheme(newTheme)
    this.setCookie('theme', newTheme, 365)
  }

  setTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    this.themeValue = theme
  }

  handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset
    if (scrollY > 200) {
      this.element.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none')
      this.element.classList.add('opacity-100', 'translate-y-0')
    } else {
      this.element.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none')
      this.element.classList.remove('opacity-100', 'translate-y-0')
    }
  }

  getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }

  setCookie(name, value, days) {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }
}
