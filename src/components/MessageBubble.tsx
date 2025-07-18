interface Message {
  id: number
  text: string
  timestamp: Date
  sender: 'user' | 'echo'
}

interface MessageBubbleProps {
  message: Message
}

/**
 * メッセージバブルコンポーネント
 * 個別のメッセージを表示する
 * @param message - 表示するメッセージオブジェクト
 * @returns メッセージバブルのJSX要素
 */
function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`message-bubble ${message.sender === 'echo' ? 'echo-message' : 'user-message'}`}>
      {message.text}
    </div>
  )
}

export default MessageBubble