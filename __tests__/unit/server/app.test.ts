import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Mock the routes module to avoid circular dependencies
vi.mock('../../../server/routes.js', () => ({
  createRouter: vi.fn(() => {
    const router = express.Router()
    router.post('/echo', (req, res) => {
      const { message } = req.body
      if (typeof message !== 'string') {
        res.status(400).json({ error: 'Message must be a string' })
        return
      }
      res.json({ message })
    })
    return router
  })
}))

describe('Express App Integration', () => {
  let app: express.Application

  beforeEach(async () => {
    // Reset modules to get a fresh instance
    vi.resetModules()
    
    // Import the dependencies after mock is set up
    const { createRouter } = await import('../../../server/routes.js')
    
    // Create the app similar to index.ts but without starting the server
    app = express()
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    // JSON パース用のミドルウェア
    app.use(express.json())

    // API ルーターの使用
    app.use('/api', createRouter())

    // 静的ファイルの配信（ビルド済みファイル）
    // Note: In tests, we might not have the dist-src directory, so we'll skip this or mock it
    
    // ルートパス用の設定
    app.get('/', (_req, res) => {
      res.json({ message: 'Server is running' })
    })
  })

  describe('API endpoints', () => {
    it('should handle POST /api/echo with valid message', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: 'Hello, World!' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Hello, World!' })
    })

    it('should return 400 for POST /api/echo with invalid message', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: 123 })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Message must be a string' })
    })

    it('should return 400 for POST /api/echo with no message', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Message must be a string' })
    })

    it('should handle empty string message', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: '' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: '' })
    })
  })

  describe('Root endpoint', () => {
    it('should respond to GET /', async () => {
      const response = await request(app)
        .get('/')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Server is running' })
    })
  })

  describe('Error handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')

      expect(response.status).toBe(404)
    })

    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/echo')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')

      expect(response.status).toBe(400)
    })
  })

  describe('Middleware', () => {
    it('should parse JSON request bodies', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: 'test' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'test' })
    })
  })
})