export class Menu {
  constructor() {
    this.menuItems = [
      { text: '🎮 Start Game', action: 'start' },
      { text: '📖 Instructions', action: 'instructions' },
      { text: '🏆 Your High Scores', action: 'highscores' }
    ]
    this.selectedMenuItem = 0
    this.menuMouseX = 0
    this.menuMouseY = 0
    this.showInstructions = false
    this.showHighScores = false
    this.instructionsScrollOffset = 0
  }

  updateHover(canvas, centerX, centerY) {
    const buttonHeight = 60
    const buttonSpacing = 20
    const startY = centerY + 40
    const buttonWidth = 400
    
    for (let i = 0; i < this.menuItems.length; i++) {
      const buttonY = startY + i * (buttonHeight + buttonSpacing)
      const buttonX = centerX - buttonWidth / 2
      
      if (this.menuMouseX >= buttonX && 
          this.menuMouseX <= buttonX + buttonWidth &&
          this.menuMouseY >= buttonY && 
          this.menuMouseY <= buttonY + buttonHeight) {
        this.selectedMenuItem = i
        break
      }
    }
  }
  
  handleClick(canvas, centerX, centerY) {
    const buttonHeight = 60
    const buttonSpacing = 20
    const startY = centerY + 40
    const buttonWidth = 400
    
    for (let i = 0; i < this.menuItems.length; i++) {
      const buttonY = startY + i * (buttonHeight + buttonSpacing)
      const buttonX = centerX - buttonWidth / 2
      
      if (this.menuMouseX >= buttonX && 
          this.menuMouseX <= buttonX + buttonWidth &&
          this.menuMouseY >= buttonY && 
          this.menuMouseY <= buttonY + buttonHeight) {
        return this.menuItems[i].action
      }
    }
    return null
  }
  
  handleAction(action, canvas) {
    if (action === 'instructions') {
      this.showInstructions = true
      this.showHighScores = false
    } else if (action === 'highscores') {
      this.showHighScores = true
      this.showInstructions = false
    }
  }

  getHighScores() {
    const stored = localStorage.getItem('christmasShooterHighScores')
    if (stored) {
      return JSON.parse(stored).sort((a, b) => b - a).slice(0, 5)
    }
    return []
  }
  
  saveHighScore(score) {
    const scores = this.getHighScores()
    scores.push(score)
    scores.sort((a, b) => b - a)
    localStorage.setItem('christmasShooterHighScores', JSON.stringify(scores.slice(0, 5)))
  }

  reset() {
    this.selectedMenuItem = 0
    this.showInstructions = false
    this.showHighScores = false
    this.instructionsScrollOffset = 0
  }
  
  scrollInstructions(delta, canvasHeight) {
    const maxScroll = 600 // Maximum scroll distance
    this.instructionsScrollOffset += delta * 30
    this.instructionsScrollOffset = Math.max(0, Math.min(maxScroll, this.instructionsScrollOffset))
  }
}

