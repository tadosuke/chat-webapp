import { useState, useEffect } from 'react'
import './Chat.css'
import ChatDisplay, { type Message } from './ChatDisplay'
import ChatInput from './ChatInput'

/**
 * チャットコンポーネント
 * メッセージの送信と表示を行うチャットインターフェースを提供する
 * @returns チャットのJSX要素
 */
function Chat() {
  const [messages, setMessages] = useState<Message[]>([])

  /**
   * 履歴からメッセージを読み込む
   */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch('/api/messages')
        if (response.ok) {
          const data = await response.json()
          // データベースからのメッセージを適切な形式に変換
          const formattedMessages: Message[] = data.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            sender: msg.sender as 'user' | 'echo' // データベースからsender情報を使用
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Failed to load message history:', error)
      }
    }

    loadMessages()
  }, [])

  /**
   * メッセージ送信時の処理
   * 新しいメッセージを作成してメッセージリストに追加し、
   * API/echoエンドポイントに送信してレスポンスを取得する
   * エコーAPIが自動的にユーザーメッセージとエコーメッセージの両方をデータベースに保存する
   * @param messageText - 送信するメッセージのテキスト
   */
  const handleMessageSubmit = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      timestamp: new Date(),
      sender: 'user'
    }
    
    // ユーザーメッセージを追加
    setMessages(prev => [...prev, userMessage])

    try {
      // API/echoエンドポイントに送信（バックエンドで自動的にメッセージが保存される）
      const response = await fetch('/api/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText })
      })

      if (response.ok) {
        const data = await response.json()
        const echoMessage: Message = {
          id: Date.now() + 1,
          text: data.message,
          timestamp: new Date(),
          sender: 'echo'
        }
        
        // エコーメッセージを追加
        setMessages(prev => [...prev, echoMessage])
      } else {
        console.error('Echo API error:', response.status)
      }
    } catch (error) {
      console.error('Failed to call Echo API:', error)
    }
  }

  return (
    <div className="chat-container">
      <ChatDisplay messages={messages} />
      <ChatInput onSubmit={handleMessageSubmit} />
    </div>
  )
}

export default Chat