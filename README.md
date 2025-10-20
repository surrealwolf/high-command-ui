# High Command UI

A modern, interactive web-based user interface for the High Command MCP Server. This React + TypeScript application provides a chat-like prompt interface for interacting with the High Command strategic management system.

## Features

- 💬 **Interactive Chat Interface** - Send commands and receive real-time responses
- 📊 **Campaign Data Display** - View war status and campaign statistics
- 🎖️ **Strategic Prompt** - Query the High Command system with natural language
- ⚡ **Real-time Updates** - Live data from the High Command MCP Server
- 🎨 **Modern UI** - Dark theme with military aesthetic

## Available Commands

- `War Status` - Get current campaign status
- `List Planets` - View all planets in the campaign
- `Show Factions` - Display faction information
- `Get Biomes` - Information about planetary biomes
- `Get Statistics` - Global game statistics

## Project Structure

```
src/
├── components/
│   ├── ChatInterface.tsx    # Main chat UI component
│   ├── ChatInterface.css    # Chat styling
│   ├── DataDisplay.tsx      # Campaign data viewer
│   └── DataDisplay.css      # Data display styling
├── services/
│   └── api.ts              # High Command API client
├── App.tsx                 # Main application component
├── App.css                 # App styling
├── index.css               # Global styles
└── main.tsx                # Entry point
```

## Setup & Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run preview
```

## API Integration

The UI communicates with the High Command MCP Server via REST endpoints:

- `POST /api/command` - Execute a strategic command
- `GET /api/war-status` - Fetch current war status
- `GET /api/campaign` - Get campaign information
- `GET /api/planets` - List all planets
- `GET /api/factions` - Get faction data
- `GET /api/biomes` - Get biome information
- `GET /api/statistics` - Get game statistics
- `GET /api/planets/:index` - Get specific planet status

## Configuration

The API base URL is configured in `src/services/api.ts`. By default it points to:
```
http://localhost:3001/api
```

Update this if your High Command server runs on a different port or host.

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with animations

## License

High Command UI - Strategic Management Interface
