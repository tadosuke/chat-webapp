import { useEffect, useState } from 'react'
import './ConversationList.css'

interface Conversation {
  id: number
  title: string
  created_at: string
}

interface ConversationListProps {
  onConversationSelect: (conversationId: number) => void
  selectedConversationId: number | null
  onNewConversation: () => void
}

/**
 * 会話履歴リストコンポーネント
 * 保存された会話の一覧を表示し、選択された会話をロードする
 * @param onConversationSelect - 会話選択時のコールバック関数
 * @param selectedConversationId - 現在選択されている会話のID
 * @param onNewConversation - 新規会話作成のコールバック関数
 * @returns 会話履歴リストのJSX要素
 */
function ConversationList({ onConversationSelect, selectedConversationId, onNewConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * 会話一覧を読み込む
   */
  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
        setError(null)
      } else {
        setError('会話履歴の読み込みに失敗しました')
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setError('会話履歴の読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])

  /**
   * 会話タイトルを表示用にフォーマットする
   * 15文字を超える場合は末尾に「...」を付ける
   */
  const formatTitle = (title: string): string => {
    return title.length > 15 ? title.substring(0, 15) + '...' : title
  }

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2 className="conversation-list-title">会話履歴</h2>
        <button 
          className="new-conversation-button"
          onClick={onNewConversation}
          title="新しい会話を開始"
        >
          <span className="material-icons">add</span>
          新規
        </button>
      </div>
      
      <div className="conversation-list-content">
        {loading && (
          <div className="conversation-list-loading">
            読み込み中...
          </div>
        )}
        
        {error && (
          <div className="conversation-list-error">
            {error}
            <button onClick={loadConversations} className="retry-button">
              再試行
            </button>
          </div>
        )}
        
        {!loading && !error && conversations.length === 0 && (
          <div className="conversation-list-empty">
            会話履歴がありません<br />
            新しい会話を開始してください
          </div>
        )}
        
        {!loading && !error && conversations.length > 0 && (
          <div className="conversation-list-items">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${selectedConversationId === conversation.id ? 'selected' : ''}`}
                onClick={() => onConversationSelect(conversation.id)}
                title={conversation.title}
              >
                <div className="conversation-item-title">
                  {formatTitle(conversation.title)}
                </div>
                <div className="conversation-item-date">
                  {new Date(conversation.created_at).toLocaleDateString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationList
export type { ConversationListProps, Conversation }