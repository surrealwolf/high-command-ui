import { useState, useEffect, useRef } from 'react'
import HighCommandAPI from '../services/api'
import './MapView.css'

interface Planet {
  name: string
  index: number
  status?: string
  health?: number
  maxHealth?: number
  currentOwner?: string
  owner?: string
  biomeType?: string
  biome?: string
  event?: any
  [key: string]: any
}

interface MapViewProps {
  warStatus: any
}

const MapView: React.FC<MapViewProps> = ({ warStatus }) => {
  
  const [planets, setPlanets] = useState<Planet[]>([])  // Start empty, show loading animation
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
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
      setRotation(prev => (prev + 0.2) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const getPlanetStatus = (planet: any) => {
    // Use owner field first (authoritative faction control), then fall back to currentOwner
    const faction = planet.owner || planet.currentOwner
    
    if (faction === 'Humans') return 'liberated'
    if (faction === 'Terminids') return 'under-siege'
    if (faction === 'Automaton' || faction === 'Automatons') return 'contested-automaton'
    if (faction === 'Illuminate') return 'contested-illuminate'
    
    // Debug: log neutral planets to see their structure
    if (!faction) {
      console.log('Neutral planet:', { 
        name: planet.name, 
        owner: planet.owner, 
        currentOwner: planet.currentOwner,
        keys: Object.keys(planet).slice(0, 15)
      })
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

  const getEventColor = (event: any) => {
    if (!event) return null
    // Map event faction to blink color
    if (event.faction === 'Terminids') return '#ffff00'  // Yellow for Terminids
    if (event.faction === 'Automaton' || event.faction === 'Automatons') return '#ff0000'  // Red for Automatons
    if (event.faction === 'Illuminate') return '#9933ff'  // Purple for Illuminate
    return '#ff00ff'  // Magenta for unknown
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

  // Calculate grid layout for sector containers (puzzle-piece style)
  const getSectorLayout = () => {
    const sectorEntries = Object.entries(sectorMap)
    const sectorCount = sectorEntries.length
    
    // Determine grid dimensions to fit all sectors (roughly square)
    const gridCols = Math.ceil(Math.sqrt(sectorCount))
    const gridRows = Math.ceil(sectorCount / gridCols)
    
    // Each sector container is 800x800px with no gap
    const sectorSize = 800
    const gridGap = 0  // No gap for puzzle-piece effect
    
    const layouts: { [key: string]: { x: number; y: number; w: number; h: number } } = {}
    
    sectorEntries.forEach(([sector, _], index) => {
      const col = index % gridCols
      const row = Math.floor(index / gridCols)
      
      layouts[sector] = {
        x: col * (sectorSize + gridGap),
        y: row * (sectorSize + gridGap),
        w: sectorSize,
        h: sectorSize
      }
    })
    
    return { layouts, gridCols, gridRows, sectorSize }
  }

  const sectorLayout = getSectorLayout()
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
                animateViewBox({ x: -2100, y: -2100, w: 6200, h: 6200 }, 360)
                setSelectedSector(null)
              }}
              title="Reset Zoom"
            >
              ⊙
            </button>
          </div>

      <div className="map-container" ref={containerRef}>
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
          <circle cx="2000" cy="2000" r="500" fill="none" stroke="rgba(255, 179, 0, 0.04)" strokeWidth="2" strokeDasharray="10,10" />
          <circle cx="2000" cy="2000" r="1000" fill="none" stroke="rgba(255, 179, 0, 0.05)" strokeWidth="2" strokeDasharray="10,10" />
          <circle cx="2000" cy="2000" r="2000" fill="none" stroke="rgba(255, 179, 0, 0.1)" strokeWidth="3" />

          {/* Sector containers - grid-based puzzle layout */}
          {Object.entries(sectorMap).map(([sector, sectorPlanets]: [string, any]) => {
            if (sectorPlanets.length === 0) return null
            
            const layout = sectorLayout.layouts[sector]
            if (!layout) return null
            
            const isSelected = selectedSector === sector
            const sectorCenterX = layout.x + layout.w / 2
            
            // Place planets inside sector container in a grid
            const planetsPerRow = Math.ceil(Math.sqrt(sectorPlanets.length))
            const planetSize = 24
            const padding = 40
            const availableWidth = layout.w - padding * 2
            const availableHeight = layout.h - padding * 2
            const planetSpacingX = availableWidth / planetsPerRow
            const planetSpacingY = availableHeight / planetsPerRow
            
            return (
              <g key={`sector-${sector}`}>
                {/* Sector background - solid barrier */}
                <rect
                  x={layout.x}
                  y={layout.y}
                  width={layout.w}
                  height={layout.h}
                  fill={isSelected ? 'rgba(255, 179, 0, 0.15)' : 'rgba(0, 0, 0, 0.3)'}
                  stroke={isSelected ? 'rgba(255, 179, 0, 0.9)' : 'rgba(255, 179, 0, 0.4)'}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => {
                    setSelectedSector(isSelected ? null : sector)
                    if (!isSelected) {
                      // Zoom into sector
                      const padding = 50
                      animateViewBox({
                        x: layout.x - padding,
                        y: layout.y - padding,
                        w: layout.w + padding * 2,
                        h: layout.h + padding * 2
                      }, 300)
                    } else {
                      // Reset zoom
                      animateViewBox({ x: -2100, y: -2100, w: 6200, h: 6200 }, 300)
                    }
                  }}
                />
                
                {/* Sector label */}
                <text
                  x={sectorCenterX}
                  y={layout.y + 30}
                  textAnchor="middle"
                  fill={isSelected ? 'rgba(255, 179, 0, 0.95)' : 'rgba(255, 179, 0, 0.6)'}
                  fontSize={isSelected ? "20" : "16"}
                  fontFamily="'Courier New', monospace"
                  fontWeight="bold"
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease', pointerEvents: 'none' }}
                >
                  {sector}
                </text>
                
                {/* Planet count badge */}
                <circle
                  cx={layout.x + layout.w - 30}
                  cy={layout.y + 30}
                  r="18"
                  fill={isSelected ? 'rgba(255, 179, 0, 0.3)' : 'rgba(0, 0, 0, 0.6)'}
                  stroke={isSelected ? 'rgba(255, 179, 0, 0.9)' : 'rgba(255, 179, 0, 0.5)'}
                  strokeWidth="2"
                  style={{ pointerEvents: 'none', transition: 'all 0.3s ease' }}
                />
                <text
                  x={layout.x + layout.w - 30}
                  y={layout.y + 37}
                  textAnchor="middle"
                  fill={isSelected ? 'rgba(255, 179, 0, 0.95)' : 'rgba(255, 179, 0, 0.7)'}
                  fontSize="14"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {sectorPlanets.length}
                </text>
                
                {/* Planets in grid layout inside sector */}
                {sectorPlanets.map((planet: Planet, planetIdx: number) => {
                  const col = planetIdx % planetsPerRow
                  const row = Math.floor(planetIdx / planetsPerRow)
                  const x = layout.x + padding + col * planetSpacingX + planetSpacingX / 2
                  const y = layout.y + padding + 60 + row * planetSpacingY + planetSpacingY / 2
                  
                  const status = getPlanetStatus(planet)
                  const color = getStatusColor(status)
                  const isPlanetSelected = selectedPlanet?.index === planet.index
                  const hasEvent = planet.event && planet.event !== null
                  const eventColor = hasEvent ? getEventColor(planet.event) : null
                  
                  return (
                    <g key={`${sector}-planet-${planetIdx}`}>
                      {/* Event glow */}
                      {hasEvent && (
                        <>
                          <defs>
                            <style>{`
                              @keyframes event-blink-${planet.index} {
                                0%, 100% { opacity: 0.3; }
                                50% { opacity: 0.8; }
                              }
                              .planet-event-glow-${planet.index} {
                                animation: event-blink-${planet.index} 0.6s infinite;
                              }
                            `}</style>
                          </defs>
                          <circle
                            cx={x}
                            cy={y}
                            r={planetSize + 10}
                            fill={eventColor || '#ff00ff'}
                            className={`planet-event-glow-${planet.index}`}
                          />
                        </>
                      )}
                      
                      {/* Planet */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isPlanetSelected ? planetSize + 4 : planetSize}
                        fill={color}
                        stroke={isPlanetSelected ? '#ffff00' : 'rgba(255, 255, 255, 0.2)'}
                        strokeWidth={isPlanetSelected ? 2 : 1}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onClick={() => setSelectedPlanet(planet)}
                      />
                      
                      {/* Planet label tooltip */}
                      <title>{planet.name}</title>
                    </g>
                  )
                })}
              </g>
            )
          })}

          {/* Grid background pattern */}
          <defs>
            <pattern id="grid" width="800" height="800" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
              <path d="M 800 0 L 0 0 0 800" fill="none" stroke="rgba(255, 179, 0, 0.05)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          {/* Optional: grid background - comment out if not desired */}
          {/* <rect width="10000" height="10000" fill="url(#grid)" /> */}

          {/* Orbital rings - visual guides for the galactic map */}
          <circle cx="2000" cy="2000" r="500" fill="none" stroke="rgba(255, 179, 0, 0.04)" strokeWidth="2" strokeDasharray="10,10" />
          <circle cx="2000" cy="2000" r="1000" fill="none" stroke="rgba(255, 179, 0, 0.05)" strokeWidth="2" strokeDasharray="10,10" />
          <circle cx="2000" cy="2000" r="2000" fill="none" stroke="rgba(255, 179, 0, 0.1)" strokeWidth="3" />
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

      {/* Legend */}
      <div className="map-legend">
        <h4>📡 STATUS LEGEND</h4>
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
    </div>
  )
}

export default MapView
