# Implementation Details: Galactic Map Event Visualization

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     High Command UI Frontend                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              MapView Component (TSX)                    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Data Loading Layer                              │  │   │
│  │  │ - Load planets from API or warStatus           │  │   │
│  │  │ - Extract event data from planet.event         │  │   │
│  │  │ - Scale position coordinates                   │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                        ↓                                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ SVG Rendering Layer                             │  │   │
│  │  │ - Orbital rings and background                  │  │   │
│  │  │ - Sector connection lines                       │  │   │
│  │  │ - Planet circles with ownership colors          │  │   │
│  │  │ - Event blinking halos (dynamic CSS)            │  │   │
│  │  │ - Planet labels                                 │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                        ↓                                 │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Details Panel                                    │  │   │
│  │  │ - Planet status and owner                       │  │   │
│  │  │ - Health bar                                    │  │   │
│  │  │ - Event information (if present)                │  │   │
│  │  │   - Faction, Type, Progress, End Time           │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│     HighCommandAPI Service           │
├──────────────────────────────────────┤
│ getPlanets()                         │
│ getPlanetEvents() [NEW]              │
│ getMajorOrders()                     │
│ getDispatches()                      │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│    Backend API (Port 5000)           │
├──────────────────────────────────────┤
│ GET /api/planets                     │
│ GET /api/events                      │
│ GET /api/assignments                 │
│ GET /api/dispatches                  │
└──────────────────────────────────────┘
```

---

## Data Flow: Planet Event Visualization

### 1. Data Fetching
```
User opens Galactic Map Tab
         ↓
MapView component mounts
         ↓
useEffect: loadPlanets()
         ↓
Try warStatus.planets OR HighCommandAPI.getPlanets()
         ↓
Planets array received with event data
         ↓
Scale positions: normalize [-0.93, 0.93] → [±750]
         ↓
Store in state: setPlanets(scaledPlanets)
```

### 2. Event Detection
```
For each planet:
  if (planet.event && planet.event !== null)
    hasEvent = true
    eventColor = getEventColor(planet.event)
  else
    hasEvent = false
```

### 3. Rendering Pipeline
```
For each planet (map, idx):
  ↓
  [Event Blinking Halo] (if hasEvent)
    - Create dynamic @keyframes
    - Apply pulsing animation: 0-0.3s opacity, 50%-0.8s opacity
    - Circle r="35" with event faction color
    - 0.6s animation cycle, infinite loop
  ↓
  [Base Glow Effect]
    - Circle r="28" with ownership color
    - opacity 0.2 (normal) or 0.4 (selected)
  ↓
  [Planet Circle]
    - Circle r="16" (or 18 if selected)
    - fill: ownership color
    - stroke: selection highlight or default border
  ↓
  [Planet Label]
    - Text below planet with name
    - Font: 12px, Courier New, bold
    - Color: #e0e0e0
```

### 4. Details Panel Display
```
User clicks planet
         ↓
setSelectedPlanet(planet)
         ↓
Panel shows: name, index, owner, biome, sector, health
         ↓
if planet.event:
  Show event-info section:
  - FACTION: event.faction
  - TYPE: event.eventType (1→ATTACK, 2→DEFENSE, 3→SABOTAGE)
  - PROGRESS: health / maxHealth bar
  - ENDS: event.endTime as locale string
```

---

## Color Mapping System

### Ownership Colors (Base Planet Color)
```
Faction          Color      Hex     Meaning
────────────────────────────────────────────
Humans           Green      #00ff00 Liberated
Terminids        Yellow     #ffff00 Under Siege
Automatons       Red        #ff0000 Contested
Illuminate       Purple     #9933ff Contested
(Neutral)        Gray       #999999 Unclaimed
```

### Event Blink Colors (Halo Color)
```
Event Faction    Color      Hex     Animation
──────────────────────────────────────────────
Terminids        Yellow     #ffff00 Pulse 0.6s
Automatons       Red        #ff0000 Pulse 0.6s
Illuminate       Purple     #9933ff Pulse 0.6s
Unknown          Magenta    #ff00ff Pulse 0.6s
```

### Event Type Mapping
```
eventType   Meaning
─────────────────────
1           ATTACK
2           DEFENSE
3           SABOTAGE
Other       TYPE {n}
```

---

## CSS Animation Details

### Event Blink Keyframes
```css
/* Generated dynamically for each planet */
@keyframes event-blink-{planetIndex} {
  0%, 100% { 
    opacity: 0.3;  /* Subtle at start/end */
  }
  50% { 
    opacity: 0.8;  /* Bright in middle */
  }
}

.planet-event-glow-{planetIndex} {
  animation: event-blink-{planetIndex} 0.6s infinite;
  /* Continuous pulsing effect */
  /* Color varies by event faction */
  /* Radius: 35px (extends beyond planet) */
}
```

### Why Dynamic Per-Planet Keyframes?
- Avoids conflicts when multiple planets have events
- Each planet can have different animation timing if needed
- Clean CSS generation with no naming collisions
- CSS is scoped to SVG defs element

---

## Event Data Structure

### From API Response
```json
{
  "id": 5384,
  "eventType": 1,
  "faction": "Terminids",
  "health": 686620,
  "maxHealth": 750000,
  "startTime": "2025-10-21T21:07:05Z",
  "endTime": "2025-10-22T21:07:05Z",
  "campaignId": 51339,
  "jointOperationIds": [5384]
}
```

### Extracted to UI Display
```
Event Faction: Terminids
Event Type: ATTACK (eventType === 1)
Health: 686,620 / 750,000
Progress: 91.5% (health/maxHealth * 100)
Ends: 10/22/2025, 9:07:05 PM (from endTime)
```

---

## Component State Management

### MapView Component State
```typescript
// Planets with scaled positions and event data
const [planets, setPlanets] = useState<Planet[]>([])

// Selected planet for details panel
const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)

// Map view state
const [rotation, setRotation] = useState(0)
const [isLoading, setIsLoading] = useState(true)
const [viewBox, setViewBox] = useState({ x: -250, y: -250, w: 1300, h: 1300 })

// References for SVG and container
const svgRef = useRef<SVGSVGElement | null>(null)
const containerRef = useRef<HTMLDivElement | null>(null)
```

### Props Flow
```
MapView ← warStatus
    ↓
    Uses: warStatus?.planets OR HighCommandAPI.getPlanets()
    ↓
    Contains: GalacticMap component (wrapper)
    ↓
    Renders: SVG with planets, details panel, legend
```

---

## User Interaction Flow

### Viewing Events on Map
```
1. Open "Galactic Map" tab
   ↓
2. Wait for planets to load (loading spinner shows)
   ↓
3. Map displays with colored planets
   ↓
4. Planets with events show blinking halos
   - Color indicates event faction
   - Pulsing animation draws attention
   ↓
5. Click any planet to select
   ↓
6. If planet has event:
   - Details panel shows event section
   - Displays: Faction, Type, Progress bar, End time
   ↓
7. Can pan/zoom map to view other planets
   ↓
8. Click another planet or ✕ button to deselect
```

### Keyboard/Mouse Controls
```
Scroll Wheel:  Zoom in/out (centered on cursor)
Click + Drag:  Pan around map
Click Planet:  Select and show details
✕ Button:      Deselect planet
Zoom Controls: Buttons in top-left (+/−/⊙)
```

---

## Error Handling

### API Failures
```typescript
if (!response.ok) {
  console.error(`Error fetching: HTTP ${response.status}`)
  return null
}
```

### Missing Event Data
```typescript
if (hasEvent && !eventColor) {
  // Fallback to magenta
  fill={eventColor || '#ff00ff'}
}
```

### No Selection
```tsx
{selectedPlanet ? (
  <div className="planet-details">...</div>
) : (
  <div className="no-selection">
    <p>🎯 SELECT A PLANET</p>
  </div>
)}
```

---

## Performance Considerations

### Optimizations
- SVG rendering for millions of pixels efficiently
- Dynamic keyframes only created for planets with events
- Debounced pan/zoom to prevent excessive re-renders
- Canvas-style drawing avoids DOM bloat

### Scalability
- Tested with 261 planets
- Smooth animation even with multiple events
- Linear time complexity for planet rendering

---

## Browser Compatibility

### Required Features
- SVG rendering (all modern browsers)
- CSS Keyframes animation (all modern browsers)
- ES6+ JavaScript (transpiled for legacy support)
- React 18+ Hooks

### Tested On
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancement Ideas

### Short Term
1. Real-time event updates via WebSocket
2. Event filtering/search controls
3. Sound alerts for new events
4. Faction-specific UI themes

### Medium Term
1. Historical event tracking
2. Event impact predictions
3. Automated recommendation system
4. Mobile responsive layout

### Long Term
1. 3D map visualization
2. Galactic trade routes
3. Alliance management interface
4. Strategic planning tools
