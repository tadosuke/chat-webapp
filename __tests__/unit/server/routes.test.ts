import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import { createRouter } from '../../../server/routes.js'

// Mock the api-controller module
vi.mock('../../../server/api-controller.js', () => ({
  handleEcho: vi.fn((req, res) => {
    res.json({ message: 'mocked response' })
  })
}))

describe('routes', () => {
  describe('createRouter', () => {
    it('should create a router instance', () => {
      const router = createRouter()
      expect(router).toBeDefined()
    })

    it('should have POST /echo endpoint configured', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .post('/api/echo')
        .send({ message: 'test' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ message: 'mocked response' })
    })

    it('should return 404 for undefined routes', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .get('/api/nonexistent')

      expect(response.status).toBe(404)
    })

    it('should return 404 for GET on /echo endpoint', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .get('/api/echo')

      expect(response.status).toBe(404)
    })

    it('should return 404 for PUT on /echo endpoint', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .put('/api/echo')
        .send({ message: 'test' })

      expect(response.status).toBe(404)
    })

    it('should return 404 for DELETE on /echo endpoint', async () => {
      const app = express()
      app.use(express.json())
      app.use('/api', createRouter())

      const response = await request(app)
        .delete('/api/echo')

      expect(response.status).toBe(404)
    })
  })
})