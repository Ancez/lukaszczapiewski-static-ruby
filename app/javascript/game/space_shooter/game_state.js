export class GameState {
  constructor(canvas) {
    this.canvas = canvas
    this.gameState = 'menu'
    this.score = 0
    this.lives = 3
    this.maxLives = 3
    this.hp = 100
    this.maxHp = 100
    this.level = 1
    this.stage = 1
    this.bossActive = false
    this.bossSpawned = false
    this.enemySpawnTimer = 0
    this.enemySpawnInterval = 120
    this.shootTimer = 0
    this.shootInterval = 10
    this.mouseDeltaX = 0
    this.isPointerLocked = false
    this.highScoreSaved = false
  }

  init(canvasWidth, canvasHeight, centerX, centerY) {
    this.gameState = 'menu'
    this.score = 0
    this.lives = 3
    this.maxLives = 3
    this.hp = 100
    this.maxHp = 100
    this.level = 1
    this.stage = 1
    this.bossActive = false
    this.bossSpawned = false
    this.wave = 1
    this.waveEnemiesSpawned = 0
    this.waveEnemiesTotal = 10
    this.waveComplete = false
    this.enemySpawnTimer = 0
    this.enemySpawnInterval = 120
    this.shootTimer = 0
    this.shootInterval = 50
    this.mouseDeltaX = 0
    this.isPointerLocked = false
    this.highScoreSaved = false
    this.showPowerupSelection = false
    this.showStartingWeaponSelection = false
    this.pendingPowerups = []
    this.powerupCardBounds = []
    this.powerupSelectionType = 'weapon' // 'weapon' or 'skill'
    this.hoveredPowerupIndex = -1
    this.clickedPowerupIndex = -1
    this.clickAnimationTime = 0
    this.lastLevel = 0
    this.scorePopups = []
  }

  startGame(canvasWidth, canvasHeight, centerX, centerY) {
    // Always reset game state when starting (even if already playing)
    // Call init to reset everything first
    this.init(canvasWidth, canvasHeight, centerX, centerY)
    // Then set to playing state
    this.gameState = 'playing'
    this.showStartingWeaponSelection = true
  }

  getXpRequiredForLevel(level) {
    // Dynamic XP: base 100, +20% per level
    // Level 1: 100, Level 2: 120, Level 3: 144, Level 4: 173, etc.
    if (level === 1) return 100
    return Math.ceil(100 * Math.pow(1.2, level - 1))
  }

  getTotalXpForLevel(level) {
    // Calculate total XP needed to reach a specific level
    let total = 0
    for (let i = 1; i < level; i++) {
      total += this.getXpRequiredForLevel(i)
    }
    return total
  }

  getLevelProgress() {
    // Ensure level is up to date before calculating progress
    this.recalculateLevel()
    const currentLevelXp = this.getTotalXpForLevel(this.level)
    const nextLevelXp = currentLevelXp + this.getXpRequiredForLevel(this.level)
    const progress = (this.score - currentLevelXp) / (nextLevelXp - currentLevelXp)
    return Math.max(0, Math.min(1, progress))
  }

  recalculateLevel() {
    // Calculate level based on total XP accumulated
    let calculatedLevel = 1
    let totalXpNeeded = 0
    while (this.score >= totalXpNeeded + this.getXpRequiredForLevel(calculatedLevel)) {
      totalXpNeeded += this.getXpRequiredForLevel(calculatedLevel)
      calculatedLevel++
    }
    
    this.level = calculatedLevel
  }

  levelUp() {
    const oldLevel = this.level
    
    // Recalculate level based on total XP accumulated
    this.recalculateLevel()
    
    const leveledUp = this.level > oldLevel
    
    if (leveledUp && this.level > this.lastLevel) {
      this.lastLevel = this.level
      return { leveledUp: true, stageChanged: false }
    }
    return { leveledUp: false, stageChanged: false }
  }

  takeDamage(damage = 1) {
    this.hp -= damage
    if (this.hp <= 0) {
      this.lives--
      if (this.lives > 0) {
        this.hp = this.maxHp
      } else {
        this.gameState = 'gameOver'
        return true
      }
    }
    return false
  }

  loseLife() {
    return this.takeDamage(this.hp)
  }

  addMaxHp(amount) {
    this.maxHp += amount
    this.hp += amount
  }
}

