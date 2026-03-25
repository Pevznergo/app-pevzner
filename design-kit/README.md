# Pevzner Foundation Design System & Design Kit

## 🎨 Color Palette

### Base Colors
- **Background (`--bg-color`)**: `#030308` (Deep space black)
- **Text Main (`--text-main`)**: `#f8fafc` (Off-white / Slate 50)
- **Text Muted (`--text-muted`)**: `#94a3b8` (Slate 400)

### Accents
- **Accent Blue (`--accent-blue`)**: `#3b82f6` (Blue 500)
- **Accent Purple (`--accent-purple`)**: `#8b5cf6` (Purple 500)
- **Accent Orange (`--accent-orange`)**: `#f97316` (Orange 500)

### UI Elements (Glassmorphism)
- **Card Background (`--card-bg`)**: `rgba(20, 20, 30, 0.4)`
- **Glass Border (`--glass-border`)**: `rgba(255, 255, 255, 0.08)`
- **Glass Glow (`--glass-glow`)**: `rgba(139, 92, 246, 0.15)`

### Gradients
- **Text Gradient**: `linear-gradient(135deg, #e879f9, #a855f7, #3b82f6)`
- **Primary Button Background**: `linear-gradient(135deg, var(--accent-blue), var(--accent-purple))`
- **Accent Glow 1 (Top Blob)**: `radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 35%, rgba(3, 3, 8, 0) 70%)`
- **Accent Glow 2 (Bottom Blob)**: `radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(139, 92, 246, 0.05) 40%, rgba(3, 3, 8, 0) 70%)`

---

## ✒️ Typography
- **Primary Font**: `Inter` (Google Fonts), applied globally.
- **Hero Headline**: `4rem`, `font-weight: 800`, `letter-spacing: -0.03em`, `line-height: 1.1`
- **Section Headline / CTA Headline**: `2.75rem` to `3.5rem`, `font-weight: 700`, `letter-spacing: -0.02em`
- **Subheadline**: `1.25rem`, `color: var(--text-muted)`, `line-height: 1.6`
- **Body / Paragraphs**: `1rem`, `color: var(--text-muted)`

---

## 🚀 Animations & Interactions

### 1. Primary Button Hover
- Transitions subtly upward and intensifies the purple glow.
- **Transforms**: `translateY(-2px)`
- **Box Shadow**: `0 6px 20px rgba(139, 92, 246, 0.3)`
- **Transition Duration**: `0.2s ease`

### 2. Step Card Hover (Features/How It Works)
- Lifts card, adds a darker drop shadow, and triggers an inner purple glow while revealing a linear gradient border via a pseudo-element on top of the card.
- **Transforms**: `translateY(-5px)`
- **Box Shadow**: `0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.15)`
- **Border**: `rgba(139, 92, 246, 0.3)`
- **Top Border Gradient Reveal**: `linear-gradient(90deg, #3b82f6, #8b5cf6)` goes from `opacity: 0` to `opacity: 1`.

### 3. Logo Ticker Loop
- **Animation**: `scrollLeft 30s linear infinite`
- **Hover State**: Pauses animation on hover (`animation-play-state: paused`).
- **Keyframes**:
  ```css
  @keyframes scrollLeft {
    0% { transform: translateX(0); }
    100% { transform: translateX(-33.3333%); }
  }
  ```

### 4. Layout Effects (Glassmorphism)
- **Header Structure**: Sticky (`fixed`), `background: rgba(3, 3, 8, 0.7)` with a `backdrop-filter: blur(12px)`
- **CTA Sections**: Darker glassmorphism containers with `backdrop-filter: blur(12px)`.

---

## 📐 Components Overview

### Primary Button (`.btn-primary`)
- **Background**: Purple-blue diagonal gradient.
- **Padding**: `0.65rem 1.5rem` (Header) / `1rem 2.5rem` (Hero) / `1.2rem 3.5rem` (CTA)
- **Border Radius**: `8px` or `12px`
- **Shadow**: Drop shadow with `var(--glass-glow)`.

### Secondary Button (`.btn-secondary`)
- **Background**: Semi-transparent white (`rgba(255, 255, 255, 0.05)`)
- **Border**: `1px solid rgba(255, 255, 255, 0.1)`
- **Hover**: Enhances background opacity and border to `0.1` and `0.2` respectively.

### Glass Card (`.step-card`)
- **Background**: `var(--card-bg)`
- **Border**: `var(--glass-border)`
- **Border Radius**: `16px`
- **Spacing**: `2.5rem` top/bottom, `2rem` sides (`padding`)
