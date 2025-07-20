import ConversationItem from './ConversationItem'

interface Conversation {
  id: number
  title: string
  created_at: string
}

interface ConversationItemsProps {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  selectedConversationId: number | null
  onConversationSelect: (conversationId: number) => void
  onDeleteConversation: (conversationId: number, event: React.MouseEvent) => void
  onRetry: () => void
  formatTitle: (title: string) => string
}

/**
 * 会話リスト表示部分コンポーネント
 * @param conversations - 会話一覧データ
 * @param loading - 読み込み状態
 * @param error - エラーメッセージ
 * @param selectedConversationId - 選択中の会話ID
 * @param onConversationSelect - 会話選択時のコールバック関数
 * @param onDeleteConversation - 会話削除時のコールバック関数
 * @param onRetry - 再試行時のコールバック関数
 * @param formatTitle - タイトルフォーマット関数
 * @returns 会話リスト表示のJSX要素
 */
function ConversationItems({ 
  conversations, 
  loading, 
  error, 
  selectedConversationId, 
  onConversationSelect, 
  onDeleteConversation, 
  onRetry, 
  formatTitle 
}: ConversationItemsProps) {
  return (
    <div className="conversation-list-content">
      {loading && (
        <div className="conversation-list-loading">
          読み込み中...
        </div>
      )}
      
      {error && (
        <div className="conversation-list-error">
          {error}
          <button onClick={onRetry} className="retry-button">
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
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onSelect={onConversationSelect}
              onDelete={onDeleteConversation}
              formatTitle={formatTitle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ConversationItems
export type { ConversationItemsProps, Conversation }