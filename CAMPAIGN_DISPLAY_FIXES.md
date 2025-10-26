# Campaign Display Fixes

## Issues Fixed

### 1. **Removed Duplicate "CAMPAIGN PROGRESS:" Label**
- **Issue:** Progress bar was shown twice - once as "PROGRESS:" and once as "CAMPAIGN PROGRESS:"
- **Fix:** Removed the duplicate "CAMPAIGN PROGRESS:" section, keeping only "PROGRESS:"
- **Result:** Single, clean progress bar display for campaign progress

### 2. **Campaign Details Display for All Planets with Campaigns**
- **Issue:** Campaign info was only showing for planets that also have active events
- **Fix:** Updated campaign display logic to work independently of planet events
  - Campaign details now display whenever `activeCampaigns?.find()` finds a matching campaign
  - Doesn't depend on `planet.event` existing
  - All conditional fields within campaign details check for their own existence with `?.` and `!== undefined`

## Campaign Detail Card Display Order (Updated)

```
Campaign Details (Final):
1. Campaign ID
2. ⚔️ Event Type (with emoji) - if available
3. Attacking Faction - if available
4. Started (timestamp) - if available
5. Expires (timestamp) - if available
6. Progress (bar + numbers) - if available
7. 👾 Hell Divers (player count) - if available
8. Success Rate (percentage) - if available
```

## Key Code Changes

### Removed Duplicate
```tsx
// REMOVED - was creating duplicate display:
{activeCampaign.planet?.event?.health !== undefined && 
 activeCampaign.planet?.event?.maxHealth && (
  <div className="campaign-detail">
    <span className="campaign-label">CAMPAIGN PROGRESS:</span>
    {/* duplicate progress bar */}
  </div>
)}
```

### Campaign Display Logic
```tsx
// Shows campaign details for ANY planet with an active campaign
const activeCampaign = activeCampaigns?.find(
  (campaign: any) => campaign.planet?.index === selectedPlanet.index
)

// Display shows if campaign found, regardless of whether planet has event
return activeCampaign ? (
  <div className="detail-row campaign-info">
    {/* Campaign details display */}
  </div>
) : null
```

### Conditional Fields
Each field now properly checks for existence:
```tsx
// Only displays if eventType exists (not just if planet.event exists)
{activeCampaign.planet?.event?.eventType !== undefined && (
  <div className="campaign-detail">
    {/* Display eventType */}
  </div>
)}

// Only displays if faction exists
{activeCampaign.planet?.event?.faction && (
  <div className="campaign-detail">
    {/* Display faction */}
  </div>
)}

// And so on for all fields...
```

## Expected Behavior

### Before Fix:
- Only planets with BOTH events AND campaigns showed campaign details
- Planets with campaigns but no events showed no campaign info
- Progress bar was duplicated

### After Fix:
- ALL planets with active campaigns show campaign details
- Whether or not the planet has an event
- Single, clean progress bar
- All fields gracefully handle missing data

## Testing

To verify the fix works:
1. Select a planet with a campaign but NO event
   - Should now see "⭐ ACTIVE CAMPAIGN:" section
   - Should see campaign details (ID, faction, times, etc.)
   - Should see progress bar
   
2. Select a planet with BOTH event and campaign
   - Event displays first (takes priority)
   - Campaign displays below event
   - No duplicate progress bars
   
3. Look at planet visual indicators
   - Planets with events: emoji on top left
   - Planets with campaigns (no events): emoji on top right + pulsing ring
   - Planets with both: event emoji only on top left

## Notes

- Campaign data structure includes `planet.event` object for all active campaigns
- Each field in campaign display checks for its own existence
- The `getPlanetCampaign()` function correctly matches campaigns to planets by index
- Campaign display is independent of whether the planet has an active event
