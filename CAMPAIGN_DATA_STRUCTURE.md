# Campaign Data Structure

## Overview
The `/api/campaigns/active` endpoint returns an array of 45+ active campaigns in the galactic war.

## Campaign Object Structure

```typescript
interface Campaign {
  id: number                    // Unique campaign ID (e.g., 51347)
  planet: {
    index: number              // Planet index (e.g., 183)
    name: string               // Planet name (e.g., "HORT")
    sector: string             // Sector name (e.g., "Rigel")
    biome: {
      name: string             // Biome name (e.g., "Plains")
      description: string      // Biome description
    }
    hazards: Array<{
      name: string             // Hazard name (e.g., "Ion Storms")
      description: string      // Hazard description
    }>
    position: {
      x: number               // X coordinate (-0.93 to 0.93)
      y: number               // Y coordinate (-0.93 to 0.93)
    }
    maxHealth: number          // Planet max health (e.g., 2200000)
    health: number             // Current planet health
    currentOwner: string       // Owner: "Humans", "Terminids", "Automaton", "Illuminate"
    initialOwner: string       // Starting owner
    regenPerSecond: number     // Health regen rate
    event?: {
      id: number              // Event/mission ID
      eventType: number       // 1=Attack, 2=Defense, 3=Sabotage
      faction: string         // Enemy faction
      health: number          // Event health
      maxHealth: number       // Event max health
      startTime: string       // ISO timestamp
      endTime: string         // ISO timestamp
      campaignId: number      // Links to campaign ID
      jointOperationIds: number[] // Related operation IDs
    } | null
    statistics: {
      missionsWon: number
      missionsLost: number
      missionTime: number
      terminidKills: number
      automatonKills: number
      illuminateKills: number
      bulletsFired: number
      bulletsHit: number
      timePlayed: number
      deaths: number
      revives: number
      friendlies: number
      missionSuccessRate: number
      accuracy: number
      playerCount: number
    }
    regions: Array<{
      id: number              // Region ID within planet
      name: string | null     // Region name
      health: number
      maxHealth: number
      size: string            // "Settlement", "Town", "City", "MegaCity"
      regenPerSecond: number
      availabilityFactor: number
      isAvailable: boolean
      players: number
    }>
  }
  type: number                // Campaign type (e.g., 0)
  count: number               // Campaign count/priority indicator
  faction: string             // Faction defending: "Humans"
}
```

## Example Campaign Data
```json
{
  "id": 51347,
  "planet": {
    "index": 183,
    "name": "HORT",
    "sector": "Rigel",
    "currentOwner": "Humans",
    "event": {
      "id": 5392,
      "eventType": 1,
      "faction": "Illuminate",
      "health": 1289089,
      "maxHealth": 1600000,
      "endTime": "2025-10-27T22:46:03Z"
    },
    "statistics": {
      "playerCount": 22,
      "missionsWon": 1007803,
      "missionSuccessRate": 88
    }
  },
  "type": 0,
  "count": 7,
  "faction": "Humans"
}
```

## Key Fields for Display

### Campaign Identification
- `id`: Unique campaign ID
- `planet.name`: Planet name (e.g., "HORT")
- `planet.sector`: Sector name (e.g., "Rigel")

### Combat Status
- `planet.currentOwner`: Who controls the planet
- `planet.health / planet.maxHealth`: Planet defense level
- `event.faction`: Enemy faction attacking
- `event.health / event.maxHealth`: Attack/defense progress

### Player Activity
- `planet.statistics.playerCount`: Defenders on planet
- `planet.statistics.missionSuccessRate`: Win rate

### Time Info
- `event.startTime`: Campaign start
- `event.endTime`: Campaign deadline

## Display Recommendation

For the Galactic Map, campaigns should be displayed showing:
1. **Campaign List**: All active campaigns with planet name and defending faction
2. **Campaign Filter**: Highlight campaigns on the selected planet
3. **Progress Bars**: Show planet health and event progress
4. **Player Count**: Show current defenders and mission success rate

### Example Display Format
```
⭐ ACTIVE CAMPAIGNS (45 total)
─────────────────────────────
🌍 HORT (Rigel Sector)
   👥 22 defenders | 🔴 Illuminate attacking
   ████████░░ 80% | Expires: 2025-10-27

🌍 FENMIRE (Marspira Sector) 
   👥 6016 defenders | 🤖 Automaton attacking
   ██████████ 99% | Expires: 2025-10-28

[More campaigns...]
```
