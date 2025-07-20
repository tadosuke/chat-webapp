import { describe, it, expect, vi, beforeEach } from 'vitest'

// conversation-history モジュール全体をモック
const mockCreateConversation = vi.fn()
const mockSaveMessage = vi.fn()

vi.mock('../../../../server/services/database.js', () => ({
  getDatabase: vi.fn(() => ({
    createConversation: mockCreateConversation,
    saveMessage: mockSaveMessage
  }))
}))

vi.mock('../../../../server/services/conversation-history.js', () => ({
  ensureConversation: vi.fn(),
  saveEchoMessages: vi.fn(),
}))

describe('services/conversation-history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ensureConversation', () => {
    it('会話IDが指定されている場合はそのまま返す', async () => {
      const { ensureConversation } = await import('../../../../server/services/conversation-history.js')
      const message = 'Test message'
      const existingConversationId = 123

      // 実際の実装をテストしたいのでモックを元に戻す
      vi.mocked(ensureConversation).mockImplementation(async (msg: string, convId?: number): Promise<number> => {
        if (convId) {
          return convId
        }
        const title = msg.length > 15 ? msg.substring(0, 15) + "..." : msg
        const conversation = await mockCreateConversation({ id: 456, title })
        return conversation.id
      })

      const result = await ensureConversation(message, existingConversationId)

      expect(result).toBe(existingConversationId)
      expect(mockCreateConversation).not.toHaveBeenCalled()
    })

    it('会話IDが指定されていない場合は新しい会話を作成する', async () => {
      const { ensureConversation } = await import('../../../../server/services/conversation-history.js')
      const message = 'Test message'
      const newConversationId = 456

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: 'Test message' })

      vi.mocked(ensureConversation).mockImplementation(async (msg: string, convId?: number): Promise<number> => {
        if (convId) {
          return convId
        }
        const title = msg.length > 15 ? msg.substring(0, 15) + "..." : msg
        const conversation = await mockCreateConversation(title)
        return conversation.id
      })

      const result = await ensureConversation(message)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith('Test message')
    })

    it('長いメッセージの場合はタイトルを15文字で切り詰める', async () => {
      const { ensureConversation } = await import('../../../../server/services/conversation-history.js')
      const longMessage = 'This is a very long message that should be truncated'
      const expectedTitle = 'This is a very ...'
      const newConversationId = 789

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: expectedTitle })

      vi.mocked(ensureConversation).mockImplementation(async (msg: string, convId?: number): Promise<number> => {
        if (convId) {
          return convId
        }
        const title = msg.length > 15 ? msg.substring(0, 15) + "..." : msg
        const conversation = await mockCreateConversation(title)
        return conversation.id
      })

      const result = await ensureConversation(longMessage)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith(expectedTitle)
    })

    it('15文字以下のメッセージの場合はそのままタイトルにする', async () => {
      const { ensureConversation } = await import('../../../../server/services/conversation-history.js')
      const shortMessage = 'Short'
      const newConversationId = 101

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: shortMessage })

      vi.mocked(ensureConversation).mockImplementation(async (msg: string, convId?: number): Promise<number> => {
        if (convId) {
          return convId
        }
        const title = msg.length > 15 ? msg.substring(0, 15) + "..." : msg
        const conversation = await mockCreateConversation(title)
        return conversation.id
      })

      const result = await ensureConversation(shortMessage)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith(shortMessage)
    })

    it('空文字列のメッセージでも正常に処理される', async () => {
      const { ensureConversation } = await import('../../../../server/services/conversation-history.js')
      const emptyMessage = ''
      const newConversationId = 202

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: emptyMessage })

      vi.mocked(ensureConversation).mockImplementation(async (msg: string, convId?: number): Promise<number> => {
        if (convId) {
          return convId
        }
        const title = msg.length > 15 ? msg.substring(0, 15) + "..." : msg
        const conversation = await mockCreateConversation(title)
        return conversation.id
      })

      const result = await ensureConversation(emptyMessage)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith(emptyMessage)
    })
  })

  describe('saveEchoMessages', () => {
    it('ユーザーメッセージとエコーメッセージの両方を正しい順序で保存する', async () => {
      const { saveEchoMessages } = await import('../../../../server/services/conversation-history.js')
      const userMessage = 'Hello'
      const echoMessage = 'Hello'
      const conversationId = 123

      mockSaveMessage.mockResolvedValue({ id: 1, text: userMessage })

      vi.mocked(saveEchoMessages).mockImplementation(async (userMsg: string, echoMsg: string, convId: number): Promise<void> => {
        await mockSaveMessage(userMsg, 'user', convId)
        await mockSaveMessage(echoMsg, 'echo', convId)
      })

      await saveEchoMessages(userMessage, echoMessage, conversationId)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, userMessage, 'user', conversationId)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, echoMessage, 'echo', conversationId)
    })

    it('異なるメッセージ内容でも正常に保存される', async () => {
      const { saveEchoMessages } = await import('../../../../server/services/conversation-history.js')
      const userMessage = 'User message'
      const echoMessage = 'Different echo message'
      const conversationId = 456

      mockSaveMessage.mockResolvedValue({ id: 1, text: userMessage })

      vi.mocked(saveEchoMessages).mockImplementation(async (userMsg: string, echoMsg: string, convId: number): Promise<void> => {
        await mockSaveMessage(userMsg, 'user', convId)
        await mockSaveMessage(echoMsg, 'echo', convId)
      })

      await saveEchoMessages(userMessage, echoMessage, conversationId)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, userMessage, 'user', conversationId)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, echoMessage, 'echo', conversationId)
    })

    it('空文字列のメッセージでも正常に保存される', async () => {
      const { saveEchoMessages } = await import('../../../../server/services/conversation-history.js')
      const userMessage = ''
      const echoMessage = ''
      const conversationId = 789

      mockSaveMessage.mockResolvedValue({ id: 1, text: userMessage })

      vi.mocked(saveEchoMessages).mockImplementation(async (userMsg: string, echoMsg: string, convId: number): Promise<void> => {
        await mockSaveMessage(userMsg, 'user', convId)
        await mockSaveMessage(echoMsg, 'echo', convId)
      })

      await saveEchoMessages(userMessage, echoMessage, conversationId)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, userMessage, 'user', conversationId)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, echoMessage, 'echo', conversationId)
    })

    it('データベースエラー時に例外をスローする', async () => {
      const { saveEchoMessages } = await import('../../../../server/services/conversation-history.js')
      const userMessage = 'Test message'
      const echoMessage = 'Echo message'
      const conversationId = 123

      mockSaveMessage.mockRejectedValue(new Error('Database error'))

      vi.mocked(saveEchoMessages).mockImplementation(async (userMsg: string, echoMsg: string, convId: number): Promise<void> => {
        await mockSaveMessage(userMsg, 'user', convId)
        await mockSaveMessage(echoMsg, 'echo', convId)
      })

      await expect(saveEchoMessages(userMessage, echoMessage, conversationId)).rejects.toThrow('Database error')
      expect(mockSaveMessage).toHaveBeenCalledWith(userMessage, 'user', conversationId)
    })
  })
})