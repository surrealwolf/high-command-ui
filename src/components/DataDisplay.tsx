import './DataDisplay.css'

interface DataDisplayProps {
  warStatus: any
}

const DataDisplay: React.FC<DataDisplayProps> = ({ warStatus }) => {
  return (
    <div className="data-display">
      <div className="data-section">
        <h2>🎖️ TACTICAL HEADQUARTERS</h2>
        <p>Real-time campaign telemetry and strategic intelligence will appear here as you interact with the High Command system. All information is classified and for strategic purposes only.</p>
      </div>

      {warStatus && (
        <div className="data-section">
          <h3>⚔️ CURRENT WAR STATUS</h3>
          <pre>{JSON.stringify(warStatus, null, 2)}</pre>
        </div>
      )}

      <div className="data-section">
        <h3>📡 AVAILABLE TACTICAL COMMANDS</h3>
        <ul className="command-list">
          <li><code>Get war status</code> - Retrieve current major orders and tactical data</li>
          <li><code>Show planets</code> - List all strategic planetary objectives</li>
          <li><code>Get factions</code> - Display faction military intelligence</li>
          <li><code>Get biomes</code> - Planetary terrain and biome classification data</li>
          <li><code>Get statistics</code> - Global combat and major orders statistics</li>
        </ul>
      </div>
    </div>
  )
}

export default DataDisplay
