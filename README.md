# Placement Sheet Generator

A browser-based tool for generating garment artwork placement spec sheets.  
No server required — runs entirely in the browser.

## Features

- Upload 4 images: Artwork (AW), Color Swatch, Style Reference, 2D Placement Diagram
- Live preview with editable text fields
- Adjustable column widths via sliders
- Export to **JPG** or **PDF** (A4 Landscape)
- DICK'S Sporting Goods logo fixed in header

## Usage

1. Open `index.html` in any modern browser
2. Upload your images in the left sidebar
3. Click any text on the sheet to edit
4. Adjust column widths with the sliders
5. Click **Download JPG** or **Download PDF**

## File Structure

```
placement-sheet-app/
├── index.html       # Main HTML
├── style.css        # All styles
├── app.js           # Upload, layout, export logic
├── assets/
│   └── dks_logo.png # DICK'S logo (fixed)
└── README.md
```

## Deploy to GitHub Pages

See deployment instructions below or follow the included guide.

## Browser Support

Chrome, Edge, Firefox, Safari (latest versions)
