# Campaign Integration - Complete Implementation Guide

## Overview

This document consolidates the campaign system implementation for the High Command UI galactic map. Campaigns represent active military operations on planets and are displayed with visual indicators and detailed information cards.

## Data Structure

### Campaign Object (from `/api/campaigns/active`)
```typescript
{
  id: number,           // Unique campaign ID
  faction: string,      // Defending faction (e.g., "Humans")
  type: number,         // Campaign type code
  count: number,        // Campaign count/value
  planet: {
    index: number,      // Planet index for matching
    name: string,       // Planet name
    currentOwner: string,  // Current controlling faction
    sector: string,     // Sector name
    biome: {
      name: string,     // Biome type
      description: string
    },
    hazards: Array<{    // Environmental hazards
      name: string,
      description: string
    }>,
    event: {            // Active event (can be null)
      id: number,
      eventType: 1|2|3, // 1=ATTACK, 2=DEFENSE, 3=SABOTAGE
      faction: string,  // Attacking faction
      health: number,
      maxHealth: number,
      startTime: string,  // ISO timestamp
      endTime: string,    // ISO timestamp
      campaignId: number
    } | null,
    statistics: {       // Campaign statistics
      playerCount: number,      // Hell Divers count
      missionSuccessRate: number // Success percentage
    },
    health: number,
    maxHealth: number
  }
}
```

## Visual Implementation

### Campaign Indicators on Map

#### 1. **Pulsing Ring Animation**
- Applied to planets with active campaigns
- Uses faction color from currentOwner or event faction
- 2-second animation cycle with opacity/radius variation
- Non-intrusive visual indicator

#### 2. **Campaign Emoji**
- **Position**: Top-right of planet (when no event)
- **Priority**: Event emoji takes top-right when both present
- **Display**: Faction-specific emoji
  - 🐛 Terminids
  - 🤖 Automaton
  - 👁️ Illuminate
  - 👨 Humans (fallback)
- **Source**: Uses `event.faction` first, falls back to `currentOwner`

#### 3. **Event Emoji (Higher Priority)**
- **Position**: Top-left of planet
- **Display**: Faction emoji for attacking force
- Takes precedence over campaign emoji for space

### Campaign Detail Card

Displayed when planet is selected and has an active campaign.

#### When Event is Active
Shows campaign-specific data only (avoids duplication):
- **CAMPAIGN ID**: Campaign identifier
- **HELL DIVERS**: Player count defending the planet
- **SUCCESS RATE**: Mission success percentage

Event data (TYPE, FACTION, TIMELINE, PROGRESS) shown in separate "ACTIVE EVENT" section above.

#### When No Event Exists (Contested Campaign)
Shows complete campaign information:
- **CAMPAIGN ID**: Campaign identifier
- **STATUS**: "CONTESTED" badge
- **FACTION**: Attacking faction (from currentOwner)
- **STARTED**: Campaign start timestamp
- **EXPIRES**: Campaign deadline
- **PROGRESS**: Campaign progress bar
- **HELL DIVERS**: Player count
- **SUCCESS RATE**: Mission success percentage

### Planet Detail Card - Base Information

Reorganized field order for clarity:
1. **STATUS**: Current owner with faction-specific color
2. **INDEX**: Planet index number
3. **SECTOR**: Sector location
4. **BIOME**: Biome type
5. **HAZARDS**: Environmental hazards
6. **POSITION**: Coordinates
7. **HEALTH**: Planet health bar with current/max values
8. **ACTIVE EVENT** (if present): Event details
9. **ACTIVE CAMPAIGN** (if present): Campaign details

## Implementation Details

### Data Flow

```
API (/api/campaigns/active)
  ↓
loadCampaigns() [MapView.tsx]
  ↓
activeCampaigns state
  ↓
getPlanetCampaign(planet) - matches by planet.index
  ↓
Campaign detail card display
```

### Key Functions

#### getCampaignEmoji(campaign)
Returns faction emoji based on priority:
1. `campaign.planet?.event?.faction` - Event faction if present
2. `campaign.planet?.currentOwner` - Fallback to planet owner
3. Returns emoji or '⭐' as fallback

#### getPlanetCampaign(planet)
Finds active campaign for selected planet:
```typescript
return activeCampaigns?.find(
  (campaign: any) => campaign.planet?.index === planet.index
)
```

#### getStatusColor(status)
Maps planet status to color for visual display:
- 'liberated' → Green (#00ff00)
- 'under-siege' → Yellow (#ffff00)
- 'contested-automaton' → Red (#ff0000)
- 'contested-illuminate' → Purple (#9933ff)
- 'neutral' → Gray (#999999)

### Campaign Display Logic

**When event AND campaign both exist:**
- Event section shows all event details
- Campaign section shows campaign-specific data only
- NO duplicate data (type, faction, timeline, progress)

**When only campaign exists (no event):**
- Campaign section shows all campaign details
- Includes type, faction, timeline, and progress
- Shows "CONTESTED" status

### Emoji Mapping

```typescript
const factionEmojis: Record<string, string> = {
  'Terminids': '🐛',
  'Automaton': '🤖',
  'Automatons': '🤖',
  'Illuminate': '👁️',
  'Humans': '👨'
}
```

## CSS Classes and Animations

### Campaign Pulsing Animation
```css
@keyframes campaign-pulse {
  0%   { r: 20px; opacity: 0.6; stroke-width: 2px; }
  50%  { r: 28px; opacity: 0.2; stroke-width: 1px; }
  100% { r: 20px; opacity: 0.6; stroke-width: 2px; }
}

.planet-campaign-pulse {
  animation: campaign-pulse 2s ease-in-out infinite;
}
```

### Detail Card Styling
- `.campaign-details`: Container for campaign information
- `.campaign-detail`: Individual campaign detail row
- `.campaign-label`: Label styling
- `.campaign-value`: Value styling
- `.campaign-health-bar`: Progress bar container
- `.campaign-health-fill`: Progress fill visual

## Error Handling

### Fallback Behavior
- **Missing event data**: Shows "CONTESTED" status
- **Missing faction**: Uses currentOwner as fallback
- **Missing emoji**: Returns '⭐' star emoji
- **No campaign**: Campaign section not displayed

## Performance Notes

- Campaigns loaded once on component mount
- Auto-refresh every hour (configurable)
- Efficient index-based planet matching
- No duplicate data in detail cards

## Testing Checklist

- [ ] Campaign emoji displays correctly for all factions
- [ ] Pulsing ring animation visible on campaign planets
- [ ] Campaign detail card shows when planet selected
- [ ] No duplicate data when event exists
- [ ] Fallback display works when no event data
- [ ] All timestamps format correctly
- [ ] Hell Divers count displays
- [ ] Success rate percentage shows
- [ ] Color coding correct for all statuses
- [ ] Build passes without errors

## Related Files

- `src/components/MapView.tsx` - Main campaign display logic
- `src/components/MapView.css` - Campaign styling and animations
- `src/services/api.ts` - API integration (`getActiveCampaigns()`)
- `src/App.tsx` - Help section with campaign terminology
- `src/components/DataDisplay.tsx` - Data console display
