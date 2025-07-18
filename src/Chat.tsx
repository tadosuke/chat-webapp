import { useState, useRef, useEffect } from 'react'
import './Chat.css'

interface Message {
  id: number
  text: string
  timestamp: Date
}

/**
 * チャットコンポーネント
 * メッセージの送信と表示を行うチャットインターフェースを提供する
 * @returns チャットのJSX要素
 */
function Chat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * フォーム送信時の処理
   * メッセージが空でない場合、新しいメッセージを作成してメッセージリストに追加する
   * @param e - フォームイベント
   */
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

  /**
   * キーボード入力時の処理
   * Enterキー（Shiftキーなし）でフォーム送信を実行する
   * @param e - キーボードイベント
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  /**
   * テキストエリアの高さを内容に応じて自動調整する
   * 最小4行、最大12行の範囲で動的に高さを変更する
   */
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const lineHeight = 24 // 1.5em * 16px
      const minHeight = lineHeight * 4 // 4 rows
      const maxHeight = lineHeight * 12 // 12 rows
      const scrollHeight = textarea.scrollHeight
      
      if (scrollHeight <= maxHeight) {
        textarea.style.height = Math.max(minHeight, scrollHeight) + 'px'
        textarea.style.overflowY = 'hidden'
      } else {
        textarea.style.height = maxHeight + 'px'
        textarea.style.overflowY = 'auto'
      }
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

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
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力してください..."
          className="chat-input"
          rows={4}
        />
        <button type="submit" className="chat-button">
          送信
        </button>
      </form>
    </div>
  )
}

export default Chat