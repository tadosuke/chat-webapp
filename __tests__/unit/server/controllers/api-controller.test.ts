import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'

// echo モジュールをモック
vi.mock('../../../../server/services/echo.js', () => ({
  echo: vi.fn((message: string) => message)
}))

// cat モジュールをモック
const mockGetCatFact = vi.fn()
vi.mock('../../../../server/services/cat.js', () => ({
  getCatFact: mockGetCatFact
}))

// services/database モジュールをモック
const mockGetConversations = vi.fn()
const mockGetMessagesByConversationId = vi.fn()
const mockDeleteConversation = vi.fn()
vi.mock('../../../../server/services/database.js', () => ({
  getDatabase: vi.fn(() => ({
    getConversations: mockGetConversations,
    getMessagesByConversationId: mockGetMessagesByConversationId,
    deleteConversation: mockDeleteConversation
  }))
}))

// services/conversation-history モジュールをモック
const mockEnsureConversation = vi.fn()
const mockSaveEchoMessages = vi.fn()
vi.mock('../../../../server/services/conversation-history.js', () => ({
  ensureConversation: mockEnsureConversation,
  saveEchoMessages: mockSaveEchoMessages
}))

// テスト対象をインポート
const { handleEcho, deleteConversation, handleCat } = await import('../../../../server/controllers/api-controller.js')

describe('api-controller', () => {
  const createMockRequest = (body: any = {}, params: any = {}): Request => ({
    body,
    params
  } as Request)

  const createMockResponse = (): { res: Response; json: any; status: any } => {
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const res = { json, status } as unknown as Response
    return { res, json, status }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleEcho', () => {

    it('有効な文字列が提供された場合、メッセージを返し、ユーザーとエコーメッセージを保存する', async () => {
      const req = createMockRequest({ message: 'Hello, World!' })
      const { res, json } = createMockResponse()

      mockEnsureConversation.mockResolvedValue(1)
      mockSaveEchoMessages.mockResolvedValue(undefined)

      await handleEcho(req, res)

      // 会話IDが確保されることを確認
      expect(mockEnsureConversation).toHaveBeenCalledTimes(1)
      expect(mockEnsureConversation).toHaveBeenCalledWith('Hello, World!', undefined)
      
      // ユーザーメッセージとエコーメッセージの両方が保存されることを確認
      expect(mockSaveEchoMessages).toHaveBeenCalledTimes(1)
      expect(mockSaveEchoMessages).toHaveBeenCalledWith('Hello, World!', 'Hello, World!', 1)
      expect(json).toHaveBeenCalledWith({ message: 'Hello, World!', conversationId: 1 })
    })

    it('メッセージが文字列でない場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: 123 })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('メッセージがnullの場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: null })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('メッセージがundefinedの場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: undefined })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('メッセージがオブジェクトの場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: { text: 'hello' } })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('メッセージが配列の場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: ['hello'] })
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('空文字列のメッセージを処理し、データベースに保存する', async () => {
      const req = createMockRequest({ message: '' })
      const { res, json } = createMockResponse()

      mockEnsureConversation.mockResolvedValue(1)
      mockSaveEchoMessages.mockResolvedValue(undefined)

      await handleEcho(req, res)

      expect(mockEnsureConversation).toHaveBeenCalledWith('', undefined)
      expect(mockSaveEchoMessages).toHaveBeenCalledWith('', '', 1)
      expect(json).toHaveBeenCalledWith({ message: '', conversationId: 1 })
    })

    it('リクエストボディにmessageプロパティがない場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({})
      const { res, json, status } = createMockResponse()

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest({ message: 'Test message' })
      const { res, json, status } = createMockResponse()

      mockEnsureConversation.mockRejectedValue(new Error('DB Error'))

      await handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })

    it('会話IDが指定されている場合はそれを使用する', async () => {
      const req = createMockRequest({ message: 'Test message', conversationId: 123 })
      const { res, json } = createMockResponse()

      mockEnsureConversation.mockResolvedValue(123)
      mockSaveEchoMessages.mockResolvedValue(undefined)

      await handleEcho(req, res)

      expect(mockEnsureConversation).toHaveBeenCalledWith('Test message', 123)
      expect(mockSaveEchoMessages).toHaveBeenCalledWith('Test message', 'Test message', 123)
      expect(json).toHaveBeenCalledWith({ message: 'Test message', conversationId: 123 })
    })
  })

  describe('deleteConversation', () => {
    it('有効な会話IDで会話を削除し、成功レスポンスを返す', async () => {
      const req = createMockRequest({}, { conversationId: '123' })
      const { res, json, status } = createMockResponse()

      mockDeleteConversation.mockResolvedValue(undefined)

      await deleteConversation(req, res)

      expect(mockDeleteConversation).toHaveBeenCalledWith(123)
      expect(json).toHaveBeenCalledWith({ success: true })
      expect(status).not.toHaveBeenCalled()
    })

    it('無効な会話ID（数値以外）の場合、400エラーを返す', async () => {
      const req = createMockRequest({}, { conversationId: 'invalid' })
      const { res, json, status } = createMockResponse()

      await deleteConversation(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid conversation ID' })
      expect(mockDeleteConversation).not.toHaveBeenCalled()
    })

    it('会話IDが空の場合、400エラーを返す', async () => {
      const req = createMockRequest({}, { conversationId: '' })
      const { res, json, status } = createMockResponse()

      await deleteConversation(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid conversation ID' })
      expect(mockDeleteConversation).not.toHaveBeenCalled()
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest({}, { conversationId: '123' })
      const { res, json, status } = createMockResponse()

      mockDeleteConversation.mockRejectedValue(new Error('DB Error'))

      await deleteConversation(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Database error' })
    })
  })

  describe('handleCat', () => {
    it('有効な文字列が提供された場合、猫の雑学を返し、ユーザーと猫の雑学メッセージを保存する', async () => {
      const req = createMockRequest({ message: '/cat' })
      const { res, json } = createMockResponse()

      mockEnsureConversation.mockResolvedValue(1)
      mockSaveEchoMessages.mockResolvedValue(undefined)
      mockGetCatFact.mockResolvedValue('猫は一日の70%を寝て過ごします。')

      await handleCat(req, res)

      // 会話IDが確保されることを確認
      expect(mockEnsureConversation).toHaveBeenCalledTimes(1)
      expect(mockEnsureConversation).toHaveBeenCalledWith('/cat', undefined)
      
      // 猫の雑学が取得されることを確認
      expect(mockGetCatFact).toHaveBeenCalledTimes(1)
      
      // ユーザーメッセージと猫の雑学メッセージの両方が保存されることを確認
      expect(mockSaveEchoMessages).toHaveBeenCalledTimes(1)
      expect(mockSaveEchoMessages).toHaveBeenCalledWith('/cat', '猫は一日の70%を寝て過ごします。', 1)
      expect(json).toHaveBeenCalledWith({ message: '猫は一日の70%を寝て過ごします。', conversationId: 1 })
    })

    it('メッセージが文字列でない場合、400エラーを返し、データベースに保存しない', async () => {
      const req = createMockRequest({ message: 123 })
      const { res, json, status } = createMockResponse()

      await handleCat(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockEnsureConversation).not.toHaveBeenCalled()
      expect(mockGetCatFact).not.toHaveBeenCalled()
      expect(mockSaveEchoMessages).not.toHaveBeenCalled()
    })

    it('猫の雑学取得でエラーが発生した場合、500エラーを返す', async () => {
      const req = createMockRequest({ message: '/cat' })
      const { res, json, status } = createMockResponse()

      mockEnsureConversation.mockResolvedValue(1)
      mockGetCatFact.mockRejectedValue(new Error('Cat API Error'))

      await handleCat(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Internal server error' })
    })

    it('会話IDが指定されている場合はそれを使用する', async () => {
      const req = createMockRequest({ message: '/cat', conversationId: 123 })
      const { res, json } = createMockResponse()

      mockEnsureConversation.mockResolvedValue(123)
      mockSaveEchoMessages.mockResolvedValue(undefined)
      mockGetCatFact.mockResolvedValue('猫は夜行性の動物です。')

      await handleCat(req, res)

      expect(mockEnsureConversation).toHaveBeenCalledWith('/cat', 123)
      expect(mockSaveEchoMessages).toHaveBeenCalledWith('/cat', '猫は夜行性の動物です。', 123)
      expect(json).toHaveBeenCalledWith({ message: '猫は夜行性の動物です。', conversationId: 123 })
    })
  })
})