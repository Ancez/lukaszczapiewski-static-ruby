import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['popup', 'container']

  connect() {
    if (!this.hasSeenCookiesNotice()) {
      this.show()
    } else {
      this.hide()
    }
  }

  dismiss() {
    this.setCookie('cookies_notice_seen', 'true', 365)
    this.hide()
  }

  hasSeenCookiesNotice() {
    return this.getCookie('cookies_notice_seen') === 'true'
  }

  show() {
    this.containerTarget.classList.remove('hidden')
    requestAnimationFrame(() => {
      this.popupTarget.classList.remove('opacity-0', 'translate-y-full')
      this.popupTarget.classList.add('opacity-100', 'translate-y-0')
    })
  }

  hide() {
    this.popupTarget.classList.remove('opacity-100', 'translate-y-0')
    this.popupTarget.classList.add('opacity-0', 'translate-y-full')
    setTimeout(() => {
      this.containerTarget.classList.add('hidden')
    }, 500)
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

