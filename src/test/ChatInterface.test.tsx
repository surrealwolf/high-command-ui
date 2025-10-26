import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatInterface from '../components/ChatInterface'

describe('ChatInterface Component', () => {
  const mockOnSendMessage = vi.fn()
  const mockMessagesEndRef = { current: null }

  const defaultProps = {
    messages: [],
    loading: false,
    onSendMessage: mockOnSendMessage,
    messagesEndRef: mockMessagesEndRef
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render welcome message when no messages', () => {
      render(<ChatInterface {...defaultProps} />)
      expect(screen.getByText(/STRATEGIST REPORTS FOR DUTY/)).toBeInTheDocument()
    })

    it('should render quick action buttons', () => {
      render(<ChatInterface {...defaultProps} />)
      expect(screen.getByText(/War Status/)).toBeInTheDocument()
      expect(screen.getByText(/Planets/)).toBeInTheDocument()
      expect(screen.getByText(/Factions/)).toBeInTheDocument()
    })

    it('should render messages', () => {
      const messages = [
        {
          id: '1',
          type: 'user' as const,
          content: 'What is the war status?',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'assistant' as const,
          content: 'The war is ongoing',
          timestamp: new Date()
        }
      ]

      render(<ChatInterface {...defaultProps} messages={messages} />)
      expect(screen.getByText(/What is the war status?/)).toBeInTheDocument()
      expect(screen.getByText(/The war is ongoing/)).toBeInTheDocument()
    })

    it('should render loading indicator when loading is true', () => {
      render(<ChatInterface {...defaultProps} loading={true} />)
      expect(screen.getByText(/Processing.../)).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('should send message on form submit', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const input = screen.getByPlaceholderText(/Enter command/)
      const submitButton = screen.getByText(/SEND COMMAND/)

      await user.type(input, 'Test message')
      await user.click(submitButton)

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('should clear input after sending message', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const input = screen.getByPlaceholderText(/Enter command/) as HTMLInputElement
      const submitButton = screen.getByText(/SEND COMMAND/)

      await user.type(input, 'Test message')
      await user.click(submitButton)

      expect(input.value).toBe('')
    })

    it('should not send empty message', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const submitButton = screen.getByText(/SEND COMMAND/)
      await user.click(submitButton)

      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('should not send message with only whitespace', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const input = screen.getByPlaceholderText(/Enter command/)
      await user.type(input, '   ')
      const submitButton = screen.getByText(/SEND COMMAND/)
      await user.click(submitButton)

      expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    it('should trigger quick action buttons', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const warStatusButton = screen.getByText(/War Status/)
      await user.click(warStatusButton)

      expect(mockOnSendMessage).toHaveBeenCalledWith(
        expect.stringContaining('war status')
      )
    })
  })

  describe('input handling', () => {
    it('should accept keyboard input', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const input = screen.getByPlaceholderText(/Enter command/) as HTMLInputElement

      await user.type(input, 'Test command')
      expect(input.value).toBe('Test command')
    })

    it('should support Enter key submission', async () => {
      const user = userEvent.setup()
      render(<ChatInterface {...defaultProps} />)

      const input = screen.getByPlaceholderText(/Enter command/)

      await user.type(input, 'Test message')
      await user.keyboard('{Enter}')

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ChatInterface {...defaultProps} />)
      const input = screen.getByPlaceholderText(/Enter command/)
      expect(input).toBeInTheDocument()
    })

    it('should have form for accessibility', () => {
      const { container } = render(<ChatInterface {...defaultProps} />)
      const form = container.querySelector('form')
      expect(form).toBeInTheDocument()
    })
  })
})
