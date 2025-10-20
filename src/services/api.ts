// API Service for High Command MCP Server
// This service handles communication with the High Command backend

class HighCommandAPI {
  private baseUrl: string = 'http://localhost:3001/api'

  async executeCommand(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.response || 'No response received'
    } catch (error) {
      throw new Error(`Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getWarStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/war-status`)
      if (!response.ok) throw new Error('Failed to fetch war status')
      return await response.json()
    } catch (error) {
      console.error('Error fetching war status:', error)
      return null
    }
  }

  async getCampaignInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/campaign`)
      if (!response.ok) throw new Error('Failed to fetch campaign info')
      return await response.json()
    } catch (error) {
      console.error('Error fetching campaign info:', error)
      return null
    }
  }

  async getPlanets() {
    try {
      const response = await fetch(`${this.baseUrl}/planets`)
      if (!response.ok) throw new Error('Failed to fetch planets')
      return await response.json()
    } catch (error) {
      console.error('Error fetching planets:', error)
      return null
    }
  }

  async getFactions() {
    try {
      const response = await fetch(`${this.baseUrl}/factions`)
      if (!response.ok) throw new Error('Failed to fetch factions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching factions:', error)
      return null
    }
  }

  async getBiomes() {
    try {
      const response = await fetch(`${this.baseUrl}/biomes`)
      if (!response.ok) throw new Error('Failed to fetch biomes')
      return await response.json()
    } catch (error) {
      console.error('Error fetching biomes:', error)
      return null
    }
  }

  async getStatistics() {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`)
      if (!response.ok) throw new Error('Failed to fetch statistics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching statistics:', error)
      return null
    }
  }

  async getPlanetStatus(planetIndex: number) {
    try {
      const response = await fetch(`${this.baseUrl}/planets/${planetIndex}`)
      if (!response.ok) throw new Error('Failed to fetch planet status')
      return await response.json()
    } catch (error) {
      console.error('Error fetching planet status:', error)
      return null
    }
  }
}

export default new HighCommandAPI()
