import { useState, useEffect, useCallback } from 'react'
import './Chat.css'
import ChatDisplay, { type Message } from '../ChatDisplay'
import ChatInput from '../ChatInput'
import ConversationList from '../ConversationList'
import ResizeHandle from '../ResizeHandle'

/**
 * チャットコンポーネント
 * メッセージの送信と表示を行うチャットインターフェースを提供する
 * @returns チャットのJSX要素
 */
function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const [refreshConversations, setRefreshConversations] = useState<number>(0)
  const [sidebarWidth, setSidebarWidth] = useState<number>(280) // デフォルト幅
  const [isResizing, setIsResizing] = useState<boolean>(false)

  /**
   * リサイズ処理を開始する
   * @param event - マウス押下イベント
   */
  const handleResizeStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    setIsResizing(true)

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = e.clientX
      // 最小幅200px、最大幅500pxに制限
      const clampedWidth = Math.max(200, Math.min(500, newWidth))
      setSidebarWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // 幅をlocalStorageに保存
      localStorage.setItem('sidebarWidth', sidebarWidth.toString())
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [sidebarWidth])

  /**
   * コンポーネント初期化時にlocalStorageから幅を復元
   */
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth')
    if (savedWidth) {
      const width = parseInt(savedWidth, 10)
      if (!isNaN(width) && width >= 200 && width <= 500) {
        setSidebarWidth(width)
      }
    }
  }, [])

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
   * 会話削除時の処理
   * 削除された会話が現在選択中の会話の場合、新規会話状態にする
   */
  const handleConversationDelete = (deletedConversationId: number) => {
    if (currentConversationId === deletedConversationId) {
      startNewConversation()
    }
  }

  /**
   * メッセージ送信時の処理
   * "time"の場合は時刻APIを、"/cat"の場合は猫APIを、それ以外はエコーAPIを呼び出す
   * エコーAPIと猫APIは自動的にユーザーメッセージとレスポンスメッセージの両方をデータベースに保存する
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
      if (messageText.toLowerCase() === 'time') {
        // 時刻APIを呼び出し
        const response = await fetch('/api/time', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        })

        if (response.ok) {
          const data = await response.json()
          const timeMessage: Message = {
            id: Date.now() + 1,
            text: data.message,
            timestamp: new Date(),
            sender: 'echo'
          }
          
          // 時刻メッセージを追加
          setMessages(prev => [...prev, timeMessage])
        } else {
          console.error('Time API error:', response.status)
        }
      } else if (messageText === '/cat') {
        // 猫APIを呼び出し（バックエンドで自動的にメッセージが保存される）
        const response = await fetch('/api/cat', {
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
          const catMessage: Message = {
            id: Date.now() + 1,
            text: data.message,
            timestamp: new Date(),
            sender: 'echo'
          }
          
          // 猫の雑学メッセージを追加
          setMessages(prev => [...prev, catMessage])

          // 新しい会話が作成された場合、会話IDを更新し、履歴リストを更新
          if (data.conversationId && !currentConversationId) {
            setCurrentConversationId(data.conversationId)
            setRefreshConversations(prev => prev + 1) // トリガーを変更して履歴リストを更新
          }
        } else {
          console.error('Cat API error:', response.status)
        }
      } else {
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

          // 新しい会話が作成された場合、会話IDを更新し、履歴リストを更新
          if (data.conversationId && !currentConversationId) {
            setCurrentConversationId(data.conversationId)
            setRefreshConversations(prev => prev + 1) // トリガーを変更して履歴リストを更新
          }
        } else {
          console.error('Echo API error:', response.status)
        }
      }
    } catch (error) {
      console.error('Failed to call API:', error)
    }
  }

  return (
    <div className={`app-container ${isResizing ? 'resizing' : ''}`} style={{ cursor: isResizing ? 'col-resize' : 'default' }}>
      <ConversationList
        onConversationSelect={loadConversation}
        selectedConversationId={currentConversationId}
        onNewConversation={startNewConversation}
        onConversationDelete={handleConversationDelete}
        refreshTrigger={refreshConversations}
        width={sidebarWidth}
      />
      <ResizeHandle onMouseDown={handleResizeStart} />
      <div className="chat-container">
        <div className="chat-header">
          <h1 className="chat-title">チャット</h1>
        </div>
        <ChatDisplay messages={messages} />
        <ChatInput onSubmit={handleMessageSubmit} />
      </div>
    </div>
  )
}

export default Chat