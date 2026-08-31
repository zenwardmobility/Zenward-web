# Photography source masters

Lossless PNG masters for the approved Zenward Mobility marketing photography,
moved here from `public/images/incoming/`. **Not served** — nothing here ships
to the browser. The website loads only the optimized `.jpg` derivatives in
`public/images/`.

These PNGs are pixel-identical to the supplied originals (re-encoded losslessly
by `sharp` during the move; file sizes differ, image data does not).

| Master | Production derivative | `brandImages` key |
|---|---|---|
| `zenward-hero-ramp-assist-v2.png` (1376 × 768) | `public/images/zenward-hero-ramp-assist-v2.jpg` | `heroRampAssist` |
| `zenward-van-walker-assist.png` (1264 × 848) | `public/images/zenward-van-walker-assist.jpg` | `vanWalkerAssist` |
| `zenward-staff-walking-assist.png` (1264 × 848) | `public/images/zenward-staff-walking-assist.jpg` | `staffWalkingAssist` |

The hero was replaced with a higher-quality, wider (16:9) version; the old
1024 × 1024 `Hero Image 1` master and its `zenward-hero-ramp-assist.jpg`
derivative were removed. `-v2` in the filename is a deliberate cache-safe new
URL, not a variant to keep alongside an old one.

Full descriptions, usage, alt text and crop notes: [`../brand-assets.md`](../brand-assets.md).

## Regenerating a production derivative

```
# supporting images
sharp("docs/design/source-assets/<name>.png")
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/images/<name>.jpg")

# homepage hero (LCP — prioritise quality)
sharp("docs/design/source-assets/zenward-hero-ramp-assist-v2.png")
  .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: "4:4:4" })
  .toFile("public/images/zenward-hero-ramp-assist-v2.jpg")
```

Rules: native resolution only (never upscale a master), and never re-compress
an existing `.jpg` — always start from the PNG master here.
