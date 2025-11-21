import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.element.addEventListener("click", this.handleClick.bind(this))
  }

  handleClick(event) {
    const href = event.currentTarget.getAttribute("href")
    if (href && href.startsWith("#")) {
      event.preventDefault()
      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }
}
