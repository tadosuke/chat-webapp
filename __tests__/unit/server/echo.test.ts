import { describe, it, expect } from 'vitest'
import { echo } from '../../../server/services/echo.js'

describe('echo', () => {
  describe('echo', () => {
    it('渡されたメッセージと同じメッセージを返す', () => {
      const message = 'Hello, World!'
      const result = echo(message)
      expect(result).toBe(message)
    })

    it('空文字列を処理する', () => {
      const message = ''
      const result = echo(message)
      expect(result).toBe('')
    })

    it('特殊文字を含む文字列を処理する', () => {
      const message = 'Hello! @#$%^&*()_+{}[]|\\:";\'<>?,./'
      const result = echo(message)
      expect(result).toBe(message)
    })

    it('複数行の文字列を処理する', () => {
      const message = 'Hello\nWorld\nHow are you?'
      const result = echo(message)
      expect(result).toBe(message)
    })
  })
})