# zen wild om — Photography Portfolio

A minimal, responsive photography portfolio for wellness and yoga photography.

## Quick Start

```bash
# Install dependencies
npm install

# Start local server
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Adding New Images

Original high-resolution images are **not committed to git** (too large). Only optimized images are tracked.

### Workflow for adding new images:

1. **Add original images** to the `portfolio/` folder
   ```
   portfolio/
   ├── your-new-image.jpg    ← Add originals here
   ├── another-image.JPG
   └── optimized/            ← Generated (committed to git)
   ```

2. **Run the optimization script**
   ```bash
   npm run optimize
   ```
   This will:
   - Generate 4 sizes (400px, 800px, 1200px, 2000px)
   - Create WebP and JPEG versions
   - Strip all EXIF metadata (GPS, camera info, etc.)
   - Output to `portfolio/optimized/`

3. **Update the HTML** in `index.html`
   Add your image to the `images` array:
   ```javascript
   const images = [
       // ... existing images
       { id: 'your-new-image', title: 'Image Title', type: 'image' },
   ];
   ```

   Note: The `id` should match the sanitized filename (lowercase, spaces → hyphens)

4. **Commit only the optimized images**
   ```bash
   git add portfolio/optimized/
   git add index.html
   git commit -m "Add new portfolio image"
   ```

## File Structure

```
├── index.html              # Main portfolio page
├── about.html              # About page
├── package.json            # Node.js dependencies
├── scripts/
│   └── optimize-images.js  # Image optimization script
├── portfolio/
│   ├── *.jpg               # Original images (gitignored)
│   └── optimized/          # Optimized images (committed)
│       ├── thumb/          # 400px
│       ├── medium/         # 800px
│       ├── large/          # 1200px
│       ├── full/           # 2000px
│       └── manifest.json   # Image metadata
└── README.md
```

## Image Optimization Details

| Size   | Width  | Quality | Use Case           |
|--------|--------|---------|-------------------|
| thumb  | 400px  | 80%     | Mobile gallery    |
| medium | 800px  | 82%     | Tablet gallery    |
| large  | 1200px | 85%     | Desktop gallery   |
| full   | 2000px | 88%     | Lightbox view     |

All images are:
- Converted to WebP (with JPEG fallback)
- Stripped of EXIF metadata for privacy
- Auto-rotated based on original orientation

## Deployment

This site is deployed via GitHub Pages. Push to `main` branch to deploy.

```bash
git push origin main
```

## Tech Stack

- Static HTML/CSS/JS (no framework)
- Sharp for image optimization
- Responsive images with `<picture>` and `srcset`
- Google Fonts (Cormorant Garamond, Questrial, Dancing Script)
