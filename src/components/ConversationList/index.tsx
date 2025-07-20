import { useEffect, useState } from 'react'
import './ConversationList.css'
import ConversationItems, { type Conversation } from './ConversationItems'

interface ConversationListProps {
  onConversationSelect: (conversationId: number) => void
  selectedConversationId: number | null
  onNewConversation: () => void
  onConversationDelete: (conversationId: number) => void
  refreshTrigger?: number // 履歴リストを再読み込みするためのトリガー
  width?: number // サイドバーの幅
}

/**
 * 会話履歴リストコンポーネント
 * 保存された会話の一覧を表示し、選択された会話をロードする
 * @param onConversationSelect - 会話選択時のコールバック関数
 * @param selectedConversationId - 現在選択されている会話のID
 * @param onNewConversation - 新規会話作成のコールバック関数
 * @param onConversationDelete - 会話削除時のコールバック関数
 * @returns 会話履歴リストのJSX要素
 */
function ConversationList({ onConversationSelect, selectedConversationId, onNewConversation, onConversationDelete, refreshTrigger, width = 280 }: ConversationListProps) {
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

  // refreshTriggerが変更された時に履歴を再読み込み
  useEffect(() => {
    if (refreshTrigger) {
      loadConversations()
    }
  }, [refreshTrigger])

  /**
   * 会話タイトルを表示用にフォーマットする
   * 15文字を超える場合は末尾に「...」を付ける
   */
  const formatTitle = (title: string): string => {
    return title.length > 15 ? title.substring(0, 15) + '...' : title
  }

  /**
   * 会話を削除する
   * @param conversationId - 削除する会話のID
   * @param event - クリックイベント（バブリングを防ぐため）
   */
  const handleDeleteConversation = async (conversationId: number, event: React.MouseEvent) => {
    event.stopPropagation() // 会話選択のクリックイベントをキャンセル

    if (!confirm('この会話を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // 削除成功時に親コンポーネントに通知
        onConversationDelete(conversationId)
        // リストを再読み込み
        await loadConversations()
      } else {
        alert('会話の削除に失敗しました')
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      alert('会話の削除に失敗しました')
    }
  }

  return (
    <div className="conversation-list" style={{ width: `${width}px` }}>
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
      
      <ConversationItems
        conversations={conversations}
        loading={loading}
        error={error}
        selectedConversationId={selectedConversationId}
        onConversationSelect={onConversationSelect}
        onDeleteConversation={handleDeleteConversation}
        onRetry={loadConversations}
        formatTitle={formatTitle}
      />
    </div>
  )
}

export default ConversationList
export type { ConversationListProps, Conversation }