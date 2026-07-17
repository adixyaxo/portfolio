# Ultimate Brutalist Overhaul Plan (Phase 4)

This phase introduces significant structural and interactive changes, transitioning the portfolio into an extremely dynamic, app-like experience.

## Open Questions & Considerations for You
> [!WARNING]
> **Project Fullscreen on Hover**: Expanding a video to occupy the *whole screen* purely on `hover` can sometimes create a jarring user experience (if the mouse slips off, it instantly snaps back down). I will implement a smooth `framer-motion` fixed overlay that scales up to cover the screen when hovered, but if it feels too sensitive, we might want to change it to a `click` interaction later. Does this sound okay for now?

## Proposed Changes

### 1. Liquid Menu & Navbar Redesign
- **Navbar Layout**: Remove the inline links from `Nav.tsx`. It will only contain your "ADITYA DAGAR" logo on the left and a "MENU" button on the right.
- **Fullscreen Overlay**: Create a new `MenuOverlay` component. When "MENU" is clicked, it will trigger a liquid/circular `clip-path` animation via Framer Motion, expanding to cover the entire screen.
- **Menu Content**: The overlay will house massive, brutalist typography links for Navigation (Work, About, Contact) and your Socials.

### 2. Fullscreen Contact Form Footer
- **Layout Expansion**: Overhaul `Footer.tsx` and `Footer.module.css`. Set its height to `100vh` (`min-height: 100vh`).
- **Contact Form**: Integrate a brutalist-styled contact form (Name, Email, Project Details, Submit button) directly into the footer alongside your existing address and social blocks.

### 3. Hero Section Wave & Height
- **Increased Height**: Add `10vh` extra height to the Hero section to give it more breathing room before the content starts.
- **Dynamic Wave Border**: Implement a custom SVG or CSS-animated liquid wave at the very bottom of the Hero section to create an aesthetic, fluid transition into the next section.

### 4. Project Video Fullscreen Hover
- **Remove Watermark**: Delete the `[X-NCU]` / `[Project-SERA]` text overlay from `ProjectCard.tsx`.
- **Fullscreen Hover Scale**: Wrap the video in a `framer-motion` AnimatePresence block. On hover, the video will transition from its constrained card size to a `position: fixed` fullscreen layout, creating a cinematic preview effect.

### 5. Experience Section Layout Fixes
- **Image Scaling**: Modify `Experience.module.css`. The hover image wrapper will be set to `height: 100%` of the row container and given a consistent width across all items.
- **Overflow Fix**: Identify and remove the horizontal overflow bug caused by the `.colOrg` or `.row` padding extending beyond `100vw`.

### 6. Cursor & Spacing Tweaks
- **Hide System Cursor**: Inject `* { cursor: none !important; }` into `theme.css` so only your custom animated dot cursor is visible.
- **Skills Padding**: Increase the vertical margin/padding between the category headings and the skill pills in `Skills.module.css` for a cleaner visual hierarchy.

## Verification
- Test the full-screen menu toggling on both desktop and mobile.
- Verify the system cursor is invisible everywhere.
- Test the Project video hover to ensure the transition is smooth and doesn't trap the user's mouse.
- Confirm the Footer form takes up exactly `100vh`.
# Plan
- [x] Open http://localhost:5173/
- [x] Wait 3 seconds for page to load
- [x] Capture initial screenshot (notch, nav layout)
- [x] Scroll down slightly
- [x] Capture second screenshot (panel switcher buttons)
- [x] Analyze screenshots and document findings

# Findings
- **Notch Design and Controls:** The notch is a rounded black pill at the top-center of the viewport. It displays dynamic content like weather (e.g. "38°C MOSTLY CLEAR"), time, or Github commit info.
- **Panel Switcher Buttons:** The four buttons (Spotify, Weather, Clock, Github) are vertically stacked on the left side of the notch, but they are positioned **outside** the notch. They appear as semi-transparent icons.
- **Nav Bar Layout:**
  - Left side: `@ADIXYAXO` logo with a green dot and `AVAILABLE` text.
  - Center: The dynamic notch and the panel switcher buttons next to it.
  - Right side: Battery percentage (e.g., `3%`) and a `MENU` button.
- **Visual Issues:** The switcher buttons are completely separate from the notch visual container, which looks disjointed rather than being an integrated part of the notch as requested by the user.
# Task: Verify Portfolio Website Functionality

## Checklist
- [ ] Open http://localhost:5174/
- [ ] Wait 3 seconds for page and content to load
- [ ] Verify page loads without errors (check console logs)
- [ ] Verify navigation bar is visible with "@ADIXYAXO" text
- [ ] Verify Dynamic Notch is visible at the top
- [ ] Take screenshot of the home page
- [ ] Click "@adixyaxo" and verify it navigates to /cv
- [ ] Verify /cv page loads resume
- [ ] Verify menu section has CV link
- [ ] Verify footer has "VIEW CV" button
- [ ] Click "VIEW CV" in footer and verify it navigates to /cv
# Task Tracker

## 1. Fix Spotify Embeds + Notch Swipe
- [ ] Rewrite DynamicNotch.tsx with pan/swipe gestures
- [ ] Update DynamicNotch.module.css for mobile + swipe
- [ ] Test embeds play without login

## 2. Fix Footer Gradient Cursor Reactivity
- [ ] Update Contact.module.css pointer-events
- [ ] Verify gradient reacts to mouse

## 3. Magnetic Buttons (SheryJS)
- [ ] Add SheryJS CSS to index.html
- [ ] Create useMagnet hook or App-level init
- [ ] Add `.magnet` class to buttons across components
- [ ] Test magnetic effect

## 4. Liquid Glass Effect (CSS)
- [ ] Update Cursor.tsx + Cursor.module.css for glass hover
- [ ] Apply glass to buttons on gradients (Footer)

## 5. SheryJS Image Effects
- [ ] Update ProjectCard.tsx with Shery image effect
- [ ] Desktop-only guard

## 6. Mobile Responsiveness
- [ ] Update mobile-overrides.css
- [ ] Update DynamicNotch responsive styles
- [ ] Add CV to MobileNav
- [ ] Test all sections on mobile viewport
# Portfolio Enhancement Plan

6 parallel streams of work, ordered by dependency.

---

## 1. Fix Spotify Embeds in Notch

**Problem**: Embeds require Spotify login to play. The compact iframe height (152px) is too tall for the notch UI.

**Solution**: Switch to the `compact` theme Spotify embed with `&theme=0` (dark mode, no login required for previews). The 152px embed is Spotify's minimum — it will work without login for 30s previews. The expanded notch needs its max-width bumped to accommodate the iframe properly.

#### [MODIFY] [DynamicNotch.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/DynamicNotch/DynamicNotch.tsx)
- Ensure embed URL uses `?utm_source=generator&theme=0` (already correct)
- Add swipe gesture via `drag="x"` on the panel wrapper (not just expanded) for switching between Spotify/Weather/Clock/GitHub
- Add swipe within Spotify panel to switch between tracks/playlist
- Remove the `dragOverlay` approach (blocks clicks) → use `onPan` events on the notch body instead

#### [MODIFY] [DynamicNotch.module.css](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/DynamicNotch/DynamicNotch.module.css)
- Fix notch sizing for mobile: constrain `max-width`, tighter padding
- Add `touch-action: pan-y` to the notch for vertical scroll passthrough
- Add `will-change: transform` to animated elements
- Left side buttons: smaller on mobile, hidden if screen < 400px

---

## 2. Fix Footer Gradient Not Reacting to Cursor

**Problem**: In the Contact section, the `LiquidGradient` canvas sits at `z-index: 0` with the footer content at `z-index: 10`. Mouse events hit the footer content and never reach the canvas's `mousemove` handler.

**Solution**: Forward `pointer-events: none` on the `.footerWrapper` and re-enable `pointer-events: auto` only on interactive children (form inputs, links, buttons). This lets mousemove events pass through to the canvas underneath.

#### [MODIFY] [Contact.module.css](file:///home/batman/Desktop/Coding/Projects/portfolio/src/sections/Contact.module.css)
- `.footerWrapper { pointer-events: none; }`
- `.footerWrapper * { pointer-events: auto; }` — re-enables clicks on actual interactive elements
- The canvas below will now receive mousemove events for the ripple/touch effect

---

## 3. Magnetic Buttons (via SheryJS `makeMagnet`)

**Problem**: User wants buttons to "stick" to the cursor on hover.

**Solution**: Use `Shery.makeMagnet()` from the already-installed `sheryjs` package. Create a reusable React hook `useMagnet` that applies the effect to refs.

> [!IMPORTANT]
> SheryJS requires GSAP at runtime. GSAP is already in `package.json`. We need to import SheryJS CSS and ensure it doesn't conflict with our custom cursor.

#### [NEW] [useMagnet.ts](file:///home/batman/Desktop/Coding/Projects/portfolio/src/hooks/useMagnet.ts)
- Hook that takes a ref and calls `Shery.makeMagnet()` on mount, with cleanup
- Parameters: `ease`, `duration` (tuned for brutalist feel)

#### [MODIFY] [Footer.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/Footer/Footer.tsx)
- Apply `data-magnet` class to submit button, CV button, social links

#### [MODIFY] [Nav.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/Nav/Nav.tsx)
- Apply magnet effect to menu button

#### [MODIFY] [App.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/App.tsx)
- Initialize `Shery.makeMagnet('.magnet')` at app level after mount, targeting all `.magnet` classed elements

#### [MODIFY] [index.html](file:///home/batman/Desktop/Coding/Projects/portfolio/index.html)
- Add SheryJS CSS link

---

## 4. Liquid Glass Effect

**Problem**: User wants Apple-style liquid glass applied to cursor hover, buttons on gradients, and other interactive surfaces.

**Approach**: The `LIQUID_GLASS.md` references a `liquid-glass.js` module that doesn't exist yet in the project. Instead of the SVG filter approach (Chromium-only, complex), I'll implement a **CSS-based glassmorphism** with enhanced `backdrop-filter`, subtle border glow, and inner highlight — which works cross-browser and is performant.

#### [MODIFY] [Cursor.module.css](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/Cursor/Cursor.module.css)
- Add glass effect to the cursor hover state: `backdrop-filter: blur(12px)`, semi-transparent background, subtle border glow, inner highlight ring
- Add `box-shadow` with colored rim for the refraction illusion

#### [MODIFY] [Cursor.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/Cursor/Cursor.tsx)
- When hovering, switch cursor background to translucent glass with blur

#### [MODIFY] [Footer.module.css](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/Footer/Footer.module.css)
- Apply glass effect to `.submitBtn` and `.cvBtn` when they're over the gradient: translucent bg, backdrop-filter, border glow

---

## 5. SheryJS Image Effects

**Problem**: User wants SheryJS 3D effects on project card images.

**Solution**: Use `Shery.imageEffect()` with `style: 5` (liquid distortion) on project card images. This requires giving images a shared CSS class.

> [!WARNING]
> SheryJS creates its own Three.js canvas per image. With 2 project cards, this is fine. More than 4-5 would hurt performance. We'll apply it only to project card images on desktop.

#### [MODIFY] [ProjectCard.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/ProjectCard/ProjectCard.tsx)
- Add class `shery-img` to project video elements (or a wrapper `<img>` thumbnail)
- Initialize Shery effect after mount via `useEffect`

> [!NOTE]
> SheryJS expects `<img>` elements, not `<video>`. We'll add a static poster/thumbnail `<img>` with the Shery effect, and overlay the video on hover. This is more performant too — videos won't autoplay until hovered.

---

## 6. Full Mobile Responsiveness

**Problem**: Various components need responsive fixes.

#### [MODIFY] [mobile-overrides.css](file:///home/batman/Desktop/Coding/Projects/portfolio/src/mobile/mobile-overrides.css)
- Notch: tighter size, hide side buttons on small screens
- Footer: stack layout vertically, full-width inputs
- Hero: adjust title sizing
- Disable SheryJS effects on mobile (perf)
- Disable liquid glass backdrop-filter on mobile (perf)

#### [MODIFY] [DynamicNotch.module.css](file:///home/batman/Desktop/Coding/Projects/portfolio/src/components/DynamicNotch/DynamicNotch.module.css)
- Mobile breakpoint: hide left-side panel buttons, smaller notch, touch-friendly dots
- Swipe gesture works natively on touch

#### [MODIFY] [MobileNav.tsx](file:///home/batman/Desktop/Coding/Projects/portfolio/src/mobile/MobileNav.tsx)
- Add CV link to mobile bottom nav

---

## Open Questions

> [!IMPORTANT]
> **SheryJS + React compatibility**: SheryJS manipulates the DOM directly and expects vanilla HTML elements. It works in React via `useEffect` + refs, but we need to be careful about cleanup on unmount to avoid memory leaks. I'll handle this in the hooks.

> [!IMPORTANT]
> **Liquid Glass scope**: The `LIQUID_GLASS.md` mentions a `liquid-glass.js` module that doesn't exist in the project. Should I:
> - **(A)** Download/create it from the GitHub source referenced in the docs?
> - **(B)** Use CSS-only glassmorphism (cross-browser, simpler, no GPU cost)?
>
> I'm recommending **(B)** since the SVG filter approach is Chromium-only and the CSS approach achieves 90% of the visual effect with zero perf overhead.

---

## Verification Plan

### Automated
- `npm run dev` — verify no build/runtime errors
- `curl` check all routes return 200

### Manual (Browser)
- [ ] Spotify embeds play 30s preview without login
- [ ] Swipe left/right on notch switches panels
- [ ] Swipe within Spotify panel switches tracks
- [ ] Footer gradient reacts to cursor movement
- [ ] Buttons attract to cursor on hover (magnetic)
- [ ] Cursor shows glass effect on hover
- [ ] Buttons on gradient have glass appearance
- [ ] Mobile: notch responsive, nav works, no overflow
- [ ] SheryJS effects on project card images (desktop only)
# Mobile & Desktop Audit Plan
- [ ] Open http://localhost:5173 (Blocked: Connection Refused)
- [ ] Desktop audit (1440px): Take screenshot
- [ ] Resize to mobile (375x812)
- [ ] Mobile audit:
    - [ ] Hero section screenshot & check
    - [ ] Projects section screenshot & check
    - [ ] Experience section screenshot & check
    - [ ] Skills/WakaTime section screenshot & check
    - [ ] Footer/Contact section screenshot & check
- [ ] Summarize issues:
    - Liquid gradient visibility
    - Overflow / horizontal scroll
    - Text readability
    - Element stacking
    - Navbar issues
    - Dynamic island/notch features check
