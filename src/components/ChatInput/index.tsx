import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

interface ChatInputProps {
  onSubmit: (message: string) => void
}

/**
 * チャット入力コンポーネント
 * メッセージの入力と送信を行うチャットインターフェースの入力部分を提供する
 * @param onSubmit - メッセージ送信時に呼び出されるコールバック関数
 * @returns チャット入力のJSX要素
 */
function ChatInput({ onSubmit }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * フォーム送信時の処理
   * メッセージが空でない場合、onSubmitコールバックを呼び出してメッセージをクリアする
   * @param e - フォームイベント
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSubmit(message.trim())
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
  )
}

export default ChatInput
export type { ChatInputProps }