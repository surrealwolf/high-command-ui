# Planet Events Priority Update

## Changes Made

### 1. Color Priority (Events > Campaigns > Status)
Updated the planet color logic to enforce event priority:
```
1. Planet.event exists      → Use event color (pink)
2. Campaign active          → Use campaign color (orange)
3. Neither                  → Use status color (green/red/purple)
```

### 2. Emoji Display Logic
- **Event Emoji (Top Left)** - Shows when planet has an active event (takes priority)
- **Campaign Emoji (Top Right)** - Shows only when planet has campaign BUT NO event
- Both emojis cannot show simultaneously on the same planet

### 3. Detail Card Display Order
The planet detail card now displays in this order:
1. **Basic Info** - Name, Index, Owner, Biome, Sector, Position
2. **Health** - Planet health bar and status
3. **Active Event** ⭐ **(PRIORITY - displays first)**
   - Mission Code
   - Attacking Faction
   - Event Type (ATTACK/DEFENSE/SABOTAGE)
   - Progress bar
   - Expiration time
4. **Active Campaigns** ⭐ **(displays after events)**
   - Campaign list
   - Indicator if on current planet
   - Attacking faction info
5. **Sector Info** - Related planets in sector
6. **Threat Level** - Planet threat rating

## Visual Indicators

### When Planet Has Event:
- Color: Pink (from `getEventColor()`)
- Top Left Emoji: Faction indicator (🐛🤖👾)
- Top Right: Empty
- Detail Card: Events section + Campaigns section

### When Planet Has Campaign (No Event):
- Color: Orange (#ff8800)
- Top Left Emoji: Empty
- Top Right Emoji: Campaign faction (🐛🤖👾)
- Detail Card: Campaigns section (no events section)

### When Planet Has Both:
- Color: Pink (event takes color priority)
- Top Left Emoji: Event emoji
- Top Right Emoji: Empty (event emoji takes precedence)
- Detail Card: Events first, then Campaigns below

## Campaign Data in Detail Card
The campaign display shows:
- Campaign name/title
- **Indicator**: "✓ ON THIS PLANET" if campaign targets this planet
- **Faction**: Attacking faction name from campaign.planet.event.faction

## Code Changes

### Color Priority Logic
```typescript
// Use event color (priority), then campaign color, then status color
let color: string
if (planet.event) {
  const eventColor = getEventColor(planet.event)
  color = eventColor || getStatusColor(status)
} else if (campaign) {
  color = '#ff8800'  // Orange for active campaign
} else {
  color = getStatusColor(status)
}
```

### Emoji Priority Logic
```typescript
// Campaign emoji only shows if NO event
{campaign && !planet.event && (
  <text {...}>
    {getCampaignEmoji(campaign)}
  </text>
)}

// Event emoji takes priority
{planet.event && (
  <text {...}>
    {getFactionEmoji(planet.event)}
  </text>
)}
```

### Detail Card Order
```typescript
// Events section (higher priority)
{selectedPlanet.event && (...)}

// Campaigns section (below events)
{activeCampaigns && activeCampaigns.length > 0 && (...)}
```

## Summary
Events now have clear priority over campaigns in all three areas:
1. **Color** - Event color overrides campaign color
2. **Emoji** - Event emoji blocks campaign emoji display
3. **Detail Card** - Events section displays above campaigns section

This ensures important active events are visually prominent while still displaying all relevant campaign information below.
