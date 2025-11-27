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

      requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    })
  }
}

