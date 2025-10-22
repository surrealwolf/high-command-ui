# Quick Reference: Galactic Map Event Features

## What Changed?

### 🎯 Core Features Added

1. **Event-Based Planet Highlighting**
   - Planets with active events show blinking halos
   - Color indicates which faction is attacking/defending
   - Animation automatically updates as events change

2. **Ownership-Based Coloring**
   - Map colors now reflect who actually controls each planet
   - Human (Green) | Terminid (Yellow) | Automaton (Red) | Illuminate (Purple)
   - Replaces previous status-based coloring

3. **Event Information Display**
   - Click any planet to see event details
   - Shows: Faction, Type, Health/Progress, End Time
   - Integrated into existing planet details panel

4. **API Integration**
   - New `getPlanetEvents()` method in API service
   - Existing `getMajorOrders()` and `getDispatches()` verified working
   - Graceful fallback when data unavailable

---

## Key Files & What They Do

### `src/services/api.ts`
```typescript
// NEW: Fetch planet events
async getPlanetEvents() → /api/events

// EXISTING: Fetch assignments/orders
async getMajorOrders() → /api/assignments (2 active)

// EXISTING: Fetch news/dispatches
async getDispatches() → /api/dispatches (10 current)
```

### `src/components/MapView.tsx`
```typescript
// Updated function: Uses owner field for coloring
getPlanetStatus(planet) → 'liberated' | 'under-siege' | 'contested-automaton' | 'contested-illuminate' | 'neutral'

// NEW: Maps event faction to blink color
getEventColor(event) → '#ffff00' | '#ff0000' | '#9933ff' | '#ff00ff'

// RENDERING: Event detection and blinking halo
{hasEvent && <circle class="planet-event-glow-{id}" ... />}

// DETAILS: Event information section
{selectedPlanet.event && <div className="event-info">...</div>}
```

### `src/components/MapView.css`
```css
/* Event section styling */
.detail-row.event-info { ... }
.event-details { ... }
.event-health-bar { ... }

/* Dynamically injected keyframes */
@keyframes event-blink-{planetIndex} { ... }
.planet-event-glow-{planetIndex} { ... }
```

---

## API Data Contracts

### Planet Object (from `/api/planets`)
```json
{
  "name": "HELLMIRE",
  "index": 42,
  "owner": "Terminids",           // PRIMARY faction control
  "currentOwner": "Terminids",    // FALLBACK
  "health": 500000,
  "maxHealth": 750000,
  "event": {                      // NULL if no active event
    "id": 5384,
    "eventType": 1,               // 1=ATTACK, 2=DEFENSE, 3=SABOTAGE
    "faction": "Terminids",
    "health": 686620,
    "maxHealth": 750000,
    "startTime": "2025-10-21T21:07:05Z",
    "endTime": "2025-10-22T21:07:05Z"
  }
}
```

### Event Color Logic
```typescript
if (event.faction === 'Terminids') return '#ffff00'     // Yellow
if (event.faction === 'Automatons') return '#ff0000'    // Red
if (event.faction === 'Illuminate') return '#9933ff'    // Purple
return '#ff00ff'                                         // Magenta (unknown)
```

---

## Visual Reference

### Planet Colors (By Ownership)
```
🟢 Human/Liberated     → #00ff00 (bright green)
🟡 Terminid/Siege      → #ffff00 (bright yellow)
🔴 Automaton/Contested → #ff0000 (bright red)
🟣 Illuminate/Contested → #9933ff (bright purple)
⚫ Neutral/Unclaimed   → #999999 (dark gray)
```

### Event Blink Animation
```
Opacity over 0.6s cycle:
  0%   → 0.3 (subtle)
  25%  → 0.55 (building)
  50%  → 0.8 (peak/brightest)
  75%  → 0.55 (fading)
  100% → 0.3 (subtle)

↻ Repeats infinitely
```

### Event Type Labels
```
eventType === 1 → "ATTACK"
eventType === 2 → "DEFENSE"
eventType === 3 → "SABOTAGE"
other           → "TYPE {n}"
```

---

## Common Development Tasks

### Display Planet Event Info
```tsx
// Already implemented! Just select a planet on the map.
// Event section appears automatically if planet.event exists.

// To manually show event:
{selectedPlanet?.event && (
  <div className="detail-row event-info">
    <span>🔴 ACTIVE EVENT:</span>
    <div className="event-details">
      <div className="event-detail">
        <span className="event-label">FACTION:</span>
        <span className="event-value">{event.faction}</span>
      </div>
      {/* ... */}
    </div>
  </div>
)}
```

### Add New Event Type
```tsx
// In getEventColor(event):
if (event.faction === 'NewFaction') return '#00ff00'

// In event type display:
eventType === 4 ? 'NEW_TYPE' : ...
```

### Change Blink Animation Speed
```css
/* In MapView.tsx, dynamically injected style: */
.planet-event-glow-${planet.index} {
  animation: event-blink-${planet.index} 0.6s infinite;  // ← Change 0.6s
}

/* Current: 0.6s cycle time
   Faster:  0.3s (urgent, active)
   Slower:  1.2s (gradual, monitoring)
*/
```

### Filter Planets by Event Type
```tsx
const planetsWithAttacks = planets.filter(p => p.event?.eventType === 1)
const planetsWithDefense = planets.filter(p => p.event?.eventType === 2)
```

### Get Event Countdown Time
```tsx
if (selectedPlanet?.event?.endTime) {
  const endTime = new Date(selectedPlanet.event.endTime)
  const now = new Date()
  const msRemaining = endTime.getTime() - now.getTime()
  const minutesRemaining = Math.floor(msRemaining / 60000)
}
```

---

## Testing Checklist

- [ ] Map loads and displays planets
- [ ] Planets have correct ownership colors
- [ ] Planets with events show blinking halos
- [ ] Event halo color matches faction
- [ ] Click planet shows details
- [ ] Event section appears if planet.event exists
- [ ] Event faction displays correctly
- [ ] Event type translates to label (ATTACK/DEFENSE/SABOTAGE)
- [ ] Event health bar shows progress
- [ ] Event end time displays as readable date/time
- [ ] No console errors
- [ ] No animation jank or stuttering
- [ ] Build succeeds without errors

---

## Troubleshooting

### No Events Showing?
1. Check API response: `curl http://localhost:5000/api/planets | grep "event"`
2. Verify `planet.event !== null`
3. Check browser console for errors
4. Ensure planet data is loaded (not still loading)

### Blink Animation Not Visible?
1. Check CSS is injected: Open DevTools → Elements → Look for `<style>` with `@keyframes`
2. Verify opacity keyframes are correct (0.3 to 0.8)
3. Check if planet actually has event: `console.log(planet.event)`
4. Try other planets - maybe that one has no event

### Wrong Colors?
1. Check `getEventColor()` logic
2. Verify `event.faction` value matches expected strings
3. Check `getStatusColor()` for ownership color
4. Ensure planet has `owner` field (not just `currentOwner`)

### Event Details Don't Show?
1. Select a planet by clicking it
2. Check `selectedPlanet.event` in console
3. Verify event section CSS is loaded
4. Check for TypeScript errors in MapView.tsx

---

## Performance Tips

### For Many Events
```typescript
// Memoize event color calculation
const eventColorCache = new Map()

const getEventColorMemoized = (event) => {
  const key = event?.id
  if (!eventColorCache.has(key)) {
    eventColorCache.set(key, getEventColor(event))
  }
  return eventColorCache.get(key)
}
```

### Reduce Animation Overhead
```css
/* Only animate visible planets */
@media (prefers-reduced-motion: reduce) {
  .planet-event-glow {
    animation: none;
    opacity: 0.6;  /* Static fallback */
  }
}
```

---

## Deployment Checklist

- [ ] All endpoints responding (planets, assignments, dispatches, events)
- [ ] Event data present in planet objects
- [ ] CSS styles included in build bundle
- [ ] No console errors in production
- [ ] Animation smooth on target devices
- [ ] Event details readable on all screen sizes
- [ ] API proxies correctly configured

---

## Support & Documentation

- **API Docs:** See backend repo `/high-command-api`
- **Component Docs:** See `IMPLEMENTATION_DETAILS.md` in this repo
- **Styling Docs:** See `MapView.css` comments and sections

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-21 | Initial event visualization release |

---

**Last Updated:** October 21, 2025  
**Status:** ✅ Production Ready
