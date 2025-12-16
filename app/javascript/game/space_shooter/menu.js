export class Menu {
  constructor() {
    this.menuItems = [
      { text: '🎮 Start Game', action: 'start' },
      { text: '📖 Instructions', action: 'instructions' },
      { text: '🏆 Your High Scores', action: 'highscores' },
      { text: '⚙️ Settings', action: 'settings' }
    ]
    this.pauseMenuItems = [
      { text: '▶️ Resume', action: 'resume' },
      { text: '⚙️ Settings', action: 'settings' },
      { text: '🏠 Quit to Menu', action: 'quit' }
    ]
    this.selectedMenuItem = 0
    this.selectedPauseMenuItem = 0
    this.menuMouseX = 0
    this.menuMouseY = 0
    this.showInstructions = false
    this.showHighScores = false
    this.showSettings = false
    this.showPauseSettings = false
    this.instructionsScrollOffset = 0
  }

  updateHover(canvas, centerX, centerY, isPauseMenu = false) {
    const buttonHeight = 60
    const buttonSpacing = 20
    const startY = centerY + 40
    const buttonWidth = 400
    const items = isPauseMenu ? this.pauseMenuItems : this.menuItems
    
    for (let i = 0; i < items.length; i++) {
      const buttonY = startY + i * (buttonHeight + buttonSpacing)
      const buttonX = centerX - buttonWidth / 2
      
      if (this.menuMouseX >= buttonX && 
          this.menuMouseX <= buttonX + buttonWidth &&
          this.menuMouseY >= buttonY && 
          this.menuMouseY <= buttonY + buttonHeight) {
        if (isPauseMenu) {
          this.selectedPauseMenuItem = i
        } else {
          this.selectedMenuItem = i
        }
        break
      }
    }
  }
  
  handleClick(canvas, centerX, centerY, isPauseMenu = false, clickX = null, clickY = null) {
    const buttonHeight = 60
    const buttonSpacing = 20
    const startY = centerY + 40
    const buttonWidth = 400
    const items = isPauseMenu ? this.pauseMenuItems : this.menuItems
    
    // Use provided click coordinates or fall back to stored mouse position
    const x = clickX !== null ? clickX : this.menuMouseX
    const y = clickY !== null ? clickY : this.menuMouseY
    
    for (let i = 0; i < items.length; i++) {
      const buttonY = startY + i * (buttonHeight + buttonSpacing)
      const buttonX = centerX - buttonWidth / 2
      
      if (x >= buttonX && 
          x <= buttonX + buttonWidth &&
          y >= buttonY && 
          y <= buttonY + buttonHeight) {
        return items[i].action
      }
    }
    return null
  }
  
  handleAction(action, canvas, isPauseMenu = false) {
    if (isPauseMenu) {
      if (action === 'settings') {
        this.showPauseSettings = true
      }
    } else {
      if (action === 'instructions') {
        this.showInstructions = true
        this.showHighScores = false
        this.showSettings = false
      } else if (action === 'highscores') {
        this.showHighScores = true
        this.showInstructions = false
        this.showSettings = false
      } else if (action === 'settings') {
        this.showSettings = true
        this.showInstructions = false
        this.showHighScores = false
      }
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
    this.selectedPauseMenuItem = 0
    this.showInstructions = false
    this.showHighScores = false
    this.showSettings = false
    this.showPauseSettings = false
    this.instructionsScrollOffset = 0
  }
  
  scrollInstructions(delta, canvasHeight) {
    const maxScroll = 600 // Maximum scroll distance
    this.instructionsScrollOffset += delta * 30
    this.instructionsScrollOffset = Math.max(0, Math.min(maxScroll, this.instructionsScrollOffset))
  }
}

