import './ChatDisplay.css'

interface Message {
  id: number
  text: string
  timestamp: Date
  sender: 'user' | 'echo'
}

interface ChatDisplayProps {
  messages: Message[]
}

/**
 * チャット表示コンポーネント
 * メッセージの表示を行うチャットインターフェースの表示部分を提供する
 * @param messages - 表示するメッセージの配列
 * @returns チャット表示のJSX要素
 */
function ChatDisplay({ messages }: ChatDisplayProps) {
  return (
    <div className="messages-area">
      {messages.map((msg) => (
        <div key={msg.id} className={`message-bubble ${msg.sender === 'echo' ? 'echo-message' : 'user-message'}`}>
          {msg.text}
        </div>
      ))}
    </div>
  )
}

export default ChatDisplay
export type { Message, ChatDisplayProps }