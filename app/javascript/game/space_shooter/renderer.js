export class Renderer {
  constructor(ctx) {
    this.ctx = ctx
  }

  drawStars(stars) {
    const christmasColors = ['#ffffff', '#fbbf24', '#fef3c7']
    stars.forEach(star => {
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

  drawPlayer(player, powerups) {
    const { x, y, width, height } = player
    
    this.ctx.save()
    this.ctx.translate(x, y)
    
    const gradient = this.ctx.createLinearGradient(-width/2, -height/2, width/2, height/2)
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)')
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.9)')
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.9)')
    
    this.ctx.fillStyle = gradient
    this.ctx.shadowBlur = 20
    this.ctx.shadowColor = 'rgba(99, 102, 241, 0.8)'
    
    if (powerups && powerups.activePowerups.barrier && powerups.activePowerups.barrier > 0) {
      this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'
      this.ctx.lineWidth = 3
      this.ctx.beginPath()
      this.ctx.arc(0, 0, width + 5, 0, Math.PI * 2)
      this.ctx.stroke()
    }
    
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

  drawBullets(bullets) {
    bullets.forEach(bullet => {
      if (bullet.isLaser) {
        // Draw laser beam with glow effect
        const gradient = this.ctx.createLinearGradient(
          bullet.x - bullet.width / 2, bullet.y - bullet.height / 2,
          bullet.x + bullet.width / 2, bullet.y - bullet.height / 2
        )
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)')
        gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.9)')
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)')
        
        // Outer glow
        this.ctx.shadowBlur = 15
        this.ctx.shadowColor = 'rgba(0, 255, 255, 0.8)'
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height)
        
        // Inner bright core
        this.ctx.shadowBlur = 0
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        this.ctx.fillRect(bullet.x - bullet.width / 4, bullet.y - bullet.height / 2, bullet.width / 2, bullet.height)
      } else if (bullet.homing) {
        // Draw reindeer shape for homing bullets
        this.ctx.save()
        this.ctx.translate(bullet.x, bullet.y)
        
        // Calculate angle from velocity
        const angle = Math.atan2(bullet.vy || -1, bullet.vx || 0)
        this.ctx.rotate(angle + Math.PI / 2)
        
        const size = Math.max(bullet.width, bullet.height)
        
        // Reindeer body (brown)
        const bodyGradient = this.ctx.createRadialGradient(0, size * 0.2, 0, 0, size * 0.2, size * 0.4)
        bodyGradient.addColorStop(0, '#8b4513')
        bodyGradient.addColorStop(1, '#654321')
        
        this.ctx.fillStyle = bodyGradient
        this.ctx.shadowBlur = 12
        this.ctx.shadowColor = 'rgba(139, 69, 19, 0.8)'
        
        // Body ellipse
        this.ctx.beginPath()
        this.ctx.ellipse(0, size * 0.2, size * 0.3, size * 0.2, 0, 0, Math.PI * 2)
        this.ctx.fill()
        
        // Head (smaller circle at front)
        this.ctx.beginPath()
        this.ctx.arc(0, -size * 0.1, size * 0.15, 0, Math.PI * 2)
        this.ctx.fill()
        
        // Antlers (branches)
        this.ctx.strokeStyle = '#654321'
        this.ctx.lineWidth = size * 0.05
        this.ctx.shadowBlur = 8
        this.ctx.shadowColor = 'rgba(101, 67, 33, 0.6)'
        
        // Left antler
        this.ctx.beginPath()
        this.ctx.moveTo(-size * 0.1, -size * 0.2)
        this.ctx.lineTo(-size * 0.25, -size * 0.35)
        this.ctx.lineTo(-size * 0.2, -size * 0.4)
        this.ctx.moveTo(-size * 0.25, -size * 0.35)
        this.ctx.lineTo(-size * 0.3, -size * 0.3)
        this.ctx.stroke()
        
        // Right antler
        this.ctx.beginPath()
        this.ctx.moveTo(size * 0.1, -size * 0.2)
        this.ctx.lineTo(size * 0.25, -size * 0.35)
        this.ctx.lineTo(size * 0.2, -size * 0.4)
        this.ctx.moveTo(size * 0.25, -size * 0.35)
        this.ctx.lineTo(size * 0.3, -size * 0.3)
        this.ctx.stroke()
        
        // Nose (red)
        this.ctx.fillStyle = '#ff0000'
        this.ctx.shadowBlur = 6
        this.ctx.shadowColor = 'rgba(255, 0, 0, 0.8)'
        this.ctx.beginPath()
        this.ctx.arc(0, size * 0.05, size * 0.06, 0, Math.PI * 2)
        this.ctx.fill()
        
        this.ctx.shadowBlur = 0
        this.ctx.restore()
      } else {
        const gradient = this.ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height)
        gradient.addColorStop(0, '#fbbf24')
        gradient.addColorStop(1, '#f59e0b')
        
        this.ctx.fillStyle = gradient
        this.ctx.shadowBlur = 15
        this.ctx.shadowColor = 'rgba(251, 191, 36, 0.9)'
        
        this.ctx.fillRect(bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height)
        
        this.ctx.shadowBlur = 0
      }
    })
  }

  drawEnemyBullets(bullets) {
    bullets.forEach(bullet => {
      const gradient = this.ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + bullet.height)
      gradient.addColorStop(0, '#ef4444')
      gradient.addColorStop(1, '#dc2626')
      
      this.ctx.fillStyle = gradient
      this.ctx.shadowBlur = 15
      this.ctx.shadowColor = 'rgba(239, 68, 68, 0.9)'
      
      this.ctx.save()
      this.ctx.translate(bullet.x, bullet.y)
      this.ctx.rotate(bullet.angle)
      this.ctx.fillRect(-bullet.width/2, -bullet.height/2, bullet.width, bullet.height)
      this.ctx.restore()
      
      this.ctx.shadowBlur = 0
    })
  }

  drawEnemies(enemies) {
    enemies.forEach(enemy => {
      this.ctx.save()
      this.ctx.translate(enemy.x, enemy.y)
      this.ctx.rotate(enemy.rotation)
      
      const isBoss = enemy.isBoss || false
      
      if (isBoss) {
        // Boss rendering - larger, more menacing
        const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1
        const size = enemy.width * pulse
        
        // Outer glow
        const outerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size/2)
        outerGradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)')
        outerGradient.addColorStop(0.3, 'rgba(168, 85, 247, 0.7)')
        outerGradient.addColorStop(0.6, 'rgba(192, 38, 211, 0.5)')
        outerGradient.addColorStop(1, 'rgba(219, 39, 119, 0.3)')
        
        this.ctx.fillStyle = outerGradient
        this.ctx.shadowBlur = 40
        this.ctx.shadowColor = 'rgba(139, 92, 246, 0.9)'
        
        this.ctx.beginPath()
        this.ctx.arc(0, 0, size/2, 0, Math.PI * 2)
        this.ctx.fill()
        
        // Inner core
        const innerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width/2)
        innerGradient.addColorStop(0, 'rgba(220, 38, 38, 0.95)')
        innerGradient.addColorStop(0.5, 'rgba(185, 28, 28, 0.9)')
        innerGradient.addColorStop(1, 'rgba(153, 27, 27, 0.7)')
        
        this.ctx.fillStyle = innerGradient
        this.ctx.shadowBlur = 30
        this.ctx.shadowColor = 'rgba(220, 38, 38, 0.8)'
        
        this.ctx.beginPath()
        this.ctx.moveTo(0, -enemy.height/2)
        this.ctx.lineTo(-enemy.width/2, enemy.height/2)
        this.ctx.lineTo(enemy.width/2, enemy.height/2)
        this.ctx.closePath()
        this.ctx.fill()
        
        // Boss health bar
        this.ctx.restore()
        const barWidth = enemy.width * 1.5
        const barHeight = 8
        const barX = enemy.x - barWidth / 2
        const barY = enemy.y - enemy.height / 2 - 20
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        this.ctx.fillRect(barX, barY, barWidth, barHeight)
        
        const healthPercent = enemy.health / enemy.maxHealth
        const healthWidth = barWidth * healthPercent
        
        const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + healthWidth, barY)
        healthGradient.addColorStop(0, '#ef4444')
        healthGradient.addColorStop(0.5, '#f59e0b')
        healthGradient.addColorStop(1, '#10b981')
        this.ctx.fillStyle = healthGradient
        this.ctx.fillRect(barX, barY, healthWidth, barHeight)
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        this.ctx.lineWidth = 2
        this.ctx.strokeRect(barX, barY, barWidth, barHeight)
        
        // Boss label
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = 'bold 16px sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.shadowBlur = 10
        this.ctx.shadowColor = 'rgba(139, 92, 246, 0.9)'
        this.ctx.fillText(`BOSS STAGE ${enemy.bossStage}`, enemy.x, barY - 10)
        this.ctx.shadowBlur = 0
      } else {
        // Different rendering based on enemy type
        const enemyType = enemy.enemyType || 'normal'
        let color1, color2, color3, shadowColor, shape
        
        switch (enemyType) {
          case 'fast':
            color1 = 'rgba(251, 191, 36, 0.95)' // Yellow
            color2 = 'rgba(245, 158, 11, 0.9)'
            color3 = 'rgba(217, 119, 6, 0.7)'
            shadowColor = 'rgba(251, 191, 36, 0.8)'
            shape = 'diamond'
            break
          case 'tank':
            color1 = 'rgba(75, 85, 99, 0.95)' // Gray
            color2 = 'rgba(55, 65, 81, 0.9)'
            color3 = 'rgba(31, 41, 55, 0.7)'
            shadowColor = 'rgba(75, 85, 99, 0.8)'
            shape = 'square'
            break
          case 'zigzag':
            color1 = 'rgba(139, 92, 246, 0.95)' // Purple
            color2 = 'rgba(124, 58, 237, 0.9)'
            color3 = 'rgba(109, 40, 217, 0.7)'
            shadowColor = 'rgba(139, 92, 246, 0.8)'
            shape = 'triangle'
            break
          case 'kamikaze':
            color1 = 'rgba(239, 68, 68, 0.95)' // Bright red
            color2 = 'rgba(220, 38, 38, 0.9)'
            color3 = 'rgba(185, 28, 28, 0.7)'
            shadowColor = 'rgba(239, 68, 68, 0.8)'
            shape = 'star'
            break
          case 'shooter':
            color1 = 'rgba(34, 197, 94, 0.95)' // Green
            color2 = 'rgba(22, 163, 74, 0.9)'
            color3 = 'rgba(21, 128, 61, 0.7)'
            shadowColor = 'rgba(34, 197, 94, 0.8)'
            shape = 'triangle'
            break
          default: // 'normal'
            color1 = 'rgba(220, 38, 38, 0.95)'
            color2 = 'rgba(185, 28, 28, 0.9)'
            color3 = 'rgba(153, 27, 27, 0.7)'
            shadowColor = 'rgba(220, 38, 38, 0.8)'
            shape = 'triangle'
            break
        }
        
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width/2)
        gradient.addColorStop(0, color1)
        gradient.addColorStop(0.5, color2)
        gradient.addColorStop(1, color3)
        
        this.ctx.fillStyle = gradient
        this.ctx.shadowBlur = 25
        this.ctx.shadowColor = shadowColor
        
        this.ctx.beginPath()
        
        if (shape === 'diamond') {
          // Diamond shape for fast enemies
          this.ctx.moveTo(0, -enemy.height/2)
          this.ctx.lineTo(enemy.width/2, 0)
          this.ctx.lineTo(0, enemy.height/2)
          this.ctx.lineTo(-enemy.width/2, 0)
        } else if (shape === 'square') {
          // Square shape for tank enemies
          this.ctx.rect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height)
        } else if (shape === 'star') {
          // Star shape for kamikaze
          const spikes = 5
          const outerRadius = enemy.width / 2
          const innerRadius = outerRadius * 0.5
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const angle = (Math.PI * i) / spikes - Math.PI / 2
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            if (i === 0) {
              this.ctx.moveTo(x, y)
            } else {
              this.ctx.lineTo(x, y)
            }
          }
        } else {
          // Triangle shape (default)
          this.ctx.moveTo(0, -enemy.height/2)
          this.ctx.lineTo(-enemy.width/2, enemy.height/2)
          this.ctx.lineTo(enemy.width/2, enemy.height/2)
        }
        
        this.ctx.closePath()
        this.ctx.fill()
        
        // Add special effects
        if (enemyType === 'shooter') {
          // Add a small gun indicator
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          this.ctx.fillRect(-2, -enemy.height/2 - 4, 4, 6)
        }
        
        this.ctx.shadowBlur = 0
        this.ctx.restore()
        
        // Health bar for damaged enemies
        if (enemy.health < enemy.maxHealth) {
          const barWidth = enemy.width * 1.2
          const barHeight = 4
          const barX = enemy.x - barWidth / 2
          const barY = enemy.y - enemy.height / 2 - 12
          
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
          this.ctx.fillRect(barX, barY, barWidth, barHeight)
          
          const healthPercent = enemy.health / enemy.maxHealth
          const healthWidth = barWidth * healthPercent
          
          const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + healthWidth, barY)
          if (healthPercent > 0.6) {
            healthGradient.addColorStop(0, '#10b981')
            healthGradient.addColorStop(1, '#34d399')
          } else if (healthPercent > 0.3) {
            healthGradient.addColorStop(0, '#f59e0b')
            healthGradient.addColorStop(1, '#fbbf24')
          } else {
            healthGradient.addColorStop(0, '#ef4444')
            healthGradient.addColorStop(1, '#f87171')
          }
          this.ctx.fillStyle = healthGradient
          this.ctx.fillRect(barX, barY, healthWidth, barHeight)
          
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
          this.ctx.lineWidth = 1
          this.ctx.strokeRect(barX, barY, barWidth, barHeight)
        }
      }
    })
  }

  drawParticles(particles) {
    particles.forEach(particle => {
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

  drawUI(score, lives, level, powerups, gameState) {
    this.ctx.save()
    const isDark = document.documentElement.classList.contains('dark')
    const uiHeight = gameState && gameState.bossActive ? 180 : (gameState ? 160 : 130)
    const canvasWidth = this.ctx.canvas.width
    const panelX = Math.max(10, canvasWidth - 290) // Keep panel on screen
    this.ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.7)' : 'rgba(248, 250, 252, 0.7)'
    this.ctx.fillRect(panelX, 10, 280, uiHeight)
    this.ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.5)'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(panelX, 10, 280, uiHeight)
    
    this.ctx.shadowBlur = 5
    this.ctx.shadowColor = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)'
    this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
    this.ctx.font = 'bold 18px sans-serif'
    const textX = panelX + 10
    this.ctx.fillText(`🎁 Score: ${score}`, textX, 35)
    if (gameState) {
      this.ctx.fillText(`💚 Lives: ${lives}`, textX, 60)
      this.ctx.fillText(`⭐ Level: ${level}`, textX, 85)
      this.ctx.fillText(`🏆 Stage: ${gameState.stage}`, textX, 110)
      this.ctx.fillText(`🌊 Wave: ${gameState.wave}`, textX, 135)
      
      if (gameState && powerups) {
        const progress = gameState.getLevelProgress()
        const currentLevelXp = gameState.getTotalXpForLevel(level)
        const nextLevelXp = currentLevelXp + gameState.getXpRequiredForLevel(level)
        const remaining = nextLevelXp - score
        
        this.ctx.font = '12px sans-serif'
        this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)'
        this.ctx.fillText(`${remaining} XP to next level`, textX, 160)
        
        const barWidth = 240
        const barHeight = 8
        const barX = textX
        const barY = 175
        
        this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
        this.ctx.fillRect(barX, barY, barWidth, barHeight)
        
        const progressWidth = barWidth * progress
        const gradient = this.ctx.createLinearGradient(barX, barY, barX + progressWidth, barY)
        gradient.addColorStop(0, isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)')
        gradient.addColorStop(1, isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(99, 102, 241, 0.8)')
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(barX, barY, progressWidth, barHeight)
        
        this.ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(79, 70, 229, 0.6)'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(barX, barY, barWidth, barHeight)
      }
      
      if (gameState.bossActive) {
        // Boss fight text centered at top
        this.ctx.fillStyle = 'rgba(139, 92, 246, 1)'
        this.ctx.shadowBlur = 15
        this.ctx.shadowColor = 'rgba(139, 92, 246, 0.8)'
        this.ctx.font = 'bold 24px sans-serif'
        this.ctx.textAlign = 'center'
        this.ctx.fillText('👹 BOSS FIGHT!', canvasWidth / 2, 40)
        this.ctx.textAlign = 'left'
        this.ctx.shadowBlur = 5
        this.ctx.font = 'bold 18px sans-serif'
        this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
      }
    } else {
      this.ctx.fillText(`❤️ Lives: ${lives}`, textX, 60)
      this.ctx.fillText(`⭐ Level: ${level}`, textX, 85)
    }
    
    if (gameState && powerups) {
      const totalLevels = Object.values(powerups.activePowerups).reduce((sum, level) => sum + (level || 0), 0)
      if (totalLevels > 0) {
        this.ctx.fillStyle = isDark ? 'rgba(251, 191, 36, 0.9)' : 'rgba(217, 119, 6, 0.9)'
        this.ctx.font = '14px sans-serif'
        const yOffset = gameState.bossActive ? 20 : 0
        this.ctx.fillText(`✨ Powerups: ${totalLevels} levels`, textX, 195 + yOffset)
      }
    }
    
    this.ctx.shadowBlur = 0
    this.ctx.restore()
  }

  drawPlayerHealthBar(gameState, powerups, canvasWidth, canvasHeight) {
    if (!gameState) return
    
    this.ctx.save()
    const isDark = document.documentElement.classList.contains('dark')
    const barWidth = 300
    const barHeight = 20
    const barX = 20
    const barY = canvasHeight - 80
    
    // Background panel
    this.ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.8)' : 'rgba(248, 250, 252, 0.8)'
    this.ctx.fillRect(barX - 10, barY - 10, barWidth + 20, barHeight + 50)
    this.ctx.strokeStyle = isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(79, 70, 229, 0.6)'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(barX - 10, barY - 10, barWidth + 20, barHeight + 50)
    
    // HP Label
    this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
    this.ctx.font = 'bold 14px sans-serif'
    this.ctx.fillText('❤️ HP', barX, barY - 5)
    
    // Health bar background
    this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
    this.ctx.fillRect(barX, barY, barWidth, barHeight)
    
    // Health bar fill
    const healthPercent = gameState.hp / gameState.maxHp
    const healthWidth = barWidth * healthPercent
    
    const healthGradient = this.ctx.createLinearGradient(barX, barY, barX + healthWidth, barY)
    if (healthPercent > 0.6) {
      healthGradient.addColorStop(0, '#10b981')
      healthGradient.addColorStop(1, '#34d399')
    } else if (healthPercent > 0.3) {
      healthGradient.addColorStop(0, '#f59e0b')
      healthGradient.addColorStop(1, '#fbbf24')
    } else {
      healthGradient.addColorStop(0, '#ef4444')
      healthGradient.addColorStop(1, '#f87171')
    }
    this.ctx.fillStyle = healthGradient
    this.ctx.fillRect(barX, barY, healthWidth, barHeight)
    
    // Health bar border
    this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(barX, barY, barWidth, barHeight)
    
    // HP text
    this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
    this.ctx.font = 'bold 12px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(`${gameState.hp}/${gameState.maxHp}`, barX + barWidth / 2, barY + 14)
    this.ctx.textAlign = 'left'
    
    // Barrier strength
    const barrierLevel = powerups ? powerups.getLevel('barrier') : 0
    if (barrierLevel > 0) {
      const barrierBarWidth = 300
      const barrierBarHeight = 12
      const barrierBarX = barX
      const barrierBarY = barY + 30
      
      // Barrier label
      this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
      this.ctx.font = 'bold 14px sans-serif'
      this.ctx.fillText('🛡️ Barrier', barrierBarX, barrierBarY - 5)
      
      // Barrier bar background
      this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
      this.ctx.fillRect(barrierBarX, barrierBarY, barrierBarWidth, barrierBarHeight)
      
      // Barrier bar fill (based on remaining barrier hits)
      const barrierPercent = barrierLevel / Math.max(barrierLevel, 5) // Normalize to max 5 for visual
      const barrierWidth = barrierBarWidth * barrierPercent
      
      const barrierGradient = this.ctx.createLinearGradient(barrierBarX, barrierBarY, barrierBarX + barrierWidth, barrierBarY)
      barrierGradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)')
      barrierGradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)')
      this.ctx.fillStyle = barrierGradient
      this.ctx.fillRect(barrierBarX, barrierBarY, barrierWidth, barrierBarHeight)
      
      // Barrier bar border
      this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(barrierBarX, barrierBarY, barrierBarWidth, barrierBarHeight)
      
      // Barrier text
      this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
      this.ctx.font = 'bold 11px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(`${barrierLevel} hit${barrierLevel > 1 ? 's' : ''} remaining`, barrierBarX + barrierBarWidth / 2, barrierBarY + 10)
      this.ctx.textAlign = 'left'
    }
    
    this.ctx.restore()
  }

  drawGifts(gifts) {
    gifts.forEach(gift => {
      this.ctx.save()
      this.ctx.translate(gift.x, gift.y)
      this.ctx.rotate(gift.rotation)
      
      this.ctx.fillStyle = 'rgba(220, 38, 38, 0.9)'
      this.ctx.shadowBlur = 15
      this.ctx.shadowColor = 'rgba(220, 38, 38, 0.8)'
      this.ctx.fillRect(-gift.width/2, -gift.height/2, gift.width, gift.height)
      
      this.ctx.fillStyle = '#fbbf24'
      this.ctx.font = '20px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.fillText('🎁', 0, 5)
      
      this.ctx.shadowBlur = 0
      this.ctx.restore()
    })
  }

  drawScorePopups(popups) {
    popups.forEach(popup => {
      this.ctx.save()
      this.ctx.globalAlpha = popup.life
      this.ctx.fillStyle = '#fbbf24'
      this.ctx.font = 'bold 24px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.shadowBlur = 10
      this.ctx.shadowColor = 'rgba(251, 191, 36, 0.8)'
      this.ctx.fillText(popup.text, popup.x, popup.y)
      this.ctx.shadowBlur = 0
      this.ctx.globalAlpha = 1.0
      this.ctx.restore()
    })
  }

  drawPowerupSelection(powerups, powerupSystem, centerX, centerY, gameState) {
    const isDark = document.documentElement.classList.contains('dark')
    const time = Date.now() * 0.001
    
    this.ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.95)' : 'rgba(248, 250, 252, 0.95)'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    
    const gradient = this.ctx.createLinearGradient(centerX - 300, centerY - 200, centerX + 300, centerY + 200)
    if (isDark) {
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)')
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)')
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.15)')
    } else {
      gradient.addColorStop(0, 'rgba(79, 70, 229, 0.1)')
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)')
      gradient.addColorStop(1, 'rgba(79, 70, 229, 0.1)')
    }
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    
    this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
    this.ctx.font = 'bold 42px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.shadowBlur = 20
    this.ctx.shadowColor = isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(79, 70, 229, 0.5)'
    const selectionType = gameState?.powerupSelectionType || 'powerup'
    const isStartingSelection = gameState?.showStartingWeaponSelection || false
    const titleText = isStartingSelection 
      ? '🎯 Choose Your Starting Weapon!' 
      : selectionType === 'weapon' 
        ? '🎯 Choose a Weapon' 
        : selectionType === 'skill' 
          ? '✨ Choose a Skill' 
          : '🎁 Level Up!'
    const subtitleText = isStartingSelection
      ? 'Select your first weapon to begin'
      : selectionType === 'weapon' 
        ? 'Select a weapon upgrade' 
        : selectionType === 'skill' 
          ? 'Select a skill upgrade' 
          : 'Choose a Powerup'
    
    this.ctx.fillText(titleText, centerX, centerY - 200)
    
    this.ctx.font = 'bold 24px sans-serif'
    this.ctx.shadowBlur = 10
    this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)'
    this.ctx.fillText(subtitleText, centerX, centerY - 160)
    this.ctx.shadowBlur = 0
    
    const cardWidth = 300
    const cardHeight = 220
    const spacing = 40
    const totalWidth = (powerups.length * cardWidth) + ((powerups.length - 1) * spacing)
    const startX = centerX - (totalWidth / 2) + (cardWidth / 2)
    
    // Store card bounds for click detection
    if (gameState) {
      gameState.powerupCardBounds = []
    }
    
    powerups.forEach((powerup, index) => {
      const x = startX + index * (cardWidth + spacing)
      const y = centerY
      const isHovered = gameState && gameState.hoveredPowerupIndex === index
      const isClicked = gameState && gameState.clickedPowerupIndex === index
      const hoverScale = isHovered ? 1.08 : 1.0
      const clickScale = isClicked ? 0.95 : 1.0
      const pulse = Math.sin(time * 2 + index) * 0.05 + 1
      const finalScale = pulse * hoverScale * clickScale
      
      const rarityStyles = {
        common: {
          bg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
          glow: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          text: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)'
        },
        rare: {
          bg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(79, 70, 229, 0.1)',
          border: isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(79, 70, 229, 0.4)',
          glow: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.2)',
          text: isDark ? 'rgba(99, 102, 241, 0.9)' : 'rgba(79, 70, 229, 0.9)'
        },
        epic: {
          bg: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(217, 119, 6, 0.1)',
          border: isDark ? 'rgba(251, 191, 36, 0.6)' : 'rgba(217, 119, 6, 0.5)',
          glow: isDark ? 'rgba(251, 191, 36, 0.4)' : 'rgba(217, 119, 6, 0.3)',
          text: isDark ? 'rgba(251, 191, 36, 0.9)' : 'rgba(217, 119, 6, 0.9)'
        }
      }
      
      const style = rarityStyles[powerup.rarity] || rarityStyles.common
      
      // Enhanced glow on hover
      const glowIntensity = isHovered ? 1.5 : 1.0
      const borderIntensity = isHovered ? 1.3 : 1.0
      
      this.ctx.save()
      this.ctx.translate(x, y)
      this.ctx.scale(finalScale, finalScale)
      
      // Hover glow effect
      if (isHovered) {
        this.ctx.shadowBlur = 50 * glowIntensity
        this.ctx.shadowColor = style.glow
        this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        this.ctx.fillRect(-cardWidth/2 - 5, -cardHeight/2 - 5, cardWidth + 10, cardHeight + 10)
      }
      
      this.ctx.shadowBlur = 30 * glowIntensity
      this.ctx.shadowColor = style.glow
      this.ctx.fillStyle = style.bg
      this.ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight)
      
      this.ctx.shadowBlur = 0
      this.ctx.strokeStyle = style.border
      this.ctx.lineWidth = isHovered ? 3 : 2
      this.ctx.strokeRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight)
      
      // Click flash effect
      if (isClicked) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        this.ctx.fillRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight)
      }
      
      this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
      this.ctx.font = '64px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.shadowBlur = 15
      this.ctx.shadowColor = style.glow
      this.ctx.fillText(powerup.icon, 0, -60)
      this.ctx.shadowBlur = 0
      
      this.ctx.font = 'bold 22px sans-serif'
      this.ctx.fillStyle = isDark ? '#ffffff' : '#1e293b'
      this.ctx.fillText(powerup.name, 0, 20)
      
      this.ctx.font = '15px sans-serif'
      this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)'
      const currentLevel = powerupSystem.getLevel(powerup.id)
      const newLevel = currentLevel + 1
      const description = typeof powerup.getDescription === 'function' 
        ? powerup.getDescription(newLevel, powerupSystem)
        : powerup.description
      const words = description.split(' ')
      const line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
      const line2 = words.slice(Math.ceil(words.length / 2)).join(' ')
      this.ctx.fillText(line1, 0, 50)
      if (line2) {
        this.ctx.fillText(line2, 0, 70)
      }
      
      this.ctx.font = 'bold 11px sans-serif'
      this.ctx.fillStyle = style.text
      this.ctx.fillText(powerup.rarity.toUpperCase(), 0, 95)
      
      if (currentLevel > 0) {
        this.ctx.font = 'bold 12px sans-serif'
        this.ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)'
        this.ctx.fillText(`Level ${currentLevel} → ${newLevel}`, 0, 115)
      }
      
      this.ctx.font = 'bold 18px sans-serif'
      this.ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)'
      this.ctx.fillText(`Press ${index + 1} or Click`, 0, 140)
      
      this.ctx.restore()
      
      // Store card bounds for click detection
      if (gameState) {
        gameState.powerupCardBounds.push({
          index: index,
          x: x - cardWidth / 2,
          y: y - cardHeight / 2,
          width: cardWidth,
          height: cardHeight,
          powerupId: powerup.id
        })
      }
    })
    
    this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)'
    this.ctx.font = '18px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('Select a powerup to continue', centerX, centerY + 180)
    
    this.ctx.textAlign = 'left'
  }

  drawMenu(menu, canvasWidth, canvasHeight, centerX, centerY) {
    const isDark = document.documentElement.classList.contains('dark')
    this.ctx.fillStyle = isDark ? 'rgba(2, 6, 23, 0.9)' : 'rgba(248, 250, 252, 0.9)'
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    if (menu.showInstructions) {
      this.drawInstructions(centerX, centerY, menu)
      return
    }
    
    if (menu.showHighScores) {
      this.drawHighScores(menu, centerX, centerY)
      return
    }
    
    const gradient = this.ctx.createLinearGradient(centerX - 200, centerY - 120, centerX + 200, centerY - 120)
    if (isDark) {
      gradient.addColorStop(0, 'rgb(99, 102, 241)')
      gradient.addColorStop(0.5, 'rgb(59, 130, 246)')
      gradient.addColorStop(1, 'rgb(99, 102, 241)')
    } else {
      gradient.addColorStop(0, 'rgb(79, 70, 229)')
      gradient.addColorStop(0.5, 'rgb(59, 130, 246)')
      gradient.addColorStop(1, 'rgb(79, 70, 229)')
    }
    
    this.ctx.fillStyle = gradient
    this.ctx.font = 'bold 48px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.shadowBlur = 15
    this.ctx.shadowColor = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)'
    this.ctx.fillText('🎄 CHRISTMAS SHOOTER 🎄', centerX, centerY - 120)
    this.ctx.shadowBlur = 0
    
    const buttonHeight = 60
    const buttonSpacing = 20
    const buttonWidth = 400
    const startY = centerY + 40
    
    menu.menuItems.forEach((item, index) => {
      const buttonY = startY + index * (buttonHeight + buttonSpacing)
      const buttonX = centerX - buttonWidth / 2
      const isHovered = menu.selectedMenuItem === index
      
      if (isHovered) {
        this.ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(79, 70, 229, 0.2)'
        this.ctx.shadowBlur = 20
        this.ctx.shadowColor = isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.6)'
      } else {
        this.ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
        this.ctx.shadowBlur = 0
      }
      
      this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight)
      this.ctx.shadowBlur = 0
      
      this.ctx.strokeStyle = isHovered 
        ? (isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.8)')
        : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)')
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight)
      
      this.ctx.fillStyle = isHovered 
        ? (isDark ? 'rgb(99, 102, 241)' : 'rgb(79, 70, 229)')
        : (isDark ? '#ffffff' : '#1e293b')
      this.ctx.font = isHovered ? 'bold 28px sans-serif' : '24px sans-serif'
      this.ctx.fillText(item.text, centerX, buttonY + buttonHeight / 2 + 10)
    })
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    this.ctx.font = '16px sans-serif'
    this.ctx.fillText('Use arrow keys to navigate, Enter to select', centerX, canvasHeight - 40)
    this.ctx.fillText('Press ESC to return', centerX, canvasHeight - 20)
    
    this.ctx.textAlign = 'left'
  }
  
  drawInstructions(centerX, centerY, menu) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    
    const scrollOffset = menu.instructionsScrollOffset || 0
    const startY = centerY - 150 - scrollOffset
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 36px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('📖 Instructions', centerX, startY)
    
    this.ctx.font = '18px sans-serif'
    const instructions = [
      '🎮 CONTROLS:',
      '  • Move: Mouse or Arrow Keys',
      '  • Auto-shoot: Enabled',
      '  • Pause: ESC key',
      '',
      '🎯 GAMEPLAY:',
      '  • Destroy enemies to score points',
      '  • Avoid collisions or lose HP',
      '  • Level up: XP required increases per level',
      '  • Bosses appear every 5 levels',
      '',
      '🔫 WEAPONS (choose up to 3):',
      '  • Shotgun - Spread pattern, more bullets per level',
      '  • Homing Reindeers - Tracks enemies (Legendary)',
      '  • Big Bullets - Larger size',
      '  • Laser - Piercing beams, more beams per level',
      '  • Leveling weapons increases:',
      '    - Attack speed (+10% per level)',
      '    - Bullet speed (+5% per level)',
      '    - Bullet count (weapon-specific)',
      '',
      '⚡ POWERUPS (modifiers):',
      '  • Rapid Fire - Fire rate boost',
      '  • Piercing - Bullets pierce enemies',
      '  • Attack Damage - Flat damage bonus',
      '  • Bullet Speed - Speed multiplier',
      '  • Bullet Size - Size multiplier',
      '  • XP Gain - More XP from kills',
      '',
      '✨ SKILLS:',
      '  • Explosive Kill - Enemies explode on death',
      '  • Max HP - Increases max health',
      '  • Barrier - Blocks incoming hits',
      '  • Luck - Better powerup rarities',
      '',
      '💡 TIPS:',
      '  • Combine weapons for maximum damage',
      '  • Level up weapons for better stats',
      '  • Use Luck to get Legendary weapons',
      '  • Barrier protects from enemy bullets',
      '',
      '🎄 Have fun and Merry Christmas!'
    ]
    
    const lineHeight = 28
    const visibleHeight = this.ctx.canvas.height - 100
    const clipY = 50
    const clipHeight = visibleHeight
    
    // Set clipping region
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(0, clipY, this.ctx.canvas.width, clipHeight)
    this.ctx.clip()
    
    instructions.forEach((line, index) => {
      const y = startY + 60 + index * lineHeight
      if (y >= clipY - lineHeight && y <= clipY + clipHeight + lineHeight) {
        this.ctx.fillText(line, centerX, y)
      }
    })
    
    this.ctx.restore()
    
    // Scroll hint
    if (scrollOffset > 0 || instructions.length * lineHeight + startY + 60 > clipY + clipHeight) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      this.ctx.font = '14px sans-serif'
      this.ctx.fillText('Scroll with mouse wheel, arrow keys, or swipe', centerX, this.ctx.canvas.height - 60)
    }
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    this.ctx.font = '18px sans-serif'
    this.ctx.fillText('Click or press ESC to return', centerX, this.ctx.canvas.height - 30)
    
    this.ctx.textAlign = 'left'
  }
  
  drawHighScores(menu, centerX, centerY) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 36px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('🏆 Your High Scores', centerX, centerY - 100)
    
    const highScores = menu.getHighScores()
    
    if (highScores.length === 0) {
      this.ctx.font = '20px sans-serif'
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      this.ctx.fillText('No scores yet. Play to set your first high score!', centerX, centerY)
    } else {
      this.ctx.font = '24px sans-serif'
      highScores.forEach((score, index) => {
        const y = centerY - 30 + index * 40
        this.ctx.fillStyle = index === 0 ? '#fbbf24' : '#ffffff'
        this.ctx.fillText(`${index + 1}. ${score.toLocaleString()} points`, centerX, y)
      })
    }
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    this.ctx.font = '18px sans-serif'
    this.ctx.fillText('Click or press ESC to return', centerX, centerY + 200)
    
    this.ctx.textAlign = 'left'
  }
  
  drawPaused(centerX, centerY) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('PAUSED', centerX, centerY - 20)
    
    this.ctx.font = '24px sans-serif'
    this.ctx.fillText('Click to resume', centerX, centerY + 40)
    
    this.ctx.textAlign = 'left'
  }

  drawGameOver(gameState, menu, centerX, centerY) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 48px sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('GAME OVER', centerX, centerY - 80)
    
    this.ctx.font = '32px sans-serif'
    this.ctx.fillText(`Final Score: ${gameState.score}`, centerX, centerY)
    this.ctx.fillText(`Level Reached: ${gameState.level}`, centerX, centerY + 50)
    
    const highScores = menu.getHighScores()
    const isNewHighScore = highScores.length < 5 || gameState.score > Math.min(...highScores)
    
    if (isNewHighScore && !gameState.highScoreSaved) {
      menu.saveHighScore(gameState.score)
      gameState.highScoreSaved = true
      this.ctx.fillStyle = '#fbbf24'
      this.ctx.font = 'bold 28px sans-serif'
      this.ctx.fillText('🏆 NEW HIGH SCORE! 🏆', centerX, centerY + 110)
    }
    
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '24px sans-serif'
    this.ctx.fillText('Click to return to menu', centerX, centerY + 160)
    
    this.ctx.textAlign = 'left'
  }

  drawBackground(canvasWidth, canvasHeight) {
    const isDark = document.documentElement.classList.contains('dark')
    const gradient = this.ctx.createLinearGradient(0, 0, 0, canvasHeight)
    
    if (isDark) {
      gradient.addColorStop(0, 'rgb(2, 6, 23)')
      gradient.addColorStop(0.5, 'rgb(15, 23, 42)')
      gradient.addColorStop(1, 'rgb(2, 6, 23)')
    } else {
      gradient.addColorStop(0, 'rgb(248, 250, 252)')
      gradient.addColorStop(0.5, 'rgb(241, 245, 249)')
      gradient.addColorStop(1, 'rgb(248, 250, 252)')
    }
    
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
}

