# Campaign Visualization Updates

## Changes Made to Galactic Map

### 1. Planet Color Priority
Updated the planet color logic to use a priority system:
1. **Orange (#ff8800)** - If planet has an active campaign
2. **Event Color** (Pink/Hot Pink) - If planet has an active event
3. **Status Color** (Green/Yellow/Red/Purple) - Based on owner/controller

### 2. New Functions Added

#### `getPlanetCampaign(planet)`
- Finds and returns the active campaign for a planet
- Compares `campaign.planet.index` with `planet.index`
- Returns `null` if no campaign found

#### `getCampaignEmoji(campaign)`
- Returns appropriate emoji based on attacking faction:
  - `🐛` - Terminids
  - `🤖` - Automaton/Automatons
  - `👾` - Illuminate
  - `⭐` - Default/Unknown

### 3. Visual Indicators

#### Campaign Emoji Placement
- **Top Right** (+35, -35) from planet center
- Displayed only when planet has active campaign
- Shows attacking faction with appropriate emoji
- Includes glow effect (orange shadow)

#### Planet Color
- Planets with active campaigns appear in **orange** (#ff8800)
- Orange glow effect around the planet
- CSS class `planet-campaign` adds shadow effect

### 4. CSS Updates

```css
.planet-campaign-emoji {
  /* Campaign emoji indicator - top right */
  pointer-events: none;
  font-size: 20pt;
  opacity: 1;
  transition: font-size 0.2s, opacity 0.2s;
  filter: drop-shadow(0 0 4px rgba(255, 136, 0, 0.6));
}

.planet-campaign {
  /* Styling for planets with active campaigns */
  filter: drop-shadow(0 0 8px rgba(255, 136, 0, 0.6));
}
```

### 5. Campaign Details Display

The campaign information is already displayed in the planet details panel showing:
- List of all active campaigns
- Indicator when campaign is on selected planet
- Campaign type information

## Visual Example

When a planet has an active campaign:
```
        🐛 ← Campaign emoji (top right)
    ●○●○●
   ●      ●
  ●   HORT   ●  ← Orange planet with glow
   ●        ●
    ●○●○●
```

## Campaign Detection
Campaigns are matched to planets using:
- `campaign.planet.index === planet.index`

This allows the UI to:
1. Change planet color to orange when campaign is active
2. Display appropriate faction emoji
3. Show full campaign details in the side panel

## Integration
- Works alongside existing event indicators
- Event emoji shows on TOP LEFT if no campaign
- Campaign emoji shows on TOP RIGHT when campaign active
- Orange color takes precedence over event colors for visibility
