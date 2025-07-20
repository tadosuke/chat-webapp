interface ConversationDeleteButtonProps {
  conversationId: number
  onDelete: (conversationId: number, event: React.MouseEvent) => void
}

/**
 * 会話削除ボタンコンポーネント
 * @param conversationId - 削除対象の会話ID
 * @param onDelete - 削除ボタンクリック時のコールバック関数
 * @returns 削除ボタンのJSX要素
 */
function ConversationDeleteButton({ conversationId, onDelete }: ConversationDeleteButtonProps) {
  return (
    <button 
      className="conversation-item-delete"
      onClick={(e) => onDelete(conversationId, e)}
      title="会話を削除"
    >
      <span className="material-icons">delete</span>
    </button>
  )
}

export default ConversationDeleteButton
export type { ConversationDeleteButtonProps }