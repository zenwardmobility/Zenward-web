# Photography source masters

Lossless PNG masters for the approved Zenward Mobility marketing photography,
moved here from `public/images/incoming/`. **Not served** — nothing here ships
to the browser. The website loads only the optimized `.jpg` derivatives in
`public/images/`.

These PNGs are pixel-identical to the supplied originals (re-encoded losslessly
by `sharp` during the move; file sizes differ, image data does not).

| Master | Original supplied name | Production derivative | `brandImages` key |
|---|---|---|---|
| `zenward-hero-ramp-assist.png` (1024 × 1024) | `Hero Image 1.png` | `public/images/zenward-hero-ramp-assist.jpg` | `heroRampAssist` |
| `zenward-van-walker-assist.png` (1264 × 848) | `Staff assist 2.png` | `public/images/zenward-van-walker-assist.jpg` | `vanWalkerAssist` |
| `zenward-staff-walking-assist.png` (1264 × 848) | `Staff Assist.png` | `public/images/zenward-staff-walking-assist.jpg` | `staffWalkingAssist` |

Full descriptions, usage, alt text and crop notes: [`../brand-assets.md`](../brand-assets.md).

## Regenerating a production derivative

```
sharp("docs/design/source-assets/<name>.png")
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/images/<name>.jpg")
```

Rules: native resolution only (never upscale a master), and never re-compress
an existing `.jpg` — always start from the PNG master here.
