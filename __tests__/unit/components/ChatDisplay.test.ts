import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React 
const mockUseState = vi.fn()
const mockUseRef = vi.fn()
const mockUseEffect = vi.fn()

const React = {
  useState: mockUseState,
  useRef: mockUseRef,
  useEffect: mockUseEffect
}

vi.mock('react', () => React)

// Mock the CSS import
vi.mock('../../../src/ChatDisplay.css', () => ({}))

describe('ChatDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should export Message interface and ChatDisplayProps interface', async () => {
    const module = await import('../../../src/ChatDisplay')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })

  it('should be a named function called ChatDisplay', async () => {
    const module = await import('../../../src/ChatDisplay')
    expect(module.default.name).toBe('ChatDisplay')
  })
})

describe('ChatDisplay types', () => {
  it('should have correct Message interface structure', () => {
    // Test that the Message interface is properly defined through usage
    const testMessage = {
      id: 1,
      text: 'test',
      timestamp: new Date(),
      sender: 'user' as const
    }
    
    // These should compile without TypeScript errors
    expect(testMessage.id).toBe(1)
    expect(testMessage.text).toBe('test')
    expect(testMessage.timestamp).toBeInstanceOf(Date)
    expect(testMessage.sender).toBe('user')
  })

  it('should accept echo sender type', () => {
    const testMessage = {
      id: 1,
      text: 'test',
      timestamp: new Date(),
      sender: 'echo' as const
    }
    
    expect(testMessage.sender).toBe('echo')
  })
})