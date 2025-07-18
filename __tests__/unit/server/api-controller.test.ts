import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import { handleEcho, saveMessage, getMessages } from '../../../server/api-controller.js'

// greeting モジュールをモック
vi.mock('../../../server/greeting.js', () => ({
  echo: vi.fn((message: string) => message)
}))

// db モジュールをモック
const mockSaveMessage = vi.fn()
const mockGetMessages = vi.fn()
vi.mock('../../../server/db.js', () => ({
  getDatabase: () => ({
    saveMessage: mockSaveMessage,
    getMessages: mockGetMessages
  })
}))

describe('api-controller', () => {
  describe('handleEcho', () => {
    const createMockRequest = (body: any): Request => ({
      body
    } as Request)

    const createMockResponse = (): { res: Response; json: any; status: any } => {
      const json = vi.fn()
      const status = vi.fn(() => ({ json }))
      const res = { json, status } as unknown as Response
      return { res, json, status }
    }

    it('有効な文字列が提供された場合、メッセージを返す', () => {
      const req = createMockRequest({ message: 'Hello, World!' })
      const { res, json } = createMockResponse()

      handleEcho(req, res)

      expect(json).toHaveBeenCalledWith({ message: 'Hello, World!' })
    })

    it('メッセージが文字列でない場合、400エラーを返す', () => {
      const req = createMockRequest({ message: 123 })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('メッセージがnullの場合、400エラーを返す', () => {
      const req = createMockRequest({ message: null })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('メッセージがundefinedの場合、400エラーを返す', () => {
      const req = createMockRequest({ message: undefined })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('メッセージがオブジェクトの場合、400エラーを返す', () => {
      const req = createMockRequest({ message: { text: 'hello' } })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('メッセージが配列の場合、400エラーを返す', () => {
      const req = createMockRequest({ message: ['hello'] })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('空文字列のメッセージを処理する', () => {
      const req = createMockRequest({ message: '' })
      const { res, json } = createMockResponse()

      handleEcho(req, res)

      expect(json).toHaveBeenCalledWith({ message: '' })
    })

    it('リクエストボディにmessageプロパティがない場合、400エラーを返す', () => {
      const req = createMockRequest({})
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })
  })

  describe('saveMessage', () => {
    const createMockRequest = (body: any): Request => ({
      body
    } as Request)

    const createMockResponse = (): { res: Response; json: any; status: any } => {
      const json = vi.fn()
      const status = vi.fn(() => ({ json }))
      const res = { json, status } as unknown as Response
      return { res, json, status }
    }

    it('有効なメッセージを保存して結果を返す', async () => {
      const req = createMockRequest({ message: 'Test message' })
      const { res, json } = createMockResponse()

      mockSaveMessage.mockResolvedValue({ id: 1, text: 'Test message' })

      await saveMessage(req, res)

      expect(mockSaveMessage).toHaveBeenCalledWith('Test message', 'user')
      expect(json).toHaveBeenCalledWith({ id: 1, text: 'Test message' })
    })

    it('メッセージが文字列でない場合、400エラーを返す', async () => {
      const req = createMockRequest({ message: 123 })
      const { res, json, status } = createMockResponse()

      // 以前のモック呼び出しをクリア
      mockSaveMessage.mockClear()

      await saveMessage(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
      expect(mockSaveMessage).not.toHaveBeenCalled()
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest({ message: 'Test message' })
      const { res, json, status } = createMockResponse()

      mockSaveMessage.mockRejectedValue(new Error('DB Error'))

      await saveMessage(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Database error' })
    })

    it('echoメッセージを保存する', async () => {
      const req = createMockRequest({ message: 'Echo message', sender: 'echo' })
      const { res, json } = createMockResponse()

      mockSaveMessage.mockResolvedValue({ id: 2, text: 'Echo message' })

      await saveMessage(req, res)

      expect(mockSaveMessage).toHaveBeenCalledWith('Echo message', 'echo')
      expect(json).toHaveBeenCalledWith({ id: 2, text: 'Echo message' })
    })

    it('無効なsenderが指定された場合、400エラーを返す', async () => {
      const req = createMockRequest({ message: 'Test message', sender: 'invalid' })
      const { res, json, status } = createMockResponse()

      await saveMessage(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: "Sender must be 'user' or 'echo'" })
    })
  })

  describe('getMessages', () => {
    const createMockRequest = (): Request => ({} as Request)

    const createMockResponse = (): { res: Response; json: any; status: any } => {
      const json = vi.fn()
      const status = vi.fn(() => ({ json }))
      const res = { json, status } as unknown as Response
      return { res, json, status }
    }

    it('メッセージ一覧を正常に取得して返す', async () => {
      const req = createMockRequest()
      const { res, json } = createMockResponse()

      const mockMessages = [
        { id: 1, text: 'Message 1', sender: 'user', timestamp: '2023-01-01 00:00:00' },
        { id: 2, text: 'Message 2', sender: 'echo', timestamp: '2023-01-01 00:01:00' }
      ]
      mockGetMessages.mockResolvedValue(mockMessages)

      await getMessages(req, res)

      expect(mockGetMessages).toHaveBeenCalled()
      expect(json).toHaveBeenCalledWith(mockMessages)
    })

    it('データベースエラー時に500エラーを返す', async () => {
      const req = createMockRequest()
      const { res, json, status } = createMockResponse()

      mockGetMessages.mockRejectedValue(new Error('DB Error'))

      await getMessages(req, res)

      expect(status).toHaveBeenCalledWith(500)
      expect(json).toHaveBeenCalledWith({ error: 'Database error' })
    })
  })
})