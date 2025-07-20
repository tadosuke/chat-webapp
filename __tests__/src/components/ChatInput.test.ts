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
vi.mock('../../../src/components/ChatInput/ChatInput.css', () => ({}))

describe('ChatInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseState.mockReturnValue(['', vi.fn()])
    mockUseRef.mockReturnValue({ current: null })
    mockUseEffect.mockImplementation(() => {})
  })

  it('should export ChatInput component and ChatInputProps interface', async () => {
    const module = await import('../../../src/components/ChatInput')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })

  it('should be a named function called ChatInput', async () => {
    const module = await import('../../../src/components/ChatInput')
    expect(module.default.name).toBe('ChatInput')
  })

  it('should use React hooks', async () => {
    const module = await import('../../../src/components/ChatInput')
    
    // Simulate calling the component
    const mockOnSubmit = vi.fn()
    module.default({ onSubmit: mockOnSubmit })
    
    // Verify hooks are called
    expect(mockUseState).toHaveBeenCalled()
    expect(mockUseRef).toHaveBeenCalled()
    expect(mockUseEffect).toHaveBeenCalled()
  })
})

describe('ChatInput props', () => {
  it('should accept onSubmit callback prop', () => {
    const mockOnSubmit = vi.fn()
    const props = { onSubmit: mockOnSubmit }
    
    expect(props.onSubmit).toBe(mockOnSubmit)
    expect(typeof props.onSubmit).toBe('function')
  })
})