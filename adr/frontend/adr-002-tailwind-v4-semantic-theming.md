# ADR 002: Tailwind v4 Native Semantic Theming (Zero-React-State Dark Mode)

**Status:** Accepted  
**Date:** 2026-08-22  
**Context:** Frontend (`/frontend`)

## Context and Problem Statement
The application requires robust theming capabilities, specifically a seamless Dark/Light mode toggle that adheres to the retro/pixel-art brand identity (StokedFleet). 
Initially, dark mode was managed via inline React state (`isDark`) coupled with Tailwind's utility-first approach (e.g., `bg-white dark:bg-gray-900`). This approach becomes unmaintainable as the application scales, leading to:
1. "Prop drilling" or Context API overhead just to manage conditional icon rendering.
2. Bloated JSX with redundant `dark:` prefixes on nearly every element.
3. Difficulties in globally swapping the primary brand colors without finding and replacing utility classes.

## Decision
We adopted **Semantic CSS Variables** integrated directly into Tailwind CSS v4's native `@theme` engine, entirely decoupling the visual theme from React's state management.

1. **CSS Variables:** We defined abstract semantic variables (e.g., `--background`, `--card`, `--foreground`) in `index.css`.
2. **Class-Based Swapping:** We use the `:root` pseudo-class for light mode values and the `.dark` class for dark mode values.
3. **Tailwind v4 Integration:** We mapped these CSS variables to Tailwind's utility classes via the `@theme` directive, effectively creating classes like `bg-card` and `text-foreground`.
4. **Custom Variant:** We configured `@custom-variant dark (&:is(.dark *));` to ensure any remaining `dark:` utilities (like `dark:block` for toggle icons) respond to the `.dark` class applied to the HTML root, rather than the OS media query.

## Consequences

**Positive:**
- **Zero React State Dependency:** Components no longer need to know what theme is active. The toggle function is a pure vanilla DOM manipulation (`document.documentElement.classList.toggle('dark')`).
- **Clean JSX:** Utilities like `dark:` are completely eliminated from standard UI components. We write `bg-card` instead of `bg-white dark:bg-gray-900`.
- **Scalability:** We can easily introduce additional themes (e.g., "Dim", "High Contrast") simply by adding a new CSS class block in `index.css` without touching a single React component.
- **FOUC Prevention:** A blocking vanilla script in `index.html` resolves the theme from `localStorage` before React mounts, preventing the Flash of Unstyled Content.

**Negative:**
- **Indirection:** Developers must look at `index.css` to understand what hex code `bg-card` translates to, rather than seeing it explicitly in the utility class.
