# Brand asset audit — 2026-09-14

Source inventory: `/home/lsh/图片/logo/` contains 大号文字 03–06 in SVG and PNG,
Logo文件 01/02/09/10 in SVG, Logo文件 09/10 in PNG, and 1-01/1-02 PNG.
The selected formal artwork reads ONE-G / 万机智能. Website asset mapping and
viewBox bounds are documented in `public/brand/README.md`.

The existing BrandLogo component centrally supplies horizontal, stacked and
mark variants. Shared Header covers home, products, customize/start, customize,
cart, checkout, account, about and authentication pages. Both Footer components,
AuthCard (login/register/forgot-password), About and AdminLayout also reuse it.
Metadata uses the new Symbol SVG and its 192px PNG fallback.

Only the HeroLogoText string changed to `ONE - G`; all ShinyText parameters,
font styling and the existing nowrap rule remain unchanged. Product names,
configuration headings, ParticleText and body text are untouched.

DriftWall discovery explicitly excludes logo/logos/brand/mark/marks/symbol/symbols
folders, case-insensitively. Its animation and product assets are unchanged.

The superseded SVGs and PNG fallback copies are removed only after checking
source/CSS/metadata references, successful new asset rendering and production
build. Formal source files outside the project are retained.
