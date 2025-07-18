import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import { handleEcho } from '../../../server/api-controller.js'

// greeting モジュールをモック
vi.mock('../../../server/greeting.js', () => ({
  echo: vi.fn((message: string) => message)
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
})