import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Database } from '../../../server/db.js'
import { mkdtempSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Database', () => {
  let db: Database
  let tempDir: string

  beforeEach(async () => {
    // 一時ディレクトリを作成してテスト用DBを作成
    tempDir = mkdtempSync(join(tmpdir(), 'db-test-'))
    const dbPath = join(tempDir, 'test.db')
    db = new Database(dbPath)
    await db.initialize()
  })

  afterEach(async () => {
    await db.close()
    // 一時ディレクトリを削除
    rmSync(tempDir, { recursive: true, force: true })
  })

  describe('initialize', () => {
    it('テーブルが正常に作成される', async () => {
      // initialization is done in beforeEach
      // This test just verifies no errors were thrown
      expect(true).toBe(true)
    })
  })

  describe('saveMessage', () => {
    it('メッセージが正常に保存される', async () => {
      const message = 'Test message'
      const result = await db.saveMessage(message)

      expect(result.id).toBeTypeOf('number')
      expect(result.text).toBe(message)
      expect(result.id).toBeGreaterThan(0)
    })

    it('複数のメッセージが保存される', async () => {
      const message1 = 'First message'
      const message2 = 'Second message'

      const result1 = await db.saveMessage(message1)
      const result2 = await db.saveMessage(message2)

      expect(result1.id).toBeTypeOf('number')
      expect(result2.id).toBeTypeOf('number')
      expect(result1.id).not.toBe(result2.id)
      expect(result1.text).toBe(message1)
      expect(result2.text).toBe(message2)
    })

    it('senderパラメータ省略時はuserとして保存される', async () => {
      const message = 'Test message'
      const result = await db.saveMessage(message)

      expect(result.id).toBeTypeOf('number')
      expect(result.text).toBe(message)

      const messages = await db.getMessages()
      expect(messages).toHaveLength(1)
      expect(messages[0].sender).toBe('user')
    })

    it('senderパラメータを指定してメッセージを保存', async () => {
      const message = 'Echo message'
      const result = await db.saveMessage(message, 'echo')

      expect(result.id).toBeTypeOf('number')
      expect(result.text).toBe(message)

      const messages = await db.getMessages()
      expect(messages).toHaveLength(1)
      expect(messages[0].sender).toBe('echo')
    })
  })

  describe('getMessages', () => {
    it('空のデータベースから空の配列を取得', async () => {
      const messages = await db.getMessages()
      expect(messages).toEqual([])
    })

    it('保存されたメッセージを取得', async () => {
      const message1 = 'First message'
      const message2 = 'Second message'

      await db.saveMessage(message1)
      await db.saveMessage(message2)

      const messages = await db.getMessages()

      expect(messages).toHaveLength(2)
      expect(messages[0].text).toBe(message1)
      expect(messages[1].text).toBe(message2)
      expect(messages[0].id).toBeTypeOf('number')
      expect(messages[1].id).toBeTypeOf('number')
      expect(messages[0].timestamp).toBeTypeOf('string')
      expect(messages[1].timestamp).toBeTypeOf('string')
      expect(messages[0].sender).toBe('user') // デフォルトでuser
      expect(messages[1].sender).toBe('user') // デフォルトでuser
    })

    it('senderを指定してメッセージを保存・取得', async () => {
      const userMessage = 'User message'
      const echoMessage = 'Echo message'

      await db.saveMessage(userMessage, 'user')
      await db.saveMessage(echoMessage, 'echo')

      const messages = await db.getMessages()

      expect(messages).toHaveLength(2)
      expect(messages[0].text).toBe(userMessage)
      expect(messages[0].sender).toBe('user')
      expect(messages[1].text).toBe(echoMessage)
      expect(messages[1].sender).toBe('echo')
    })

    it('メッセージが時系列順で取得される', async () => {
      const message1 = 'First'
      const message2 = 'Second'
      const message3 = 'Third'

      const result1 = await db.saveMessage(message1)
      // 少し待機してタイムスタンプに差をつける
      await new Promise(resolve => setTimeout(resolve, 10))
      const result2 = await db.saveMessage(message2)
      await new Promise(resolve => setTimeout(resolve, 10))
      const result3 = await db.saveMessage(message3)

      const messages = await db.getMessages()

      expect(messages).toHaveLength(3)
      expect(messages[0].id).toBe(result1.id)
      expect(messages[1].id).toBe(result2.id)
      expect(messages[2].id).toBe(result3.id)
    })
  })

  describe('clearMessages', () => {
    it('すべてのメッセージを削除する', async () => {
      // 最初にメッセージを保存
      await db.saveMessage('Test message 1', 'user')
      await db.saveMessage('Test message 2', 'echo')

      // メッセージが存在することを確認
      const messagesBefore = await db.getMessages()
      expect(messagesBefore).toHaveLength(2)

      // メッセージをクリア
      await db.clearMessages()

      // メッセージが削除されたことを確認
      const messagesAfter = await db.getMessages()
      expect(messagesAfter).toHaveLength(0)
    })

    it('空のテーブルでも正常に動作する', async () => {
      // 最初から空の状態でクリアを実行
      await expect(db.clearMessages()).resolves.toBeUndefined()

      // メッセージが存在しないことを確認
      const messages = await db.getMessages()
      expect(messages).toHaveLength(0)
    })
  })
})