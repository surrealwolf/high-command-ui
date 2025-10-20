import { useState, useRef, useEffect } from 'react'
import './App.css'
import HighCommandAPI from './services/api'
import ChatInterface from './components/ChatInterface'
import DataDisplay from './components/DataDisplay'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface WarStatus {
  [key: string]: any
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [warStatus, setWarStatus] = useState<WarStatus | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'data'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
          <h1>⚔️ HELLDIVERS 2: STRATEGIC COMMAND</h1>
          <p className="subtitle">DEMOCRACY SPREADS - WAR CAMPAIGN TACTICAL INTERFACE</p>
        </div>
      </header>

      <div className="main-container">
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            � TACTICAL PROMPT
          </button>
          <button 
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            📊 WAR READOUTS
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
          ) : (
            <DataDisplay warStatus={warStatus} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
