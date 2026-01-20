# CLAUDE.md — Daily Pulse

> Personal life dashboard. Premium feel, minimal fuss.

---

## Project Context

- **Stack:** Next.js 16 (App Router, Turbopack), Tailwind CSS, Lucide icons, Framer Motion, date-fns
- **Integrations:** OpenAI (AI insights), Google APIs (Calendar/Gmail)
- **Repo:** `github.com/amwoods44/daily.git` (main branch)
- **Local:** `/Users/aaronwoods/Code/daily-pulse`

### Key Files
| File | Purpose |
|------|---------|
| `globals.css` | All design tokens and utility classes |
| `lib/themes.ts` | 5 theme definitions |
| `lib/mock-data.ts` | Demo data |

### Design Vibe
Apple minimalism + editorial luxury + modern dashboard (Linear/Vercel). Every pixel intentional.

---

## Styling Rules

**Use CSS custom properties for colors — never hardcode.**

```tsx
// ❌ Nope
<div className="bg-gray-100 text-gray-900">

// ✅ Yes
<div className="bg-[var(--bg-card)] text-[var(--text-primary)]">

// ✅ Even better — use existing classes from globals.css
<div className="premium-card">
```

**Check globals.css first** for existing utility classes before writing custom styles.

**Must work in both light and dark themes.**

---

## Git Protocol

**After completing work:**
1. `git add -A`
2. `git commit -m "message"`
3. `git push origin main`
4. Confirm: "Pushed to GitHub"

**Commit format:**
```
Short description -- 1/19/2026 at 2:31 PM

- Detail if needed
```

Always include the timestamp in Central Time (Chicago) using 12-hour format with AM/PM.
Note: System is UTC. Central = UTC-6 (CST, winter) or UTC-5 (CDT, summer).

---

## When Uncertain

If intent is clear → just do it, note any assumptions with `[ASSUMPTION]`

If genuinely unclear → ask one focused question, then execute

---

## Plan Mode

- Keep plans scannable: bullets, clear structure, no fluff
- Lead with the approach, then key decisions/trade-offs
- End with unresolved questions requiring your input

---

## Quality Check

Before delivering, verify:
- [ ] Uses CSS custom properties (no hardcoded colors)
- [ ] Works in dark mode
- [ ] Has loading/error states for async stuff
- [ ] Interactive elements have hover states
- [ ] TypeScript compiles (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Git committed and pushed

---

## Proactive Enhancement Radar

While working on any task, actively look for:
- **Quick wins:** Things that take <5 min extra but significantly improve the result
- **Tech debt:** Code smells or patterns that will cause pain later
- **UX friction:** Flows that technically work but feel clunky
- **Missing states:** Loading, empty, error states that weren't requested but should exist
- **Accessibility gaps:** Keyboard nav, contrast, screen reader issues

Surface at the end of every response:
```
**While I was in there:**
- [Enhancement] Could add hover preview on timeline items (S effort)
- [Gap] No empty state if user has no events
- [Quick win] Loading skeleton doesn't match actual content shape
```

Don't wait to be asked. Flag it, size it, let Aaron decide.

---

## Pre-flight Validation

Before delivering ANY code, verify:
- [ ] TypeScript: No type errors, proper typing, no untyped `any`
- [ ] Imports: All imports exist and paths are correct
- [ ] Hooks: Called at top level, not conditionally
- [ ] Dependencies: useEffect/useCallback/useMemo deps are complete
- [ ] Null safety: Optional chaining where data might be undefined
- [ ] Key props: Arrays have stable, unique keys (not index)

Include in response:
```
**Pre-flight:** ✓ Types ✓ Imports ✓ Hooks ✓ Null-safe
```

If uncertain:
```
**Pre-flight:** ✓ Types ✓ Imports ⚠️ Hooks (useEffect deps may need review)
```

---

## Blast Radius Protocol

Before modifying shared code (components, hooks, utilities, styles), assess impact:

### Blast Radius Sizing
| Size | Description | Action |
|------|-------------|--------|
| **Small** | Single file, no external dependents | Proceed |
| **Medium** | 2-5 files affected, same feature area | Note affected files, proceed |
| **Large** | 6+ files, crosses feature boundaries | List all affected, confirm approach |
| **Critical** | globals.css, theme, shared types, lib utilities | Full impact audit before touching |

### Before Modifying Shared Code
1. Identify everything that imports/uses it
2. Check if changes break the contract (props, types, behavior)
3. Size the blast radius
4. For Large/Critical: list affected files and confirm approach

```
**Blast radius:** MEDIUM
Modifying `useTheme` hook — used in:
- `VisualTimelineBar.tsx`
- `UnifiedItem.tsx`
- `AIBriefingCard.tsx`
Return type unchanged, adding optional param. Safe to proceed.
```

### After Modifying Shared Code
Verify nothing broke:
- [ ] All importing files still type-check
- [ ] No runtime errors in affected components
- [ ] Behavior unchanged for existing usage

If blast radius was underestimated:
```
**Blast radius update:** Found additional usage in `WeekInReview` — updated.
```

---

## Ripple Effect Awareness

Before modifying a component, hook, or utility:
1. Identify what imports/uses it
2. Check if changes affect the contract (props, return type, behavior)
3. Flag breaking changes before implementing

```
**Ripple check:** `VisualTimelineBar` is used in:
- `app/page.tsx` (main dashboard)
- `app/morning/page.tsx` (morning view)
Prop change will require updates to both. Proceeding.
```

If the ripple is large, pause and confirm approach.

---

## Blind Spot Alerts

Proactively flag these even when not asked:

**Edge cases:**
- What if data is empty? null? malformed?
- What if array has 1 item? 100 items?
- What if text is very long? Very short?

**Responsive:**
- Does this break on mobile? (< 640px)
- Touch targets at least 44x44px?

**Accessibility:**
- Can you tab through it?
- Does it announce to screen readers?
- Sufficient color contrast?

**Performance:**
- Unnecessary re-renders?
- Large bundle additions?
- Layout shifts?

Flag with:
```
**Blind spot:** This list has no max-height — 50+ items will blow out the layout
```

---

## Ambient Improvement Mode

While working in a file, fix small issues encountered:
- Typos in comments or strings
- Inconsistent formatting
- Unused imports
- Missing TypeScript types (implicit `any`)
- Console.logs left behind
- Commented-out dead code

Don't ask permission. Fix and note:
```
**Ambient fixes while I was in there:**
- Removed unused `useState` import
- Fixed typo: "recieve" → "receive"
- Added explicit return type to `formatTime()`
```

Keep the main task focused. These are drive-by cleanups, not scope creep.

---

## Theme Parity

Before delivering any visual change, verify:
- [ ] Light theme: contrast, readability, shadows visible
- [ ] Dark theme: no white flashes, borders visible, accent pops

If a style only works in one theme, flag it and propose a solution — don't deliver broken.

---

**Last Updated:** 2026-01-19
