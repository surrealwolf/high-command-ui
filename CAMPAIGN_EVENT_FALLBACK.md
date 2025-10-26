# Campaign Details Enhancement - Missing Event Data

## Problem

Some campaigns have `event: null` - no active event data attached to them. This caused incomplete campaign details display:

**Example: RIRGA BAY (Planet Index 226)**
```json
{
  "id": 51319,
  "planet": {
    "currentOwner": "Illuminate",
    "event": null,  // ← No event data
    "statistics": {
      "playerCount": 133,
      "missionSuccessRate": 89
    }
  }
}
```

**Result:** Missing information in campaign card:
- No event type indicator
- No attacking faction displayed
- No progress bar
- Incomplete campaign context

## Solution

Added fallback information when event data is missing:

### 1. **Event Type Fallback**
```tsx
{activeCampaign.planet?.event?.eventType !== undefined ? (
  // Show: ⚔️ EVENT TYPE
) : (
  // Fallback: 🔴 STATUS: CONTESTED
)}
```

When no event exists, displays "CONTESTED" status instead.

### 2. **Attacking Faction Fallback**
```tsx
{activeCampaign.planet?.event?.faction ? (
  // Show: EVENT FACTION
) : activeCampaign.planet?.currentOwner && activeCampaign.planet?.currentOwner !== 'Humans' ? (
  // Fallback: CURRENT OWNER (if not human)
)}
```

When event faction missing, shows the planet's current owner as the attacking faction.

### 3. **Additional Campaign Context**
Added always-visible campaign information:
- **SECTOR:** Campaign planet's sector
- **BIOME:** Campaign planet's biome type

These provide context even when event data is absent.

## Updated Campaign Details Display

### With Event Data (Normal Case):
```
⭐ ACTIVE CAMPAIGN:
CAMPAIGN ID: 51319
⚔️ TYPE: ATTACK
ATTACKING FACTION: Illuminate
STARTED: 10/26/2025, 10:46:03 PM
EXPIRES: 10/27/2025, 10:46:03 PM
PROGRESS: ████░░░░░░ 40%
SECTOR: Rigel
BIOME: Acidic Badlands
👾 HELL DIVERS: 133
SUCCESS RATE: 89%
```

### Without Event Data (Fallback):
```
⭐ ACTIVE CAMPAIGN:
CAMPAIGN ID: 51319
🔴 STATUS: CONTESTED
ATTACKING FACTION: Illuminate
SECTOR: Rigel
BIOME: Acidic Badlands
👾 HELL DIVERS: 133
SUCCESS RATE: 89%
```

## Updated Campaign Details Order

1. Campaign ID
2. ⚔️ Event Type OR 🔴 Contested Status (always shows one)
3. Attacking Faction (from event or current owner)
4. Started timestamp (if event exists)
5. Expires timestamp (if event exists)
6. Progress bar (if event exists with health data)
7. Sector (always shows)
8. Biome (always shows)
9. 👾 Hell Divers count
10. Success Rate

## Benefits

1. **Complete Information** - Campaigns always display relevant details
2. **Graceful Degradation** - Works with or without event data
3. **Context Clues** - Sector/Biome provide planet identification
4. **Status Indication** - "CONTESTED" clearly indicates disputed territory
5. **Faction Attribution** - Always shows attacking faction from available sources

## Data Behavior

### Campaigns with Events:
- Full event timeline (started/expires)
- Event progress bar
- Event type indicator (ATTACK/DEFENSE/SABOTAGE)
- Event faction

### Campaigns without Events:
- CONTESTED status indicator
- Current owner as attacking faction
- Sector and biome context
- Player and success rate stats

## Code Changes

**File:** `src/components/MapView.tsx`

Added conditional rendering for:
1. Event type with fallback to status
2. Attacking faction with fallback to current owner
3. New fields: Sector and Biome

All fields gracefully handle missing data using optional chaining and conditional logic.
