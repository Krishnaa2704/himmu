# Himanya Birthday Website

A GitHub Pages-ready, dependency-free birthday story for Himanya.

## Included
- PIN gate: `2026`
- Song 1: `assets/audio/song1.mp3` — The Metro Proposal
- 5 interactive memory placeholders
- Interactive cake cutting with drag/touch + tap fallback
- 6-photo gallery with zoom/lightbox
- Candle wish animation
- Envelope letter reveal with typewriter text
- 6 flip-to-open wish cards
- Surprise gift reveal with the configured Google Drive video
- Final replay button
- Soft lavender palette with plum, rose, cream, mint and gold accents
- Floating clouds, flowers, hearts and decorative frame-corner SVGs

## Replace photos later
Memory placeholders:
`assets/photos/memory/memory-1.svg` through `memory-5.svg`

Gallery placeholders:
`assets/photos/gallery/gallery-1.svg` through `gallery-6.svg`

Update captions and text from:
`js/config.js`

## Audio
Replace `assets/audio/song1.mp3` with your final track when needed. The site attempts to start it immediately after the PIN unlock; a small music chip remains available if the browser requires an extra gesture.

## Surprise video
The configured Google Drive link is stored in `js/config.js`. The visitor's account/browser must have permission to view the Drive file.

## Deploy on GitHub Pages
Upload the folder contents to a repository and enable GitHub Pages for the branch/folder you use. No npm install or build step is required.
