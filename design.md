# Wunschhimmel — Design System

## Concept
Warm, dreamy wishlist platform for 12–25 year olds. Inspired by pastel rose + deep navy contrast. Playful but polished. Wave/scallop decorative motifs throughout.

## Colors
- **Navy** `#1A1A4E` — primary dark, headlines, nav background
- **Rose** `#FFD6D6` — primary light, backgrounds, cards
- **Coral** `#FF6B8A` — CTA buttons, accent, highlights
- **Lavender** `#E8DEFF` — secondary background, tags
- **Cream** `#FFF8F0` — page background
- **White** `#FFFFFF` — cards, inputs

CSS Variables mapping:
- `--primary`: Navy `#1A1A4E`
- `--accent`: Coral `#FF6B8A`
- `--background`: Cream `#FFF8F0`
- `--rose`: `#FFD6D6`
- `--lavender`: `#E8DEFF`

## Typography
- **Headlines**: Playfair Display (serif, bold, italic for flair)
- **Body**: Plus Jakarta Sans (clean, modern, readable)
- **UI/Labels**: Plus Jakarta Sans medium

Import via Google Fonts:
```
Playfair+Display:ital,wght@0,700;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700
```

## Decorative Elements
- Wave/scallop SVG borders between sections
- Subtle star/sparkle ✦ accents in headings
- Soft drop shadows on cards (rose-tinted)
- Rounded pill shapes for tags/badges
- Gradient blobs in backgrounds (rose + lavender)

## Spacing
- Generous padding (sections: py-24 mobile: py-16)
- Large hero typography (headline: text-5xl to text-7xl)
- Cards: rounded-2xl with soft shadow

## Anti-patterns to avoid
- No gray corporate layouts
- No generic card grids with identical padding
- No Inter or system fonts
- No purple gradients on white
