import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    target: String,
    count: Number
  }

  connect() {
    this.clickCount = 0
    this.requiredClicks = this.hasCountValue ? this.countValue : 10
    this.targetUrl = this.hasTargetValue ? this.targetValue : '/space-shooter'
  }

  handleClick() {
    this.clickCount++
    
    if (this.clickCount >= this.requiredClicks) {
      window.location.href = this.targetUrl
    }
  }
}

