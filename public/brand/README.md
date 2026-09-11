# ONE-G / 万机智能

- `one-g-mark.svg`: Symbol and primary favicon, from ONE-G Logo文件-01.svg.
- `one-g-logo-horizontal.svg`: horizontal master logo, from ONE-G Logo文件-03.svg.
- `one-g-logo-stacked.svg`: stacked logo, from ONE-G Logo文件-09.svg.
- `one-g-mark.png`: raster fallback / Apple touch icon, rendered from the Symbol.

The 05 and 07 Robotics variants are not used. All original path data, transforms,
letterforms and artwork proportions are unchanged. Horizontal and stacked viewBoxes
only remove excess empty artboard space. SVG fill inherits currentColor.

Header uses the horizontal SVG as a CSS mask, with currentColor from the existing
--text theme token: #FFFFFF / #F5EFEA / #F1DDDF / #FBF1D7. This is necessary because
external SVG images in an img tag cannot inherit the surrounding text color.
The compact backing uses --bg for contrast on pale navigation surfaces. Its fixed
96px width and proportional height fit the existing 64px Header content row.
The standalone Symbol favicon adapts to the browser's light/dark color scheme;
it does not inherit the page theme. PNG is only an icon fallback.

## Shared component

`src/components/BrandLogo.tsx` supports mark/horizontal/stacked and sm/md/lg.
It exposes `role="img"` with the accessible name `ONE-G 万机智能`, equivalent to
alt text, and uses the canonical SVG as a currentColor mask. Mobile Header uses
Mark, desktop Header and both Footers use horizontal, login/register use stacked,
forgot-password uses a compact horizontal, and About uses stacked.

PNG copies are in `fallback/`: the original transparent 01/03 variants and original
09 PNG, plus `one-g-mark-icon.png` for compact favicon/Apple fallback. The earlier
root PNG is retained for compatibility; no original asset was deleted.

This integration does not change SVG path data, viewBoxes or artwork proportions.
Hero ShinyText, ParticleText, product names, section headings and body copy remain
text. No 05/07 Robotics logo is used.
