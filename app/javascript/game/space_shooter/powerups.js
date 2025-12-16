export class Powerups {
  constructor() {
    this.activePowerups = {
      shotgun: 0,
      homingReindeers: 0,
      laser: 0,
      explodeAround: 0,
      shield: 0,
      barrier: 0,
      damage: 0,
      bulletVelocity: 0,
      bulletSize: 0,
      rapidFire: 0,
      piercing: 0,
      luck: 0,
      xpGain: 0
    }
    this.activeWeapons = [] // Array of active weapon IDs (max 3)
    this.baseChances = {
      explodeAround: 0.1,
      damage: 0
    }
    this.chancePerLevel = {
      explodeAround: 0.08,
      damage: 0
    }
    this.gifts = []
  }

  getChance(powerupId, level = null) {
    const currentLevel = level !== null ? level : (this.activePowerups[powerupId] || 0)
    if (currentLevel === 0) return 0
    const baseChance = this.baseChances[powerupId] || 0
    const perLevel = this.chancePerLevel[powerupId] || 0
    return Math.min(0.95, baseChance + (currentLevel - 1) * perLevel)
  }

  getAvailableWeapons() {
    return [
      {
        id: 'shotgun',
        name: 'Shotgun',
        getDescription: (level) => {
          const bullets = level === 1 ? '3' : level === 2 ? '5' : '7'
          return `Fires ${bullets} bullets in a spread pattern`
        },
        icon: '🔫',
        rarity: 'common',
        weaponType: 'shotgun'
      },
      {
        id: 'homingReindeers',
        name: 'Homing Reindeers',
        getDescription: (level) => {
          const strength = level
          return `Reindeer bullets track enemies (${strength}x strength)`
        },
        icon: '🦌',
        rarity: 'legendary',
        weaponType: 'homing'
      },
      {
        id: 'laser',
        name: 'Laser',
        getDescription: (level) => {
          const lasers = level === 1 ? '1' : level === 2 ? '2' : '3'
          return `Fires ${lasers} continuous laser beam${lasers > 1 ? 's' : ''}`
        },
        icon: '⚡',
        rarity: 'epic',
        weaponType: 'laser'
      }
    ]
  }

  getAvailableSkills() {
    return [
      {
        id: 'explodeAround',
        name: 'Explosive Kill',
        getDescription: (level, powerupSystem) => {
          const radius = (level * 1.5).toFixed(1)
          const chance = Math.round(powerupSystem.getChance('explodeAround', level) * 100)
          return `${chance}% chance, ${radius}x radius`
        },
        icon: '💥',
        rarity: 'rare'
      },
      {
        id: 'shield',
        name: 'Max HP',
        getDescription: (level) => {
          return `Always active: +${level} max HP`
        },
        icon: '❤️',
        rarity: 'epic'
      },
      {
        id: 'barrier',
        name: 'Barrier',
        getDescription: (level) => {
          return `Blocks ${level} hit${level > 1 ? 's' : ''}`
        },
        icon: '🛡️',
        rarity: 'legendary'
      },
      {
        id: 'damage',
        name: 'Attack Damage',
        getDescription: (level) => {
          const damage = level
          return `Always active: +${damage} damage`
        },
        icon: '⚔️',
        rarity: 'common'
      },
      {
        id: 'bulletVelocity',
        name: 'Bullet Speed',
        getDescription: (level) => {
          const speedBonus = Math.round(level * 25)
          return `Always active: +${speedBonus}% bullet speed`
        },
        icon: '🚀',
        rarity: 'common'
      },
      {
        id: 'bulletSize',
        name: 'Bullet Size',
        getDescription: (level) => {
          const sizeBonus = Math.round(level * 30)
          return `Always active: +${sizeBonus}% bullet size`
        },
        icon: '💎',
        rarity: 'rare'
      },
      {
        id: 'rapidFire',
        name: 'Rapid Fire',
        getDescription: (level) => {
          const speedBonus = Math.round(level * 30)
          return `Always active: +${speedBonus}% fire rate`
        },
        icon: '⚡',
        rarity: 'common'
      },
      {
        id: 'piercing',
        name: 'Piercing Bullets',
        getDescription: (level) => {
          return `Always active: Bullets pierce through enemies`
        },
        icon: '🔪',
        rarity: 'rare'
      },
      {
        id: 'luck',
        name: 'Luck',
        getDescription: (level) => {
          const luckBonus = Math.round(level * 15)
          return `Always active: +${luckBonus}% chance for better powerups`
        },
        icon: '🍀',
        rarity: 'epic'
      },
      {
        id: 'xpGain',
        name: 'XP Gain',
        getDescription: (level) => {
          const xpBonus = Math.round(level * 20)
          return `Always active: +${xpBonus}% XP from kills`
        },
        icon: '⭐',
        rarity: 'rare'
      }
    ]
  }

  getAvailablePowerups() {
    // Return all powerups for backwards compatibility
    return [...this.getAvailableWeapons(), ...this.getAvailableSkills()]
  }

  getLuckLevel() {
    return this.activePowerups.luck || 0
  }

  getRarityWeight(powerup) {
    const luckLevel = this.getLuckLevel()
    const baseWeights = {
      common: 50,
      rare: 30,
      epic: 15,
      legendary: 5
    }
    
    // Increase weights for better rarities based on luck
    const luckMultiplier = 1 + (luckLevel * 0.15)
    
    if (powerup.rarity === 'legendary') {
      return baseWeights.legendary * luckMultiplier * 2
    } else if (powerup.rarity === 'epic') {
      return baseWeights.epic * luckMultiplier * 1.5
    } else if (powerup.rarity === 'rare') {
      return baseWeights.rare * luckMultiplier
    } else {
      return baseWeights.common / luckMultiplier
    }
  }

  selectRandomWeapons(count = 3) {
    const all = this.getAvailableWeapons()
    return this.selectByRarity(all, count)
  }

  selectRandomSkills(count = 2) {
    const all = this.getAvailableSkills()
    return this.selectByRarity(all, count)
  }

  selectByRarity(powerups, count) {
    // Create weighted selection based on rarity and luck
    const weighted = []
    powerups.forEach(powerup => {
      const weight = this.getRarityWeight(powerup)
      for (let i = 0; i < weight; i++) {
        weighted.push(powerup)
      }
    })
    
    // Shuffle and select
    const shuffled = [...weighted].sort(() => Math.random() - 0.5)
    const selected = []
    const selectedIds = new Set()
    
    for (const powerup of shuffled) {
      if (!selectedIds.has(powerup.id) && selected.length < count) {
        selected.push(powerup)
        selectedIds.add(powerup.id)
      }
    }
    
    // Fill remaining slots if needed
    while (selected.length < count && selected.length < powerups.length) {
      const remaining = powerups.filter(p => !selectedIds.has(p.id))
      if (remaining.length === 0) break
      const random = remaining[Math.floor(Math.random() * remaining.length)]
      selected.push(random)
      selectedIds.add(random.id)
    }
    
    return selected
  }

  selectRandomPowerups(count = 3) {
    const all = this.getAvailablePowerups()
    const shuffled = [...all].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  applyPowerup(powerupId, gameState) {
    // Check if it's a weapon
    const weapons = this.getAvailableWeapons()
    const isWeapon = weapons.some(w => w.id === powerupId)
    
    if (isWeapon) {
      // Regular weapon - add as weapon if not already active (max 3)
      if (!this.activeWeapons.includes(powerupId) && this.activeWeapons.length < 3) {
        this.activeWeapons.push(powerupId)
        this.activePowerups[powerupId] = 1
      } else if (this.activeWeapons.includes(powerupId)) {
        // Level up existing weapon
        this.activePowerups[powerupId] = (this.activePowerups[powerupId] || 0) + 1
      }
    } else {
      // Regular powerup/skill (including bigBullets)
      if (this.activePowerups.hasOwnProperty(powerupId)) {
        this.activePowerups[powerupId] = (this.activePowerups[powerupId] || 0) + 1
        
        if (powerupId === 'shield' && gameState) {
          gameState.addMaxHp(1)
        }
      }
    }
  }

  getLevel(powerupId) {
    return this.activePowerups[powerupId] || 0
  }

  shouldDropGift() {
    return Math.random() < 0.15
  }

  createGift(x, y) {
    this.gifts.push({
      x: x,
      y: y,
      width: 30,
      height: 30,
      speed: 2,
      rotation: 0,
      rotationSpeed: 0.1,
      collected: false
    })
  }

  updateGifts(canvasHeight) {
    for (let i = this.gifts.length - 1; i >= 0; i--) {
      const gift = this.gifts[i]
      gift.y += gift.speed
      gift.rotation += gift.rotationSpeed
      
      if (gift.y > canvasHeight + gift.height || gift.collected) {
        this.gifts.splice(i, 1)
      }
    }
  }

  checkGiftCollection(player) {
    for (let i = this.gifts.length - 1; i >= 0; i--) {
      const gift = this.gifts[i]
      const dx = player.x - gift.x
      const dy = player.y - gift.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < player.width / 2 + gift.width / 2) {
        gift.collected = true
        return { collected: true, x: gift.x, y: gift.y }
      }
    }
    return { collected: false }
  }

  getDamageBonus() {
    return this.activePowerups.damage || 0
  }

  getBulletSpeedMultiplier() {
    const level = this.activePowerups.bulletVelocity || 0
    return 1 + (level * 0.25)
  }

  getBulletSizeMultiplier() {
    const bulletSizeLevel = this.activePowerups.bulletSize || 0
    return 1 + (bulletSizeLevel * 0.3)
  }

  getRapidFireLevel() {
    // Rapid fire is always a powerup/modifier now
    return this.activePowerups.rapidFire || 0
  }

  getWeaponAttackSpeedBonus() {
    // Each weapon level gives +10% attack speed
    let totalBonus = 0
    this.activeWeapons.forEach(weaponId => {
      const level = this.getWeaponLevel(weaponId)
      totalBonus += level * 0.1
    })
    return totalBonus
  }

  getWeaponBulletSpeedBonus() {
    // Each weapon level gives +5% bullet speed
    let totalBonus = 0
    this.activeWeapons.forEach(weaponId => {
      const level = this.getWeaponLevel(weaponId)
      totalBonus += level * 0.05
    })
    return totalBonus
  }

  getXpGainMultiplier() {
    // XP Gain gives +20% XP per level
    const level = this.activePowerups.xpGain || 0
    return 1 + (level * 0.2)
  }

  getActiveWeaponCount() {
    return this.activeWeapons.length
  }
  
  hasWeapon(weaponId) {
    return this.activeWeapons.includes(weaponId)
  }
  
  getWeaponLevel(weaponId) {
    return this.activePowerups[weaponId] || 0
  }

  getActiveSkillCount() {
    const skills = ['explodeAround', 'shield', 'barrier', 'damage', 'bulletVelocity', 'bulletSize', 'rapidFire', 'piercing', 'luck', 'xpGain']
    return skills.reduce((count, skillId) => {
      return count + (this.activePowerups[skillId] > 0 ? 1 : 0)
    }, 0)
  }

  reset() {
    this.activePowerups = {
      shotgun: 0,
      homingReindeers: 0,
      laser: 0,
      explodeAround: 0,
      shield: 0,
      barrier: 0,
      damage: 0,
      bulletVelocity: 0,
      bulletSize: 0,
      rapidFire: 0,
      piercing: 0,
      luck: 0,
      xpGain: 0
    }
    this.activeWeapons = []
    this.gifts = []
  }
}

