// Claude Service for High Command
// Handles communication with Claude LLM to execute commands via MCP tools

interface ToolInput {
  [key: string]: string | number | boolean
}

interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: string
    properties: Record<string, unknown>
    required: string[]
  }
}

export class ClaudeService {
  private apiKey: string
  private mcpUrl: string = '/mcp'
  private tools: MCPTool[] = []

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || ''
    if (!this.apiKey) {
      console.warn('VITE_CLAUDE_API_KEY not set. Claude integration will not work.')
    }
  }

  async getAvailableTools(): Promise<MCPTool[]> {
    if (this.tools.length > 0) {
      return this.tools
    }

    try {
      const response = await fetch(`${this.mcpUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Math.random().toString(36).substr(2, 9),
          method: 'tools/list'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get tools: ${response.statusText}`)
      }

      const data = await response.json()
      this.tools = data.result?.tools || []
      return this.tools
    } catch (error) {
      console.error('Error fetching tools:', error)
      return []
    }
  }

  private async callMCPTool(toolName: string, toolInput: ToolInput): Promise<string> {
    try {
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
            arguments: toolInput
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`MCP Error: ${data.error.message}`)
      }

      // Extract text from MCP response format
      if (data.result?.content?.[0]?.text) {
        return data.result.content[0].text
      }

      return JSON.stringify(data.result)
    } catch (error) {
      console.error('Error calling MCP tool:', error)
      throw error
    }
  }

  async executeCommand(userMessage: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Set VITE_CLAUDE_API_KEY environment variable.')
    }

    try {
      const tools = await this.getAvailableTools()
      
      if (tools.length === 0) {
        throw new Error('No tools available from MCP server')
      }

      // Format tools for Claude
      const claudeTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      }))

      // Call Claude via local proxy
      const response = await fetch('/claude/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          tools: claudeTools,
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      // Process Claude's response - might include tool uses
      let finalResponse = ''
      let toolCalls: Array<{name: string; input: ToolInput}> = []

      // Extract content blocks
      for (const block of data.content) {
        if (block.type === 'text') {
          finalResponse = block.text
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            name: block.name,
            input: block.input
          })
        }
      }

      // If Claude wants to call tools, do it
      if (toolCalls.length > 0) {
        const toolResults: Array<{type: string; tool_use_id: string; content: string}> = []
        
        // Extract tool use IDs from Claude's response
        const toolUseIds: string[] = []
        for (const block of data.content) {
          if (block.type === 'tool_use') {
            toolUseIds.push(block.id)
          }
        }
        
        for (let i = 0; i < toolCalls.length; i++) {
          try {
            const result = await this.callMCPTool(toolCalls[i].name, toolCalls[i].input)
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUseIds[i] || `tool_${i}`,
              content: result
            })
          } catch (error) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUseIds[i] || `tool_${i}`,
              content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
          }
        }
        
        const followUpResponse = await fetch('/claude/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            tools: claudeTools,
            messages: [
              {
                role: 'user',
                content: userMessage
              },
              {
                role: 'assistant',
                content: data.content
              },
              {
                role: 'user',
                content: toolResults
              }
            ]
          })
        })

        if (!followUpResponse.ok) {
          throw new Error(`Claude follow-up failed: ${followUpResponse.statusText}`)
        }

        const followUpData = await followUpResponse.json()
        
        // Extract final text response
        for (const block of followUpData.content) {
          if (block.type === 'text') {
            return block.text
          }
        }
      }

      return finalResponse || 'No response from Claude'
    } catch (error) {
      console.error('Error executing command with Claude:', error)
      throw error
    }
  }
}
