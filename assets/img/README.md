# Image assets

Drop your images in this folder. The site references these filenames
(the headshot falls back to an "RW" tile if it's missing):

| Filename            | Used for                                  | Recommended           |
| ------------------- | ----------------------------------------- | --------------------- |
| `headshot.jpg`      | Intro card + hero portrait (RW tile until added) | 600×600, square, <300KB |
| `og-image.png`      | Social share preview (Open Graph) — included | 1200×630              |

## Tips
- Compress images (tinypng.com or ImageOptim) before committing.
- Keep file names lowercase and use dashes, e.g. `checkout-before.png`.
- Prefer `.webp` for screenshots to cut file size, but `.jpg`/`.png` are fine.

## Referencing an image in HTML
```html
<img src="assets/img/headshot.jpg" alt="Portrait of Raymond Wang" width="600" height="600">
```
