import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Custom ESLint rule to prevent hardcoded Tailwind color classes.
 *
 * Per CLAUDE.md styling rules:
 * - Use CSS custom properties for colors — never hardcode
 * - ❌ Nope: bg-gray-100, text-gray-900, bg-white
 * - ✅ Yes: bg-[var(--bg-card)], text-[var(--text-primary)]
 *
 * This rule catches patterns like:
 * - bg-white, bg-black, bg-{color}-{shade}
 * - text-white, text-black, text-{color}-{shade}
 * - border-{color}-{shade}
 * - ring-{color}-{shade}
 * - fill-{color}-{shade}, stroke-{color}-{shade}
 * - from-{color}-{shade}, via-{color}-{shade}, to-{color}-{shade} (gradient stops)
 *
 * It does NOT flag:
 * - CSS variable patterns: bg-[var(--...)], text-[var(--...)]
 * - Opacity modifiers on black/white overlays: bg-black/50 (intentional for modals)
 * - Non-color utilities: bg-gradient-to-r, text-center, border-2
 */

// Tailwind color names (excluding white/black which are handled separately)
const tailwindColors = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"
].join("|");

// Regex pattern to match hardcoded color classes
// Matches: bg-white, bg-black, bg-gray-100, text-stone-900, border-slate-200, etc.
// Does NOT match: bg-black/50 (opacity variant), bg-[var(--...)], bg-gradient-to-r
const hardcodedColorPattern = new RegExp(
  // Match the utility prefix
  `\\b(bg|text|border|ring|fill|stroke|from|via|to)-` +
  // Match either:
  // 1. white or black (without opacity modifier like /50)
  // 2. A color name followed by a shade number
  `((?:white|black)(?![/\\d])|(?:${tailwindColors})-\\d{2,3})\\b`,
  "g"
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Custom rules for Daily Pulse styling standards
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Prevent hardcoded Tailwind color classes
      // Use CSS custom properties instead: bg-[var(--bg-card)]
      "no-restricted-syntax": [
        "warn",
        {
          selector: `Literal[value=/${hardcodedColorPattern.source}/]`,
          message:
            "Hardcoded Tailwind color classes are not allowed. " +
            "Use CSS custom properties instead: bg-[var(--bg-card)], text-[var(--text-primary)]. " +
            "See CLAUDE.md styling rules."
        },
        {
          selector: `TemplateElement[value.raw=/${hardcodedColorPattern.source}/]`,
          message:
            "Hardcoded Tailwind color classes are not allowed. " +
            "Use CSS custom properties instead: bg-[var(--bg-card)], text-[var(--text-primary)]. " +
            "See CLAUDE.md styling rules."
        }
      ]
    }
  }
]);

export default eslintConfig;
