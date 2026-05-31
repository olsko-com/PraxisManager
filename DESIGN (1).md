---
name: Epicure Organic Tech
colors:
  surface: '#f9f9f8'
  surface-dim: '#d9dad9'
  surface-bright: '#f9f9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f3'
  surface-container: '#edeeed'
  surface-container-high: '#e7e8e7'
  surface-container-highest: '#e1e3e2'
  on-surface: '#191c1c'
  on-surface-variant: '#404944'
  inverse-surface: '#2e3131'
  inverse-on-surface: '#f0f1f0'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#566060'
  on-secondary: '#ffffff'
  secondary-container: '#d7e2e1'
  on-secondary-container: '#5a6564'
  tertiary: '#003625'
  on-tertiary: '#ffffff'
  tertiary-container: '#184d3a'
  on-tertiary-container: '#88bda4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#dae5e4'
  secondary-fixed-dim: '#bec9c8'
  on-secondary-fixed: '#131d1d'
  on-secondary-fixed-variant: '#3e4948'
  tertiary-fixed: '#b8eed4'
  tertiary-fixed-dim: '#9cd2b9'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#1b503c'
  background: '#f9f9f8'
  on-background: '#191c1c'
  surface-variant: '#e1e3e2'
  surface-sage: '#D1DCDB'
  surface-muted: '#ECEDEF'
  text-rich: '#043F2D'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system embodies the "Organic Tech" aesthetic—a sophisticated intersection of high-end utility and natural warmth. It is designed for a target audience that values precision, sustainability, and editorial quality. 

The style utilizes **Minimalism** enriched with **Tactile** cues. It leverages expansive whitespace, a nature-inspired palette, and intentional typographic contrasts to evoke a sense of calm efficiency. The visual narrative should feel like a premium CRM for a world that prioritizes well-being and craftsmanship over raw industrial speed.

## Colors
The color strategy centers on a deep, authoritative forest green used for primary actions and brand emphasis. This is balanced by a soft "Sage" and neutral off-whites that serve as the primary canvas, reducing eye strain and reinforcing the organic theme.

- **Primary**: Use for high-emphasis buttons, active navigation states, and key brand moments.
- **Secondary (Sage)**: Use for large surface areas, secondary containers, and subtle highlights.
- **Neutral**: An off-white base that avoids the clinical feel of pure hex white, providing a softer backdrop for the high-contrast green.
- **Named Colors**: "Text-rich" should be used for headlines to ensure maximum legibility while maintaining the chromatic theme.

## Typography
The typographic system relies on a high-contrast pairing between an elegant serif and a technical sans-serif.

- **Headlines**: Rendered in **Source Serif 4**. This provides an editorial, authoritative tone that feels "Epicurean" and refined. Use tighter letter spacing for display sizes to maintain impact.
- **Body & UI**: Rendered in **Manrope**. Its modern, geometric construction ensures clarity in data-heavy CRM environments and functional UI components.
- **Labels**: Utilize the semi-bold and bold weights of Manrope. Small labels should be treated with slight tracking (letter spacing) and uppercase styling for better scannability in dense interfaces.

## Layout & Spacing
This design system uses a **Fluid Grid** model with generous internal margins to prevent visual clutter. 

- **Desktop**: A 12-column grid with a maximum container width of 1280px. Gutters are kept wide (24px) to emphasize the airy, "Organic Tech" feel.
- **Mobile**: A 4-column grid with 20px side margins. 
- **Spacing Rhythm**: All measurements are multiples of an 8px base unit. Vertical rhythm is critical; use "stack-lg" (48px) to separate major content sections, and "stack-sm" (12px) for related grouping within cards.

## Elevation & Depth
Depth in this design system is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than aggressive shadows.

1.  **Primary Surface**: The neutral off-white background.
2.  **Secondary Surface**: Cards and containers use the Sage color (`#D1DCDB`) or pure White to lift them from the background.
3.  **Outlines**: Use 1px solid borders in a slightly darker shade of the surface color (e.g., 10% darker sage) to define boundaries without adding visual weight.
4.  **Soft Depth**: For floating elements like modals, use an extremely diffused, low-opacity shadow (40px blur, 4% opacity) tinted with the Primary Forest Green to maintain the organic palette.

## Shapes
The shape language is defined by oversized, welcoming curves. All major containers and cards use a **Rounded** (0.5rem base) to **Rounded-XL** (1.5rem) logic.

- **Cards**: Use the largest radii (24px/1.5rem) to create a soft, friendly structure.
- **Buttons & Inputs**: Use a 12px (0.75rem) radius to balance professional structure with the overall rounded aesthetic.
- **Iconography**: Icons should feature rounded caps and corners to match the softness of the UI containers.

## Components
- **Buttons**: Primary buttons are solid Forest Green with White text and 12px rounded corners. Secondary buttons should use the Sage background with Forest Green text.
- **Cards**: Use a White or Sage background with a 24px corner radius. Include a very subtle 1px border. Avoid heavy shadows; let the color difference do the lifting.
- **Input Fields**: Soft Sage background, no border by default, 12px corner radius. On focus, add a 2px Forest Green border.
- **Chips**: Use a pill shape (fully rounded) with the Sage background for metadata and Forest Green text.
- **Lists**: Rows should be separated by a soft horizontal rule. Active list items use a Sage background highlight with a vertical Forest Green "pill" indicator on the leading edge.
- **Data Tables**: High whitespace, no vertical lines. Use Source Serif 4 for column headers to elevate the data presentation.