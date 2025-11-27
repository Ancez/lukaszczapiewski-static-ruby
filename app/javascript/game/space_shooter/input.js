export class InputHandler {
  constructor(canvas, gameState, menu, gameObjects, effects, powerups) {
    this.canvas = canvas
    this.gameState = gameState
    this.menu = menu
    this.gameObjects = gameObjects
    this.effects = effects
    this.powerups = powerups
    
    this.pointerMoveHandler = null
    this.pointerLockChangeHandler = null
    this.pointerLockErrorHandler = null
    this.clickHandler = null
    this.touchStartHandler = null
    this.touchMoveHandler = null
    this.touchEndHandler = null
    this.menuMouseMoveHandler = null
    this.keyDownHandler = null
    this.keyUpHandler = null
    this.wheelHandler = null
    this.lastTouchY = undefined
    this.isScrolling = false
  }

  setup() {
    this.mouseX = 0
    this.mouseY = 0
    this.keysPressed = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    }
    
    this.pointerMoveHandler = (e) => {
      if (this.gameState.gameState === 'playing') {
        if (this.gameState.isPointerLocked) {
          // Use movement deltas when pointer is locked
          const movementX = e.movementX || 0
          const movementY = e.movementY || 0
          this.gameObjects.player.x = Math.max(
            this.gameObjects.player.width / 2,
            Math.min(this.canvas.width - this.gameObjects.player.width / 2, 
              this.gameObjects.player.x + movementX)
          )
          this.gameObjects.player.y = Math.max(
            this.gameObjects.player.height / 2,
            Math.min(this.canvas.height - this.gameObjects.player.height / 2,
              this.gameObjects.player.y + movementY)
          )
        } else {
          // Fallback to absolute position if pointer lock not available
          const rect = this.canvas.getBoundingClientRect()
          this.mouseX = e.clientX - rect.left
          this.mouseY = e.clientY - rect.top
          
          this.gameObjects.player.x = Math.max(
            this.gameObjects.player.width / 2,
            Math.min(this.canvas.width - this.gameObjects.player.width / 2, this.mouseX)
          )
          this.gameObjects.player.y = Math.max(
            this.gameObjects.player.height / 2,
            Math.min(this.canvas.height - this.gameObjects.player.height / 2, this.mouseY)
          )
        }
      }
    }
    
    this.pointerLockChangeHandler = () => {
      this.gameState.isPointerLocked = document.pointerLockElement === this.canvas
      if (!this.gameState.isPointerLocked && this.gameState.gameState === 'playing' && !this.gameState.showPowerupSelection) {
        // If pointer lock is lost during gameplay, try to reacquire it (but not during powerup selection)
        this.canvas.requestPointerLock()
      }
    }
    
    this.pointerLockErrorHandler = () => {
      // Pointer lock failed - continue without it
      this.gameState.isPointerLocked = false
    }
    
    this.clickHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const clickX = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left
      const clickY = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top
      
      // Check for powerup selection clicks
      if (this.gameState.gameState === 'playing' && this.gameState.showPowerupSelection && this.gameState.powerupCardBounds) {
        for (let i = 0; i < this.gameState.powerupCardBounds.length; i++) {
          const card = this.gameState.powerupCardBounds[i]
          if (clickX >= card.x && clickX <= card.x + card.width &&
              clickY >= card.y && clickY <= card.y + card.height) {
            // Click animation
            this.gameState.clickedPowerupIndex = i
            this.gameState.clickAnimationTime = Date.now()
            
            // Apply powerup after short delay for visual feedback
            setTimeout(() => {
              this.powerups.applyPowerup(card.powerupId, this.gameState)
              this.gameState.showPowerupSelection = false
              this.gameState.showStartingWeaponSelection = false
              this.gameState.pendingPowerups = []
              this.gameState.powerupCardBounds = []
              this.gameState.hoveredPowerupIndex = -1
              this.gameState.clickedPowerupIndex = -1
            }, 150)
            
            e.preventDefault()
            e.stopPropagation()
            return
          }
        }
      }
      
      if (this.gameState.gameState === 'menu') {
        if (this.menu.showInstructions || this.menu.showHighScores) {
          this.menu.showInstructions = false
          this.menu.showHighScores = false
        } else {
          const action = this.menu.handleClick(this.canvas, this.canvas.width / 2, this.canvas.height / 2)
          if (action) {
            if (action === 'start') {
              // Reset everything before starting new game
              this.gameObjects.bullets = []
              this.gameObjects.enemies = []
              this.gameObjects.particles = []
              this.gameObjects.enemyBullets = []
              this.powerups.reset()
              this.gameObjects.initPlayer(this.canvas.width, this.canvas.height, this.canvas.width / 2)
              this.gameState.startGame(this.canvas.width, this.canvas.height, this.canvas.width / 2, this.canvas.height / 2)
              // Request pointer lock when starting game
              setTimeout(() => {
                if (this.gameState.gameState === 'playing' && document.pointerLockElement !== this.canvas) {
                  this.canvas.requestPointerLock()
                }
              }, 100)
            } else {
              this.menu.handleAction(action, this.canvas)
            }
          }
        }
      } else if (this.gameState.gameState === 'paused') {
        this.gameState.gameState = 'playing'
        // Request pointer lock when resuming
        if (document.pointerLockElement !== this.canvas) {
          this.canvas.requestPointerLock()
        }
      } else if (this.gameState.gameState === 'gameOver') {
        this.gameState.init(this.canvas.width, this.canvas.height, this.canvas.width / 2, this.canvas.height / 2)
        this.gameObjects.initPlayer(this.canvas.width, this.canvas.height, this.canvas.width / 2)
        this.gameObjects.reset()
        this.menu.reset()
      }
    }
    
    this.touchStartHandler = (e) => {
      const touch = e.touches[0] || e.changedTouches[0]
      
      // Handle instructions scrolling on mobile
      if (this.gameState.gameState === 'menu' && this.menu.showInstructions) {
        this.lastTouchY = touch.clientY
        this.isScrolling = false
        e.preventDefault()
        return
      }
      
      e.preventDefault()
      // Convert touch event to click-like event
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        touches: [touch]
      }
      this.clickHandler(fakeEvent)
    }
    
    this.touchMoveHandler = (e) => {
      // Handle instructions scrolling on mobile
      if (this.gameState.gameState === 'menu' && this.menu.showInstructions && this.lastTouchY !== undefined) {
        const currentTouchY = e.touches[0].clientY
        const deltaY = this.lastTouchY - currentTouchY
        if (Math.abs(deltaY) > 10) {
          this.isScrolling = true
          const delta = deltaY > 0 ? 1 : -1
          this.menu.scrollInstructions(delta, this.canvas.height)
          this.lastTouchY = currentTouchY
        }
        e.preventDefault()
        return
      }
    }
    
    this.touchEndHandler = (e) => {
      // If we were scrolling, don't trigger click
      if (this.isScrolling && this.gameState.gameState === 'menu' && this.menu.showInstructions) {
        e.preventDefault()
      }
      this.lastTouchY = undefined
      this.isScrolling = false
    }
    
    this.menuMouseMoveHandler = (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      if (this.gameState.gameState === 'menu') {
        this.menu.menuMouseX = mouseX
        this.menu.menuMouseY = mouseY
        this.menu.updateHover(this.canvas, this.canvas.width / 2, this.canvas.height / 2)
      } else if (this.gameState.gameState === 'playing' && this.gameState.showPowerupSelection && this.gameState.powerupCardBounds) {
        // Check hover on powerup cards
        let hoveredIndex = -1
        for (let i = 0; i < this.gameState.powerupCardBounds.length; i++) {
          const card = this.gameState.powerupCardBounds[i]
          if (mouseX >= card.x && mouseX <= card.x + card.width &&
              mouseY >= card.y && mouseY <= card.y + card.height) {
            hoveredIndex = i
            break
          }
        }
        this.gameState.hoveredPowerupIndex = hoveredIndex
      }
    }
    
    this.keyDownHandler = (e) => {
      if (e.code === 'Escape') {
        if (this.gameState.gameState === 'playing') {
          // Don't allow closing powerup selection with Esc - must select one
          if (!this.gameState.showPowerupSelection) {
            this.gameState.gameState = 'paused'
            // Release pointer lock when pausing
            if (document.pointerLockElement === this.canvas) {
              document.exitPointerLock()
            }
          }
        } else if (this.gameState.gameState === 'paused') {
          // Reset everything when going back to menu
          this.gameObjects.bullets = []
          this.gameObjects.enemies = []
          this.gameObjects.particles = []
          this.gameObjects.enemyBullets = []
          this.powerups.reset()
          this.gameState.gameState = 'menu'
        } else if (this.menu.showInstructions || this.menu.showHighScores) {
          this.menu.showInstructions = false
          this.menu.showHighScores = false
        }
      } else if (this.gameState.gameState === 'playing' && this.gameState.showPowerupSelection) {
        if (e.key === '1' || e.key === '2' || e.key === '3') {
          e.preventDefault()
          const index = parseInt(e.key) - 1
          if (this.gameState.pendingPowerups[index]) {
            // Click animation
            this.gameState.clickedPowerupIndex = index
            this.gameState.clickAnimationTime = Date.now()
            
            setTimeout(() => {
              this.powerups.applyPowerup(this.gameState.pendingPowerups[index].id, this.gameState)
              this.gameState.showPowerupSelection = false
              this.gameState.showStartingWeaponSelection = false
              this.gameState.pendingPowerups = []
              this.gameState.powerupCardBounds = []
              this.gameState.hoveredPowerupIndex = -1
              this.gameState.clickedPowerupIndex = -1
            }, 150)
          }
        }
      } else if (this.gameState.gameState === 'playing') {
        if (this.keysPressed.hasOwnProperty(e.key)) {
          e.preventDefault()
          this.keysPressed[e.key] = true
        }
      } else if (this.gameState.gameState === 'menu' && !this.menu.showInstructions && !this.menu.showHighScores) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault()
          if (e.key === 'ArrowDown') {
            this.menu.selectedMenuItem = (this.menu.selectedMenuItem + 1) % this.menu.menuItems.length
          } else {
            this.menu.selectedMenuItem = (this.menu.selectedMenuItem - 1 + this.menu.menuItems.length) % this.menu.menuItems.length
          }
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const action = this.menu.menuItems[this.menu.selectedMenuItem].action
          if (action === 'start') {
            // Reset everything before starting new game
            this.gameObjects.bullets = []
            this.gameObjects.enemies = []
            this.gameObjects.particles = []
            this.gameObjects.enemyBullets = []
            this.powerups.reset()
            this.gameObjects.initPlayer(this.canvas.width, this.canvas.height, this.canvas.width / 2)
            this.gameState.startGame(this.canvas.width, this.canvas.height, this.canvas.width / 2, this.canvas.height / 2)
            // Request pointer lock when starting game
            setTimeout(() => {
              if (this.gameState.gameState === 'playing' && document.pointerLockElement !== this.canvas) {
                this.canvas.requestPointerLock()
              }
            }, 100)
          } else {
            this.menu.handleAction(action, this.canvas)
          }
        }
      } else if (this.gameState.gameState === 'menu' && this.menu.showInstructions) {
        // Scroll instructions with arrow keys
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          this.menu.scrollInstructions(1, this.canvas.height)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.menu.scrollInstructions(-1, this.canvas.height)
        }
      }
    }
    
    this.keyUpHandler = (e) => {
      if (this.keysPressed.hasOwnProperty(e.key)) {
        e.preventDefault()
        this.keysPressed[e.key] = false
      }
    }
    
    this.wheelHandler = (e) => {
      if (this.gameState.gameState === 'menu' && this.menu.showInstructions) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? 1 : -1
        this.menu.scrollInstructions(delta, this.canvas.height)
      }
    }
    
    this.canvas.addEventListener('mousemove', this.pointerMoveHandler)
    this.canvas.addEventListener('mousemove', this.menuMouseMoveHandler)
    this.canvas.addEventListener('touchmove', this.menuMouseMoveHandler)
    this.canvas.addEventListener('click', this.clickHandler)
    this.canvas.addEventListener('touchstart', this.touchStartHandler, { passive: false })
    this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false })
    this.canvas.addEventListener('touchend', this.touchEndHandler)
    this.canvas.addEventListener('wheel', this.wheelHandler, { passive: false })
    document.addEventListener('pointerlockchange', this.pointerLockChangeHandler)
    document.addEventListener('pointerlockerror', this.pointerLockErrorHandler)
    window.addEventListener('keydown', this.keyDownHandler)
    window.addEventListener('keyup', this.keyUpHandler)
    
    window.addEventListener('resize', () => {
      if (this.onResize) {
        this.onResize()
      }
    })
  }

  updatePlayerMovement() {
    if (this.gameState.gameState === 'playing') {
      const speed = this.gameObjects.player.speed
      let newX = this.gameObjects.player.x
      let newY = this.gameObjects.player.y
      
      if (this.keysPressed.ArrowLeft) {
        newX -= speed
      }
      if (this.keysPressed.ArrowRight) {
        newX += speed
      }
      if (this.keysPressed.ArrowUp) {
        newY -= speed
      }
      if (this.keysPressed.ArrowDown) {
        newY += speed
      }
      
      this.gameObjects.player.x = Math.max(
        this.gameObjects.player.width / 2,
        Math.min(this.canvas.width - this.gameObjects.player.width / 2, newX)
      )
      this.gameObjects.player.y = Math.max(
        this.gameObjects.player.height / 2,
        Math.min(this.canvas.height - this.gameObjects.player.height / 2, newY)
      )
    }
  }

  remove() {
    if (this.pointerMoveHandler) {
      this.canvas.removeEventListener('mousemove', this.pointerMoveHandler)
    }
    if (this.clickHandler) {
      this.canvas.removeEventListener('click', this.clickHandler)
    }
    if (this.touchStartHandler) {
      this.canvas.removeEventListener('touchstart', this.touchStartHandler)
    }
    if (this.touchMoveHandler) {
      this.canvas.removeEventListener('touchmove', this.touchMoveHandler)
    }
    if (this.touchEndHandler) {
      this.canvas.removeEventListener('touchend', this.touchEndHandler)
    }
    if (this.menuMouseMoveHandler) {
      this.canvas.removeEventListener('mousemove', this.menuMouseMoveHandler)
      this.canvas.removeEventListener('touchmove', this.menuMouseMoveHandler)
    }
    if (this.wheelHandler) {
      this.canvas.removeEventListener('wheel', this.wheelHandler)
    }
    if (this.pointerLockChangeHandler) {
      document.removeEventListener('pointerlockchange', this.pointerLockChangeHandler)
    }
    if (this.pointerLockErrorHandler) {
      document.removeEventListener('pointerlockerror', this.pointerLockErrorHandler)
    }
    if (this.keyDownHandler) {
      window.removeEventListener('keydown', this.keyDownHandler)
    }
    if (this.keyUpHandler) {
      window.removeEventListener('keyup', this.keyUpHandler)
    }
  }
}

