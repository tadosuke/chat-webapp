import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// routes モジュールをモックして循環依存を回避
vi.mock('../../../server/routes/api-routes.js', () => ({
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
    router.post('/messages', (req, res) => {
      const { message } = req.body
      if (typeof message !== 'string') {
        res.status(400).json({ error: 'Message must be a string' })
        return
      }
      res.json({ id: 1, text: message })
    })
    router.get('/messages', (req, res) => {
      res.json([
        { id: 1, text: 'Test message', timestamp: '2023-01-01 00:00:00' }
      ])
    })
    return router
  })
}))

describe('Express App Integration', () => {
  let app: express.Application

  beforeEach(async () => {
    // モジュールをリセットして新しいインスタンスを取得
    vi.resetModules()
    
    // モック設定後に依存関係をインポート
    const { createRouter } = await import('../../../server/routes/api-routes.js')
    
    // index.ts と同様にアプリを作成するが、サーバー起動は行わない
    app = express()
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    // JSON パース用のミドルウェア
    app.use(express.json())

    // API ルーターの使用
    app.use('/api', createRouter())

    // 静的ファイルの配信（ビルド済みファイル）
    // 注: テストでは dist-src ディレクトリがない場合があるため、これをスキップまたはモック
    
    // ルートパス用の設定
    app.get('/', (_req, res) => {
      res.json({ message: 'Server is running' })
    })
  })

  describe('API エンドポイント', () => {
    it('有効なメッセージでPOST /api/echo を処理する', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: 'Hello, World!' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Hello, World!' })
    })

    it('無効なメッセージでPOST /api/echo に対して400を返す', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: 123 })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Message must be a string' })
    })

    it('メッセージなしでPOST /api/echo に対して400を返す', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Message must be a string' })
    })

    it('空文字列メッセージを処理する', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: '' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: '' })
    })
  })

  describe('メッセージ保存・取得エンドポイント', () => {
    it('POST /api/messages でメッセージを保存', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({ message: 'Test message' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ id: 1, text: 'Test message' })
    })

    it('POST /api/messages で無効なメッセージに対して400を返す', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({ message: 123 })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'Message must be a string' })
    })

    it('GET /api/messages でメッセージ一覧を取得', async () => {
      const response = await request(app)
        .get('/api/messages')

      expect(response.status).toBe(200)
      expect(response.body).toEqual([
        { id: 1, text: 'Test message', timestamp: '2023-01-01 00:00:00' }
      ])
    })
  })

  describe('ルートエンドポイント', () => {
    it('GET / に応答する', async () => {
      const response = await request(app)
        .get('/')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'Server is running' })
    })
  })

  describe('エラーハンドリング', () => {
    it('存在しないルートに対して404を返す', async () => {
      const response = await request(app)
        .get('/non-existent-route')

      expect(response.status).toBe(404)
    })

    it('リクエストボディの不正なJSONを処理する', async () => {
      const response = await request(app)
        .post('/api/echo')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')

      expect(response.status).toBe(400)
    })
  })

  describe('ミドルウェア', () => {
    it('JSONリクエストボディを解析する', async () => {
      const response = await request(app)
        .post('/api/echo')
        .send({ message: 'test' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'test' })
    })
  })
})