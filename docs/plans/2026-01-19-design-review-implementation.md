# Design Review Implementation Plan

Based on forensic design review of Midnight Editorial theme.

## P0: Critical (This Session)

### 1. Shadow System (Remove Borders)
- [ ] Remove all default card borders
- [ ] Implement 3-tier shadow system:
  ```css
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2), 0 1px 1px rgba(0,0,0,0.14);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.15);
  --shadow-lg: 0 4px 8px rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.2);
  ```
- [ ] Critical alerts: glow effect `box-shadow: 0 0 0 1px #FF6B35, 0 4px 12px rgba(255,107,53,0.4)`

### 2. Orange Diet (Reduce 70%)
- [ ] Reserve orange ONLY for: primary CTAs, critical alerts, metrics above threshold
- [ ] Secondary buttons → ghost style: `border: 1px solid rgba(255,255,255,0.1)`
- [ ] Time indicators → muted gray `#6B7280`
- [ ] Checkmarks → subtle green `#10B981`
- [ ] Audit all orange usage and convert non-critical to neutral

### 3. Typography Hierarchy
- [ ] Greeting: weight 300, size 40px, letter-spacing +0.02em, remove period
- [ ] Implement strict type scale:
  ```css
  --text-xs: 12px;    /* timestamps, meta */
  --text-sm: 14px;    /* body, secondary */
  --text-base: 16px;  /* body, primary */
  --text-lg: 18px;    /* card titles */
  --text-xl: 24px;    /* section headers */
  --text-2xl: 32px;   /* greeting */
  --text-3xl: 40px;   /* primary greeting */
  ```

### 4. Calendar Block Legibility
- [ ] Increase block height from ~24px to 32px minimum
- [ ] Use 4px left border accent instead of full background fill
- [ ] Background: 10% opacity of accent color
- [ ] Text: #FFFFFF, font-weight 500
- [ ] Add time stamps in smaller gray text

## P1: High (Next Session)

### 5. Spacing Rhythm (8px Grid)
- [ ] Audit all spacing
- [ ] Card internal padding: 24px (3×8)
- [ ] Card-to-card spacing: 16px (2×8)
- [ ] Section spacing: 40px (5×8)
- [ ] All margins/paddings must be multiples of 8px

### 6. Health Metrics Upgrade
- [ ] Increase pill height from ~20px to 28px
- [ ] Add trend indicators: "↑ 12% from yesterday"
- [ ] Color coding: green=good, amber=attention, red=concern
- [ ] Better labels on hover/expansion

### 7. Task Card Variable Sizing
- [ ] High priority: full width, 80px height, bold title
- [ ] Medium: 60px height
- [ ] Low: 40px height, muted treatment (60% opacity)
- [ ] Deadline proximity affects glow:
  - <2 hours: red glow
  - <6 hours: amber accent
  - Today: default
  - Future: muted

### 8. Button Polish
- [ ] Primary buttons: gradient `linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)`
- [ ] Padding: 12px 24px
- [ ] Border-radius: 8px (less round)
- [ ] Shadow: `0 4px 14px rgba(255,107,53,0.4)`
- [ ] Hover: translateY(-1px) + enhanced shadow

## P2: Medium (Polish Pass)

### 9. Text Contrast System
- [ ] Define and enforce 4 text colors:
  ```css
  --text-primary: #FFFFFF;
  --text-secondary: #E5E5E5;
  --text-tertiary: #A3A3A3;
  --text-quaternary: #737373;
  ```

### 10. Border Radius Consistency
- [ ] Reduce card radius from ~12px to 6px (sharper, more premium)
- [ ] Two-tier system:
  ```css
  --radius-sm: 6px;   /* cards, inputs */
  --radius-md: 8px;   /* buttons, badges */
  ```

### 11. Icon Consistency
- [ ] Audit all icons (already using Lucide)
- [ ] Ensure consistent 20px in buttons, 16px in cards
- [ ] Match icon color to paired text color

### 12. Pulse Check Section
- [ ] Expand to full-width insights
- [ ] Show: "X items need attention, Y due in next 2 hours"
- [ ] Add progress ring: "12 of 18 completed today"
- [ ] Subtle gradient background

## Wins to Preserve
- ✓ Dark background (#0A0A0A range)
- ✓ Information architecture flow
- ✓ Critical alert concept (orange border)
- ✓ Time-based calendar organization
- ✓ Contextual action buttons
- ✓ Color psychology (orange=urgent, green=done)

## Success Metric
**Coffee Shop Test**: From "nice dashboard" to "holy shit, what is that?"
