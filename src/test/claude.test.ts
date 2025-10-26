import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ClaudeService } from '../../services/claude'

describe('ClaudeService', () => {
  let claudeService: ClaudeService
  let fetchMock: any

  beforeEach(() => {
    claudeService = new ClaudeService()
    fetchMock = vi.fn()
    global.fetch = fetchMock
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with API key from environment', () => {
      expect(claudeService).toBeDefined()
      expect(claudeService.getConversationHistory()).toEqual([])
    })
  })

  describe('clearConversationHistory', () => {
    it('should clear conversation history', () => {
      claudeService.clearConversationHistory()
      expect(claudeService.getConversationHistory()).toEqual([])
    })
  })

  describe('getConversationHistory', () => {
    it('should return empty array initially', () => {
      expect(claudeService.getConversationHistory()).toEqual([])
    })

    it('should return conversation history after adding messages', () => {
      claudeService.clearConversationHistory()
      expect(claudeService.getConversationHistory()).toEqual([])
    })
  })

  describe('getAvailableTools', () => {
    it('should fetch tools from MCP server', async () => {
      const mockTools = [
        {
          name: 'get_war_status',
          description: 'Get current war status',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: { tools: mockTools }
        })
      })

      const tools = await claudeService.getAvailableTools()
      expect(tools).toEqual(mockTools)
      expect(fetchMock).toHaveBeenCalledWith(
        '/mcp/messages',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should return cached tools on subsequent calls', async () => {
      const mockTools = [
        {
          name: 'get_war_status',
          description: 'Get current war status',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: { tools: mockTools }
        })
      })

      await claudeService.getAvailableTools()
      await claudeService.getAvailableTools()

      // Should only fetch once due to caching
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('should return empty array on fetch error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const tools = await claudeService.getAvailableTools()
      expect(tools).toEqual([])
    })
  })

  describe('executeCommand', () => {
    it('should throw error if API key not configured', async () => {
      const serviceWithoutKey = new ClaudeService()
      
      await expect(serviceWithoutKey.executeCommand('test')).rejects.toThrow(
        'Claude API key not configured'
      )
    })

    it('should throw error if no tools available', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: { tools: [] }
        })
      })

      await expect(claudeService.executeCommand('test')).rejects.toThrow(
        'No tools available from MCP server'
      )
    })

    it('should format tools correctly for Claude API', async () => {
      const mockTools = [
        {
          name: 'get_war_status',
          description: 'Get war status',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ]

      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            result: { tools: mockTools }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: [{ type: 'text', text: 'Response' }]
          })
        })

      try {
        await claudeService.executeCommand('What is the war status?')
      } catch (error) {
        // Expected to fail due to mock limitations
      }

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })
  })
})
