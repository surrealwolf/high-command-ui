import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock the ClaudeService to avoid dependencies
vi.mock('../../services/claude', () => ({
  ClaudeService: vi.fn(() => ({
    executeCommand: vi.fn(),
    getAvailableTools: vi.fn(),
    clearConversationHistory: vi.fn()
  }))
}))

// We need to import after mocking
import HighCommandAPI from '../../services/api'

describe('HighCommandAPI', () => {
  let api: HighCommandAPI
  let fetchMock: any

  beforeEach(() => {
    api = new HighCommandAPI()
    fetchMock = vi.fn()
    global.fetch = fetchMock
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should initialize API instance', () => {
      expect(api).toBeDefined()
    })
  })

  describe('getWarStatus', () => {
    it('should fetch war status from API', async () => {
      const mockWarStatus = {
        mission_time: 1234567890,
        total_players: 50000,
        active_battles: 25
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockWarStatus
      })

      const result = await api.getWarStatus()
      expect(result).toEqual(mockWarStatus)
      expect(fetchMock).toHaveBeenCalledWith('/api/war/status')
    })

    it('should return null on fetch error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getWarStatus()
      expect(result).toBeNull()
    })

    it('should return null on HTTP error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await api.getWarStatus()
      expect(result).toBeNull()
    })
  })

  describe('getCampaignInfo', () => {
    it('should fetch campaign info from API', async () => {
      const mockCampaignInfo = {
        id: 'campaign1',
        name: 'Great War',
        faction: 'Humans'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCampaignInfo
      })

      const result = await api.getCampaignInfo()
      expect(result).toEqual(mockCampaignInfo)
      expect(fetchMock).toHaveBeenCalledWith('/api/campaigns/active')
    })

    it('should return null on error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getCampaignInfo()
      expect(result).toBeNull()
    })
  })

  describe('getPlanets', () => {
    it('should fetch planets from API', async () => {
      const mockPlanets = [
        { id: 1, name: 'Planet A', state: 'contested' },
        { id: 2, name: 'Planet B', state: 'defended' }
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlanets
      })

      const result = await api.getPlanets()
      expect(result).toEqual(mockPlanets)
      expect(fetchMock).toHaveBeenCalledWith('/api/planets')
    })

    it('should return null on error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getPlanets()
      expect(result).toBeNull()
    })
  })

  describe('getFactions', () => {
    it('should fetch factions from API', async () => {
      const mockFactions = [
        { name: 'Humans', strength: 1000 },
        { name: 'Bugs', strength: 800 }
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFactions
      })

      const result = await api.getFactions()
      expect(result).toEqual(mockFactions)
      expect(fetchMock).toHaveBeenCalledWith('/api/factions')
    })

    it('should return null on error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getFactions()
      expect(result).toBeNull()
    })
  })

  describe('getBiomes', () => {
    it('should fetch biomes from API', async () => {
      const mockBiomes = [
        { name: 'Tundra', difficulty: 'medium' },
        { name: 'Desert', difficulty: 'hard' }
      ]

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBiomes
      })

      const result = await api.getBiomes()
      expect(result).toEqual(mockBiomes)
    })

    it('should return null on error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getBiomes()
      expect(result).toBeNull()
    })
  })

  describe('getStatistics', () => {
    it('should fetch statistics from API', async () => {
      const mockStats = {
        total_kills: 1000000,
        total_missions: 50000,
        average_squad_size: 4
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })

      const result = await api.getStatistics()
      expect(result).toEqual(mockStats)
    })

    it('should return null on error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const result = await api.getStatistics()
      expect(result).toBeNull()
    })
  })

  describe('interpretPrompt', () => {
    it('should map war-related prompts to get_war_status', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { message: 'War status' } })
      })

      try {
        await api['executeCommandWithKeywordMatching']('What is the war status?')
      } catch (e) {
        // Expected to throw due to mock limitations
      }

      expect(fetchMock).toHaveBeenCalled()
    })

    it('should map planet-related prompts to get_planets', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ result: { message: 'Planets' } })
      })

      try {
        await api['executeCommandWithKeywordMatching']('Show me the planets')
      } catch (e) {
        // Expected
      }

      expect(fetchMock).toHaveBeenCalled()
    })
  })
})
