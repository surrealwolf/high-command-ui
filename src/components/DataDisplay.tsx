import './DataDisplay.css'

interface DataDisplayProps {
  warStatus: any
}

const DataDisplay: React.FC<DataDisplayProps> = ({ warStatus }) => {
  return (
    <div className="data-display">
      <div className="data-section">
        <h2>🎖️ Campaign Information</h2>
        <p>Real-time campaign data and statistics will appear here as you interact with the High Command system.</p>
      </div>

      {warStatus && (
        <div className="data-section">
          <h3>Current War Status</h3>
          <pre>{JSON.stringify(warStatus, null, 2)}</pre>
        </div>
      )}

      <div className="data-section">
        <h3>Available Commands</h3>
        <ul className="command-list">
          <li><code>Get war status</code> - Retrieve current campaign status</li>
          <li><code>Show planets</code> - List all planets in the campaign</li>
          <li><code>Get factions</code> - Display faction information</li>
          <li><code>Get biomes</code> - Information about planetary biomes</li>
          <li><code>Get statistics</code> - Global game statistics</li>
        </ul>
      </div>
    </div>
  )
}

export default DataDisplay
