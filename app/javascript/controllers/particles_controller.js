import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.mouseX = 0
    this.mouseY = 0
    this.mouseRadius = 150
    this.createParticles()
    this.setupMouseTracking()
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    })

    document.addEventListener('mouseleave', () => {
      this.mouseX = -1000
      this.mouseY = -1000
    })
  }

  createParticles() {
    const canvas = this.element
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 80

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2.5 + 1
        this.speedX = Math.random() * 0.8 - 0.4
        this.speedY = Math.random() * 0.8 - 0.4
        this.opacity = Math.random() * 0.5 + 0.2
        this.baseOpacity = this.opacity
        this.baseSize = this.size
      }

      update(mouseX, mouseY, mouseRadius) {
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius
          const angle = Math.atan2(dy, dx)
          const repelForce = force * 0.5

          this.speedX -= Math.cos(angle) * repelForce
          this.speedY -= Math.sin(angle) * repelForce

          this.opacity = Math.min(this.baseOpacity + force * 0.8, 1)
          this.size = this.baseSize + force * 2
        } else {
          this.opacity += (this.baseOpacity - this.opacity) * 0.1
          this.size += (this.baseSize - this.size) * 0.1
        }

        this.speedX *= 0.98
        this.speedY *= 0.98

        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) {
          this.x = 0
        }
        if (this.x < 0) {
          this.x = canvas.width
        }
        if (this.y > canvas.height) {
          this.y = 0
        }
        if (this.y < 0) {
          this.y = canvas.height
        }
      }

      draw(ctx, mouseX, mouseY, mouseRadius) {
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const mouseInfluence = distance < mouseRadius ? (mouseRadius - distance) / mouseRadius : 0

        const glowIntensity = mouseInfluence * 0.5
        const baseColor = { r: 99, g: 102, b: 241 }

        if (glowIntensity > 0) {
          ctx.shadowBlur = 15 * glowIntensity
          ctx.shadowColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${glowIntensity})`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${this.opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach(particle => {
        particle.update(this.mouseX, this.mouseY, this.mouseRadius)
        particle.draw(ctx, this.mouseX, this.mouseY, this.mouseRadius)
      })

      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const mouseDx1 = this.mouseX - particle.x
            const mouseDy1 = this.mouseY - particle.y
            const mouseDist1 = Math.sqrt(mouseDx1 * mouseDx1 + mouseDy1 * mouseDy1)
            
            const mouseDx2 = this.mouseX - otherParticle.x
            const mouseDy2 = this.mouseY - otherParticle.y
            const mouseDist2 = Math.sqrt(mouseDx2 * mouseDx2 + mouseDy2 * mouseDy2)

            const mouseInfluence1 = mouseDist1 < this.mouseRadius ? (this.mouseRadius - mouseDist1) / this.mouseRadius : 0
            const mouseInfluence2 = mouseDist2 < this.mouseRadius ? (this.mouseRadius - mouseDist2) / this.mouseRadius : 0
            const maxInfluence = Math.max(mouseInfluence1, mouseInfluence2)

            const baseOpacity = 0.2 * (1 - distance / 120)
            const enhancedOpacity = baseOpacity + maxInfluence * 0.4
            const lineWidth = 1 + maxInfluence * 1.5

            ctx.strokeStyle = `rgba(99, 102, 241, ${Math.min(enhancedOpacity, 0.8)})`
            ctx.lineWidth = lineWidth
            ctx.shadowBlur = maxInfluence > 0 ? 5 * maxInfluence : 0
            ctx.shadowColor = maxInfluence > 0 ? `rgba(99, 102, 241, ${maxInfluence * 0.5})` : 'transparent'
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
            ctx.shadowBlur = 0
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }
}

