export class GameLogic {
  constructor(gameState, gameObjects, effects, powerups, canvasWidth, canvasHeight, soundManager) {
    this.gameState = gameState
    this.gameObjects = gameObjects
    this.effects = effects
    this.powerups = powerups
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.soundManager = soundManager
  }

  updateCanvasSize(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
  }

  checkCollisions() {
    for (let i = this.gameObjects.bullets.length - 1; i >= 0; i--) {
      const bullet = this.gameObjects.bullets[i]
      let bulletRemoved = false
      
      // Store old position for continuous collision detection
      const oldX = bullet.oldX !== undefined ? bullet.oldX : bullet.x
      const oldY = bullet.oldY !== undefined ? bullet.oldY : bullet.y
      
      for (let j = this.gameObjects.enemies.length - 1; j >= 0; j--) {
        const enemy = this.gameObjects.enemies[j]
        
        // Continuous collision detection - check if bullet path intersects enemy
        const enemyRadius = enemy.width / 2
        const bulletRadius = Math.max(bullet.width, bullet.height) / 2
        const collisionRadius = enemyRadius + bulletRadius
        
        // Check current position
        const dx = bullet.x - enemy.x
        const dy = bullet.y - enemy.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Check old position
        const oldDx = oldX - enemy.x
        const oldDy = oldY - enemy.y
        const oldDistance = Math.sqrt(oldDx * oldDx + oldDy * oldDy)
        
        // Simple collision check - if bullet is within collision radius
        let hit = false
        if (distance < collisionRadius) {
          hit = true
        } else if (oldDistance < collisionRadius) {
          // Bullet was inside enemy last frame
          hit = true
        } else {
          // Check if bullet path crosses enemy (line-circle intersection)
          const pathDx = bullet.x - oldX
          const pathDy = bullet.y - oldY
          const pathLength = Math.sqrt(pathDx * pathDx + pathDy * pathDy)
          
          if (pathLength > 0) {
            // Vector from old bullet position to enemy center
            const toEnemyDx = enemy.x - oldX
            const toEnemyDy = enemy.y - oldY
            
            // Project enemy position onto bullet path
            const t = Math.max(0, Math.min(1, (toEnemyDx * pathDx + toEnemyDy * pathDy) / (pathLength * pathLength)))
            
            // Closest point on bullet path to enemy center
            const closestX = oldX + t * pathDx
            const closestY = oldY + t * pathDy
            
            // Distance from closest point to enemy center
            const closestDx = closestX - enemy.x
            const closestDy = closestY - enemy.y
            const closestDistance = Math.sqrt(closestDx * closestDx + closestDy * closestDy)
            
            if (closestDistance < collisionRadius) {
              hit = true
            }
          }
        }
        
        if (hit) {
          // Clear target enemy for homing bullets IMMEDIATELY
          if (bullet.homing && bullet.targetEnemy === enemy) {
            bullet.targetEnemy = null
          }
          
          // Ensure enemy has valid health
          if (enemy.health === undefined || enemy.health === null || isNaN(enemy.health)) {
            enemy.health = enemy.maxHealth || 1
          }
          
          // Apply damage
          const damage = bullet.damage || 1
          enemy.health -= damage
          
          // Create explosion effect
          this.effects.createExplosion(enemy.x, enemy.y, enemy.width)
          
          // Check if enemy died BEFORE removing bullet
          if (enemy.health <= 0) {
            const enemyX = enemy.x
            const enemyY = enemy.y
            const enemySize = enemy.width
            const isBoss = enemy.isBoss || false
            
            // Clear target enemy for any homing bullets targeting this enemy
            this.gameObjects.bullets.forEach(b => {
              if (b.homing && b.targetEnemy === enemy) {
                b.targetEnemy = null
              }
            })
            
            this.gameObjects.enemies.splice(j, 1)
            
            // Play kill sound
            if (this.soundManager) {
              this.soundManager.playKillSound()
            }
            
            if (isBoss) {
              this.gameState.score += 500 * enemy.bossStage
              this.gameState.bossActive = false
              this.gameState.bossSpawned = false
              // Mark wave as complete so it can advance
              this.gameState.waveEnemiesSpawned = this.gameState.waveEnemiesTotal
            } else {
              // Different XP based on enemy type and wave number
              const enemyType = enemy.enemyType || 'normal'
              const wave = this.gameState.wave || 1
              let baseScore = Math.ceil(enemySize / 5)
              
              // Wave multiplier: +10% per wave (wave 1 = 1.0x, wave 2 = 1.1x, wave 5 = 1.4x, etc.)
              const waveMultiplier = 1 + ((wave - 1) * 0.1)
              
              switch (enemyType) {
                case 'fast':
                  baseScore = Math.ceil(baseScore * 1.5) // Fast enemies give more XP
                  break
                case 'tank':
                  baseScore = Math.ceil(baseScore * 2.0) // Tank enemies give much more XP
                  break
                case 'zigzag':
                  baseScore = Math.ceil(baseScore * 1.3) // Zigzag enemies give more XP
                  break
                case 'kamikaze':
                  baseScore = Math.ceil(baseScore * 1.8) // Kamikaze enemies give more XP
                  break
                case 'shooter':
                  baseScore = Math.ceil(baseScore * 1.6) // Shooter enemies give more XP
                  break
                default: // 'normal'
                  // Base score
                  break
              }
              
              // Apply wave multiplier
              baseScore = Math.ceil(baseScore * waveMultiplier)
              
              // Apply XP Gain powerup multiplier
              const xpGainMultiplier = this.powerups.getXpGainMultiplier()
              baseScore = Math.ceil(baseScore * xpGainMultiplier)
              
              this.gameState.score += baseScore
            }
            
            const explodeLevel = this.powerups.getLevel('explodeAround')
            if (explodeLevel > 0 && Math.random() < this.powerups.getChance('explodeAround')) {
              this.effects.createExplosionAround(enemyX, enemyY, enemySize, this.gameObjects.enemies, explodeLevel)
            }
            
            if (this.powerups.shouldDropGift() || isBoss) {
              this.powerups.createGift(enemyX, enemyY)
            }
            
            // Only check level up if not a boss (bosses give score but don't trigger level up)
            if (!isBoss) {
              // Recalculate level to ensure it's up to date
              this.gameState.recalculateLevel()
              const levelUpResult = this.gameState.levelUp()
              
              this.effects.fireConfetti(enemyX, enemyY, this.canvasWidth, this.canvasHeight)
              
              if (levelUpResult.leveledUp) {
                if (this.soundManager) {
                  this.soundManager.playLevelUpSound()
                }
                this.gameState.showPowerupSelection = true
                this.gameState.pendingPowerups = this.powerups.selectRandomPowerups(3)
              }
            } else {
              // Boss defeated - special effects
              // Recalculate level after boss gives score
              this.gameState.recalculateLevel()
              this.effects.fireLevelUpConfetti()
              this.effects.fireConfetti(enemyX, enemyY, this.canvasWidth, this.canvasHeight)
            }
          }
          
          // Remove bullet AFTER checking if enemy died (but only if not piercing)
          if (!bullet.piercing && !bulletRemoved) {
            this.gameObjects.bullets.splice(i, 1)
            bulletRemoved = true
            // Break out of enemy loop since bullet is gone
            break
          }
        }
      }
    }
    
    // Enemy bullets hitting player
    for (let i = this.gameObjects.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.gameObjects.enemyBullets[i]
      const dx = this.gameObjects.player.x - bullet.x
      const dy = this.gameObjects.player.y - bullet.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < this.gameObjects.player.width / 2 + bullet.width / 2) {
        this.gameObjects.enemyBullets.splice(i, 1)
        
        const barrierLevel = this.powerups.getLevel('barrier')
        if (barrierLevel > 0) {
          this.powerups.activePowerups.barrier = Math.max(0, barrierLevel - 1)
        } else {
          this.gameState.takeDamage(bullet.damage || 5)
        }
      }
    }
    
    // Enemy collision with player
    for (let i = this.gameObjects.enemies.length - 1; i >= 0; i--) {
      const enemy = this.gameObjects.enemies[i]
      const dx = this.gameObjects.player.x - enemy.x
      const dy = this.gameObjects.player.y - enemy.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < enemy.width / 2 + this.gameObjects.player.width / 2) {
        const enemyX = enemy.x
        const enemyY = enemy.y
        const enemySize = enemy.width
        const isBoss = enemy.isBoss || false
        
        // Enemy dies on collision
        this.gameObjects.enemies.splice(i, 1)
        this.effects.createExplosion(enemyX, enemyY, enemySize)
        
        // Play kill sound
        if (this.soundManager) {
          this.soundManager.playKillSound()
        }
        
        // Player takes damage
        const barrierLevel = this.powerups.getLevel('barrier')
        const enemyDamage = isBoss ? (30 + enemy.bossStage * 5) : (5 + Math.floor(this.gameState.level / 2))
        
        if (barrierLevel > 0) {
          this.powerups.activePowerups.barrier = Math.max(0, barrierLevel - 1)
        } else {
          this.gameState.takeDamage(enemyDamage)
        }
        
        // Give score for killing enemy
        if (!isBoss) {
          // Different XP based on enemy type
          const enemyType = enemy.enemyType || 'normal'
          let baseScore = Math.ceil(enemySize / 5)
          
          switch (enemyType) {
            case 'fast':
              baseScore = Math.ceil(baseScore * 1.5) // Fast enemies give more XP
              break
            case 'tank':
              baseScore = Math.ceil(baseScore * 2.0) // Tank enemies give much more XP
              break
            case 'zigzag':
              baseScore = Math.ceil(baseScore * 1.3) // Zigzag enemies give more XP
              break
            case 'kamikaze':
              baseScore = Math.ceil(baseScore * 1.8) // Kamikaze enemies give more XP
              break
            case 'shooter':
              baseScore = Math.ceil(baseScore * 1.6) // Shooter enemies give more XP
              break
            default: // 'normal'
              // Base score
              break
          }
          
          this.gameState.score += baseScore
          
          const explodeLevel = this.powerups.getLevel('explodeAround')
          if (explodeLevel > 0 && Math.random() < this.powerups.getChance('explodeAround')) {
            this.effects.createExplosionAround(enemyX, enemyY, enemySize, this.gameObjects.enemies, explodeLevel)
          }
          
          if (this.powerups.shouldDropGift()) {
            this.powerups.createGift(enemyX, enemyY)
          }
          
          // Recalculate level to ensure it's up to date
          this.gameState.recalculateLevel()
          const levelUpResult = this.gameState.levelUp()
          this.effects.fireConfetti(enemyX, enemyY, this.canvasWidth, this.canvasHeight)
          
          if (levelUpResult.leveledUp) {
            if (this.soundManager) {
              this.soundManager.playLevelUpSound()
            }
            // Alternate between weapon and skill selection
            const weaponCount = this.powerups.getActiveWeaponCount()
            const skillCount = this.powerups.getActiveSkillCount()
            
            if (weaponCount < 3 && (weaponCount <= skillCount || skillCount >= 5)) {
              // Show weapons if we have less than 3 weapons
              this.gameState.showPowerupSelection = true
              this.gameState.powerupSelectionType = 'weapon'
              this.gameState.pendingPowerups = this.powerups.selectRandomWeapons(3)
            } else if (skillCount < 5) {
              // Show skills if we have less than 5 skills
              this.gameState.showPowerupSelection = true
              this.gameState.powerupSelectionType = 'skill'
              this.gameState.pendingPowerups = this.powerups.selectRandomSkills(2)
            } else {
              // Both maxed, show random
              this.gameState.showPowerupSelection = true
              this.gameState.powerupSelectionType = Math.random() > 0.5 ? 'weapon' : 'skill'
              if (this.gameState.powerupSelectionType === 'weapon') {
                this.gameState.pendingPowerups = this.powerups.selectRandomWeapons(3)
              } else {
                this.gameState.pendingPowerups = this.powerups.selectRandomSkills(2)
              }
            }
          }
        }
      }
    }
    
    const giftResult = this.powerups.checkGiftCollection(this.gameObjects.player)
    if (giftResult.collected) {
      // Gift XP scales with level: base 50 + (level * 10)
      // Ensure level is up to date before calculating gift XP
      this.gameState.recalculateLevel()
      const giftXp = 50 + (this.gameState.level * 10)
      const xpGainMultiplier = this.powerups.getXpGainMultiplier()
      const finalXp = Math.ceil(giftXp * xpGainMultiplier)
      
      this.gameState.score += finalXp
      // Recalculate level after adding XP
      this.gameState.recalculateLevel()
      const levelUpResult = this.gameState.levelUp()
      
      this.effects.createGiftCollectionEffect(giftResult.x, giftResult.y)
      this.effects.fireConfetti(giftResult.x, giftResult.y, this.canvasWidth, this.canvasHeight)
      this.gameState.scorePopups.push({
        x: giftResult.x,
        y: giftResult.y,
        text: `+${finalXp}`,
        life: 1.0,
        vy: -2
      })
      
      if (levelUpResult.leveledUp) {
        if (this.soundManager) {
          this.soundManager.playLevelUpSound()
        }
        this.gameState.showPowerupSelection = true
        this.gameState.pendingPowerups = this.powerups.selectRandomPowerups(3)
      }
    }
  }
}

