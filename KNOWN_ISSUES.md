# Known Issues

## Turbopack CSS Parsing Error (Dev Mode)

**Status:** Workaround available
**Affects:** `npm run dev` only
**Production:** ✅ Not affected

### Issue
Development server shows CSS parsing error:
```
⨯ ./src/app/globals.css:1372:18
Parsing CSS source code failed
.text-\[var\(--\.\.\.\)\] {
    color: var(--...);
          ^-- Unexpected token Delim('.')
```

### Root Cause
Turbopack's CSS parser encounters a generated utility class `text-[var(--...)]` with literal dots. This appears to be a Tailwind JIT generation issue where a className pattern in the source code causes this invalid CSS to be generated.

### Workaround
Use production build for development:
```bash
npm run build && npm start
```

Or use production mode (slower but stable):
```bash
# Temporarily in package.json
"dev": "next build && next start"
```

### Technical Notes
- Production builds (`npm run build`) succeed with only a warning
- Error occurs in generated CSS, not source code
- Extensive search did not locate the exact source pattern causing this
- Likely a Turbopack-specific strictness issue vs Webpack
- The pattern `text-[var(--...)]` appears to be generated from scanning className attributes
