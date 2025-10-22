import { useState, useEffect, useRef } from 'react'
import HighCommandAPI from '../services/api'
import './MapView.css'

interface Event {
  id?: string
  eventType?: number
  faction?: string
  health?: number
  maxHealth?: number
  startTime?: string
  endTime?: string
  campaignId?: string
  jointOperationIds?: string[]
  [key: string]: any
}

interface Planet {
  name: string
  index: number
  status?: string
  health?: number
  maxHealth?: number
  currentOwner?: string
  owner?: string
  biomeType?: string
  event?: Event
  [key: string]: any
}

interface MapViewProps {
  warStatus: any
}

const MapView: React.FC<MapViewProps> = ({ warStatus }) => {
  
  const [planets, setPlanets] = useState<Planet[]>([])  // Start empty, show loading animation
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [_selectedSector, _setSelectedSector] = useState<string | null>(null)
  // TODO: _selectedSector and _setSelectedSector will be used for sector-based features
  void _selectedSector
  void _setSelectedSector
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(true)  // Track loading state
  // viewBox state for SVG zoom/pan: x, y, width, height
  // With planets spread across ±2000 from center (2000, 2000):
  // - All planets fit in range roughly -2100 to 4100 for both X and Y
  // - Massive viewBox for maximum planet separation
  const [viewBox, setViewBox] = useState({ x: -2100, y: -2100, w: 6200, h: 6200 })
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isPanning = useRef(false)
  const lastPointer = useRef<{ x: number; y: number } | null>(null)
  const animRef = useRef<number | null>(null)

  // Fetch planets from API on mount
  useEffect(() => {
    const loadPlanets = async () => {
      if (warStatus?.planets && warStatus.planets.length > 0) {
        // Use warStatus planets if available
        console.log('Setting planets from warStatus')
        setPlanets(warStatus.planets)
      } else {
        // Try to fetch from planets API endpoint
        console.log('Fetching planets from API...')
        try {
          const data = await HighCommandAPI.getPlanets()
          console.log('API returned:', data.length, 'planets')
          
          if (data && Array.isArray(data) && data.length > 0) {
            // Scale normalized coordinates (-0.93 to 0.93) to SVG space (relative to 2000, 2000)
            // Map -0.93 to -2000 and 0.93 to 2000, giving us range of ±2000 around center (maximum spread)
            // Invert Y axis so that positive Y values go up instead of down
            const scaledPlanets = data.map(planet => ({
              ...planet,
              position: planet.position ? {
                x: (planet.position.x || 0) * 2000,  // Scale from normalized [-0.93, 0.93] to [-2000, 2000]
                y: -(planet.position.y || 0) * 2000   // Negate Y so up is up
              } : undefined
            }))
            
            console.log('Scaled planets:', scaledPlanets.length)
            console.log('Sample planet positions:', scaledPlanets.slice(0, 3).map(p => ({ name: p.name, pos: p.position })))
            setPlanets(scaledPlanets)
            setIsLoading(false)
          } else if (data?.planets && Array.isArray(data.planets)) {
            // Alternative response format
            const scaledPlanets = data.planets.map((planet: Planet) => ({
              ...planet,
              position: planet.position ? {
                x: (planet.position.x || 0) * 2000,
                y: -(planet.position.y || 0) * 2000  // Negate Y so up is up
              } : undefined
            }))
            console.log('Using scaled planets from data.planets:', scaledPlanets.length)
            setPlanets(scaledPlanets)
            setIsLoading(false)
          } else {
            console.log('API returned no valid data')
            setIsLoading(false)
          }
        } catch (error) {
          console.error('Failed to fetch planets:', error)
          setIsLoading(false)
        }
      }
    }
    loadPlanets()
  }, [])

  // Rotate the star field slowly
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.0025) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const getPlanetStatus = (planet: any) => {
    // Use owner field directly for faction colors
    if (planet.owner === 'Humans') return 'liberated'
    if (planet.owner === 'Terminids') return 'under-siege'
    if (planet.owner === 'Automaton' || planet.owner === 'Automatons') return 'contested-automaton'
    if (planet.owner === 'Illuminate') return 'contested-illuminate'
    
    // Fallback to currentOwner if owner not available
    if (planet.currentOwner === 'Humans') return 'liberated'
    if (planet.currentOwner === 'Terminids') return 'under-siege'
    if (planet.currentOwner === 'Automaton' || planet.currentOwner === 'Automatons') return 'contested-automaton'
    if (planet.currentOwner === 'Illuminate') return 'contested-illuminate'
    
    // Debug: log neutral planets to see their structure
    if (!planet.owner && !planet.currentOwner) {
      console.log('Neutral planet:', { name: planet.name, owner: planet.owner, currentOwner: planet.currentOwner, faction: planet.faction, controllingFaction: planet.controllingFaction, keys: Object.keys(planet).slice(0, 10) })
    }
    
    return 'neutral'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'liberated':
        return '#00ff00'  // Bright green for defended/liberated
      case 'under-siege':
        return '#ffff00'  // Yellow for Terminids/under siege
      case 'contested-automaton':
        return '#ff0000'  // Red for Automatons
      case 'contested-illuminate':
        return '#9933ff'  // Purple for Illuminate
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

  const getEventColor = (event: Event | null | undefined) => {
    if (!event) return null
    // Map event faction to pink color (all events use pink)
    if (event.faction === 'Terminids') return '#ff69b4'  // Hot pink for Terminids
    if (event.faction === 'Automaton' || event.faction === 'Automatons') return '#ff1493'  // Deep pink for Automatons
    if (event.faction === 'Illuminate') return '#ff69b4'  // Hot pink for Illuminate
    // Debug unknown faction
    console.warn('Unknown event faction:', event.faction)
    return '#ff69b4'  // Hot pink for unknown
  }

  const getFactionEmoji = (event: Event | null | undefined) => {
    if (!event) return null
    // Map event faction to emoji
    if (event.faction === 'Terminids') return '🐛'  // Bug for Terminids
    if (event.faction === 'Automaton' || event.faction === 'Automatons') return '🤖'  // Robot for Automatons
    if (event.faction === 'Illuminate') return '👁️'  // Eye for Illuminate
    return '⚠️'  // Warning for unknown
  }

  const getEventTypeEmoji = (event: Event | null | undefined) => {
    if (!event) return null
    // Map event type to emoji
    if (event.eventType === 1) return '⚔️'  // Swords for ATTACK
    if (event.eventType === 2) return '🛡️'  // Shield for DEFENSE
    if (event.eventType === 3) return '💣'  // Bomb for SABOTAGE
    return '⚠️'  // Warning for unknown
  }

  // Calculate position based on actual position data or use optimal circular layout as fallback
  const getPlanetPosition = (planet: Planet, index: number, total: number) => {
    // If planet has position data, use it directly (coordinates come from API or mock data)
    if (planet.position && typeof planet.position === 'object') {
      const x = typeof planet.position.x === 'number' ? planet.position.x : 0
      const y = typeof planet.position.y === 'number' ? planet.position.y : 0
      return { x, y }
    }

    // Fallback: arrange in optimal circular orbits by distance
    // Inner ring (planets 0-2): radius 140, outer ring (planets 3+): radius 280
    if (total <= 3) {
      // Small set: use inner ring only
      const radius = 140
      const angle = (index / total) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      return { x, y }
    } else if (index < Math.ceil(total / 2)) {
      // First half: inner ring
      const radius = 160
      const angle = (index / Math.ceil(total / 2)) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      return { x, y }
    } else {
      // Second half: outer ring
      const radius = 280
      const relIndex = index - Math.ceil(total / 2)
      const count = total - Math.ceil(total / 2)
      const angle = (relIndex / count) * Math.PI * 2 + Math.PI / count // offset to avoid alignment with inner
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      return { x, y }
    }
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

  // Calculate sector grid layout positions
  const getSectorLayout = () => {
    const sectors = Object.keys(sectorMap)
    const sectorCount = sectors.length
    const gridSize = Math.ceil(Math.sqrt(sectorCount))
    const sectorSpacing = 2400 // Space between sector centers
    const baseX = 2000
    const baseY = 2000

    const layout: { [key: string]: { x: number; y: number } } = {}
    
    sectors.forEach((sector, index) => {
      const row = Math.floor(index / gridSize)
      const col = index % gridSize
      
      // Center grid around (2000, 2000)
      const offsetX = (col - (gridSize - 1) / 2) * sectorSpacing
      const offsetY = (row - (gridSize - 1) / 2) * sectorSpacing
      
      layout[sector] = {
        x: baseX + offsetX,
        y: baseY + offsetY
      }
    })
    
    return layout
  }

  const _sectorLayout = getSectorLayout()
  // TODO: These will be used for sector grid rendering and zoom-to-sector features
  void _sectorLayout

  // Smoothly animate viewBox from current to target over duration (ms)
  const animateViewBox = (target: { x: number; y: number; w: number; h: number }, duration = 300) => {
    const start = { ...viewBox }
    const startTime = performance.now()
    if (animRef.current) cancelAnimationFrame(animRef.current)

    const step = (t: number) => {
      const p = Math.min(1, (t - startTime) / duration)
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p // easeInOutQuad-ish
      const next = {
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
        w: start.w + (target.w - start.w) * ease,
        h: start.h + (target.h - start.h) * ease
      }
      setViewBox(next)
      if (p < 1) animRef.current = requestAnimationFrame(step)
      else animRef.current = null
    }

    animRef.current = requestAnimationFrame(step)
  }

  // Convert client coords to SVG coords based on current viewBox and svg size
  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 400, y: 400 }
    const rect = svg.getBoundingClientRect()
    const svgX = ((clientX - rect.left) / rect.width) * viewBox.w + viewBox.x
    const svgY = ((clientY - rect.top) / rect.height) * viewBox.h + viewBox.y
    return { x: svgX, y: svgY }
  }

  // Wheel zoom centered on cursor
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY
    const zoomFactor = delta > 0 ? 1.12 : 1 / 1.12
    const svgPos = clientToSvg(e.clientX, e.clientY)
    setViewBox(b => {
      const newW = Math.max(200, Math.min(4000, b.w * zoomFactor))
      const newH = Math.max(200, Math.min(4000, b.h * zoomFactor))
      // keep svgPos at same visual point: compute new x/y so that svgPos maps to same client coords
      const nx = svgPos.x - ((svgPos.x - b.x) * (newW / b.w))
      const ny = svgPos.y - ((svgPos.y - b.y) * (newH / b.h))
      return { x: nx, y: ny, w: newW, h: newH }
    })
  }

  // Pointer handlers for panning
  const onPointerDown = (e: PointerEvent) => {
    isPanning.current = true
    lastPointer.current = { x: e.clientX, y: e.clientY }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!isPanning.current || !lastPointer.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    // translate pixels to viewBox units
    const vx = (dx / rect.width) * viewBox.w
    const vy = (dy / rect.height) * viewBox.h
    setViewBox(b => ({ x: b.x - vx, y: b.y - vy, w: b.w, h: b.h }))
    lastPointer.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerUp = (e: PointerEvent) => {
    isPanning.current = false
    lastPointer.current = null
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
  }

  // Attach wheel and pointer events to container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const wheelHandler = (e: Event) => onWheel(e as WheelEvent)
    const pd = (e: Event) => onPointerDown(e as PointerEvent)
    const pm = (e: Event) => onPointerMove(e as PointerEvent)
    const pu = (e: Event) => onPointerUp(e as PointerEvent)
    container.addEventListener('wheel', wheelHandler, { passive: false })
    container.addEventListener('pointerdown', pd)
    window.addEventListener('pointermove', pm)
    window.addEventListener('pointerup', pu)
    return () => {
      container.removeEventListener('wheel', wheelHandler)
      container.removeEventListener('pointerdown', pd)
      window.removeEventListener('pointermove', pm)
      window.removeEventListener('pointerup', pu)
    }
  }, [viewBox])

  return (
    <div className="map-view">
      <div className="map-container" ref={containerRef}>
        {/* Zoom Controls (viewBox-based) */}
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={() => {
              // zoom out: increase viewBox size (animated)
              const factor = 1.25
              const newW = Math.min(4000, viewBox.w * factor)
              const newH = Math.min(4000, viewBox.h * factor)
              const nx = viewBox.x - (newW - viewBox.w) / 2
              const ny = viewBox.y - (newH - viewBox.h) / 2
              animateViewBox({ x: nx, y: ny, w: newW, h: newH }, 260)
            }}
            title="Zoom Out"
          >
            −
          </button>
          <span className="zoom-level">{Math.round((800 / viewBox.w) * 100)}%</span>
          <button
            className="zoom-btn"
            onClick={() => {
              // zoom in: decrease viewBox size (animated)
              const factor = 1 / 1.25
              const newW = Math.max(200, viewBox.w * factor)
              const newH = Math.max(200, viewBox.h * factor)
              const nx = viewBox.x + (viewBox.w - newW) / 2
              const ny = viewBox.y + (viewBox.h - newH) / 2
              animateViewBox({ x: nx, y: ny, w: newW, h: newH }, 200)
            }}
            title="Zoom In"
          >
            +
          </button>
          <button
            className="zoom-btn reset"
            onClick={() => {
              // reset to default centered view (animated)
              animateViewBox({ x: -250, y: -250, w: 1300, h: 1300 }, 360)
            }}
            title="Reset Zoom"
          >
            ⊙
          </button>
        </div>

        {/* Legend */}
        <div className="map-legend">
          <h4>📡 STATUS</h4>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-dot" style={{ color: '#00ff00' }}>●</span>
              <span>Liberated</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ color: '#ffff00' }}>●</span>
              <span>Terminids</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ color: '#ff0000' }}>●</span>
              <span>Automaton</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ color: '#9933ff' }}>●</span>
              <span>Illuminate</span>
            </div>
          </div>
        </div>
        {/* Loading animation */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>INITIALIZING GALACTIC MAP...</p>
            </div>
          </div>
        )}
        
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
  <svg ref={svgRef} className="orbital-map" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}>
          {/* Orbital rings - visual guides for the galactic map */}
          <circle cx="400" cy="400" r="160" fill="none" stroke="rgba(255, 179, 0, 0.04)" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(255, 179, 0, 0.05)" strokeWidth="1" strokeDasharray="4,4" />
          <circle cx="400" cy="400" r="750" fill="none" stroke="rgba(255, 179, 0, 0.1)" strokeWidth="1.5" />

          {/* Sector connecting lines - draw lines between planets in same sector - HIDDEN */}
          {false && planets && planets.length > 1 && (
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

          {/* Debug: Coordinate crosshairs at Super Earth center - HIDDEN */}
          {false && (
          <g opacity="0.3" stroke="rgba(255, 179, 0, 0.5)" strokeWidth="1">
            <line x1="350" y1="400" x2="450" y2="400" />
            <line x1="400" y1="350" x2="400" y2="450" />
            <circle cx="400" cy="400" r="2" fill="rgba(255, 179, 0, 1)" />
            <text x="410" y="395" fill="rgba(255, 179, 0, 0.7)" fontSize="10">(400, 400)</text>
          </g>
          )}

          {/* Connection lines to Super Earth from far planets - HIDDEN */}
          {false && planets && (
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
            // Use event color if planet has an event, otherwise use status color
            const color = planet.event ? getEventColor(planet.event) || getStatusColor(status) : getStatusColor(status)
            const isSelected = selectedPlanet?.index === planet.index
            
            // Determine stroke color: selected = yellow, normal = faint white
            let strokeColor = 'rgba(255, 255, 255, 0.3)'
            let strokeWidth = 1
            if (isSelected) {
              strokeColor = '#ffff00'  // Yellow for selected
              strokeWidth = 3
            }

            return (
              <g key={planet.index || idx}>
                {/* Glow effect */}
                <circle
                  cx={400 + pos.x}
                  cy={400 + pos.y}
                  r="28"
                  fill={color}
                  opacity="0.2"
                  className="planet-glow"
                />

                {/* Planet */}
                <circle
                  cx={400 + pos.x}
                  cy={400 + pos.y}
                  r={isSelected ? 18 : 16}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => setSelectedPlanet(planet)}
                  className={`${isSelected ? 'planet-selected' : ''} ${planet.event ? 'planet-event' : ''}`}
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

                {/* Event emoji indicator - faction (top left) */}
                {planet.event && (
                  <text
                    x={400 + pos.x - 20}
                    y={400 + pos.y - 20}
                    textAnchor="middle"
                    fontSize="16"
                    className="planet-event-emoji"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    {getFactionEmoji(planet.event)}
                  </text>
                )}

                {/* Event emoji indicator - event type (top right) */}
                {planet.event && (
                  <text
                    x={400 + pos.x + 20}
                    y={400 + pos.y - 20}
                    textAnchor="middle"
                    fontSize="16"
                    className="planet-event-emoji"
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  >
                    {getEventTypeEmoji(planet.event)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Planet details panel - popup */}
      <div 
        className={`map-details ${selectedPlanet ? 'active' : ''}`}
        style={selectedPlanet ? {
          left: `${(window.innerWidth / 2) + 100}px`,
          top: `${(window.innerHeight / 2) - 100}px`
        } : {}}
      >
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

              {/* Display active event if present */}
              {selectedPlanet.event && (
                <div className="detail-row event-info">
                  <span className="detail-label">🔴 ACTIVE EVENT:</span>
                  <div className="event-details">
                    <div className="event-detail">
                      <span className="event-label">FACTION:</span>
                      <span className="event-value">{selectedPlanet.event.faction}</span>
                    </div>
                    <div className="event-detail">
                      <span className="event-label">TYPE:</span>
                      <span className="event-value">
                        {selectedPlanet.event.eventType === 1 ? 'ATTACK' : 
                         selectedPlanet.event.eventType === 2 ? 'DEFENSE' :
                         selectedPlanet.event.eventType === 3 ? 'SABOTAGE' :
                         `TYPE ${selectedPlanet.event.eventType}`}
                      </span>
                    </div>
                    {selectedPlanet.event.health !== undefined && selectedPlanet.event.maxHealth && (
                      <div className="event-detail">
                        <span className="event-label">PROGRESS:</span>
                        <div className="event-health-bar">
                          <div
                            className="event-health-fill"
                            style={{
                              width: `${(selectedPlanet.event.health / selectedPlanet.event.maxHealth) * 100}%`,
                              backgroundColor: getEventColor(selectedPlanet.event) || '#ff00ff'
                            }}
                          ></div>
                        </div>
                        <span className="event-value">
                          {selectedPlanet.event.health.toLocaleString()} / {selectedPlanet.event.maxHealth.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedPlanet.event.endTime && (
                      <div className="event-detail">
                        <span className="event-label">ENDS:</span>
                        <span className="event-value">
                          {new Date(selectedPlanet.event.endTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
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
    </div>
  )
}

export default MapView
