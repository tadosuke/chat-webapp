import { useState, useEffect } from 'react'
import './Chat.css'
import ChatDisplay, { type Message } from '../ChatDisplay'
import ChatInput from '../ChatInput'

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

  /**
   * 会話履歴削除時の処理
   * データベースから全ての会話履歴を削除し、表示をクリアする
   */
  const handleClearMessages = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'DELETE'
      })

      if (response.ok) {
        // 成功時はメッセージリストをクリア
        setMessages([])
      } else {
        console.error('Clear messages API error:', response.status)
      }
    } catch (error) {
      console.error('Failed to clear messages:', error)
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1 className="chat-title">チャット</h1>
        <button 
          className="clear-button" 
          onClick={handleClearMessages}
          title="新規会話を開始"
        >
          <span className="material-icons">add</span>
          新規
        </button>
      </div>
      <ChatDisplay messages={messages} />
      <ChatInput onSubmit={handleMessageSubmit} />
    </div>
  )
}

export default Chat