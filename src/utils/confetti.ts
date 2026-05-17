import confetti from 'canvas-confetti'

export const triggerSkyShot = () => {
  const duration = 2000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#C19100', '#D4A800', '#FF8C00', '#FFC107']
    })
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#C19100', '#D4A800', '#FF8C00', '#FFC107']
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  
  frame()
}
