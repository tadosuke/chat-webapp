import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ensureConversation, saveEchoMessages } from '../../../../server/services/db.js'

// db モジュールをモック
const mockCreateConversation = vi.fn()
const mockSaveMessage = vi.fn()
vi.mock('../../../../server/db.js', () => ({
  getDatabase: () => ({
    createConversation: mockCreateConversation,
    saveMessage: mockSaveMessage
  })
}))

describe('services/db', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ensureConversation', () => {
    it('会話IDが指定されている場合はそのまま返す', async () => {
      const message = 'Test message'
      const existingConversationId = 123

      const result = await ensureConversation(message, existingConversationId)

      expect(result).toBe(existingConversationId)
      expect(mockCreateConversation).not.toHaveBeenCalled()
    })

    it('会話IDが指定されていない場合は新しい会話を作成する', async () => {
      const message = 'Test message'
      const newConversationId = 456

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: 'Test message' })

      const result = await ensureConversation(message)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith('Test message')
    })

    it('長いメッセージの場合はタイトルを15文字で切り詰める', async () => {
      const longMessage = 'This is a very long message that should be truncated'
      const expectedTitle = 'This is a very ...'
      const newConversationId = 789

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: expectedTitle })

      const result = await ensureConversation(longMessage)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith(expectedTitle)
    })

    it('15文字以下のメッセージの場合はそのままタイトルにする', async () => {
      const shortMessage = 'Short'
      const newConversationId = 101

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: shortMessage })

      const result = await ensureConversation(shortMessage)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith(shortMessage)
    })

    it('空文字列のメッセージでも正常に処理される', async () => {
      const emptyMessage = ''
      const newConversationId = 202

      mockCreateConversation.mockResolvedValue({ id: newConversationId, title: emptyMessage })

      const result = await ensureConversation(emptyMessage)

      expect(result).toBe(newConversationId)
      expect(mockCreateConversation).toHaveBeenCalledWith(emptyMessage)
    })
  })

  describe('saveEchoMessages', () => {
    it('ユーザーメッセージとエコーメッセージの両方を正しい順序で保存する', async () => {
      const userMessage = 'Hello'
      const echoMessage = 'Hello'
      const conversationId = 123

      mockSaveMessage.mockResolvedValue({ id: 1, text: userMessage })

      await saveEchoMessages(userMessage, echoMessage, conversationId)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, userMessage, 'user', conversationId)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, echoMessage, 'echo', conversationId)
    })

    it('異なるメッセージ内容でも正常に保存される', async () => {
      const userMessage = 'User message'
      const echoMessage = 'Different echo message'
      const conversationId = 456

      mockSaveMessage.mockResolvedValue({ id: 1, text: userMessage })

      await saveEchoMessages(userMessage, echoMessage, conversationId)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, userMessage, 'user', conversationId)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, echoMessage, 'echo', conversationId)
    })

    it('空文字列のメッセージでも正常に保存される', async () => {
      const userMessage = ''
      const echoMessage = ''
      const conversationId = 789

      mockSaveMessage.mockResolvedValue({ id: 1, text: userMessage })

      await saveEchoMessages(userMessage, echoMessage, conversationId)

      expect(mockSaveMessage).toHaveBeenCalledTimes(2)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(1, userMessage, 'user', conversationId)
      expect(mockSaveMessage).toHaveBeenNthCalledWith(2, echoMessage, 'echo', conversationId)
    })

    it('データベースエラー時に例外をスローする', async () => {
      const userMessage = 'Test message'
      const echoMessage = 'Echo message'
      const conversationId = 123

      mockSaveMessage.mockRejectedValue(new Error('Database error'))

      await expect(saveEchoMessages(userMessage, echoMessage, conversationId)).rejects.toThrow('Database error')
      expect(mockSaveMessage).toHaveBeenCalledWith(userMessage, 'user', conversationId)
    })
  })
})