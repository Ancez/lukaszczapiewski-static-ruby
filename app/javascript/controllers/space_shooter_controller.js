import { Controller } from "@hotwired/stimulus"
import "canvas-confetti"

export default class extends Controller {
  connect() {
    this.canvas = this.element
    this.ctx = this.canvas.getContext('2d')
    this.setupCanvas()
    this.initGame()
    this.setupEventListeners()
    this.gameLoop()
  }

  disconnect() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this.removeEventListeners()
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.centerX = this.canvas.width / 2
    this.centerY = this.canvas.height / 2
  }

  initGame() {
    this.gameState = 'menu'
    this.score = 0
    this.lives = 3
    this.level = 1
    this.enemySpawnTimer = 0
    this.enemySpawnInterval = 120
    this.shootTimer = 0
    this.shootInterval = 10
    
    this.player = {
      x: this.centerX,
      y: this.canvas.height - 80,
      width: 40,
      height: 50,
      speed: 5
    }
    
    this.bullets = []
    this.enemies = []
    this.particles = []
    this.stars = []
    this.mouseDeltaX = 0
    this.isPointerLocked = false
    
    this.createStarfield()
  }

  createStarfield() {
    this.stars = []
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.8 + 0.2
      })
    }
  }

  setupEventListeners() {
    this.pointerMoveHandler = (e) => {
      if (this.isPointerLocked && this.gameState === 'playing') {
        this.player.x += e.movementX
        
        if (this.player.x < this.player.width / 2) {
          this.player.x = this.player.width / 2
        }
        if (this.player.x > this.canvas.width - this.player.width / 2) {
          this.player.x = this.canvas.width - this.player.width / 2
        }
      }
    }
    
    this.pointerLockChangeHandler = () => {
      const wasLocked = this.isPointerLocked
      this.isPointerLocked = document.pointerLockElement === this.canvas
      
      if (this.isPointerLocked && !wasLocked) {
        if (this.gameState === 'menu') {
          this.startGame()
        } else if (this.gameState === 'paused') {
          this.gameState = 'playing'
        }
      } else if (!this.isPointerLocked && this.gameState === 'playing') {
        this.gameState = 'paused'
      }
    }
    
    this.pointerLockErrorHandler = () => {
      console.log('Pointer lock failed')
    }
    
    this.clickHandler = (e) => {
      if (this.gameState === 'menu') {
        this.canvas.requestPointerLock()
      } else if (this.gameState === 'paused') {
        this.canvas.requestPointerLock()
      } else if (this.gameState === 'gameOver') {
        this.initGame()
        this.canvas.requestPointerLock()
      }
    }
    
    this.pointerLockSuccessHandler = () => {
      if (this.gameState === 'menu') {
        this.startGame()
      } else if (this.gameState === 'paused') {
        this.gameState = 'playing'
      }
    }
    
    this.keyDownHandler = (e) => {
      if (e.code === 'Escape' && this.gameState === 'playing') {
        document.exitPointerLock()
      }
    }
    
    document.addEventListener('mousemove', this.pointerMoveHandler)
    document.addEventListener('pointerlockchange', this.pointerLockChangeHandler)
    document.addEventListener('pointerlockerror', this.pointerLockErrorHandler)
    this.canvas.addEventListener('click', this.clickHandler)
    window.addEventListener('keydown', this.keyDownHandler)
    
    window.addEventListener('resize', () => {
      this.setupCanvas()
      if (this.gameState === 'menu') {
        this.createStarfield()
      }
    })
  }

  removeEventListeners() {
    if (this.pointerMoveHandler) {
      document.removeEventListener('mousemove', this.pointerMoveHandler)
    }
    if (this.pointerLockChangeHandler) {
      document.removeEventListener('pointerlockchange', this.pointerLockChangeHandler)
    }
    if (this.pointerLockErrorHandler) {
      document.removeEventListener('pointerlockerror', this.pointerLockErrorHandler)
    }
    if (this.clickHandler) {
      this.canvas.removeEventListener('click', this.clickHandler)
    }
    if (this.keyDownHandler) {
      window.removeEventListener('keydown', this.keyDownHandler)
    }
    
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock()
    }
  }

  startGame() {
    if (this.gameState === 'menu') {
      this.gameState = 'playing'
      this.score = 0
      this.lives = 3
      this.level = 1
      this.enemySpawnTimer = 0
      this.enemySpawnInterval = 120
      this.shootTimer = 0
      this.shootInterval = 10
      this.player.x = this.centerX
      this.player.y = this.canvas.height - 80
      this.bullets = []
      this.enemies = []
      this.particles = []
      this.mouseDeltaX = 0
    }
  }

  shoot() {
    this.bullets.push({
      x: this.player.x,
      y: this.player.y,
      width: 4,
      height: 12,
      speed: 8
    })
  }

  updateStars() {
    this.stars.forEach(star => {
      star.y += star.speed
      if (star.y > this.canvas.height) {
        star.y = 0
        star.x = Math.random() * this.canvas.width
      }
    })
  }

  updatePlayer() {
    // Player movement is handled directly in pointerMoveHandler
  }
  
  autoShoot() {
    if (this.gameState === 'playing' && this.isPointerLocked) {
      this.shootTimer++
      if (this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0
        this.shoot()
      }
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      bullet.y -= bullet.speed
      
      if (bullet.y < 0) {
        this.bullets.splice(i, 1)
      }
    }
  }

  spawnEnemy() {
    this.enemySpawnTimer++
    
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
      this.enemySpawnTimer = 0
      this.enemySpawnInterval = Math.max(60, this.enemySpawnInterval - 2)
      
      const size = Math.random() * 20 + 20
      this.enemies.push({
        x: Math.random() * (this.canvas.width - size) + size / 2,
        y: -size,
        width: size,
        height: size,
        speed: Math.random() * 2 + 1 + this.level * 0.3,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        health: Math.ceil(size / 15)
      })
    }
  }

  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      enemy.y += enemy.speed
      enemy.rotation += enemy.rotationSpeed
      
      if (enemy.y > this.canvas.height + enemy.height) {
        this.enemies.splice(i, 1)
      }
    }
  }

  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j]
        
        const dx = bullet.x - enemy.x
        const dy = bullet.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < enemy.width / 2 + bullet.width / 2) {
          this.bullets.splice(i, 1)
          enemy.health--
          
          this.createExplosion(enemy.x, enemy.y, enemy.width)
          
          if (enemy.health <= 0) {
            this.enemies.splice(j, 1)
            this.score += Math.ceil(enemy.width / 5)
            const oldLevel = this.level
            this.level = Math.floor(this.score / 100) + 1
            
            this.fireConfetti(enemy.x, enemy.y)
            
            if (this.level > oldLevel) {
              this.fireLevelUpConfetti()
            }
          }
          break
        }
      }
    }
    
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      const dx = this.player.x - enemy.x
      const dy = this.player.y - enemy.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < enemy.width / 2 + this.player.width / 2) {
        this.createExplosion(enemy.x, enemy.y, enemy.width)
        this.enemies.splice(i, 1)
        this.lives--
        if (this.lives <= 0) {
          this.gameState = 'gameOver'
        }
      }
    }
  }

  createExplosion(x, y, size) {
    const particleCount = Math.ceil(size / 2)
    const christmasColors = ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e', '#facc15']
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.02,
        size: Math.random() * 4 + 2,
        color: christmasColors[Math.floor(Math.random() * christmasColors.length)]
      })
    }
  }
  
  fireConfetti(x, y) {
    if (typeof window.confetti === 'undefined') {
      return
    }
    
    const normalizedX = (x / this.canvas.width)
    const normalizedY = (y / this.canvas.height)
    
    window.confetti({
      particleCount: 30,
      startVelocity: 30,
      spread: 60,
      origin: {
        x: normalizedX,
        y: normalizedY
      },
      colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff']
    })
  }
  
  fireLevelUpConfetti() {
    if (typeof window.confetti === 'undefined') {
      return
    }
    
    window.confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff']
    })
    
    setTimeout(() => {
      window.confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff']
      })
    }, 250)
    
    setTimeout(() => {
      window.confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff']
      })
    }, 400)
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1
      particle.life -= particle.decay
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  drawStars() {
    const christmasColors = ['#ffffff', '#fbbf24', '#fef3c7']
    this.stars.forEach(star => {
      const colorIndex = Math.floor(star.opacity * christmasColors.length)
      this.ctx.fillStyle = christmasColors[colorIndex] || '#ffffff'
      this.ctx.globalAlpha = star.opacity
      this.ctx.shadowBlur = 5
      this.ctx.shadowColor = this.ctx.fillStyle
      this.ctx.beginPath()
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.shadowBlur = 0
    })
    this.ctx.globalAlpha = 1.0
  }

  drawPlayer() {
    const { x, y, width, height } = this.player
    
    this.ctx.save()
    this.ctx.translate(x, y)
    
    const gradient = this.ctx.createLinearGradient(-width/2, -height/2, width/2, height/2)
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)')
    gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.9)')
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.9)')
    
    this.ctx.fillStyle = gradient
    this.ctx.shadowBlur = 20
    this.ctx.shadowColor = 'rgba(34, 197, 94, 0.8)'
    
    this.ctx.beginPath()
    this.ctx.moveTo(0, -height/2)
    this.ctx.lineTo(-width/2, height/2)
    this.ctx.lineTo(0, height/2 - 10)
    this.ctx.lineTo(width/2, height/2)
    this.ctx.closePath()
    this.ctx.fill()
    
    this.ctx.shadowBlur = 0
    this.ctx.restore()
  }

  drawBullets() {
    this.bullets.forEach(bullet => {
      const gradient = this.ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height)
      gradient.addColorStop(0, '#fbbf24')
      gradient.addColorStop(1, '#f59e0b')
      
      this.ctx.fillStyle = gradient
      this.ctx.shadowBlur = 15
      this.ctx.shadowColor = 'rgba(251, 191, 36, 0.9)'
      
      this.ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height)
      
      this.ctx.shadowBlur = 0
    })
  }

  drawEnemies() {
    this.enemies.forEach(enemy => {
      this.ctx.save()
      this.ctx.translate(enemy.x, enemy.y)
      this.ctx.rotate(enemy.rotation)
      
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width/2)
      gradient.addColorStop(0, 'rgba(220, 38, 38, 0.95)')
      gradient.addColorStop(0.5, 'rgba(185, 28, 28, 0.9)')
      gradient.addColorStop(1, 'rgba(153, 27, 27, 0.7)')
      
      this.ctx.fillStyle = gradient
      this.ctx.shadowBlur = 25
      this.ctx.shadowColor = 'rgba(220, 38, 38, 0.8)'
      
      this.ctx.beginPath()
      this.ctx.moveTo(0, -enemy.height/2)
      this.ctx.lineTo(-enemy.width/2, enemy.height/2)
      this.ctx.lineTo(enemy.width/2, enemy.height/2)
      this.ctx.closePath()
      this.ctx.fill()
      
      this.ctx.shadowBlur = 0
      this.ctx.restore()
    })
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.globalAlpha = particle.life
      this.ctx.fillStyle = particle.color
      this.ctx.shadowBlur = 10
      this.ctx.shadowColor = particle.color
      
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fill()
      
      this.ctx.shadowBlur = 0
    })
    this.ctx.globalAlpha = 1.0
  }

  drawUI() {
    this.ctx.shadowBlur = 5
    this.ctx.shadowColor = '#fbbf24'
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 20px sans-serif'
    this.ctx.fillText(`🎁 Score: ${this.score}`, 20, 30)
    this.ctx.fillText(`❤️ Lives: ${this.lives}`, 20, 60)
    this.ctx.fillText(`⭐ Level: ${this.level}`, 20, 90)
    this.ctx.shadowBlur = 0
  }

  drawMenu() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    const gradient = this.ctx.createLinearGradient(this.centerX - 200, this.centerY - 60, this.centerX + 200, this.centerY - 60)
    gradient.addColorStop(0, '#dc2626')
    gradient.addColorStop(0.5, '#16a34a')
    gradient.addColorStop(1, '#dc2626')
    
    this.ctx.fillStyle = gradient
    this.ctx.font = 'bold 48px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.shadowBlur = 15
    this.ctx.shadowColor = '#fbbf24'
    this.ctx.fillText('🎄 CHRISTMAS SHOOTER 🎄', this.centerX, this.centerY - 60)
    this.ctx.shadowBlur = 0
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '24px sans-serif'
    this.ctx.fillText('Auto-shooting enabled', this.centerX, this.centerY + 20)
    this.ctx.fillText('Move your mouse to control the sleigh', this.centerX, this.centerY + 60)
    this.ctx.fillText('Click to start', this.centerX, this.centerY + 100)
    this.ctx.font = '18px sans-serif'
    this.ctx.fillText('Press ESC to pause', this.centerX, this.centerY + 140)
    
    this.ctx.textAlign = 'left'
  }
  
  drawPaused() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('PAUSED', this.centerX, this.centerY - 20)
    
    this.ctx.font = '24px sans-serif'
    this.ctx.fillText('Click to resume', this.centerX, this.centerY + 40)
    
    this.ctx.textAlign = 'left'
  }

  drawGameOver() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('GAME OVER', this.centerX, this.centerY - 60)
    
    this.ctx.font = '32px sans-serif'
    this.ctx.fillText(`Final Score: ${this.score}`, this.centerX, this.centerY + 20)
    this.ctx.fillText(`Level Reached: ${this.level}`, this.centerX, this.centerY + 70)
    
    this.ctx.font = '24px sans-serif'
    this.ctx.fillText('Click to play again', this.centerX, this.centerY + 140)
    
    this.ctx.textAlign = 'left'
  }

  update() {
    if (this.gameState === 'playing') {
      this.updateStars()
      this.updatePlayer()
      this.autoShoot()
      this.updateBullets()
      this.spawnEnemy()
      this.updateEnemies()
      this.updateParticles()
      this.checkCollisions()
    } else if (this.gameState === 'menu' || this.gameState === 'gameOver' || this.gameState === 'paused') {
      this.updateStars()
    }
  }

  draw() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
    gradient.addColorStop(0, '#0a0a1a')
    gradient.addColorStop(0.5, '#1a0a0a')
    gradient.addColorStop(1, '#0a0a1a')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.drawStars()
    
    if (this.gameState === 'playing') {
      this.drawPlayer()
      this.drawBullets()
      this.drawEnemies()
      this.drawParticles()
      this.drawUI()
    } else if (this.gameState === 'menu') {
      this.drawMenu()
    } else if (this.gameState === 'gameOver') {
      this.drawGameOver()
    } else if (this.gameState === 'paused') {
      this.drawPlayer()
      this.drawBullets()
      this.drawEnemies()
      this.drawParticles()
      this.drawUI()
      this.drawPaused()
    }
  }

  gameLoop() {
    this.update()
    this.draw()
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop())
  }
}

