export class GameObjects {
  constructor() {
    this.player = null
    this.bullets = []
    this.enemyBullets = []
    this.enemies = []
    this.particles = []
    this.stars = []
  }

  initPlayer(canvasWidth, canvasHeight, centerX) {
    this.player = {
      x: centerX,
      y: canvasHeight - 80,
      width: 40,
      height: 50,
      speed: 5
    }
  }

  createStarfield(canvasWidth, canvasHeight) {
    this.stars = []
    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.8 + 0.2
      })
    }
  }

  shoot(powerups) {
    const activeWeapons = powerups.activeWeapons || []
    const damageBonus = powerups.getDamageBonus()
    const baseSpeed = 8
    const weaponSpeedBonus = powerups.getWeaponBulletSpeedBonus()
    const speedMultiplier = powerups.getBulletSpeedMultiplier() * (1 + weaponSpeedBonus)
    const sizeMultiplier = powerups.getBulletSizeMultiplier()
    const baseWidth = 4
    const baseHeight = 12
    const hasPiercing = powerups.getLevel('piercing') > 0
    
    // If no weapons selected, use default single shot
    if (activeWeapons.length === 0) {
      this.bullets.push({
        x: this.player.x,
        y: this.player.y,
        width: baseWidth * sizeMultiplier,
        height: baseHeight * sizeMultiplier,
        speed: baseSpeed * speedMultiplier,
        vx: 0,
        piercing: hasPiercing,
        homing: false,
        homingLevel: 0,
        damage: 1 + damageBonus,
        targetEnemy: null
      })
      return
    }
    
    // Shoot with each active weapon
    activeWeapons.forEach(weaponId => {
      const weaponLevel = powerups.getWeaponLevel(weaponId)
      
      switch (weaponId) {
        case 'shotgun':
          // Shotgun fires multiple bullets in spread
          const angles = []
          if (weaponLevel === 1) {
            angles.push(-0.2, 0, 0.2)
          } else if (weaponLevel === 2) {
            angles.push(-0.4, -0.2, 0, 0.2, 0.4)
          } else {
            angles.push(-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6)
          }
          
          angles.forEach(angle => {
            this.bullets.push({
              x: this.player.x,
              y: this.player.y,
              width: baseWidth * sizeMultiplier,
              height: baseHeight * sizeMultiplier,
              speed: baseSpeed * speedMultiplier,
              angle: angle,
              vx: Math.sin(angle) * 2 * speedMultiplier,
              piercing: hasPiercing,
              homing: false,
              homingLevel: 0,
              damage: 1 + damageBonus,
              targetEnemy: null
            })
          })
          break
          
        case 'homingReindeers':
          // Homing bullets
          this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            width: baseWidth * sizeMultiplier,
            height: baseHeight * sizeMultiplier,
            speed: baseSpeed * speedMultiplier,
            vx: 0,
            piercing: false,
            homing: true,
            homingLevel: weaponLevel,
            damage: 1 + damageBonus,
            targetEnemy: null
          })
          break
          
        // bigBullets is now a skill/modifier, not a weapon - handled by sizeMultiplier
          
        case 'laser':
          // Laser fires continuous beams (more beams at higher levels)
          const laserCount = weaponLevel === 1 ? 1 : weaponLevel === 2 ? 2 : 3
          for (let i = 0; i < laserCount; i++) {
            const offsetX = (i - (laserCount - 1) / 2) * 15
            this.bullets.push({
              x: this.player.x + offsetX,
              y: this.player.y,
              width: 6 * sizeMultiplier,
              height: 20 * sizeMultiplier,
              speed: baseSpeed * speedMultiplier * 1.5, // Lasers are faster
              vx: 0,
              piercing: true, // Lasers always pierce
              homing: false,
              homingLevel: 0,
              damage: 1 + damageBonus,
              targetEnemy: null,
              isLaser: true
            })
          }
          break
          
        default:
          // Default single shot
          this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            width: baseWidth * sizeMultiplier,
            height: baseHeight * sizeMultiplier,
            speed: baseSpeed * speedMultiplier,
            vx: 0,
            piercing: hasPiercing,
            homing: false,
            homingLevel: 0,
            damage: 1 + damageBonus,
            targetEnemy: null
          })
          break
      }
    })
  }

  updateStars(canvasWidth, canvasHeight) {
    this.stars.forEach(star => {
      star.y += star.speed
      if (star.y > canvasHeight) {
        star.y = 0
        star.x = Math.random() * canvasWidth
      }
    })
  }

  updateBullets(enemies, canvasWidth, canvasHeight) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      
      // Store old position for continuous collision detection
      bullet.oldX = bullet.x
      bullet.oldY = bullet.y
      
      // For homing bullets, check if target enemy still exists
      if (bullet.homing && bullet.targetEnemy) {
        if (!enemies.includes(bullet.targetEnemy)) {
          bullet.targetEnemy = null
        }
      }
      
      // Find target for homing bullets
      if (bullet.homing && bullet.targetEnemy === null) {
        let closestEnemy = null
        let closestDistance = Infinity
        
        enemies.forEach(enemy => {
          const dx = enemy.x - bullet.x
          const dy = enemy.y - bullet.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < closestDistance && enemy.y < bullet.y) {
            closestDistance = distance
            closestEnemy = enemy
          }
        })
        
        if (closestEnemy) {
          bullet.targetEnemy = closestEnemy
        }
      }
      
      // Move bullet
      if (bullet.homing && bullet.targetEnemy && enemies.includes(bullet.targetEnemy)) {
        const dx = bullet.targetEnemy.x - bullet.x
        const dy = bullet.targetEnemy.y - bullet.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const homingStrength = 0.4 + (bullet.homingLevel || 1) * 0.2
        
        if (distance > 0 && bullet.targetEnemy.y < bullet.y) {
          const angle = Math.atan2(dy, dx)
          bullet.vx = Math.cos(angle) * bullet.speed * homingStrength
          bullet.vy = Math.sin(angle) * bullet.speed * 1.2
        } else {
          bullet.vx = bullet.vx || 0
          bullet.vy = -bullet.speed
        }
      } else {
        bullet.vx = bullet.vx || 0
        bullet.vy = -bullet.speed
      }
      
      // Update position
      bullet.x += bullet.vx
      bullet.y += bullet.vy
      
      // Remove if off screen
      if (bullet.y < -20 || bullet.y > canvasHeight + 20 || bullet.x < -20 || bullet.x > canvasWidth + 20) {
        this.bullets.splice(i, 1)
      }
    }
  }

  spawnEnemy(canvasWidth, level, stage, enemySpawnTimer, enemySpawnInterval, bossActive, waveEnemiesSpawned, waveEnemiesTotal) {
    const newTimer = enemySpawnTimer + 1
    let newInterval = enemySpawnInterval
    
    // Don't spawn regular enemies if boss is active or wave is complete
    if (bossActive || waveEnemiesSpawned >= waveEnemiesTotal) {
      return { timer: newTimer, interval: newInterval, spawned: false }
    }
    
    if (newTimer >= enemySpawnInterval) {
      newInterval = Math.max(60, enemySpawnInterval - 2)
      const size = Math.random() * 20 + 20
      const baseHealth = Math.ceil(size / 20)
      const levelHealthBonus = Math.floor(level * 0.5)
      const stageHealthBonus = (stage - 1) * 2
      const totalHealth = Math.max(1, baseHealth + levelHealthBonus + stageHealthBonus)
      const baseSpeed = Math.random() * 1.5 + 0.8 // No level scaling - constant speed
      
      // Different enemy types
      const enemyTypes = ['normal', 'fast', 'tank', 'zigzag', 'kamikaze', 'shooter']
      const weights = [0.3, 0.2, 0.15, 0.15, 0.1, 0.1] // Probability weights
      let rand = Math.random()
      let enemyType = 'normal'
      for (let i = 0; i < enemyTypes.length; i++) {
        if (rand < weights[i]) {
          enemyType = enemyTypes[i]
          break
        }
        rand -= weights[i]
      }
      
      // Adjust stats based on type - NO SPEED SCALING WITH LEVEL
      let finalSize = size
      let finalSpeed = baseSpeed
      let finalHealth = totalHealth
      let finalRotationSpeed = (Math.random() - 0.5) * 0.1
      
      switch (enemyType) {
        case 'fast':
          finalSize = size * 0.7
          finalSpeed = (Math.random() * 1.5 + 1) * 1.2 // Constant speed, no level scaling
          finalHealth = Math.max(1, Math.floor(totalHealth * 0.6))
          break
        case 'tank':
          finalSize = size * 1.3
          finalSpeed = (Math.random() * 0.8 + 0.3) * 0.5 // Constant speed, no level scaling
          finalHealth = Math.floor(totalHealth * 2)
          break
        case 'zigzag':
          finalSpeed = Math.random() * 1.5 + 0.8 // Constant speed, no level scaling
          finalRotationSpeed = (Math.random() - 0.5) * 0.3
          break
        case 'kamikaze':
          finalSize = size * 0.8
          finalSpeed = (Math.random() * 1.5 + 1.5) * 1.0 // Constant speed, no level scaling
          finalHealth = Math.max(1, Math.floor(totalHealth * 0.8))
          break
        case 'shooter':
          finalSpeed = Math.random() * 1.5 + 0.8 // Constant speed, no level scaling
          break
      }
      
      this.enemies.push({
        x: Math.random() * (canvasWidth - finalSize) + finalSize / 2,
        y: -finalSize,
        width: finalSize,
        height: finalSize,
        speed: finalSpeed,
        rotation: 0,
        rotationSpeed: finalRotationSpeed,
        health: finalHealth,
        maxHealth: finalHealth,
        isBoss: false,
        enemyType: enemyType,
        shootTimer: 0,
        shootInterval: 120 + Math.random() * 60,
        zigzagOffset: 0,
        zigzagSpeed: Math.random() * 0.1 + 0.05,
        kamikazeTargetX: null,
        kamikazeTargetY: null
      })
      return { timer: 0, interval: newInterval, spawned: true }
    }
    
    return { timer: newTimer, interval: newInterval, spawned: false }
  }

  spawnBoss(canvasWidth, stage) {
    const size = 80 + (stage * 10)
    const health = 100 + (stage * 50) + (stage * stage * 10) // Much more reasonable HP
    const speed = 0.5 + (stage * 0.1)
    
    this.enemies.push({
      x: canvasWidth / 2,
      y: -size - 50,
      width: size,
      height: size,
      speed: speed,
      rotation: 0,
      rotationSpeed: 0.05,
      health: health,
      maxHealth: health,
      isBoss: true,
      bossStage: stage,
      shootTimer: 0,
      shootInterval: Math.max(40, 80 - (stage * 5)), // Slower shooting, minimum 40 frames
      burstCount: 0,
      burstTimer: 0
    })
  }

  updateBossShooting(boss, player, canvasWidth, canvasHeight) {
    if (!boss.isBoss) return
    
    boss.shootTimer++
    
    // Burst fire pattern - shoot multiple bursts
    if (boss.shootTimer >= boss.shootInterval) {
      boss.burstCount = 2 + Math.floor(boss.bossStage / 3) // Fewer bursts, scales slower
      boss.burstTimer = 0
      boss.shootTimer = 0
    }
    
    // Fire bursts rapidly
    if (boss.burstCount > 0) {
      boss.burstTimer++
      if (boss.burstTimer >= 8) { // Slower bursts, 8 frames between
        boss.burstTimer = 0
        boss.burstCount--
        
        // Fewer bullets per burst
        const bulletCount = Math.min(3 + Math.floor(boss.bossStage / 2), 6)
        const spreadAngle = 0.4 + (boss.bossStage * 0.1)
        const angleStep = bulletCount > 1 ? spreadAngle / (bulletCount - 1) : 0
        const startAngle = -spreadAngle / 2
        
        for (let i = 0; i < bulletCount; i++) {
          const angle = startAngle + (i * angleStep)
          const dx = player.x - boss.x
          const dy = player.y - boss.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const baseAngle = Math.atan2(dy, dx)
          
          this.enemyBullets.push({
            x: boss.x,
            y: boss.y + boss.height / 2,
            width: 6,
            height: 12,
            speed: 4 + boss.bossStage * 0.3, // Slower bullets
            angle: baseAngle + angle,
            vx: Math.cos(baseAngle + angle) * (4 + boss.bossStage * 0.3),
            vy: Math.sin(baseAngle + angle) * (4 + boss.bossStage * 0.3),
            damage: 5 + boss.bossStage * 1 // Less damage
          })
        }
      }
    }
  }

  updateEnemyBullets(canvasWidth, canvasHeight) {
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i]
      bullet.x += bullet.vx
      bullet.y += bullet.vy
      
      if (bullet.y > canvasHeight + 20 || bullet.y < -20 || bullet.x < -20 || bullet.x > canvasWidth + 20) {
        this.enemyBullets.splice(i, 1)
      }
    }
  }

  updateEnemies(canvasHeight, canvasWidth, player) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i]
      
      if (enemy.isBoss) {
        // Boss floats at the top, moving side to side
        const targetY = 100 + enemy.height / 2
        if (enemy.y < targetY) {
          // Slow descent
          enemy.y += enemy.speed * 0.5
        } else if (enemy.y > targetY + 10) {
          enemy.y -= enemy.speed * 0.5
        } else {
          enemy.y = targetY
        }
        
        // Side to side movement
        const time = Date.now() * 0.001
        const amplitude = Math.min(150, (canvasWidth / 2) - enemy.width)
        const centerX = canvasWidth / 2
        enemy.x = centerX + Math.sin(time * 0.5) * amplitude
        
        enemy.rotation += enemy.rotationSpeed
        
        // Boss shooting
        if (player) {
          this.updateBossShooting(enemy, player, canvasWidth, canvasHeight)
        }
      } else {
        // Different movement patterns based on enemy type
        switch (enemy.enemyType) {
          case 'fast':
            // Fast enemies move straight down quickly
            enemy.y += enemy.speed
            enemy.rotation += enemy.rotationSpeed
            break
            
          case 'tank':
            // Tank enemies move slowly straight down
            enemy.y += enemy.speed
            enemy.rotation += enemy.rotationSpeed * 0.5
            break
            
          case 'zigzag':
            // Zigzag enemies move side to side while descending
            enemy.zigzagOffset += enemy.zigzagSpeed
            enemy.x += Math.sin(enemy.zigzagOffset) * 2
            enemy.y += enemy.speed
            enemy.rotation += enemy.rotationSpeed
            // Keep within bounds
            enemy.x = Math.max(enemy.width / 2, Math.min(canvasWidth - enemy.width / 2, enemy.x))
            break
            
          case 'kamikaze':
            // Kamikaze enemies rush toward player
            if (player) {
              if (!enemy.kamikazeTargetX || !enemy.kamikazeTargetY) {
                enemy.kamikazeTargetX = player.x
                enemy.kamikazeTargetY = player.y
              }
              const dx = enemy.kamikazeTargetX - enemy.x
              const dy = enemy.kamikazeTargetY - enemy.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > 5) {
                enemy.x += (dx / distance) * enemy.speed * 0.8
                enemy.y += (dy / distance) * enemy.speed
              } else {
                enemy.y += enemy.speed
              }
            } else {
              enemy.y += enemy.speed
            }
            enemy.rotation += enemy.rotationSpeed * 2
            break
            
          case 'shooter':
            // Shooter enemies move down and shoot
            enemy.y += enemy.speed
            enemy.rotation += enemy.rotationSpeed
            enemy.shootTimer++
            if (enemy.shootTimer >= enemy.shootInterval && player) {
              enemy.shootTimer = 0
              const dx = player.x - enemy.x
              const dy = player.y - enemy.y
              const angle = Math.atan2(dy, dx)
              this.enemyBullets.push({
                x: enemy.x,
                y: enemy.y + enemy.height / 2,
                width: 5,
                height: 10,
                speed: 3,
                angle: angle,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                damage: 3
              })
            }
            break
            
          default: // 'normal'
            // Normal enemies move straight down
            enemy.y += enemy.speed
            enemy.rotation += enemy.rotationSpeed
            break
        }
        
        // Remove enemies that go off-screen (with larger buffer for bottom)
        // Only remove from bottom if they're way off-screen, keep them if they're still reachable
        const sideBuffer = 50
        const bottomBuffer = 100 // Larger buffer at bottom so enemies don't disappear too quickly
        if (enemy.y > canvasHeight + bottomBuffer || 
            enemy.y < -sideBuffer ||
            enemy.x < -enemy.width - sideBuffer || 
            enemy.x > canvasWidth + enemy.width + sideBuffer) {
          this.enemies.splice(i, 1)
        }
      }
    }
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

  reset() {
    this.bullets = []
    this.enemyBullets = []
    this.enemies = []
    this.particles = []
  }
}

