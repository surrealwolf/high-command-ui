import { useState, useRef, useEffect } from 'react'
import './App.css'
import HighCommandAPI from './services/api'
import ChatInterface from './components/ChatInterface'
import GalacticMap from './components/GalacticMap'
import News from './components/News'
import MissionOrders from './components/MissionOrders'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface WarStatus {
  [key: string]: any
}

const INSPIRATIONAL_QUOTES = [
  "For every soldier lost, a thousand more will take their place. For the glory of Super Earth!",
  "Democracy will spread to the far corners of the galaxy.",
  "Managed democracy is not a negotiation—it's a service.",
  "The only good bug is a dead bug.",
  "We serve the truth. The truth is Helldivers.",
  "Victory tastes like freedom and tastes like managed democracy.",
  "No Helldiver left behind—except those who betray Democracy.",
  "Spread joy. Spread managed democracy. Spread Helldivers.",
  "Bugs have failed, bots will fall, Helldivers will prevail!",
  "Every mission is a step toward galactic freedom."
]

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [warStatus, setWarStatus] = useState<WarStatus | null>(null)
  const [dailyQuote, setDailyQuote] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'chat' | 'galactic' | 'news' | 'major' | 'help'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Load initial war status and statistics
    const loadData = async () => {
      try {
        const status = await HighCommandAPI.getWarStatus()
        setWarStatus(status)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
    
    // Set daily inspirational quote
    const dayIndex = new Date().getDate() % INSPIRATIONAL_QUOTES.length
    setDailyQuote(INSPIRATIONAL_QUOTES[dayIndex])

    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = async (prompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await HighCommandAPI.executeCommand(prompt)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      // Try to fetch war status for context
      const status = await HighCommandAPI.getWarStatus()
      setWarStatus(status)
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>⚔️ HELLDIVERS 2: HIGH COMMAND</h1>
          <p className="subtitle">H.E.L.L. — High-Endurance Liberation Logistics</p>
          
          {/* Daily Inspirational Quote */}
          <div className="quote-banner">
            <span className="quote-icon">✦</span>
            <span className="quote-text">{dailyQuote}</span>
            <span className="quote-icon">✦</span>
          </div>
        </div>
        <div className="live-stats">
          {warStatus && (
            <>
              <div className="stat-item">
                <span className="stat-label">MISSIONS WON</span>
                <span className="stat-value">{warStatus.statistics?.missionsWon?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">SUCCESS RATE</span>
                <span className="stat-value">{warStatus.statistics?.missionSuccessRate || 'N/A'}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ACTIVE PLAYERS</span>
                <span className="stat-value">{warStatus.statistics?.playerCount?.toLocaleString() || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">TERMINID KILLS</span>
                <span className="stat-value">{(warStatus.statistics?.terminidKills ? Math.floor(warStatus.statistics.terminidKills / 1e9) : 0)}B</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">AUTOMATON KILLS</span>
                <span className="stat-value">{(warStatus.statistics?.automatonKills ? Math.floor(warStatus.statistics.automatonKills / 1e9) : 0)}B</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ILLUMINATE KILLS</span>
                <span className="stat-value">{(warStatus.statistics?.illuminateKills ? Math.floor(warStatus.statistics.illuminateKills / 1e9) : 0)}B</span>
              </div>
              {warStatus?.statistics?.factionStats && Object.entries(warStatus.statistics.factionStats).map(([faction, data]: [string, any]) => (
                <div key={faction} className="stat-item faction-item">
                  <span className="stat-label">{faction.toUpperCase().substring(0, 8)}</span>
                  <span className="stat-value">{(data.kills ? Math.floor(data.kills / 1e9) : 0)}B</span>
                  <span className="stat-sublabel">Faction Kills</span>
                </div>
              ))}
              <div className="stat-item">
                <span className="stat-label">IMPACT</span>
                <span className="stat-value">{(warStatus.impactMultiplier * 100).toFixed(2)}%</span>
              </div>
              <div className="stat-item live-indicator">
                <span className="live-dot"></span>
                <span className="live-text">LIVE</span>
              </div>
            </>
          )}
        </div>
        
        {/* Democracy Officer Reminder */}
        <div className="democracy-reminder">
          ⚠️ REMINDER: Report any suspicious activity or foul play to your Democracy Officer immediately. Treason will not be tolerated.
        </div>
      </header>

      <div className="main-container">
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            🎙️ TACTICAL PROMPT
          </button>
          <button 
            className={`tab ${activeTab === 'galactic' ? 'active' : ''}`}
            onClick={() => setActiveTab('galactic')}
          >
            🌍 GALACTIC MAP
          </button>
          <button 
            className={`tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            📡 NEWS BRIEFINGS
          </button>
          <button 
            className={`tab ${activeTab === 'major' ? 'active' : ''}`}
            onClick={() => setActiveTab('major')}
          >
            ⭐ MAJOR ORDERS
          </button>
          <button 
            className={`tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            ❓ TACTICAL COMMAND
          </button>
        </nav>

        <div className="content">
          {activeTab === 'chat' ? (
            <ChatInterface 
              messages={messages}
              loading={loading}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />
          ) : activeTab === 'galactic' ? (
            <GalacticMap warStatus={warStatus} />
          ) : activeTab === 'news' ? (
            <News warStatus={warStatus} />
          ) : activeTab === 'major' ? (
            <MissionOrders warStatus={warStatus} />
          ) : (
            <div className="help-content">
              <div className="help-section">
                <h2>🎙️ TACTICAL PROMPT INTERFACE</h2>
                <p>Command the strategic warfare using the tactical prompt. Input natural language commands and our AI democracy officer will execute MCP tools to gather intelligence and execute operations.</p>
                
                <h3>Available Commands:</h3>
                <ul>
                  <li><strong>War Status:</strong> "What's the current war status?" / "Show me the war situation"</li>
                  <li><strong>Planet Data:</strong> "What planets are we fighting on?" / "Show active planets"</li>
                  <li><strong>Campaign Info:</strong> "What's the current campaign?" / "Campaign details"</li>
                  <li><strong>Faction Stats:</strong> "Show faction information" / "What factions are active?"</li>
                  <li><strong>Biome Data:</strong> "Show biome information" / "What biomes exist?"</li>
                  <li><strong>Statistics:</strong> "Show global statistics" / "What are our stats?"</li>
                  <li><strong>Planet Details:</strong> "Status of planet 0" / "Tell me about planet X"</li>
                </ul>
                
                <h3>H.E.L.L. System Overview:</h3>
                <p><strong>H</strong>igh-Endurance <strong>E</strong>xecution <strong>L</strong>iberation <strong>L</strong>ogistics — Your command center for spreading managed democracy across the galaxy.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
