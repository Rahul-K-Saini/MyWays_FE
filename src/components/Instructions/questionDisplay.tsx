import React from 'react'

interface QuestionDisplayProps {
  question: string
}

export default function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <h2 className="text-2xl font-semibold mb-4 max-w-2xl text-center">{question}</h2>
  )
}

