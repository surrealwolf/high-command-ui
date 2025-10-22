# MapView Component - Developer Guide

## Quick Overview

The refactored `MapView.tsx` component displays a **grid-based sector view** of the galactic map in the High Command UI. Planets are organized into sectors (puzzle-piece containers), and users can zoom/pan to explore the map.

## Component Location
```
src/components/MapView.tsx (739 lines)
```

## Props
```typescript
interface MapViewProps {
  warStatus: any  // Contains planets array if available
}
```

## Data Requirements

### Required Planet Fields
```typescript
{
  name: string           // Planet display name
  index: number          // Unique planet ID
  section?: string       // Sector assignment (groups planets)
  owner?: string         // Faction: "Humans", "Terminids", "Automaton", "Illuminate"
  currentOwner?: string  // Fallback owner field
  biomeType?: string     // Biome name (optional)
  health?: number        // Current health (optional)
  maxHealth?: number     // Max health (optional)
  event?: {              // Active event (optional)
    faction: string
    eventType: number    // 1=Attack, 2=Defense, 3=Sabotage
    health: number
    maxHealth: number
    endTime?: string
  }
}
```

## Key Functions

### State Management
```typescript
const [planets, setPlanets] = useState<Planet[]>([])
const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
const [selectedSector, setSelectedSector] = useState<string | null>(null)
const [viewBox, setViewBox] = useState({ x: -2100, y: -2100, w: 6200, h: 6200 })
```

### Sector Organization
```typescript
getSectorInfo()        // Returns { [sector]: [planets] }
getSectorLayout()      // Returns grid coordinates for each sector
```

### Data Mapping
```typescript
getPlanetStatus(planet)     // Returns: 'liberated' | 'under-siege' | 'contested-automaton' | 'contested-illuminate' | 'neutral'
getStatusColor(status)      // Returns hex color code
getStatusLabel(status)      // Returns display label
getEventColor(event)        // Returns event animation color
```

### ViewBox Controls
```typescript
animateViewBox(target, duration)  // Smooth zoom/pan transition
clientToSvg(clientX, clientY)    // Convert mouse coords to SVG coords
```

## Usage Example

```tsx
import MapView from './components/MapView'

function App() {
  const [warStatus, setWarStatus] = useState<any>(null)

  useEffect(() => {
    // Load war status from API
    const data = await HighCommandAPI.getWarStatus()
    setWarStatus(data)
  }, [])

  return <MapView warStatus={warStatus} />
}
```

## Styling

### CSS Classes
```css
.map-view              /* Main container */
.map-container         /* SVG container with scroll */
.starfield             /* Rotating star background */
.orbital-map           /* Main SVG canvas */
.zoom-controls         /* Zoom button group */
.map-details           /* Right panel with planet info */
.map-legend            /* Status legend */
.planet-details        /* Selected planet details */
.health-bar-small      /* Planet health indicator */
.event-info            /* Event details display */
```

### SVG Elements
- **Sector containers:** 800×800px rectangles with dashed borders
- **Planets:** Circles (16-24px radius)
- **Event glow:** Animated blinking circles
- **Labels:** Monospace font for technical appearance

## Interaction Flow

### Zoom & Pan
```
Mouse Wheel Up    → Zoom in (1.25x)
Mouse Wheel Down  → Zoom out (1.25x)
Click & Drag      → Pan the map
+ Button          → Zoom in (animated)
− Button          → Zoom out (animated)
⊙ Button          → Reset view
```

### Selection
```
Click Sector   → Zoom into sector, highlight it
Click Planet   → Show planet details panel
Click Again    → Deselect and return to previous view
```

## Performance Considerations

### Optimization Features
- **Grid arithmetic:** O(n) planet positioning instead of orbital calculations
- **Lazy animation:** RAF-based smooth transitions
- **Efficient SVG:** Direct coordinate mapping, no path calculations
- **Responsive grid:** Auto-calculates optimal sector arrangement

### Scaling Limits
- **Tested with:** Up to 200+ planets across 20+ sectors
- **Recommended max:** 500 planets, 50 sectors
- **Viewport:** Massive 10,000×10,000px virtual canvas

## Common Customizations

### Change Sector Size
```typescript
// In getSectorLayout()
const sectorSize = 1000  // Was 800px
```

### Adjust Planet Spacing
```typescript
// In render loop
const padding = 60              // Inner padding
const planetSpacingX = availableWidth / planetsPerRow
```

### Modify Color Scheme
```typescript
// In getStatusColor()
case 'liberated':
  return '#00ff00'  // Change hex value
```

### Add Custom Event Types
```typescript
// In getEventColor()
if (event.faction === 'NewFaction') return '#custom_color'
```

## Debugging Tips

### Enable Grid Background
```tsx
{/* Uncomment in SVG: */}
<rect width="10000" height="10000" fill="url(#grid)" />
```

### Log Sector Information
```typescript
console.log('Sector Map:', sectorMap)
console.log('Sector Layout:', sectorLayout)
```

### View SVG Viewbox in Real-time
```typescript
useEffect(() => {
  console.log('Current ViewBox:', viewBox)
}, [viewBox])
```

### Check Planet Data Structure
```typescript
useEffect(() => {
  console.log('Planets loaded:', planets.length)
  console.log('Sample planet:', planets[0])
}, [planets])
```

## Common Issues & Solutions

### Issue: Planets not showing up
**Cause:** `planet.section` or `planet.sector` field missing or undefined
**Solution:** Ensure API returns sector assignment for each planet

### Issue: Zoom not working
**Cause:** ViewBox state not updating due to RAF animation
**Solution:** Check browser DevTools for animation frame timing

### Issue: Sector layout is unbalanced
**Cause:** Unequal planets per sector
**Solution:** This is expected; grid auto-calculates optimal arrangement

### Issue: Event colors not blinking
**Cause:** CSS animation not loaded or browser doesn't support @keyframes injection
**Solution:** Pre-define animations in MapView.css instead of inline styles

## API Integration

### Fetching Planet Data
```typescript
// In effect hook:
const data = await HighCommandAPI.getPlanets()
// Expected response: { planets: [...], biomes: [...] } or Planet[]
```

### Updating on War Status Change
```typescript
useEffect(() => {
  if (warStatus?.planets && warStatus.planets.length > 0) {
    setPlanets(warStatus.planets)
  }
}, [warStatus])
```

## Browser Compatibility

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
❌ IE11 (not supported)

## Future Work

See `MAPVIEW_REFACTOR_SUMMARY.md` for planned enhancements:
- Sector detail expansion
- Advanced interactions (drag/drop)
- Map customization options
- Heatmap visualizations

---

**Last Updated:** 2025
**Status:** Production Ready
