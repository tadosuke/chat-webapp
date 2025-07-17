import { useState } from 'react'
import './Chat.css'

function Chat() {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      console.log('送信されたメッセージ:', message)
      setMessage('')
    }
  }

  return (
    <div className="chat-container">
      <h2>チャット</h2>
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