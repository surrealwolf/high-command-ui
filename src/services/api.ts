// API Service for High Command MCP Server
// This service handles communication with the High Command backend

import { ClaudeService } from './claude'

class HighCommandAPI {
  private baseUrl: string = '/api' // Use local proxy
  private mcpUrl: string = '/mcp' // Use local proxy
  private claudeService: ClaudeService

  constructor() {
    console.log('API Server:', this.baseUrl)
    console.log('MCP Server:', this.mcpUrl)
    this.claudeService = new ClaudeService()
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  }

  async executeCommand(prompt: string): Promise<string> {
    try {
      // Use Claude with MCP tools if API key is available
      const claudeApiKey = import.meta.env.VITE_CLAUDE_API_KEY
      if (claudeApiKey) {
        return await this.claudeService.executeCommand(prompt)
      }

      // Fallback: use keyword matching if no Claude API key
      console.warn('No Claude API key found, using basic keyword matching')
      return await this.executeCommandWithKeywordMatching(prompt)
    } catch (error) {
      console.error('Command error:', error)
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async executeCommandWithKeywordMatching(prompt: string): Promise<string> {
    try {
      // For now, interpret user prompts as tool calls
      // Map common phrases to MCP tools
      const toolName = this.interpretPrompt(prompt)
      
      const response = await fetch(`${this.mcpUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.random().toString(36).substr(2, 9),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: {}
          }
        })
      })

      const data = await this.handleResponse(response)
      
      // Extract text from MCP response format
      if (data.result?.content?.[0]?.text) {
        return data.result.content[0].text
      }
      
      return data.result?.message || 'No response received'
    } catch (error) {
      console.error('Command error:', error)
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private interpretPrompt(prompt: string): string {
    const lower = prompt.toLowerCase()
    
    if (lower.includes('war') || lower.includes('status')) return 'get_war_status'
    if (lower.includes('planet')) return 'get_planets'
    if (lower.includes('campaign')) return 'get_campaign_info'
    if (lower.includes('faction')) return 'get_factions'
    if (lower.includes('biome')) return 'get_biomes'
    if (lower.includes('statistic') || lower.includes('stats')) return 'get_statistics'
    
    // Default to war status if unsure
    return 'get_war_status'
  }

  async getWarStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/war/status`)
      if (!response.ok) {
        console.error(`Error fetching war status: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching war status:', error)
      return null
    }
  }

  async getCampaignInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/campaigns/active`)
      if (!response.ok) {
        console.error(`Error fetching campaign info: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching campaign info:', error)
      return null
    }
  }

  async getPlanets() {
    try {
      const response = await fetch(`${this.baseUrl}/planets`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching planets:', error)
      return null
    }
  }

  async getFactions() {
    try {
      const response = await fetch(`${this.baseUrl}/factions`)
      if (!response.ok) {
        console.error(`Error fetching factions: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching factions:', error)
      return null
    }
  }

  async getBiomes() {
    try {
      const response = await fetch(`${this.baseUrl}/biomes`)
      if (!response.ok) {
        console.error(`Error fetching biomes: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching biomes:', error)
      return null
    }
  }

  async getStatistics() {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`)
      if (!response.ok) {
        console.error(`Error fetching statistics: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return null
    }
  }

  async getPlanetStatus(planetIndex: number) {
    try {
      const response = await fetch(`${this.baseUrl}/planets/${planetIndex}`)
      if (!response.ok) {
        console.error(`Error fetching planet status: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching planet status:', error)
      return null
    }
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      if (!response.ok) {
        console.error(`Error fetching status: HTTP ${response.status}`)
        return null
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching status:', error)
      return null
    }
  }
}

export default new HighCommandAPI()
