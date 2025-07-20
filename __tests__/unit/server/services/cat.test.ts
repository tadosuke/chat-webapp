import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCatFact } from '../../../../server/services/cat.js'

// グローバルfetchをモック
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('cat service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCatFact', () => {
    it('API から猫の雑学を正常に取得する', async () => {
      const mockCatFact = {
        _id: '58e008800aac31001185ed05',
        text: '猫は一日の70%を寝て過ごします。',
        type: 'cat',
        user: '58e007480aac31001185ecef',
        upvotes: 5,
        userUpvoted: null
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCatFact)
      })

      const result = await getCatFact()

      expect(mockFetch).toHaveBeenCalledWith('https://cat-fact.herokuapp.com/facts/random')
      expect(result).toBe('猫は一日の70%を寝て過ごします。')
    })

    it('HTTP エラーが発生した場合、フォールバックメッセージを返す', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      })

      const result = await getCatFact()

      expect(result).toBe('猫の雑学の取得に失敗しました。しばらく後で再試行してください。')
    })

    it('ネットワークエラーが発生した場合、フォールバックメッセージを返す', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await getCatFact()

      expect(result).toBe('猫の雑学の取得に失敗しました。しばらく後で再試行してください。')
    })

    it('レスポンスのJSONパースでエラーが発生した場合、フォールバックメッセージを返す', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await getCatFact()

      expect(result).toBe('猫の雑学の取得に失敗しました。しばらく後で再試行してください。')
    })
  })
})