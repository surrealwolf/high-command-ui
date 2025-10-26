# Campaign Details Display Update

## Changes Made

### 1. Campaign Display Changed to Detailed View
**Before:**
- Showed a list of all active campaigns in the system
- Displayed only basic info (name, faction, planet indicator)

**After:**
- Shows ONLY the active campaign for the selected planet
- Displays as detailed information similar to event details
- Only renders if the selected planet has an active campaign

### 2. Campaign Information Displayed

For the active campaign on the selected planet, the detail card now shows:

#### Campaign Identification
- **Campaign ID** - Unique identifier for the campaign
- **Planet Name** - Planet targeted by campaign
- **Attacking Faction** - Enemy faction (Terminids, Automaton, Illuminate)
- **Type** - ATTACK, DEFENSE, or SABOTAGE

#### Campaign Progress
- **Planet Health** - Overall planet health with progress bar
- **Campaign Progress** - Attack/defense progress with progress bar
- **Expires** - Campaign deadline timestamp

#### Combat Statistics
- **Defenders** - Number of active players defending
- **Success Rate** - Mission win percentage

### 3. Code Implementation

```typescript
{(() => {
  const activeCampaign = activeCampaigns?.find(
    (campaign: any) => campaign.planet?.index === selectedPlanet.index
  )
  return activeCampaign ? (
    <div className="detail-row campaign-info">
      {/* Campaign details display */}
    </div>
  ) : null
})()}
```

### 4. CSS Styling

Added campaign-specific styling to match event display:

```css
.detail-row.campaign-info {
  background: rgba(255, 136, 0, 0.08);  /* Orange background */
  padding: 8px 6px;
  border: 1px solid rgba(255, 136, 0, 0.3);
  margin-top: 4px;
  flex-direction: column;
  align-items: stretch;
}

.campaign-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campaign-detail {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 11px;
  padding: 4px 0;
}

.campaign-label {
  color: rgba(255, 179, 0, 0.8);
  min-width: 90px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.campaign-value {
  color: #ffb300;
  flex: 1;
}

.campaign-health-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 136, 0, 0.2);
  position: relative;
  min-width: 80px;
}

.campaign-health-fill {
  height: 100%;
  transition: width 0.3s ease;
}
```

## Detail Card Display Order

1. **Planet Info** - Name, index, owner, biome, sector, position
2. **Planet Health** - Health bar and stats
3. **Active Event** (if exists)
4. **Active Campaign** (if exists for this planet) ⭐ NEW
   - Only shows one campaign (for the selected planet)
   - Displays as detailed information, not a list
   - Shows full campaign stats and progress
5. **Sector Info** - Related planets
6. **Threat Level** - Threat rating

## Behavior

### When Planet Selected:
- If planet has an active campaign → Campaign details section displays
- If planet has NO active campaign → Campaign details section hidden
- Campaign details only show for campaigns matching `selectedPlanet.index`

### Campaign Details Include:
- All relevant information from `campaign.planet` object
- Event details from `campaign.planet.event`
- Statistics from `campaign.planet.statistics`
- Health bars for both planet and campaign progress

## Benefits

1. **Cleaner UI** - No longer shows irrelevant campaign list
2. **Focused Information** - Only shows campaign relevant to selected planet
3. **Detailed View** - Full campaign information displayed similar to events
4. **Better UX** - Consistent styling and layout with event details
