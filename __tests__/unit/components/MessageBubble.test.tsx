import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MessageBubble from '../../../src/components/MessageBubble'

interface Message {
  id: number
  text: string
  timestamp: Date
  sender: 'user' | 'echo'
}

describe('MessageBubble', () => {
  it('renders user message with correct styling', () => {
    const userMessage: Message = {
      id: 1,
      text: 'Hello World',
      timestamp: new Date(),
      sender: 'user'
    }

    render(<MessageBubble message={userMessage} />)
    
    const bubble = screen.getByText('Hello World')
    expect(bubble).toBeInTheDocument()
    expect(bubble).toHaveClass('message-bubble', 'user-message')
  })

  it('renders echo message with correct styling', () => {
    const echoMessage: Message = {
      id: 2,
      text: 'Echo: Hello World',
      timestamp: new Date(),
      sender: 'echo'
    }

    render(<MessageBubble message={echoMessage} />)
    
    const bubble = screen.getByText('Echo: Hello World')
    expect(bubble).toBeInTheDocument()
    expect(bubble).toHaveClass('message-bubble', 'echo-message')
  })

  it('preserves whitespace and line breaks in message text', () => {
    const messageWithNewlines: Message = {
      id: 3,
      text: 'Line 1\nLine 2\n\nLine 4',
      timestamp: new Date(),
      sender: 'user'
    }

    render(<MessageBubble message={messageWithNewlines} />)
    
    const bubble = screen.getByText((content, element) => {
      return element?.className === 'message-bubble user-message' && 
             element?.textContent === 'Line 1\nLine 2\n\nLine 4'
    })
    expect(bubble).toBeInTheDocument()
  })
})