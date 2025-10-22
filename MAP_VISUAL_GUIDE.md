# Galactic Map - Visual Guide

## Map Layout Changes

### Before: Tight Clustering
```
ViewBox: (-250, -250) to (1050, 1050) = 1300x1300
Center: (400, 400)
Planet Scale: ±750px

         Star Formation
              ↓
    ╔═════════════════╗
    ║      ★ ★ ★      ║
    ║    ★ ○ ★ ★    ║  ← Planets clustered
    ║   ★ ★★★★ ★   ║     in small area
    ║    ★ ★ ★ ★    ║
    ║      ★ ★ ★      ║
    ╚═════════════════╝
```

### After: Spacious Layout
```
ViewBox: (-2100, -2100) to (4100, 4100) = 6200x6200
Center: (2000, 2000)
Planet Scale: ±2000px (2.67x larger!)

    Massive Galactic Expanse
         ↓
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║      ★          ★                    ║
    ║                          ★           ║
    ║         ★    ○    ★                  ║  ← Planets spread out
    ║                 ★          ★         ║     with clear separation
    ║      ★                  ★            ║
    ║                ★                     ║
    ║          ★              ★            ║
    ║                                      ║
    ╚══════════════════════════════════════╝
```

## Coordinate System

### Old System
```
Point (0, 0) at center (400, 400)
Range: ±750px
Total span: 1500 x 1500px
Visual density: VERY HIGH
```

### New System
```
Point (0, 0) at center (2000, 2000)
Range: ±2000px
Total span: 4000 x 4000px
Visual density: LOWER (better spacing)
Planets per unit area: 2.67x fewer
```

## Sector Container Example

### Visual Representation
```
┌───────────────────────────────────────────┐
│ SECTOR-NAME                         [5]   │
│  ┌─────────────────────────────────────┐  │
│  │                                     │  │
│  │    ●  ●      ●    ●    ●           │  │
│  │                                     │  │
│  │      ●                  ●           │  │
│  │                                     │  │
│  │    ●          ●      ●              │  │
│  │                                     │  │
│  └─────────────────────────────────────┘  │
└───────────────────────────────────────────┘

Legend:
- Title: Sector name (e.g., "SOUTH-EAST")
- [5]: Planet count badge (number of planets in sector)
- Dashed box: Clickable sector boundary
- ●: Planets (color-coded by owner)
```

## Zoom Behavior

### Default View (Full Map)
```
[ViewBox Shows Entire Galaxy]
┌──────────────────────────────────────────────────┐
│                                                  │
│  [Sector 1]        [Sector 2]      [Sector 3] │
│   ● ● ●            ● ●              ● ● ●      │
│                                                  │
│  [Sector 4]        [Sector 5]      [Sector 6] │
│   ● ● ●            ● ●              ● ● ●      │
│                                                  │
└──────────────────────────────────────────────────┘

Controls: +  −  ⊙
Zoom: 100%
Action: Can click any sector to zoom in
```

### Zoomed to Sector
```
[ViewBox Shows Only Selected Sector + Padding]
┌──────────────────────────────────────────────────┐
│                                                  │
│        ▓▓▓ ▓▓▓                                   │
│       ▓ 01 ▓   ▓ 02 ▓                           │
│        ▓▓▓ ▓▓▓                                   │
│                                                  │
│       ▓ 03 ▓   ▓ 04 ▓                           │
│        ▓▓▓ ▓▓▓                                   │
│                                                  │
│       ▓ 05 ▓   ▓ 06 ▓                           │
│        ▓▓▓ ▓▓▓                                   │
│                                                  │
└──────────────────────────────────────────────────┘

Controls: +  −  ⊙ (Reset highlighted)
Zoom: 400%+
Action: Click ⊙ button to zoom back out
        or click sector border to deselect
```

## Sector Styles

### Unselected Sector
```
Border Color:      rgba(255, 179, 0, 0.15)  [Dim Orange]
Border Width:      1px
Border Style:      Dashed (8,4)
Label Color:       rgba(255, 179, 0, 0.4)   [Dim]
Label Size:        18px
Background:        rgba(255, 179, 0, 0.02)  [Subtle]
Badge Color:       Orange with dark bg
```

### Selected Sector
```
Border Color:      rgba(255, 179, 0, 0.8)   [Bright Orange]
Border Width:      2px (thicker!)
Border Style:      Dashed (8,4)
Label Color:       rgba(255, 179, 0, 0.9)   [Bright]
Label Size:        24px (bigger!)
Background:        rgba(255, 179, 0, 0.02)  [Same]
Badge Color:       Same
Visual State:      HIGHLIGHTED
Animation:         Smooth zoom to sector
```

## Color Reference

### Planet Ownership Colors
```
Human/Liberated      🟢  #00ff00 (Bright Green)
Terminid/Siege       🟡  #ffff00 (Bright Yellow)
Automaton            🔴  #ff0000 (Bright Red)
Illuminate           🟣  #9933ff (Bright Purple)
Neutral              ⚫  #999999 (Gray)
```

### UI Element Colors
```
Sector Borders       🟡  rgba(255, 179, 0, ...)
Orbital Rings        🟠  rgba(255, 179, 0, ...)
Connection Lines     🟢  rgba(102, 255, 0, ...)
Coordinate Center    🟠  rgba(255, 179, 0, ...)
```

## Interaction Flow

```
User opens Galactic Map
         ↓
[Full Map View]
  ├─ Can see all sectors
  ├─ Planets spread across large area
  └─ Sector boundaries visible
         ↓
User clicks sector
         ↓
[Animation: Zoom to Sector]
  ├─ ViewBox animates (300ms)
  ├─ Sector highlights in bright yellow
  ├─ Can now see details better
  └─ Other sectors fade from view
         ↓
User clicks sector again OR ⊙ button
         ↓
[Animation: Zoom back to Full Map]
  ├─ ViewBox animates back (360ms)
  ├─ All sectors visible again
  └─ Selection clears
         ↓
Can click different sector or
interact with individual planets
```

## Coordinate Transformation Examples

### Example Planet Position

**Raw API Data:**
```
position: { x: -0.5, y: 0.3 }
```

**Old Calculation:**
```
screenX = 400 + (-0.5 * 750) = 400 - 375 = 25
screenY = 400 - (0.3 * 750) = 400 - 225 = 175
Position: (25, 175) - clustered near left edge
```

**New Calculation:**
```
screenX = 2000 + (-0.5 * 2000) = 2000 - 1000 = 1000
screenY = 2000 - (0.3 * 2000) = 2000 - 600 = 1400
Position: (1000, 1400) - well-spaced across map
```

## Performance Impact

### Memory Usage
```
Before: Small viewBox, many dense interactions
After:  Large viewBox, same interaction density
Impact: ~0% (SVG scales to viewBox, not absolute size)
```

### Rendering Performance
```
Before: Tight clustering may cause visual aliasing
After:  Better spacing, cleaner rendering
Impact: Slight improvement (fewer Z-order conflicts)
```

### Zoom Performance
```
ViewBox transformation: O(1) instant
No element repositioning: Just transform matrix
No re-renders: CSS/SVG handles scaling
Impact: Smooth, no stuttering
```

## Browser Rendering

### ViewBox Transform (Efficient)
```
SVG viewBox: "x y width height"
Only attribute change, no DOM modification
Browser applies matrix transform
Cost: O(1), instant
Result: Smooth zoom effect
```

## Accessibility

### For Users
- ✅ Better planet visibility (less overlap)
- ✅ Easier to click specific planets (larger gaps)
- ✅ Sector grouping helps navigation
- ✅ Zoom provides detail + context

### For Developers
- ✅ Larger coordinates reduce floating-point artifacts
- ✅ Consistent scaling factor (2000px)
- ✅ Easy to adjust sector padding
- ✅ Clear center point reference

## Summary

| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| ViewBox Size | 1300x1300 | 6200x6200 | +4.8x |
| Planet Scale | ±750px | ±2000px | +2.67x |
| Center Point | (400, 400) | (2000, 2000) | Repositioned |
| Sectors | No visual grouping | Clickable containers | **NEW** |
| Zoom to Sector | N/A | Smooth animation | **NEW** |
| Default Zoom | 100% (full map) | 100% (full map) | Same |
| Spacing Quality | Clustered | Spacious | Better |
| Visual Clarity | Lower | Higher | Better |

---

**Key Benefit:** A vastly more spacious galactic map with interactive sector grouping for improved navigation and visual clarity.
