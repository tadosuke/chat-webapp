import ConversationDeleteButton from './ConversationDeleteButton'

interface ConversationItemProps {
  conversation: {
    id: number
    title: string
    created_at: string
  }
  isSelected: boolean
  onSelect: (conversationId: number) => void
  onDelete: (conversationId: number, event: React.MouseEvent) => void
  formatTitle: (title: string) => string
}

/**
 * 個別の会話項目コンポーネント
 * @param conversation - 会話データ
 * @param isSelected - 選択状態
 * @param onSelect - 会話選択時のコールバック関数
 * @param onDelete - 会話削除時のコールバック関数
 * @param formatTitle - タイトルフォーマット関数
 * @returns 会話項目のJSX要素
 */
function ConversationItem({ conversation, isSelected, onSelect, onDelete, formatTitle }: ConversationItemProps) {
  return (
    <div
      key={conversation.id}
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(conversation.id)}
      title={conversation.title}
    >
      <div className="conversation-item-content">
        <div className="conversation-item-title">
          {formatTitle(conversation.title)}
        </div>
        <div className="conversation-item-date">
          {new Date(conversation.created_at).toLocaleDateString('ja-JP')}
        </div>
      </div>
      <ConversationDeleteButton 
        conversationId={conversation.id}
        onDelete={onDelete}
      />
    </div>
  )
}

export default ConversationItem
export type { ConversationItemProps }