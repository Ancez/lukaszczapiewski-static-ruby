export class Effects {
  constructor(gameObjects) {
    this.gameObjects = gameObjects
  }

  createExplosion(x, y, size) {
    const particleCount = Math.ceil(size / 2)
    const christmasColors = ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e', '#facc15']
    
    for (let i = 0; i < particleCount; i++) {
      this.gameObjects.particles.push({
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

  createGiftCollectionEffect(x, y) {
    const giftColors = ['#dc2626', '#16a34a', '#fbbf24', '#ffffff']
    
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = 3 + Math.random() * 2
      this.gameObjects.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.015 + 0.015,
        size: Math.random() * 5 + 3,
        color: giftColors[Math.floor(Math.random() * giftColors.length)]
      })
    }
  }

  createExplosionAround(x, y, size, enemies, level = 1) {
    const explosionRadius = size * (1.5 + level * 0.5)
    const christmasColors = ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e', '#facc15']
    
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30
      const distance = explosionRadius * (0.5 + Math.random() * 0.5)
      this.gameObjects.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: Math.cos(angle) * 6,
        vy: Math.sin(angle) * 6,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.02,
        size: Math.random() * 5 + 3,
        color: christmasColors[Math.floor(Math.random() * christmasColors.length)]
      })
    }
    
    enemies.forEach((enemy, index) => {
      const dx = enemy.x - x
      const dy = enemy.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < explosionRadius) {
        enemy.health -= 2
        if (enemy.health <= 0) {
          this.createExplosion(enemy.x, enemy.y, enemy.width)
        }
      }
    })
  }
  
  fireConfetti(x, y, canvasWidth, canvasHeight) {
    if (typeof window.confetti === 'undefined') {
      return
    }
    
    const normalizedX = (x / canvasWidth)
    const normalizedY = (y / canvasHeight)
    
    const scalar = 2
    const star = window.confetti.shapeFromText({ text: '⭐', scalar })
    const snowflake = window.confetti.shapeFromText({ text: '❄️', scalar })
    const tree = window.confetti.shapeFromText({ text: '🎄', scalar })
    const gift = window.confetti.shapeFromText({ text: '🎁', scalar })
    
    window.confetti({
      particleCount: 50,
      startVelocity: 35,
      spread: 70,
      origin: {
        x: normalizedX,
        y: normalizedY
      },
      colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e'],
      shapes: [star, snowflake, tree, gift, 'circle'],
      scalar: scalar
    })
  }
  
  fireLevelUpConfetti() {
    if (typeof window.confetti === 'undefined') {
      return
    }
    
    const scalar = 2
    const star = window.confetti.shapeFromText({ text: '⭐', scalar })
    const snowflake = window.confetti.shapeFromText({ text: '❄️', scalar })
    const tree = window.confetti.shapeFromText({ text: '🎄', scalar })
    const gift = window.confetti.shapeFromText({ text: '🎁', scalar })
    const santa = window.confetti.shapeFromText({ text: '🎅', scalar })
    
    window.confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e', '#facc15'],
      shapes: [star, snowflake, tree, gift, santa, 'circle'],
      scalar: scalar
    })
    
    setTimeout(() => {
      window.confetti({
        particleCount: 75,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e'],
        shapes: [star, snowflake, tree, gift, 'circle'],
        scalar: scalar
      })
    }, 250)
    
    setTimeout(() => {
      window.confetti({
        particleCount: 75,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        colors: ['#dc2626', '#16a34a', '#fbbf24', '#ffffff', '#ef4444', '#22c55e'],
        shapes: [star, snowflake, tree, gift, 'circle'],
        scalar: scalar
      })
    }, 400)
  }
}

