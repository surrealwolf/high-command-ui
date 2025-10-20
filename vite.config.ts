import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/mcp': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mcp/, '')
      },
      '/claude': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/claude/, '/v1'),
        configure(proxy, options) {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('anthropic-dangerous-direct-browser-access', 'true')
          })
        }
      }
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0'
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api'),
    'import.meta.env.VITE_MCP_URL': JSON.stringify(process.env.VITE_MCP_URL || 'http://localhost:8000'),
    'import.meta.env.VITE_CLAUDE_API_KEY': JSON.stringify(process.env.VITE_CLAUDE_API_KEY || '')
  }
})
