import { useState, useEffect } from 'react'
import './MapView.css'

interface Planet {
  name: string
  index: number
  status?: string
  health?: number
  maxHealth?: number
  currentOwner?: string
  biomeType?: string
  [key: string]: any
}

interface MapViewProps {
  warStatus: any
}

const MapView: React.FC<MapViewProps> = ({ warStatus }) => {
  const planets = warStatus?.planets || []
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)

  // Rotate the star field slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const getPlanetStatus = (planet: any) => {
    if (planet.currentOwner === 'Humans') return 'liberated'
    if (planet.currentOwner === 'Terminids') return 'under-siege'
    if (planet.currentOwner === 'Automatons') return 'contested-automaton'
    if (planet.currentOwner === 'Illuminate') return 'contested-illuminate'
    return 'neutral'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'liberated':
        return '#66ff00'
      case 'under-siege':
        return '#ff4400'
      case 'contested-automaton':
        return '#ff9900'
      case 'contested-illuminate':
        return '#6699ff'
      default:
        return '#999999'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      liberated: 'LIBERATED',
      'under-siege': 'UNDER SIEGE',
      'contested-automaton': 'AUTOMATON',
      'contested-illuminate': 'ILLUMINATE',
      neutral: 'NEUTRAL'
    }
    return labels[status] || 'UNKNOWN'
  }

  // Calculate position based on actual position data or use circular layout as fallback
  const getPlanetPosition = (planet: Planet, index: number, total: number) => {
    // If planet has position data, use it
    if (planet.position) {
      // Normalize position data to SVG coordinates
      let x = 0, y = 0
      
      if (typeof planet.position === 'object') {
        x = typeof planet.position.x === 'number' ? planet.position.x * 2 : 0
        y = typeof planet.position.y === 'number' ? planet.position.y * 2 : 0
      }
      
      return { x, y }
    }

    // Fallback: circular orbit if no position data
    const radius = 280
    const angle = (index / total) * Math.PI * 2
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    return { x, y }
  }

  // Get unique sectors for visualization
  const getSectorInfo = () => {
    const sectorMap: { [key: string]: Planet[] } = {}
    
    planets.forEach((planet: Planet) => {
      const sector = planet.section || planet.sector || 'UNKNOWN'
      if (!sectorMap[sector]) {
        sectorMap[sector] = []
      }
      sectorMap[sector].push(planet)
    })
    
    return sectorMap
  }

  const sectorMap = getSectorInfo()

  return (
    <div className="map-view">
      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button
          className="zoom-btn"
          onClick={() => setZoom(prev => Math.max(0.25, prev - 0.25))}
          title="Zoom Out"
        >
          −
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button
          className="zoom-btn"
          onClick={() => setZoom(prev => Math.min(2, prev + 0.25))}
          title="Zoom In"
        >
          +
        </button>
        <button
          className="zoom-btn reset"
          onClick={() => setZoom(1)}
          title="Reset Zoom"
        >
          ⊙
        </button>
      </div>

      <div className="map-container" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        {/* Starfield background */}
        <svg
          className="starfield"
          style={{
            transform: `rotate(${rotation}deg)`
          }}
        >
          {[...Array(100)].map((_, i) => {
            const x = Math.random() * 1000
            const y = Math.random() * 1000
            const size = Math.random() * 1.5
            return (
              <circle
                key={`star-${i}`}
                cx={x}
                cy={y}
                r={size}
                fill="#66ff00"
                opacity={Math.random() * 0.6 + 0.4}
              />
            )
          })}
        </svg>

        {/* SVG orbital paths */}
        <svg className="orbital-map" viewBox="0 0 800 800">
          {/* Orbital rings */}
          <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(255, 179, 0, 0.1)" strokeWidth="1" />
          <circle cx="400" cy="400" r="140" fill="none" stroke="rgba(255, 179, 0, 0.05)" strokeWidth="1" />

          {/* Sector connecting lines - draw lines between planets in same sector */}
          {planets && planets.length > 1 && (
            <g opacity="0.15">
              {Object.entries(sectorMap).map(([sector, sectorPlanets]: [string, any]) => 
                sectorPlanets.length > 1 ? (
                  sectorPlanets.map((planet: Planet, i: number) => {
                    const nextPlanet = sectorPlanets[(i + 1) % sectorPlanets.length]
                    const pos1 = getPlanetPosition(planet, 0, planets.length)
                    const pos2 = getPlanetPosition(nextPlanet, 0, planets.length)
                    return (
                      <line
                        key={`sector-line-${sector}-${i}`}
                        x1={400 + pos1.x}
                        y1={400 + pos1.y}
                        x2={400 + pos2.x}
                        y2={400 + pos2.y}
                        stroke="rgba(102, 255, 0, 0.3)"
                        strokeWidth="0.5"
                        strokeDasharray="5,5"
                      />
                    )
                  })
                ) : null
              )}
            </g>
          )}

          {/* Connection lines to Super Earth from far planets */}
          {planets && (
            <g opacity="0.1">
              {planets.map((planet: Planet, idx: number) => {
                const pos = getPlanetPosition(planet, idx, planets.length)
                const distance = Math.sqrt(pos.x * pos.x + pos.y * pos.y)
                // Only draw lines for planets far from center
                if (distance > 150) {
                  return (
                    <line
                      key={`branch-${idx}`}
                      x1="400"
                      y1="400"
                      x2={400 + pos.x}
                      y2={400 + pos.y}
                      stroke="rgba(255, 179, 0, 0.2)"
                      strokeWidth="0.8"
                    />
                  )
                }
                return null
              })}
            </g>
          )}

          {/* Planet positions */}
          {planets && planets.map((planet: Planet, idx: number) => {
            const pos = getPlanetPosition(planet, idx, planets.length)
            const status = getPlanetStatus(planet)
            const color = getStatusColor(status)
            const isSelected = selectedPlanet?.index === planet.index

            return (
              <g key={planet.index || idx}>
                {/* Glow effect */}
                <circle
                  cx={400 + pos.x}
                  cy={400 + pos.y}
                  r="20"
                  fill={color}
                  opacity="0.2"
                  className="planet-glow"
                />

                {/* Planet */}
                <circle
                  cx={400 + pos.x}
                  cy={400 + pos.y}
                  r={isSelected ? 12 : 10}
                  fill={color}
                  stroke={isSelected ? '#ffff00' : 'rgba(255, 255, 255, 0.3)'}
                  strokeWidth={isSelected ? 3 : 1}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => setSelectedPlanet(planet)}
                  className={isSelected ? 'planet-selected' : ''}
                />

                {/* Planet label */}
                <text
                  x={400 + pos.x}
                  y={400 + pos.y + 30}
                  textAnchor="middle"
                  fill="#e0e0e0"
                  fontSize="12"
                  fontFamily="'Courier New', monospace"
                  fontWeight="bold"
                  className="planet-label"
                  onClick={() => setSelectedPlanet(planet)}
                  style={{ cursor: 'pointer' }}
                >
                  {planet.name}
                </text>
              </g>
            )
          })}

          {/* Super Earth at center */}
          <g>
            <circle
              cx="400"
              cy="400"
              r="30"
              fill="none"
              stroke="#66ff00"
              strokeWidth="2"
              opacity="0.3"
            />
            <circle cx="400" cy="400" r="20" fill="#66ff00" opacity="0.8" />
            <circle cx="400" cy="400" r="20" fill="none" stroke="#66ff00" strokeWidth="2" />
            <text
              x="400"
              y="435"
              textAnchor="middle"
              fill="#66ff00"
              fontSize="14"
              fontFamily="'Courier New', monospace"
              fontWeight="bold"
            >
              SUPER EARTH
            </text>
          </g>
        </svg>
      </div>

      {/* Planet details panel */}
      <div className="map-details">
        {selectedPlanet ? (
          <div className="planet-details">
            <div className="details-header">
              <h3>{selectedPlanet.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedPlanet(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-content">
              <div className="detail-row">
                <span className="detail-label">STATUS:</span>
                <span
                  className="detail-value status-badge"
                  style={{ color: getStatusColor(getPlanetStatus(selectedPlanet)) }}
                >
                  {getStatusLabel(getPlanetStatus(selectedPlanet))}
                </span>
              </div>

              {selectedPlanet.index !== undefined && (
                <div className="detail-row">
                  <span className="detail-label">INDEX:</span>
                  <span className="detail-value">#{selectedPlanet.index}</span>
                </div>
              )}

              {selectedPlanet.currentOwner && (
                <div className="detail-row">
                  <span className="detail-label">OWNER:</span>
                  <span className="detail-value">{selectedPlanet.currentOwner}</span>
                </div>
              )}

              {selectedPlanet.biomeType && (
                <div className="detail-row">
                  <span className="detail-label">BIOME:</span>
                  <span className="detail-value">{selectedPlanet.biomeType}</span>
                </div>
              )}

              {selectedPlanet.section && (
                <div className="detail-row">
                  <span className="detail-label">SECTOR:</span>
                  <span className="detail-value">{selectedPlanet.section}</span>
                </div>
              )}

              {selectedPlanet.position && (
                <div className="detail-row">
                  <span className="detail-label">POSITION:</span>
                  <span className="detail-value">
                    {typeof selectedPlanet.position === 'object'
                      ? `(${selectedPlanet.position.x || 0}, ${selectedPlanet.position.y || 0})`
                      : selectedPlanet.position}
                  </span>
                </div>
              )}

              {/* Show related planets in same sector */}
              {selectedPlanet.section && sectorMap[selectedPlanet.section] && sectorMap[selectedPlanet.section].length > 1 && (
                <div className="detail-row related-planets">
                  <span className="detail-label">SECTOR ALLIES:</span>
                  <span className="detail-value">
                    {sectorMap[selectedPlanet.section]
                      .filter((p: Planet) => p.index !== selectedPlanet.index)
                      .map((p: Planet) => p.name)
                      .join(', ')}
                  </span>
                </div>
              )}

              {selectedPlanet.health !== undefined && selectedPlanet.maxHealth && (
                <div className="detail-row">
                  <span className="detail-label">HEALTH:</span>
                  <div className="health-bar-small">
                    <div
                      className="health-fill"
                      style={{
                        width: `${(selectedPlanet.health / selectedPlanet.maxHealth) * 100}%`,
                        backgroundColor: getStatusColor(getPlanetStatus(selectedPlanet))
                      }}
                    ></div>
                  </div>
                  <span className="detail-value">
                    {selectedPlanet.health.toLocaleString()} / {selectedPlanet.maxHealth.toLocaleString()}
                  </span>
                </div>
              )}

              {selectedPlanet.threatLevel && (
                <div className="detail-row">
                  <span className="detail-label">THREAT LEVEL:</span>
                  <span className="detail-value">{selectedPlanet.threatLevel}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <p>🎯 SELECT A PLANET</p>
            <p>Click on any planet to view its details</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <h4>📡 STATUS LEGEND</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot" style={{ color: '#66ff00' }}>●</span>
            <span>Liberated</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ color: '#ff4400' }}>●</span>
            <span>Under Siege</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ color: '#ff9900' }}>●</span>
            <span>Automaton</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ color: '#6699ff' }}>●</span>
            <span>Illuminate</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView
