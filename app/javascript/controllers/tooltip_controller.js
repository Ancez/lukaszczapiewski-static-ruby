import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    content: String,
    placement: { type: String, default: 'top' },
    delay: { type: Number, default: 0 }
  }

  connect() {
    this.tooltip = null
    this.timeout = null
    this.element.addEventListener('mouseenter', this.show.bind(this))
    this.element.addEventListener('mouseleave', this.hide.bind(this))
    this.element.addEventListener('focus', this.show.bind(this))
    this.element.addEventListener('blur', this.hide.bind(this))
  }

  disconnect() {
    this.hide()
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  show() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      const content = this.hasContentValue 
        ? this.contentValue 
        : (this.element.getAttribute('data-tooltip-text') || this.element.getAttribute('title') || '')

      if (!content) return

      // Remove title to prevent default browser tooltip
      const title = this.element.getAttribute('title')
      if (title) {
        this.element.setAttribute('data-original-title', title)
        this.element.removeAttribute('title')
      }

      this.tooltip = document.createElement('div')
      this.tooltip.className = `tooltip tooltip-${this.placementValue}`
      this.tooltip.textContent = content
      this.tooltip.setAttribute('role', 'tooltip')
      this.tooltip.style.visibility = 'hidden'
      this.tooltip.style.position = 'absolute'
      document.body.appendChild(this.tooltip)

      // Position after rendering
      requestAnimationFrame(() => {
        this.positionTooltip()
        this.tooltip.style.visibility = 'visible'
      })
    }, this.delayValue)
  }

  hide() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    if (this.tooltip) {
      this.tooltip.remove()
      this.tooltip = null
    }

    // Restore original title
    const originalTitle = this.element.getAttribute('data-original-title')
    if (originalTitle) {
      this.element.setAttribute('title', originalTitle)
      this.element.removeAttribute('data-original-title')
    }
  }

  positionTooltip() {
    if (!this.tooltip) return

    const rect = this.element.getBoundingClientRect()
    const tooltipRect = this.tooltip.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX

    let top, left

    switch (this.placementValue) {
      case 'bottom':
        top = rect.bottom + scrollY + 8
        left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2)
        break
      case 'left':
        top = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2)
        left = rect.left + scrollX - tooltipRect.width - 8
        break
      case 'right':
        top = rect.top + scrollY + (rect.height / 2) - (tooltipRect.height / 2)
        left = rect.right + scrollX + 8
        break
      case 'top':
      default:
        top = rect.top + scrollY - tooltipRect.height - 8
        left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2)
        break
    }

    // Keep tooltip within viewport
    const padding = 8
    if (left < padding) left = padding
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding
    }
    if (top < scrollY + padding) {
      top = rect.bottom + scrollY + 8
    }
    if (top + tooltipRect.height > scrollY + window.innerHeight - padding) {
      top = rect.top + scrollY - tooltipRect.height - 8
    }

    this.tooltip.style.top = `${top}px`
    this.tooltip.style.left = `${left}px`
    this.tooltip.style.zIndex = '1000'
  }
}
