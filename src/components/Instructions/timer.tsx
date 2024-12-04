"use client"

import React, { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'

interface TimerProps {
  duration: number
  onComplete: () => void
}

export default function Timer({ duration, onComplete }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timerId)
    } else {
      onComplete()
    }
  }, [timeLeft, onComplete])

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="w-full max-w-md ml-24">
      <Progress value={progress} className="w-full" />
      <p className="text-center mt-2">{timeLeft} seconds remaining</p>
    </div>
  )
}

