# Portfolio Navigation & Element Mapping

## Master Reference Document
**Date Created:** 2025-11-25  
**Purpose:** Single source of truth for all relationships between letters, categories, transformations, navigation elements, and content structure.

---

## Letter-to-Category-to-Transform Mapping

### AYIN (ع)
- **Arabic Character:** ع
- **Letter Key:** `ayin`
- **Category:** `make`
- **Transformation:** MIRROR
- **Transformation Page:** `/app/make/page.js` (to be created)
- **Subcategories:**
  - spaces
  - things
- **Navigation Dot:** 4th dot (rightmost position)
- **Visual Position:** Variable (randomizes on load)

### ALIF (ا)
- **Arabic Character:** ا
- **Letter Key:** `alif`
- **Category:** `view`
- **Transformation:** ROTATE
- **Transformation Page:** `/app/view/page.js` (to be created)
- **Subcategories:**
  - speculations
  - images
- **Navigation Dot:** 3rd dot (second from right)
- **Visual Position:** Variable (randomizes on load)

### SAD (ص)
- **Arabic Character:** ص
- **Letter Key:** `sad`
- **Category:** `reflect`
- **Transformation:** SCALE
- **Transformation Page:** `/app/reflect/page.js` (to be created)
- **Subcategories:**
  - research
  - teaching
- **Navigation Dot:** 2nd dot (third from right)
- **Visual Position:** Variable (randomizes on load)

### MIM (م)
- **Arabic Character:** م
- **Letter Key:** `mim`
- **Category:** `connect`
- **Transformation:** MOVE
- **Transformation Page:** `/app/connect/page.js` (to be created)
- **Subcategories:**
  - curriculum vitae
  - about me
- **Navigation Dot:** 1st dot (leftmost position)
- **Visual Position:** Variable (randomizes on load)

---

## Navigation Dot Assignment

**Fixed position-based mapping (does NOT randomize):**

| Dot Position | Category | Letter | Transform |
|--------------|----------|--------|-----------|
| 1st (left)   | connect  | MIM (م) | MOVE     |
| 2nd          | reflect  | SAD (ص) | SCALE    |
| 3rd          | view     | ALIF (ا) | ROTATE  |
| 4th (right)  | make     | AYIN (ع) | MIRROR  |

---

## UI Chrome Elements

### TopBar (top edge)
**Location:** `app/page.js` → TopBar component

**Elements (left to right):**
- Current time (format: "1555")
- Forward slash separator "/"
- Day of week (format: "TUESDAY")
- Forward slash separator "/"
- Current date (format: "25.11.2025")
- Horizontal line (extends most of width, gap before dots)
- Four navigation dots (black circles, rightmost changes to pink on hover/active)

**Font:** Plus Jakarta Sans (or similar)
**Size:** ~14-16px
**Color:** #000000

### LeftPanel (left edge)
**Location:** `app/page.js` → LeftPanel component

**Elements (top to bottom):**
- Vertical "asim" text (عاصم in Arabic)
  - Rotated 90° counterclockwise
  - Font: Noto Nastaliq Urdu
  - Positioned along vertical dotted line
- Vertical dotted line (full height)
  - 2px width
  - Repeating gradient pattern
  - Opacity: 0.3-0.8
- Stack/layers button (icon)
  - Position: Bottom left area
  - Function: TBD
- Info button (circle with "i")
  - Position: Below stack button
  - Function: TBD

### RightPanel (right edge)
**Location:** `app/page.js` → RightPanel component

**Elements (top to bottom):**
- Vertical dotted line (full height)
  - 2px width
  - Right edge
  - Opacity: 0.8
- Category labels (stacked, right-aligned, bottom area):
  - "make"
  - "view"
  - "reflect"
  - "connect"
- **Font:** Plus Jakarta Sans (var(--font-karla))
- **Size:** 24px
- **Weight:** 600
- **Color:** #000000 (changes to pink on hover)
- **Spacing:** 8px gap between labels

**Subcategories (revealed on 2s hover):**
- Appears below main category
- Smaller font size (~18px)
- Same font family
- Indented slightly

---

## Interaction Behaviors

### Three-Way Linked Hover System

**When ANY element is hovered (letter, dot, or category title):**
1. **Letter** → cycles through color spectrum (via `--glow-rotation`)
2. **Corresponding dot** → changes to pink, cycles through colors
3. **Corresponding category title** → changes to pink, cycles through colors

**Color sync:** All three use same CSS custom property `--glow-rotation` (60s cycle)

### Category Title Progressive Disclosure

**Interaction stages:**
1. **Gentle hover (< 2 seconds):**
   - Color changes to pink + color cycle
   - Title nudges upward (~4-8px)
   - Smooth bounce animation

2. **Sustained hover (≥ 2 seconds):**
   - Title snaps vertically to expanded position
   - Two subcategories reveal below
   - Other expanded categories collapse
   - Smooth animation (0.3-0.5s ease)

3. **Hover away:**
   - Bouncy drop back to original position
   - Immediate but smooth (not harsh)
   - Collapse animation

### Navigation Triggers

**Click to navigate to transformation page:**
- Clicking **letter** → isolated view with transformation
- Clicking **navigation dot** → isolated view with transformation  
- Clicking **main category title** → does nothing (no navigation)
- Clicking **subcategory** → isolated view with transformation

**Target pages:**
- `ayin` / `make` / subcategories → `/make` (MIRROR transform)
- `alif` / `view` / subcategories → `/view` (ROTATE transform)
- `sad` / `reflect` / subcategories → `/reflect` (SCALE transform)
- `mim` / `connect` / subcategories → `/connect` (MOVE transform)

---

## Color System

### Base Colors
- **Background:** #FFFDF3 (cream)
- **Text (default):** #000000 (black)
- **Active/Hover:** #FDABD3 (pink) + hue-rotate cycling
- **Completed state:** #2E7054 (dark green)
- **Active element:** #40CC8F (bright green)

### CSS Custom Properties
- `--glow-rotation`: 0deg → 360deg (60s cycle)
- Applied via: `filter: hue-rotate(var(--glow-rotation))`
- Driver class: `.glow-hue-driver` on root container

---

## File Structure

### Current Files
- `/app/page.js` - Landing page (main file, ~450 lines)
- `/app/layout.js` - Font imports (Noto Nastaliq Urdu, Plus Jakarta Sans)
- `/app/glals.css` - CSS resets

### To Be Created (Transformation Pages)
- `/app/make/page.js` - MIRROR transformation (for ayin/ع)
- `/app/view/page.js` - ROTATE transformation (for alif/ا)
- `/app/reflect/page.js` - SCALE transformation (for sad/ص)
- `/app/connect/page.js` - MOVE transformation (for mim/م)

### Reference Code (Completed Transformations)
- See project documents: `MOVE_page.tsx`, `ROTATE_page.tsx`, `SCALE_page.tsx`, `MIRROR_page.tsx`
- These need to be adapted from TypeScript to JavaScript
- Grid system: 100px spacing with 50px minor grid
- Two-stage progression: main target → two subcategory targets

---

## State Management

### Current State Variables (in `/app/page.js`)

```javascript
const [letterOrder, setLetterOrder] = useState(['ayin', 'alif', 'sad', 'mim'])
const [lettersVisible, setLettersVisible] = useState(false)
const [tooltipPositions, setTooltipPositions] = useState({})
const [isolatedLetter, setIsolatedLetter] = useState(null)
const [hoveredLetter, setHoveredLetter] = useState(null)
const [showTooltip, setShowTooltip] = useState(false)
const [tooltipStyle, setTooltipStyle] = useState({})
```

### Required New State (for interactions)

```javascript
// For three-way linked hover
const [hoveredElement, setHoveredElement] = useState(null) 
// Possible values: 'ayin', 'alif', 'sad', 'mim', or null

// For category expansion
const [expandedCategory, setExpandedCategory] = useState(null)
// Possible values: 'make', 'view', 'reflect', 'connect', or null

// For hover duration tracking
const [hoverStartTime, setHoverStartTime] = useState(null)
```

---

## Typography

### Fonts in Use
- **Arabic letters:** Noto Nastaliq Urdu (700 weight)
- **UI text (tooltips, panels):** Plus Jakarta Sans (200-600 weight)
- **Code reference:** `var(--font-nastaliq)` and `var(--font-karla)` (Jakarta)

### Font Imports (in `/app/layout.js`)
```javascript
import { Noto_Nastaliq_Urdu, Plus_Jakarta_Sans } from 'next/font/google'

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-nastaliq',
})

const karla = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-karla',
})
```

---

## Critical Design Notes

### Letter Randomization
- Letter order randomizes on page load
- Tooltip positions randomize per letter
- Navigation dots remain fixed (category-based, not position-based)
- This creates dynamic visual variety while maintaining navigation consistency

### Breathing Animation
- All letters breathe together (scale 1 → 1.04)
- Individual spacing compression (translateX values)
- Creates organic accordion effect
- Duration: 2.5s ease-in-out infinite

### Color Synchronization
- Single animation drives all color changes
- Orb, letters, dots, titles all read from `--glow-rotation`
- Guarantees perfect sync (no drift)
- Pure CSS solution (no performance impact)

---

## Development Checklist

### Landing Page - Completed ✓
- [x] Gradient glow system (3 orbs)
- [x] Four Arabic letters with randomization
- [x] Breathing animation with spacing compression
- [x] Color sync via CSS custom properties
- [x] Tooltip system with positioning logic
- [x] RightPanel with dotted line and category labels

### Landing Page - To Build
- [ ] TopBar (time, date, day, line, dots)
- [ ] LeftPanel (vertical "asim", buttons, dotted line)
- [ ] Three-way linked hover system
- [ ] Category title progressive disclosure (nudge → expand)
- [ ] Navigation dot interactions
- [ ] Click handlers for navigation to transformation pages

### Transformation Pages - To Build
- [ ] `/app/make/page.js` - MIRROR (ayin/ع)
- [ ] `/app/view/page.js` - ROTATE (alif/ا)
- [ ] `/app/reflect/page.js` - SCALE (sad/ص)
- [ ] `/app/connect/page.js` - MOVE (mim/م)

---