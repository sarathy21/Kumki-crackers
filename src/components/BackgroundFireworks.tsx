'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export function BackgroundFireworks() {
  useEffect(() => {
    const duration = 15 * 1000
    const animationEnd = Date.now() + duration
    
    const interval: any = setInterval(() => {
      // Rocket fireworks shooting from the bottom
      const randomX = Math.random()
      
      confetti({
        particleCount: 50,
        angle: 90 + (Math.random() * 20 - 10), // Shoot upwards
        spread: 45,
        startVelocity: 45,
        decay: 0.9,
        gravity: 1,
        origin: { x: randomX, y: 1 }, // From the bottom edge
        colors: ['#00f3ff', '#ff00ff', '#39ff14', '#F59E0B'],
        zIndex: -1,
        disableForReducedMotion: true
      })
    }, 1500) // Every 1.5 seconds

    return () => clearInterval(interval)
  }, [])

  return null
}
