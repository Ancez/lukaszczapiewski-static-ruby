import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['icon']

  connect() {
    this.setInitialTheme()
  }

  setInitialTheme() {
    // Theme is already set by inline script in head, just sync icons
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    this.updateIcon(currentTheme)
  }

  toggle() {
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme(newTheme)
    this.setCookie('theme', newTheme, 365)
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    this.updateIcon(theme)
  }

  updateIcon(theme) {
    this.iconTargets.forEach(iconContainer => {
      const sunIcon = iconContainer.querySelector('[data-theme-icon="sun"]')
      const moonIcon = iconContainer.querySelector('[data-theme-icon="moon"]')
      
      if (theme === 'dark') {
        sunIcon?.classList.add('hidden')
        moonIcon?.classList.remove('hidden')
      } else {
        sunIcon?.classList.remove('hidden')
        moonIcon?.classList.add('hidden')
      }
    })
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
