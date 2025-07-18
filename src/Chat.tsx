import { useState } from 'react'
import './Chat.css'

interface Message {
  id: number
  text: string
  timestamp: Date
}

function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: message.trim(),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setMessage('')
    }
  }

  return (
    <div className="chat-container">
      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className="message-bubble">
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="メッセージを入力してください..."
          className="chat-input"
        />
        <button type="submit" className="chat-button">
          送信
        </button>
      </form>
    </div>
  )
}

export default Chat