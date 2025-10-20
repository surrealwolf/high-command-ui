import { useState } from 'react'
import './ChatInterface.css'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  loading: boolean
  onSendMessage: (message: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  loading,
  onSendMessage,
  messagesEndRef
}) => {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>🎖️ STRATEGIST REPORTS FOR DUTY</h2>
            <p>Deploy tactical queries to command headquarters. Request campaign status, faction intel, planetary data, and real-time combat statistics.</p>
            <div className="quick-actions">
              <button 
                onClick={() => onSendMessage('What is the current war status?')}
                className="quick-action"
              >
                ⚔️ War Status
              </button>
              <button 
                onClick={() => onSendMessage('Show all factions')}
                className="quick-action"
              >
                🏛️ Factions
              </button>
              <button 
                onClick={() => onSendMessage('List all planets')}
                className="quick-action"
              >
                🌍 Planets
              </button>
              <button 
                onClick={() => onSendMessage('Get campaign info')}
                className="quick-action"
              >
                📋 Campaign
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'user' ? '👤' : '🎖️'}
              </div>
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant loading">
            <div className="message-avatar">🎖️</div>
            <div className="message-content">
              <div className="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter tactical command..."
          disabled={loading}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="send-button"
        >
          {loading ? '⏳ TRANSMIT' : '📤 DEPLOY'}
        </button>
      </form>
    </div>
  )
}

export default ChatInterface
