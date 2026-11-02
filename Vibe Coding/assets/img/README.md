# Image assets

Drop your images in this folder. The site references these filenames
(placeholders are shown if a file is missing):

| Filename            | Used for                                  | Recommended           |
| ------------------- | ----------------------------------------- | --------------------- |
| `headshot.jpg`      | Hero portrait (optional)                  | 600×600, square, <300KB |
| `case-study-activation.jpg`  | Case study card + detail hero   | 1600×900, 16:9        |
| `case-study-selfserve.jpg`   | Case study card + detail hero   | 1600×900, 16:9        |
| `og-image.png`      | Social share preview (Open Graph)         | 1200×630              |

## Tips
- Compress images (tinypng.com or ImageOptim) before committing.
- Keep file names lowercase and use dashes, e.g. `checkout-before.png`.
- Prefer `.webp` for screenshots to cut file size, but `.jpg`/`.png` are fine.

## Referencing an image in HTML
```html
<img src="../assets/img/headshot.jpg" alt="Portrait of Raymond Wang" width="600" height="600">
```
