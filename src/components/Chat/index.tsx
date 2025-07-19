import { useState, useEffect } from 'react'
import './Chat.css'
import ChatDisplay, { type Message } from '../ChatDisplay'
import ChatInput from '../ChatInput'
import ConversationList from '../ConversationList'

/**
 * チャットコンポーネント
 * メッセージの送信と表示を行うチャットインターフェースを提供する
 * @returns チャットのJSX要素
 */
function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)

  /**
   * 初期化時に会話履歴から最新の会話を読み込む
   */
  useEffect(() => {
    const loadInitialConversation = async () => {
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const conversations = await response.json()
          if (conversations.length > 0) {
            // 最新の会話を選択
            const latestConversation = conversations[0]
            await loadConversation(latestConversation.id)
          }
        }
      } catch (error) {
        console.error('Failed to load initial conversation:', error)
      }
    }

    loadInitialConversation()
  }, [])

  /**
   * 指定された会話のメッセージを読み込む
   */
  const loadConversation = async (conversationId: number) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      if (response.ok) {
        const data = await response.json()
        // データベースからのメッセージを適切な形式に変換
        const formattedMessages: Message[] = data.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          timestamp: new Date(msg.timestamp),
          sender: msg.sender as 'user' | 'echo'
        }))
        setMessages(formattedMessages)
        setCurrentConversationId(conversationId)
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  /**
   * 新しい会話を開始する
   */
  const startNewConversation = () => {
    setMessages([])
    setCurrentConversationId(null)
  }

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
        body: JSON.stringify({ 
          message: messageText,
          conversationId: currentConversationId 
        })
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

        // 新しい会話が作成された場合、会話IDを更新
        if (data.conversationId && !currentConversationId) {
          setCurrentConversationId(data.conversationId)
        }
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
        // 成功時はメッセージリストをクリアし、会話IDもリセット
        setMessages([])
        setCurrentConversationId(null)
      } else {
        console.error('Clear messages API error:', response.status)
      }
    } catch (error) {
      console.error('Failed to clear messages:', error)
    }
  }

  return (
    <div className="app-container">
      <ConversationList
        onConversationSelect={loadConversation}
        selectedConversationId={currentConversationId}
        onNewConversation={startNewConversation}
      />
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">チャット</h1>
          <button 
            className="clear-button" 
            onClick={handleClearMessages}
            title="全会話を削除"
          >
            <span className="material-icons">delete</span>
            全削除
          </button>
        </div>
        <ChatDisplay messages={messages} />
        <ChatInput onSubmit={handleMessageSubmit} />
      </div>
    </div>
  )
}

export default Chat