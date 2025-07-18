import { describe, it, expect, vi } from 'vitest'
import { Request, Response } from 'express'
import { handleEcho } from '../../../server/api-controller.js'

// Mock the greeting module
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

    it('should return the message when valid string is provided', () => {
      const req = createMockRequest({ message: 'Hello, World!' })
      const { res, json } = createMockResponse()

      handleEcho(req, res)

      expect(json).toHaveBeenCalledWith({ message: 'Hello, World!' })
    })

    it('should return 400 error when message is not a string', () => {
      const req = createMockRequest({ message: 123 })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('should return 400 error when message is null', () => {
      const req = createMockRequest({ message: null })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('should return 400 error when message is undefined', () => {
      const req = createMockRequest({ message: undefined })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('should return 400 error when message is an object', () => {
      const req = createMockRequest({ message: { text: 'hello' } })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('should return 400 error when message is an array', () => {
      const req = createMockRequest({ message: ['hello'] })
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })

    it('should handle empty string message', () => {
      const req = createMockRequest({ message: '' })
      const { res, json } = createMockResponse()

      handleEcho(req, res)

      expect(json).toHaveBeenCalledWith({ message: '' })
    })

    it('should return 400 error when request body has no message property', () => {
      const req = createMockRequest({})
      const { res, json, status } = createMockResponse()

      handleEcho(req, res)

      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Message must be a string' })
    })
  })
})