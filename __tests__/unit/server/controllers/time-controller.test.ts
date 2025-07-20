import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import { handleTime } from '../../../../server/controllers/time-controller.js'

describe('time-controller', () => {
  describe('handleTime', () => {
    it('現在時刻をHH:MM形式で返す', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', handleTime);

      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
    });

    it('POSTリクエストのボディに関係なく現在時刻を返す', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', handleTime);

      const response = await request(app)
        .post('/test')
        .send({ anyData: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/);
    });

    it('レスポンスが正しいJSON形式であることを確認', async () => {
      const app = express();
      app.use(express.json());
      app.post('/test', handleTime);

      const response = await request(app)
        .post('/test')
        .send({});

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(typeof response.body.message).toBe('string');
    });
  });
})