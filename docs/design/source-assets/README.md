# Photography source masters

Lossless PNG masters for the approved Zenward Mobility marketing photography,
moved here from `public/images/incoming/`. **Not served** — nothing here ships
to the browser. The website loads only the optimized `.jpg` derivatives in
`public/images/`.

These PNGs are pixel-identical to the supplied originals (re-encoded losslessly
by `sharp` during the move; file sizes differ, image data does not).

| Master | Production derivative | `brandImages` key |
|---|---|---|
| `zenward-hero-desktop-v3.png` (1376 × 768, 16:9) | `public/images/zenward-hero-desktop-v3.jpg` | `heroDesktop` |
| `zenward-hero-mobile-v3.png` (768 × 1376, 9:16) | `public/images/zenward-hero-mobile-v3.jpg` | `heroMobile` |
| `zenward-van-walker-assist.png` (1264 × 848) | `public/images/zenward-van-walker-assist.jpg` | `vanWalkerAssist` |
| `zenward-staff-walking-assist.png` (1264 × 848) | `public/images/zenward-staff-walking-assist.jpg` | `staffWalkingAssist` |

The homepage hero now has dedicated desktop (16:9) and mobile (9:16 portrait)
crops of the same shoot. Each supersedes the previous single hero; earlier
hero masters/derivatives (`Hero Image 1` 1024², `zenward-hero-ramp-assist`,
`-v2`) were removed. `-v3` filenames are deliberate cache-safe new URLs.

Full descriptions, usage, alt text and crop notes: [`../brand-assets.md`](../brand-assets.md).

## Regenerating a production derivative

```
# supporting images
sharp("docs/design/source-assets/<name>.png")
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/images/<name>.jpg")

# homepage hero crops (LCP — prioritise quality)
sharp("docs/design/source-assets/zenward-hero-desktop-v3.png")
  .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile("public/images/zenward-hero-desktop-v3.jpg")
# ...and likewise zenward-hero-mobile-v3
```

Rules: native resolution only (never upscale a master), and never re-compress
an existing `.jpg` — always start from the PNG master here.
