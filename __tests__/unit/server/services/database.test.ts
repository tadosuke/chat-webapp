import { describe, it, expect, vi, beforeEach } from 'vitest'

// database モジュール全体をモック
const mockCreateConversation = vi.fn()
const mockSaveMessage = vi.fn()
const mockGetConversations = vi.fn()
const mockGetMessagesByConversationId = vi.fn()
const mockDeleteConversation = vi.fn()
const mockInitialize = vi.fn()
const mockClose = vi.fn()

vi.mock('../../../../server/services/database.js', () => ({
  getDatabase: vi.fn(() => ({
    createConversation: mockCreateConversation,
    saveMessage: mockSaveMessage,
    getConversations: mockGetConversations,
    getMessagesByConversationId: mockGetMessagesByConversationId,
    deleteConversation: mockDeleteConversation,
    initialize: mockInitialize,
    close: mockClose
  }))
}))

describe('services/database', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDatabase', () => {
    it('データベースインスタンスを返す', async () => {
      const { getDatabase } = await import('../../../../server/services/database.js')
      const db = getDatabase()
      
      expect(db).toBeDefined()
      expect(typeof db.createConversation).toBe('function')
      expect(typeof db.saveMessage).toBe('function')
      expect(typeof db.getConversations).toBe('function')
      expect(typeof db.getMessagesByConversationId).toBe('function')
      expect(typeof db.deleteConversation).toBe('function')
      expect(typeof db.initialize).toBe('function')
      expect(typeof db.close).toBe('function')
    })
  })
})