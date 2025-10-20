# High Command UI - Copilot Instructions

## Architecture Overview

**High Command UI** is a React + TypeScript frontend for a Hell Divers 2 strategic management system. It uses a **three-tier proxy architecture** to coordinate Claude AI, MCP tools, and backend APIs:

```
Browser (React/TS) 
  → Vite dev server proxies (port 3000)
    → /api → Backend API (port 5000)
    → /mcp → MCP Server (port 8000)  
    → /claude → Anthropic Claude API
```

The app has two execution paths:
1. **Claude-enabled**: Claude uses MCP tools via the `/claude` proxy to answer queries
2. **Fallback**: Keyword matching if no `VITE_CLAUDE_API_KEY` is set

## Key Files & Data Flows

### Core Components
- **`ChatInterface.tsx`** - Main UI component with message history, quick-action buttons, markdown rendering (React-Markdown + DOMPurify)
- **`App.tsx`** - State management hub; loads war status on startup, routes between tabs (chat/galactic/news/major/help)
- **`api.ts`** - HighCommandAPI class: entry point for all commands; routes to Claude or keyword matching
- **`claude.ts`** - ClaudeService class: orchestrates Claude tool calls and maintains conversation history

### Data Components
- **`GalacticMap.tsx`, `News.tsx`, `MissionOrders.tsx`, `DataDisplay.tsx`** - Display campaign data (populated from API responses)

### Development
- **`vite.config.ts`** - Defines all three proxies; env vars: `VITE_API_URL`, `VITE_MCP_URL`, `VITE_CLAUDE_API_KEY`
- **`Makefile`** - Standard targets: `make dev`, `make build`, `make docker-dev`

## Critical Patterns

### Command Execution Flow
1. User enters chat message → `ChatInterface.onSendMessage()`
2. Calls `api.executeCommand(userMessage)`
3. If `VITE_CLAUDE_API_KEY` exists:
   - Fetches available MCP tools via `/mcp/messages` (method: `tools/list`)
   - POSTs to `/claude/messages` with user message + tools
   - Claude responds with text + optional `tool_use` blocks
   - For each tool_use, calls `/mcp/messages` (method: `tools/call`)
   - Sends tool results back to Claude for synthesis
4. Otherwise, falls back to `interpretPrompt()` keyword matching

### Markdown & Security
- All assistant responses use `<ReactMarkdown>` to render markdown
- DOMPurify is applied to prevent XSS
- **No markdown tables** in Claude's system prompt—use bold headers + bullet points instead

### Environment Variables
- **Browser-only**: `VITE_CLAUDE_API_KEY`, `VITE_API_URL`, `VITE_MCP_URL`
- Set in `.env` file or passed to container via `-e` flag
- Defined in `vite.config.ts` via `define` config

## Development Workflow

### Setup & Running
```bash
make dev        # Start Vite dev server + proxies (port 3000)
make build      # Build production bundle
make docker-dev # Run dev container with hot reload
```

### Required Backend Services (must be running)
- **MCP Server**: `http://localhost:8000` (exposes `get_war_status`, `get_planets`, etc.)
- **Backend API**: `http://localhost:5000` (fallback REST endpoints)
- **Claude API**: Requires `VITE_CLAUDE_API_KEY` (accessed via proxy)

### Testing Commands Locally
- Edit `.env`: set `VITE_CLAUDE_API_KEY=sk-...` and ensure MCP/backend are reachable
- Common MCP tools: `get_war_status`, `get_planets`, `get_campaign_info`, `get_factions`, `get_biomes`, `get_statistics`

### Type Safety
- Use `react` and `react-dom` from package.json
- Component props are `React.FC<T>` with interface exports
- Services are plain TS classes with explicit types

## Common Tasks

### Adding a New Query Command
1. Add quick-action button in `ChatInterface.tsx` (e.g., `onClick={() => onSendMessage('...')}`)
2. Claude's tool selection is automatic; update system prompt in `claude.ts` if needed
3. Or add keyword to `api.ts` `interpretPrompt()` for fallback mode

### Extending Data Display
1. New component file in `src/components/` with corresponding `.css`
2. Add tab case in `App.tsx` `activeTab` state
3. Fetch data via `HighCommandAPI` methods (or Claude tool calls)

### Environment-Specific Config
- Dev: proxies handle all routing to localhost services
- Production: Update proxy targets in `.env` or use `VITE_*` vars before build
- Docker: Pass env vars: `docker run -e VITE_CLAUDE_API_KEY=... -e VITE_API_URL=...`

## Build & Deployment

### Production Build
```bash
make build      # → outputs dist/
make preview    # → test dist/ locally on port 4173
```

### Docker
- **`Dockerfile`**: Multi-stage build; serves dist/ with Node
- **`Dockerfile.dev`**: Uses volume mounts; `npm run dev` for hot reload
- **Docker Compose**: orchestrates full stack (see README)

### Deployment Notes
- No build-time dependencies on MCP/backend
- Frontend requires only proxy URLs at runtime
- Fails gracefully if services unavailable (see error handlers in `App.tsx`)
