// API Service for High Command MCP Server
// This service handles communication with the High Command backend

class HighCommandAPI {
  private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  private mcpUrl: string = import.meta.env.VITE_MCP_URL || 'http://localhost:8000'

  constructor() {
    console.log('API Server:', this.baseUrl)
    console.log('MCP Server:', this.mcpUrl)
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  }

  async executeCommand(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      const data = await this.handleResponse(response)
      return data.response || data.message || 'No response received'
    } catch (error) {
      console.error('Command error:', error)
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getWarStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/war-status`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching war status:', error)
      return null
    }
  }

  async getCampaignInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/campaign`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching campaign info:', error)
      return null
    }
  }

  async getPlanets() {
    try {
      const response = await fetch(`${this.baseUrl}/planets`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching planets:', error)
      return null
    }
  }

  async getFactions() {
    try {
      const response = await fetch(`${this.baseUrl}/factions`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching factions:', error)
      return null
    }
  }

  async getBiomes() {
    try {
      const response = await fetch(`${this.baseUrl}/biomes`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching biomes:', error)
      return null
    }
  }

  async getStatistics() {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return null
    }
  }

  async getPlanetStatus(planetIndex: number) {
    try {
      const response = await fetch(`${this.baseUrl}/planets/${planetIndex}`)
      return await this.handleResponse(response)
    } catch (error) {
      console.error('Error fetching planet status:', error)
      return null
    }
  }
}

export default new HighCommandAPI()
