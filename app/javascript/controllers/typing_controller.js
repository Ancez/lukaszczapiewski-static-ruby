import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { 
    strings: String,
    speed: Number
  }

  connect() {
    this.currentStringIndex = 0
    this.currentCharIndex = 0
    this.isDeleting = false
    this.speed = this.hasSpeedValue ? this.speedValue : 100
    
    // Parse the JSON string array
    try {
      this.strings = JSON.parse(this.stringsValue || '[]')
    } catch (e) {
      this.strings = []
    }
    
    // Create cursor element
    this.cursor = document.createElement('span')
    this.cursor.className = 'typing-cursor'
    this.cursor.textContent = '|'
    this.element.appendChild(this.cursor)
    
    if (this.strings.length > 0) {
      this.type()
    }
  }

  type() {
    const currentString = this.strings[this.currentStringIndex]
    
    if (this.isDeleting) {
      this.element.removeChild(this.cursor)
      this.element.textContent = currentString.substring(0, this.currentCharIndex - 1)
      this.element.appendChild(this.cursor)
      this.currentCharIndex--
      this.speed = 50
    } else {
      this.element.removeChild(this.cursor)
      const textToShow = currentString.substring(0, this.currentCharIndex + 1)
      this.element.textContent = textToShow
      this.element.appendChild(this.cursor)
      this.currentCharIndex++
      this.speed = 100
    }

    if (!this.isDeleting && this.currentCharIndex === currentString.length) {
      this.speed = 2000
      this.isDeleting = true
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false
      this.currentStringIndex = (this.currentStringIndex + 1) % this.strings.length
      this.speed = 500
    }

    setTimeout(() => this.type(), this.speed)
  }
}

