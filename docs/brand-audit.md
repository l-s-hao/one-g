# ONE-G brand audit

Scanned the project recursively, excluding node_modules, .next, dist, build, .git
and generated out. Matched logo/one-g/oneg/brand/mark/symbol image names and searched
source for ONE-G, Robotics, logo, brand, img/Image and background-image usage.

## Canonical assets found before changes

| Path | Format / canvas | Transparent | Text | Background use |
| --- | --- | --- | --- | --- |
| public/brand/one-g-mark.svg | SVG / 1417.32 square viewBox | Yes | No | currentColor for dark/light; standalone favicon follows browser scheme |
| public/brand/one-g-logo-horizontal.svg | SVG / 793 × 353 viewBox | Yes | ONE-G / 万机智能 outlines | currentColor, with contrasting backing on pale surfaces |
| public/brand/one-g-logo-stacked.svg | SVG / 393 × 529 viewBox | Yes | ONE-G / 万机智能 outlines | currentColor, with contrasting backing on pale surfaces |
| public/brand/one-g-mark.png | PNG / 192 × 192 | Yes | No | Black Mark, light backgrounds; icon fallback only |
| public/hero/one-g-mobile.png | PNG / 3840 × 2160 | No | Product artwork, not a logo | Preserve product image |
| public/hero/one-g-arm.png | PNG / 3840 × 2160 | No | Product artwork, not a logo | Preserve product image |
| public/hero/one-g-service.png | PNG / 3840 × 2159 | No | Product artwork, not a logo | Preserve product image |

The canonical SVGs originate from 01 (Mark), 03 (horizontal), 09 (stacked).
This pass leaves them byte-for-byte unchanged, including their existing viewBoxes.
The original source folder `/home/lsh/图片/logo` also holds transparent PNGs;
copies of 01/03 transparent variants and the original 09 PNG are in brand/fallback.
No originals are removed. 05/07 and their PNG variants use the old Robotics brand
and are not adopted. No Robotics brand display or reference existed in project
source. Unreferenced public/next.svg and public/vercel.svg are template vendor
assets, not ONE-G brand assets; they remain unused and unchanged.

## Usage classification and action

| Location | Before | Action |
| --- | --- | --- |
| Header.tsx, desktop | Official horizontal SVG mask | Share BrandLogo, preserve size/spacing/65px total Header height |
| Header.tsx, mobile | Official horizontal SVG mask | Compact Mark, keep menu separate |
| Footer.tsx, non-home pages | ONE - G / 万机智能 text branding | Official horizontal BrandLogo |
| HomeFooter.tsx | siteContent.footer.brand text branding | Official horizontal BrandLogo; retain copyright text |
| AuthCard.tsx, login/register | Plain ONE-G brand link | Official stacked BrandLogo |
| AuthCard.tsx, forgot-password | Plain ONE-G brand link | Compact horizontal BrandLogo |
| about/page.tsx | Heading/body text, no standalone brand image | Add stacked BrandLogo; preserve heading, copy and product image |
| layout.tsx favicon | Formal Mark SVG and PNG | Keep SVG; point PNG fallback to fallback directory |
| HeroLogoText.tsx, app/page.tsx | Animated ONE-G text | Preserve ShinyText and hero title |
| AboutCTASection.tsx | Company heading and BUILD YOUR ONE-G | Preserve headings and ParticleText |
| CoreProductSection.tsx and products data/pages | ONE-G G1 / G1 Pro / Arm product names | Preserve product names and images |
| customize/start, customize | START YOUR BUILD / CONFIGURE YOUR ONE-G / product and module names | Preserve all business content |
| cart, checkout, account | Product names, order/account data | Preserve business content; shared shell gets brand update |
| Mobile menu | Text navigation / UI icons | Preserve navigation and icons |

`BrandLogo` uses SVG masks with currentColor from --text: white, #F5EFEA,
#F1DDDF, #FBF1D7. Theme selection remains restricted by the existing auth rules.
Screen-reader label is ONE-G 万机智能; home links point to `/` via Next Link.

## PNG fallback copies

| Path | Dimensions | Transparency | Content / use |
| --- | --- | --- | --- |
| public/brand/fallback/one-g-mark.png | 2048 × 2048 | Yes | Black 01 Mark; light-background fallback |
| public/brand/fallback/one-g-logo-horizontal.png | 2048 × 2048 | Yes | Black 03 horizontal on original square canvas; light-background fallback |
| public/brand/fallback/one-g-logo-stacked.png | 5906 × 5906 | Yes | Black 09 stacked on original square canvas; light-background fallback |
| public/brand/fallback/one-g-mark-icon.png | 192 × 192 | Yes | Compact Mark favicon fallback |

## Interior Header refinement

The former dark rectangle was the Header link's CSS background, not a background
inside the SVG. Interior links now have transparent backgrounds and use the
Header surface's --ink foreground (fallback #111), passed through BrandLogo's
header context/currentColor. Desktop horizontal Logo is 26px high (about 58.4px
wide); mobile Mark is 24px square. Existing link widths, container spacing and
65px total Header height remain unchanged. Home keeps its existing brand styling.
Login/register/forgot-password now mount the same shared Header in SiteShell;
their in-card brand logos and form components are unchanged by this refinement.

## Header readability sizing

Desktop Header now totals 64px; mobile totals 56px. Desktop horizontal width is
130px, with the existing 793:353 aspect ratio (about 57.9px high), on both hero
and interior headers. A 140px trial measured 62.3px high and left insufficient
vertical space. The SVG artwork occupies 788.54 × 348.82 within its 793 × 353
viewBox; no artboard cropping or path edits were needed. Mobile uses a 28px Mark.
Navigation is 15px/500, line-height 1, gap 36px. Desktop utility icons are 19px,
gap 20px. Existing centered grid, routes, navigation ordering, page widths and
Hero ShinyText remain unchanged.
