import { describe, it, expect } from 'vitest'
import { echo } from '../../../server/greeting.js'

describe('greeting', () => {
  describe('echo', () => {
    it('should return the same message that was passed in', () => {
      const message = 'Hello, World!'
      const result = echo(message)
      expect(result).toBe(message)
    })

    it('should handle empty strings', () => {
      const message = ''
      const result = echo(message)
      expect(result).toBe('')
    })

    it('should handle strings with special characters', () => {
      const message = 'Hello! @#$%^&*()_+{}[]|\\:";\'<>?,./'
      const result = echo(message)
      expect(result).toBe(message)
    })

    it('should handle multi-line strings', () => {
      const message = 'Hello\nWorld\nHow are you?'
      const result = echo(message)
      expect(result).toBe(message)
    })
  })
})