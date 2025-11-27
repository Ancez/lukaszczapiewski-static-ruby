export class SoundManager {
  constructor() {
    this.audioContext = null
    this.bgMusic = null
    this.bgMusicSource = null
    this.bgMusicGain = null
    
    // Volume settings (0-1)
    this.masterVolume = this.loadVolume('masterVolume', 0.7)
    this.sfxVolume = this.loadVolume('sfxVolume', 0.8)
    this.musicVolume = this.loadVolume('musicVolume', 0.5)
    
    this.initAudioContext()
  }
  
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  }
  
  loadVolume(key, defaultValue) {
    const stored = localStorage.getItem(`christmasShooter_${key}`)
    if (stored !== null) {
      return parseFloat(stored)
    }
    return defaultValue
  }
  
  saveVolume(key, value) {
    localStorage.setItem(`christmasShooter_${key}`, value.toString())
  }
  
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    this.saveVolume('masterVolume', this.masterVolume)
    this.updateBgMusicVolume()
  }
  
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume))
    this.saveVolume('sfxVolume', this.sfxVolume)
  }
  
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
    this.saveVolume('musicVolume', this.musicVolume)
    this.updateBgMusicVolume()
  }
  
  updateBgMusicVolume() {
    if (this.bgMusicGain) {
      this.bgMusicGain.gain.value = this.masterVolume * this.musicVolume
    }
  }
  
  playShootSound() {
    this.initAudioContext()
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05)
    
    gainNode.gain.setValueAtTime(0.3 * this.masterVolume * this.sfxVolume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.05)
  }
  
  playKillSound() {
    this.initAudioContext()
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.4 * this.masterVolume * this.sfxVolume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }
  
  playLevelUpSound() {
    this.initAudioContext()
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    // Play a cheerful ascending melody
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    const duration = 0.15
    
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * duration)
      
      gainNode.gain.setValueAtTime(0.5 * this.masterVolume * this.sfxVolume, this.audioContext.currentTime + index * duration)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * duration + duration)
      
      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      oscillator.start(this.audioContext.currentTime + index * duration)
      oscillator.stop(this.audioContext.currentTime + index * duration + duration)
    })
  }
  
  startBgMusic() {
    this.initAudioContext()
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    
    if (this.bgMusicSource) {
      return // Already playing
    }
    
    // Create a simple christmassy melody using oscillators
    // We'll create a looped pattern
    this.bgMusicGain = this.audioContext.createGain()
    this.bgMusicGain.gain.value = this.masterVolume * this.musicVolume
    this.bgMusicGain.connect(this.audioContext.destination)
    
    // Christmas melody: Jingle Bells pattern
    const melody = [
      { freq: 523.25, time: 0 },    // C5
      { freq: 523.25, time: 0.25 }, // C5
      { freq: 523.25, time: 0.5 },  // C5
      { freq: 523.25, time: 0.75 }, // C5
      { freq: 523.25, time: 1.0 },  // C5
      { freq: 523.25, time: 1.25 }, // C5
      { freq: 659.25, time: 1.5 },  // E5
      { freq: 392.00, time: 2.0 },  // G4
      { freq: 440.00, time: 2.5 },  // A4
      { freq: 523.25, time: 3.0 },  // C5
      { freq: 0, time: 3.5 },       // Rest
      { freq: 392.00, time: 4.0 },  // G4
      { freq: 392.00, time: 4.5 },  // G4
      { freq: 392.00, time: 5.0 },  // G4
      { freq: 0, time: 5.5 },       // Rest
      { freq: 392.00, time: 6.0 },  // G4
      { freq: 392.00, time: 6.5 },  // G4
      { freq: 392.00, time: 7.0 },  // G4
      { freq: 0, time: 7.5 },       // Rest
      { freq: 523.25, time: 8.0 },  // C5
      { freq: 523.25, time: 8.5 },  // C5
      { freq: 440.00, time: 9.0 },  // A4
      { freq: 440.00, time: 9.5 },  // A4
      { freq: 523.25, time: 10.0 }, // C5
      { freq: 440.00, time: 10.5 }, // A4
      { freq: 392.00, time: 11.0 }, // G4
      { freq: 0, time: 11.5 }       // Rest
    ]
    
    const loopDuration = 12 // seconds
    let loopStartTime = this.audioContext.currentTime
    let nextLoopTime = loopStartTime + loopDuration
    
    const scheduleLoop = (startTime) => {
      melody.forEach(note => {
        if (note.freq > 0) {
          const oscillator = this.audioContext.createOscillator()
          const gainNode = this.audioContext.createGain()
          
          oscillator.type = 'sine'
          oscillator.frequency.value = note.freq
          
          gainNode.gain.setValueAtTime(0.15, startTime + note.time)
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.time + 0.4)
          
          oscillator.connect(gainNode)
          gainNode.connect(this.bgMusicGain)
          
          oscillator.start(startTime + note.time)
          oscillator.stop(startTime + note.time + 0.4)
        }
      })
    }
    
    const scheduleNextLoop = () => {
      if (!this.bgMusicSource) return
      
      const currentTime = this.audioContext.currentTime
      if (currentTime >= nextLoopTime - 0.5) {
        scheduleLoop(nextLoopTime)
        nextLoopTime += loopDuration
      }
      
      setTimeout(() => scheduleNextLoop(), 100)
    }
    
    scheduleLoop(loopStartTime)
    this.bgMusicSource = true
    scheduleNextLoop()
  }
  
  stopBgMusic() {
    if (this.bgMusicGain) {
      this.bgMusicGain.gain.value = 0
    }
    this.bgMusicSource = null
  }
  
  resumeBgMusic() {
    if (this.bgMusicGain) {
      this.updateBgMusicVolume()
    } else {
      this.startBgMusic()
    }
  }
}

