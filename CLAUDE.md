# Daily Pulse

A personal life dashboard that shows what your day looks like, what's pressing, and what needs attention - designed to feel like a premium editorial publication.

## Git Workflow (IMPORTANT - Claude handles this)

**Claude: You are responsible for ALL git operations. The user should never have to run git commands.**

### Automatic Behaviors

1. **After completing any significant work** (new feature, bug fix, design change):
   - Stage all changes: `git add -A`
   - Commit with descriptive message
   - Push to origin: `git push origin main`
   - Tell the user it's been saved to GitHub

2. **At the start of a session**, if user mentions pulling or syncing:
   - Run `git pull origin main` to get latest
   - Run `npm install` if package.json changed
   - Restart dev server if needed

3. **Commit message format**:
   ```
   Short description of what changed -- 1/19/2026 at 2:31 PM

   - Bullet points for details if needed

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```
   Always include the timestamp in the first line using 12-hour format with AM/PM.

### Repository Info
- **Local folder**: `/Users/aaronwoods/Code/daily-pulse`
- **Remote**: `github.com/amwoods44/daily.git`
- **Branch**: `main` (single branch workflow)

### If user asks about git/saving/syncing:
Just do it. Don't explain git concepts unless asked. Run the commands and confirm "Saved and pushed to GitHub" or "Pulled latest from GitHub".

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS + CSS custom properties
- **Icons**: Lucide React
- **State**: React hooks + Context (no external state library)

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Main dashboard
│   ├── globals.css        # Design system + all styles
│   ├── morning/           # Morning routine page
│   ├── weekly/            # Weekly view
│   ├── vault/             # Life admin vault
│   └── settings/          # User settings
├── components/
│   ├── life-pulse/        # Status orbs strip component
│   ├── timeline/          # Visual day timeline
│   ├── temporal/          # Time-bucketed items
│   ├── ui/                # Shared UI components
│   └── theme/             # Theme provider + switcher
└── lib/
    ├── themes.ts          # Theme definitions (5 themes)
    ├── mock-data.ts       # Demo data
    └── ai-briefing.ts     # AI summary generation
```

## Design System

### Philosophy
Blend of Apple minimalism + editorial luxury + modern dashboard (Linear/Vercel). Every pixel must feel **intentional**.

### Typography Scale (Major Third - 1.25 ratio)
```
10px  - .text-overline (uppercase labels)
11px  - .text-label (section labels)
12px  - .text-caption
13px  - .text-body-sm
15px  - body default
17px  - h4
20px  - h3
30px  - h2
38px  - h1
48px  - .text-display
```

**Key rule**: Negative letter-spacing on large text, positive on small text.

### Spacing Scale (4px base)
```css
--space-1: 4px    --space-8: 32px
--space-2: 8px    --space-10: 40px
--space-3: 12px   --space-12: 48px
--space-4: 16px   --space-16: 64px
--space-5: 20px   --space-20: 80px
--space-6: 24px
```

### CSS Classes

**Cards**:
- `.premium-card` - Standard card with layered shadow
- `.premium-card-lg` - Large card (briefing sections)
- `.hero-focus-card` - Accent-bordered hero card

**Layout**:
- `.container-premium` - Max 1200px centered container
- `.grid-premium-2` - 2-column grid (1024px+)
- `.grid-premium-3` - 3-column grid (1280px+)
- `.stack-xs/sm/md/lg/xl` - Vertical spacing utilities

**Typography**:
- `.text-label` - 11px uppercase, 0.06em tracking
- `.text-overline` - 10px uppercase, 0.1em tracking
- `.text-number` - Tabular nums for alignment

**Section Headers**:
- `.section-header` - Flex container with line
- `.section-header-label` - Has accent bar before
- `.section-header-badge` - Pill-style count

### Themes (in `lib/themes.ts`)
1. **Ink & Paper** - Warm editorial (light, default)
2. **Morning Fog** - Nordic calm (light)
3. **Midnight Editorial** - Dark dramatic
4. **Sage Garden** - Organic green (light)
5. **Deep Ocean** - Modern depth (dark)

All colors via CSS custom properties: `var(--text-primary)`, `var(--bg-card)`, etc.

### Easing Curves
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## Key Components

### Life Pulse Strip (`/components/life-pulse/`)
Horizontal strip showing life status at a glance with colored orbs:
- Green = good
- Amber = attention needed
- Red = urgent

Click to expand detail cards in place.

### Visual Timeline Bar (`/components/timeline/`)
Day visualization showing meetings, focus blocks, breaks. Red marker shows current time.

### View Mode Toggle (`/components/ui/ViewModeToggle.tsx`)
Three modes: Minimal | Curated | Full. Stored in context.

## Conventions

### Styling
- **Prefer CSS custom properties** over Tailwind for colors/spacing
- **Inline styles** acceptable for dynamic/component-specific styling
- **All global styles** in `globals.css` (no CSS modules)
- **Dark mode** via `.dark` class (set by ThemeProvider)

### Components
- Use `'use client'` directive for interactive components
- Colocate component + types in same file
- Export via `index.ts` barrel files

### Data Flow
- Mock data in `lib/mock-data.ts` for development
- AI briefing generation in `lib/ai-briefing.ts`
- Temporal bucketing in `lib/temporal-buckets.ts`

## Running

```bash
npm run dev    # Dev server (usually port 3000)
npm run build  # Production build
```

## Design Decisions

1. **Progressive disclosure** - Click to expand, not navigate away
2. **Status at a glance** - Colored orbs communicate before you read
3. **Time context** - Always show WHEN something matters, not just what
4. **Three view modes** - User controls information density
5. **No emoji unless requested** - Clean, typographic aesthetic
