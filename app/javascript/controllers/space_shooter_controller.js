import { Controller } from "@hotwired/stimulus"
import "canvas-confetti"
import { GameState } from "../game/space_shooter/game_state.js"
import { GameObjects } from "../game/space_shooter/game_objects.js"
import { GameLogic } from "../game/space_shooter/game_logic.js"
import { Effects } from "../game/space_shooter/effects.js"
import { Powerups } from "../game/space_shooter/powerups.js"
import { Menu } from "../game/space_shooter/menu.js"
import { Renderer } from "../game/space_shooter/renderer.js"
import { InputHandler } from "../game/space_shooter/input.js"
import { SoundManager } from "../game/space_shooter/sound_manager.js"

export default class extends Controller {
  connect() {
    this.canvas = this.element
    this.ctx = this.canvas.getContext('2d')
    this.setupCanvas()
    
    this.gameState = new GameState(this.canvas)
    this.gameObjects = new GameObjects()
    this.powerups = new Powerups()
    this.effects = new Effects(this.gameObjects)
    this.soundManager = new SoundManager()
    this.gameLogic = new GameLogic(this.gameState, this.gameObjects, this.effects, this.powerups, this.canvas.width, this.canvas.height, this.soundManager)
    this.menu = new Menu()
    this.menu.soundManager = this.soundManager
    this.renderer = new Renderer(this.ctx)
    this.input = new InputHandler(this.canvas, this.gameState, this.menu, this.gameObjects, this.effects, this.powerups)
    
    // Start background music
    this.soundManager.startBgMusic()
    
    this.initGame()
    this.input.setup()
    this.input.onResize = () => {
      this.setupCanvas()
      if (this.gameState.gameState === 'menu') {
        this.gameObjects.createStarfield(this.canvas.width, this.canvas.height)
      }
    }
    this.gameLoop()
  }

  disconnect() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.input.remove()
    if (this.soundManager) {
      this.soundManager.stopBgMusic()
    }
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2
    if (this.gameLogic) {
      this.gameLogic.updateCanvasSize(this.canvas.width, this.canvas.height)
    }
  }

  initGame() {
    this.gameState.init(this.canvas.width, this.canvas.height, this.centerX, this.centerY)
    this.gameObjects.initPlayer(this.canvas.width, this.canvas.height, this.centerX)
    this.gameObjects.createStarfield(this.canvas.width, this.canvas.height)
    this.powerups.reset()
    this.menu.reset()
    // Clear all game objects
    this.gameObjects.bullets = []
    this.gameObjects.enemies = []
    this.gameObjects.particles = []
    this.gameObjects.enemyBullets = []
    this.powerups.gifts = []
  }

  update() {
    // Show starting weapon selection if needed
    if (this.gameState.gameState === 'playing' && this.gameState.showStartingWeaponSelection && !this.gameState.showPowerupSelection) {
      this.gameState.showPowerupSelection = true
      this.gameState.powerupSelectionType = 'weapon'
      this.gameState.pendingPowerups = this.powerups.selectRandomWeapons(3)
    }
    
    if (this.gameState.gameState === 'playing' && !this.gameState.showPowerupSelection) {
      this.input.updatePlayerMovement()
      this.gameObjects.updateStars(this.canvas.width, this.canvas.height)
      this.autoShoot()
      this.gameObjects.updateBullets(this.gameObjects.enemies, this.canvas.width, this.canvas.height)
      
      // Wave system - check for wave completion
      if (!this.gameState.bossActive && this.gameObjects.enemies.length === 0 && this.gameState.waveEnemiesSpawned >= this.gameState.waveEnemiesTotal) {
        // Wave complete, start next wave
        const oldWave = this.gameState.wave
        const oldStage = this.gameState.stage
        this.gameState.wave++
        this.gameState.waveEnemiesSpawned = 0
        this.gameState.waveEnemiesTotal = 10 + (this.gameState.wave * 2)
        this.gameState.waveComplete = false
        
        // Update stage based on waves (each stage is 10 waves)
        this.gameState.stage = Math.floor((this.gameState.wave - 1) / 10) + 1
        const stageChanged = this.gameState.stage > oldStage
        
        // Reset bossSpawned when entering a boss wave (10, 20, 30, etc.)
        if (this.gameState.wave % 10 === 0) {
          this.gameState.bossSpawned = false
        }
      }
      
      // Update stage based on waves (each stage is 10 waves) - ensure it's always up to date
      this.gameState.stage = Math.floor((this.gameState.wave - 1) / 10) + 1
      
      // Spawn boss at wave 10, 20, 30, 40, 50, etc.
      const isBossWave = this.gameState.wave % 10 === 0
      if (isBossWave && !this.gameState.bossSpawned && !this.gameState.bossActive && this.gameObjects.enemies.filter(e => e.isBoss).length === 0) {
        this.gameObjects.spawnBoss(this.canvas.width, this.gameState.stage)
        this.gameState.bossActive = true
        this.gameState.bossSpawned = true
      }
      
      const spawnResult = this.gameObjects.spawnEnemy(
        this.canvas.width,
        this.gameState.level,
        this.gameState.stage,
        this.gameState.enemySpawnTimer,
        this.gameState.enemySpawnInterval,
        this.gameState.bossActive,
        this.gameState.waveEnemiesSpawned,
        this.gameState.waveEnemiesTotal
      )
      this.gameState.enemySpawnTimer = spawnResult.timer
      this.gameState.enemySpawnInterval = spawnResult.interval
      if (spawnResult.spawned) {
        this.gameState.waveEnemiesSpawned++
      }
      
      this.gameObjects.updateEnemies(this.canvas.height, this.canvas.width, this.gameObjects.player)
      this.gameObjects.updateEnemyBullets(this.canvas.width, this.canvas.height)
      this.powerups.updateGifts(this.canvas.height)
      this.gameObjects.updateParticles()
      // Check collisions again after all updates
      this.gameLogic.checkCollisions()
      this.updateScorePopups()
    } else if (this.gameState.gameState === 'menu' || this.gameState.gameState === 'gameOver' || this.gameState.gameState === 'paused') {
      this.gameObjects.updateStars(this.canvas.width, this.canvas.height)
    }
  }

  updateScorePopups() {
    for (let i = this.gameState.scorePopups.length - 1; i >= 0; i--) {
      const popup = this.gameState.scorePopups[i]
      popup.y += popup.vy
      popup.life -= 0.02
      
      if (popup.life <= 0) {
        this.gameState.scorePopups.splice(i, 1)
      }
    }
  }

  autoShoot() {
    if (this.gameState.gameState === 'playing') {
      const rapidFireLevel = this.powerups.getRapidFireLevel()
      const rapidFireMultiplier = rapidFireLevel > 0 ? (1 + (rapidFireLevel * 0.3)) : 1
      const weaponSpeedBonus = this.powerups.getWeaponAttackSpeedBonus()
      const totalSpeedMultiplier = rapidFireMultiplier * (1 + weaponSpeedBonus)
      const baseInterval = this.gameState.shootInterval
      const adjustedInterval = Math.max(5, baseInterval / totalSpeedMultiplier)
      
      this.gameState.shootTimer++
      if (this.gameState.shootTimer >= adjustedInterval) {
        this.gameState.shootTimer = 0
        this.gameObjects.shoot(this.powerups)
        this.soundManager.playShootSound()
      }
    }
  }

  draw() {
    // Update cursor style based on game state
    if (this.gameState.gameState === 'playing') {
      // Show cursor when powerup selection is open, hide otherwise
      if (this.gameState.showPowerupSelection) {
        this.canvas.style.cursor = 'default'
        // Release pointer lock when selecting powerups
        if (document.pointerLockElement === this.canvas) {
          document.exitPointerLock()
        }
      } else {
        this.canvas.style.cursor = 'none'
        // Request pointer lock when playing
        if (!this.gameState.isPointerLocked && document.pointerLockElement !== this.canvas) {
          this.canvas.requestPointerLock()
        }
      }
    } else {
      this.canvas.style.cursor = 'default'
      // Release pointer lock when not playing
      if (document.pointerLockElement === this.canvas) {
        document.exitPointerLock()
      }
    }
    
    this.renderer.drawBackground(this.canvas.width, this.canvas.height)
    this.renderer.drawStars(this.gameObjects.stars)
    
    if (this.gameState.gameState === 'playing') {
      this.renderer.drawPlayer(this.gameObjects.player, this.powerups)
      this.renderer.drawBullets(this.gameObjects.bullets)
      this.renderer.drawEnemyBullets(this.gameObjects.enemyBullets)
      this.renderer.drawEnemies(this.gameObjects.enemies)
      this.renderer.drawGifts(this.powerups.gifts)
      this.renderer.drawParticles(this.gameObjects.particles)
      this.renderer.drawScorePopups(this.gameState.scorePopups)
      this.renderer.drawUI(this.gameState.score, this.gameState.lives, this.gameState.level, this.powerups, this.gameState)
      this.renderer.drawPlayerHealthBar(this.gameState, this.powerups, this.canvas.width, this.canvas.height)
      
      if (this.gameState.showPowerupSelection) {
        this.renderer.drawPowerupSelection(this.gameState.pendingPowerups, this.powerups, this.centerX, this.centerY, this.gameState)
      }
    } else if (this.gameState.gameState === 'menu') {
      this.renderer.drawMenu(this.menu, this.canvas.width, this.canvas.height, this.centerX, this.centerY)
    } else if (this.gameState.gameState === 'gameOver') {
      this.renderer.drawGameOver(this.gameState, this.menu, this.centerX, this.centerY)
    } else if (this.gameState.gameState === 'paused') {
      this.renderer.drawPlayer(this.gameObjects.player, this.powerups)
      this.renderer.drawBullets(this.gameObjects.bullets)
      this.renderer.drawEnemies(this.gameObjects.enemies)
      this.renderer.drawGifts(this.powerups.gifts)
      this.renderer.drawParticles(this.gameObjects.particles)
      this.renderer.drawUI(this.gameState.score, this.gameState.lives, this.gameState.level, this.powerups, this.gameState)
      this.renderer.drawPlayerHealthBar(this.gameState, this.powerups, this.canvas.width, this.canvas.height)
      this.renderer.drawPaused(this.menu, this.centerX, this.centerY)
    }
  }

  gameLoop() {
    this.update()
    this.draw()
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop())
  }
}
