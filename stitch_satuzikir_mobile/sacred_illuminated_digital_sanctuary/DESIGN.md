---
name: Sacred Illuminated Digital Sanctuary
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#404944'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#003623'
  on-tertiary: '#ffffff'
  tertiary-container: '#004f34'
  on-tertiary-container: '#31c98f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.01em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-desktop: 2rem
  content-max-width: 480px
---

## Brand & Style

The design system embodies an elevated manuscript aesthetic crafted for collective contemplation, shared remembrance, and sacred focus. It merges the quiet, reverent balance of classical illuminated manuscripts with modern, frictionless tactile interfaces. The emotional atmosphere is meditative, tranquil, and pristine—creating an intentional sanctuary free from digital clutter and loud visual tension.

The design identity draws from high-end modern editorial design and Islamic illumination geometry:
- **Quiet Radiance:** Expansive warm parchment backdrops paired with deep emerald inks and restrained amber highlights.
- **Architectural Harmony:** Pure, structured proportions inspired by classical arches and sacred folios, grounded through disciplined whitespace.
- **Atmospheric Focus:** Micro-interactions and real-time collective counters pulse gently with organic breathing transitions, avoiding sudden mechanical shifts.

## Colors

The color palette is rooted in the depth of natural forest stone, aged gilding, and raw parchment:

- **Primary (`#064E3B`):** Deep Islamic Emerald. Represents timeless stillness, depth, and foundation. Utilized for core action surfaces, primary headers, and deep-toned containers.
- **Secondary (`#D97706`):** Illuminated Amber Gold. Evokes gold-leaf accents found in sacred manuscript borders. Applied sparingly to signify divine light, streaks of collective progress, and active states.
- **Tertiary (`#10B981`):** Luminous Mint Green. Used for live real-time sync pulses, active communal counters, and subtle celebratory badges.
- **Neutral (`#0F172A`):** Deep Charcoal Ink. Replaces harsh true black to maintain readable textual warmth across all lighting conditions.
- **Parchment Canvas (`#F8FAF8`):** Gentle off-white with a pale emerald undertone, mitigating eye strain during extended night or dawn recitations.
- **Surface Layer (`#FFFFFF`):** Pure elevated white surfaces bordered with subtle emerald tints to float cleanly above parchment backgrounds.

## Typography

The typographical pairing sets a cadence between literary grandeur and functional clarity:

- **EB Garamond** acts as the voice of solemnity and classic scholarship. Used for ceremonial headings, prayer titles, and liturgical numbers. Set with deliberate tracking and balanced line heights to honor classic book design.
- **Plus Jakarta Sans** provides a contemporary, geometric counterweight. Its open counters and geometric humanism deliver effortless legibility for translations, meta-information, UI buttons, counts, and community metrics.
- **Arabic Script Support:** When Arabic liturgical text is displayed, render via `Amiri` or `Scheherazade New` at 1.4x scale relative to matching Latin body sizes, ensuring correct baseline balance and vowel diacritic visibility.

## Layout & Spacing

The layout is deliberately thumb-centric and vertical-first, structured around handheld mobile web and PWA engagement:

- **Mobile Viewport Focus:** Content is constrained to a maximum centered width of `480px` on desktop and tablet, simulating an intimate manuscript folio or physical devotional counter.
- **Vertical Hierarchy:** Generous vertical breathing room between liturgical passages prevents sensory overload. Rhythms are constructed around increments of `8px` (`0.5rem`).
- **Interactive Thumb Zone:** Primary interaction areas—such as the large circular tap surface for real-time dhikr—are positioned strictly within the bottom two-thirds of the viewport. Supporting navigational structures remain tucked into a slim header or fixed bottom status bar.

## Elevation & Depth

Elevation eschews aggressive drop shadows in favor of luminous ambient halos and delicate structural boundaries:

- **Ambient Sacred Tints:** Shadows use diluted emerald pigments rather than muddy neutral blacks (`rgba(6, 78, 59, 0.04)` to `rgba(6, 78, 59, 0.08)`), imparting an aura of natural daylight filtering through green lattice screens.
- **Illuminated Edge Insets:** High-priority cards feature subtle 1px inner borders (`#064E3B` at 8% opacity) paired with soft gold micro-accents for celebratory or milestone achievements.
- **Floating Actuators:** The primary counter button employs a gentle, pulsating dual halo that expands slightly on haptic touch, reflecting active real-time sync with global participants without jarring the user's focus.

## Shapes

The shape system adopts a softened geometric architecture, mirroring the sweeping arches of classical sanctuaries:

- **Base Radius (`0.5rem` / `8px`):** Used for micro-badges, indicators, and inline input fields.
- **Large Radius (`1rem` / `16px`):** Applied to prayer cards, modal sheets, and collective tally displays.
- **Extra-Large Radius (`1.5rem` / `24px`):** Reserved for devotional container groups, bottom action sheets, and prayer progress monitors.
- **Fully Circular Elements:** Real-time pulse avatars, counter tap targets, and tasbih rings maintain pure circular geometry to reflect eternal, uninterrupted continuity.

## Components

### Sacred Counter (Tasbih Button)
- **Structure:** Centered, circular component with a minimum touch diameter of `180px` (scaling to `220px` on larger mobile screens).
- **Surface:** Smooth gradient transition from `#064E3B` to `#047857`, framed by a 2px amber outer ring (`#D97706` at 40% opacity).
- **Micro-Interaction:** Scale transformation down to `0.96` on touch with immediate haptic trigger, releasing a delicate tertiary green ripple ring (`#10B981`) that fades outward.

### Buttons & Actions
- **Primary Button:** Deep emerald fill (`#064E3B`), crisp white text (`#FFFFFF`), `rounded-lg` (16px), minimum height of `48px`.
- **Secondary Button:** Warm parchment fill with a delicate emerald border (`1px solid rgba(6, 78, 59, 0.2)`), dark emerald text.
- **Spiritual Accent Button:** Amber glow surface (`#D97706`), white text, reserved for collective room creation and milestone sharing.

### Cards & Devotional Folios
- **Surface:** Pure white (`#FFFFFF`) with a subtle `1px` border of `rgba(6, 78, 59, 0.06)`.
- **Spacing:** `1.5rem` interior padding, `1rem` vertical separation.
- **Header:** EB Garamond titles paired with amber manuscript accents or minimal arch icons.

### Real-Time Crowd Indicators (Pulse Chips)
- **Visuals:** Pill-shaped status indicators featuring a glowing green beacon dot (`#10B981`) with a continuous CSS breathing animation.
- **Typography:** Plus Jakarta Sans `label-sm` tracking live global count additions with fluid counter transitions.

### Input Fields & Selectors
- **Base Style:** Parchment background (`#F1F5F2`), deep charcoal text, rounded to `0.5rem`.
- **Focused State:** Transitions to pure white surface with a prominent `1.5px` emerald ring (`#064E3B`) and zero harsh drop shadows.