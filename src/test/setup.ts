import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock global fetch for API calls
global.fetch = vi.fn()

// Mock environment variables
import.meta.env.VITE_API_URL = 'http://localhost:5000/api'
import.meta.env.VITE_MCP_URL = 'http://localhost:8000'
import.meta.env.VITE_CLAUDE_API_KEY = 'test-key'
