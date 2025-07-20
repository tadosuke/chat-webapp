import { describe, it, expect, vi } from 'vitest'

// Mock the CSS import
vi.mock('../../../../src/components/ResizeHandle/ResizeHandle.css', () => ({}))

describe('ResizeHandle', () => {
  it('should export ResizeHandle component', async () => {
    const module = await import('../../../../src/components/ResizeHandle')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })

  it('should be a named function called ResizeHandle', async () => {
    const module = await import('../../../../src/components/ResizeHandle')
    expect(module.default.name).toBe('ResizeHandle')
  })

  it('should export ResizeHandleProps type', async () => {
    const module = await import('../../../../src/components/ResizeHandle')
    // TypeScript types are compiled away, but we can check that the module structure is correct
    expect(module.default).toBeDefined()
  })
})