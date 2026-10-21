# ONE-G: naming, navigation, locale, font and effects audit

## Scope and existing changes

Only the ONE main repository was edited. The starting tree already contained the previous homepage TechText change: src/app/page.tsx plus HomeTechTextHero.tsx/.module.css and TechText.tsx/.css. These were preserved and extended. The initial diff and copies were recorded in /tmp/one-six-audit. No commit, push, database integration, real payment, email or reference-demo repository changes were performed.

## RoboDock and compatibility

The product's display name is **RoboDock**, including product data, homepage, search, metadata, alt text and solution references. The canonical product data remains src/data/products/robotdock.ts. Existing lowercase robotdock IDs, slugs, URLs, asset directories and storage identifiers remain deliberately unchanged. This is the same product, not a new SKU. Current product descriptions come from this source; historical audit documents retain their original source names with a current-name note.

Stable URLs:
- /one-g/products/robotdock/
- /one-g/products/robotdock/specs/
- /one-g/buy/robotdock/

No robodock URL was introduced: keeping existing static-export URLs avoids redirects and preserves package/payment/quantity/login-return compatibility. SONIC Link remains a solution. Both currently displayed RoboDock images were visually inspected: public/products/robotdock/robotdock-concept.png and installation-sketch.png contain no baked RobotDock text. Artwork was not redrawn.

## Product menu

The Header product menu is one untitled list, in this order:

| Chinese | English | Existing destination (Next adds basePath) |
| --- | --- | --- |
| 全部商品 | All products | /products |
| RoboDock | RoboDock | /products/robotdock |
| 机器人 | Robots | /products?category=robot |
| 机械臂 | Robot arms | /products?category=arm |
| 灵巧手 | Dexterous hands | /products?category=hand |
| 视觉系统 | Vision systems | /products?category=vision |

The existing open/close, outside-click, keyboard and mobile mechanisms remain. The solution menu is unchanged apart from its translated presentation. Main navigation remains Shop / Solutions / About, with no configuration or accessory entry.

## Localisation

src/i18n/dictionary.ts contains the local Chinese-keyed English dictionary and TypeScript types. LocaleProvider supplies zh-CN (default) and en, persists only one-g-locale, and synchronises html lang and page title. No external translation API or locale URL changes are used. This does not provide separate English URLs or complete bilingual SEO.

Elements.tsx contains typed React presentation elements and Next Link/Image wrappers. They translate text children and alt/title/placeholder/aria-label, preserve original DOM tags, pass refs and handlers through, and leave form values, IDs, hrefs and business objects unchanged. They do not mutate DOM text, clone entire business components, change locale keys or remount WebGL effects. Free-text enquiry values are explicitly excluded. AboutVision supplies grammatical bilingual inline emphasis rather than concatenating translated Chinese fragments.

Preference restoration happens after mount. useSyncExternalStore supplies the Chinese server snapshot to every newly hydrating boundary, including delayed Suspense content, before consuming the live locale. This resolved a measured late-hydration mismatch in PurchaseReturnLink. Missing dynamic messages log an explicit error; tests/i18n-dictionary.test.cjs verifies all current Chinese source strings against the dictionary so omissions cannot silently become permanent fallbacks.

Coverage includes Header/search/menu, Footer, homepage, products/filters/details/specifications, purchase packages/payment notes, solutions, About, custom engineering, sign-in/verification/errors, account/admin layout and controls, cart/checkout/order states, support form/preview/validation, alt and accessible names. Stable business values remain Chinese-independent. Currency remains CNY and payment integration status is unchanged. Admin gets the same compact language switch; mobile navigation also exposes it.

## Font audit: retained (historical snapshot)

> This section records the earlier system-font implementation. The current homepage no longer mounts TechText. The 2026-10-21 [font audit](./font-audit.md) supersedes the active-font/loading conclusions below with locally hosted OFL Inter Variable and Noto Sans SC; the inactive source Inter asset remains retained.

There is no next/font usage, @font-face declaration, remote font dependency or public font bundle. The existing global declaration remains Arial, Helvetica, sans-serif, with Arial/Helvetica/sans-serif in the Tailwind token. TechText inherits this family and calls document.fonts.load/ready to remeasure and redraw. Its fontWeight remains 600; page weights and type scale are unchanged. The effect label font is a system monospace stack, without embedded commercial font files.

| Font | Actual use / source | License evidence | Weights | Local hosting |
| --- | --- | --- | --- | --- |
| Arial / Helvetica | System-font references, availability depends on the visitor OS | System references only; no proprietary font files copied or redistributed | Existing 400–700 style hierarchy, including intermediate requested weights | No |
| Liberation Sans | Linux browser/system match for Arial in this environment (fc-match Arial) | /usr/share/doc/fonts-liberation2/copyright: SIL OFL 1.1; Google/Red Hat notices | System regular/bold/italic fallback | OS installed, not shipped by site |
| Noto Sans CJK SC | Actual Chinese system match in this environment (fc-match :lang=zh-cn) | /usr/share/doc/fonts-noto-cjk/copyright: SIL 1.1, Google copyright | System regular/bold fallback | OS installed, not shipped by site |
| Inter Variable, version 4.001 | Existing src/components/fonts/InterVariable.ttf; not referenced by active page CSS | src/components/fonts/Inter-OFL.txt, Copyright 2020 Inter Project Authors, SIL OFL 1.1 | Variable 100–900 | Existing source asset, not loaded by current page |

The existing Inter asset and license were retained. System fonts already display both languages appropriately; no unnecessary font replacement, proprietary-file copying or large Chinese font download was introduced. System font rendering varies by visitor platform; this audit does not claim that Arial itself is open-source or that all visitors receive an embedded Noto font.

## MicroSlats and Lanyard sources

Both registry TSX/CSS pairs match the pinned official React Bits commit 9f88cc7c7ea8d057b3bc43a846caf767de78a226. See src/components/MicroSlats/README.md and src/components/Lanyard/README.md for source URLs and local adaptations.

MicroSlats declares ogl@^1.0.11; installed 1.0.11. The requested shadcn command failed with “other side closed”, so the exact downloaded official TS-CSS files were extracted without converting JS or installing another variant. Its required props are retained. It fills only the existing first-screen Hero, with normal header compensation, beneath white TechText. Window pointer listeners and local coordinate checks allow background interaction through the non-intercepting layer. The shared page palette remains unchanged.

Lanyard's website and GitHub registries were identical and are the new direct-three implementation declaring three@^0.180.0. Existing three 0.186.0 was retained; matching @types/three was made an explicit development dependency. 0.186.0 is newer than the registry semver range (not a semver match); compatibility was checked through TypeScript, build, live rendering and interaction. No project-wide upgrade/downgrade was made. Old R3F/Rapier/Meshline props and preload logic are removed from the current instance. Their old dependencies and historical GLB/PNG files remain unused; they are not loaded by the new implementation.

Current Lanyard assets:
- frontImage and backImage: /one-g/brand/one-g-mark.png (formal text-free symbol)
- strapImage: /one-g/lanyard/one-g-band.png (repeated formal text-free symbols)
- imageFit: contain

There is one About instance, after contact and before Footer, with transparent background. Desktop container is 600px; mobile is clamp(360px,52svh,480px). The canvas fills the parent. Portrait camera framing reserves extra room because tests showed the default swing could clip; physical defaults are unchanged. Official interaction and simulation algorithms remain intact. Local adjustments address React ref publication, document-hidden pause, live reduced-motion preference changes and readable fallback. Both effects retain official observer/listener/RAF/resource cleanup. LocalEffectBoundary confines optional-effect failures to their own area.

## Validation artifacts

Browser screenshots and JSON results are in /tmp/one-six-audit. Final results are recorded after the final implementation, separately from earlier failed test runs. The language regression test and lint/type/build results must be read together with final browser results; early failed script runs are not treated as acceptance passes.

## Changed files

- docs/reference-robotdock.md
- docs/website-six-updates.md
- package-lock.json
- package.json
- src/app/about/page.tsx
- src/app/account/page.tsx
- src/app/admin/layout.tsx
- src/app/admin/login/page.tsx
- src/app/admin/page.tsx
- src/app/cart/page.tsx
- src/app/checkout/page.tsx
- src/app/deep-customization/PurchaseReturnLink.tsx
- src/app/deep-customization/page.tsx
- src/app/globals.css
- src/app/layout.tsx
- src/app/login/page.tsx
- src/app/order-success/page.tsx
- src/app/page.tsx
- src/app/products/[id]/page.tsx
- src/app/products/page.tsx
- src/app/solutions/page.tsx
- src/app/solutions/teleoperation/page.tsx
- src/components/AboutHero.tsx
- src/components/AboutVision.tsx
- src/components/AccountActions.tsx
- src/components/AccountOrders.tsx
- src/components/AddToCartButton.tsx
- src/components/AuthCard.tsx
- src/components/BrandLogo.tsx
- src/components/ContactProvider.tsx
- src/components/Footer.tsx
- src/components/Header.tsx
- src/components/HeaderBrand.module.css
- src/components/HomeProductShowcase.tsx
- src/components/HomeTechTextHero.module.css
- src/components/HomeTechTextHero.tsx
- src/components/InlineAuthError.tsx
- src/components/LanguageSwitch.module.css
- src/components/LanguageSwitch.tsx
- src/components/Lanyard/Lanyard.css
- src/components/Lanyard/Lanyard.tsx
- src/components/Lanyard/README.md
- src/components/Lanyard/assets.ts
- src/components/LanyardBrandSection.module.css
- src/components/LanyardBrandSection.tsx
- src/components/LegacyConfigurationRedirect.tsx
- src/components/LegacySonicLinkRedirect.tsx
- src/components/LocalEffectBoundary.tsx
- src/components/MagicBento.tsx
- src/components/MagicBentoEffect.tsx
- src/components/MicroSlats/MicroSlats.css
- src/components/MicroSlats/MicroSlats.tsx
- src/components/MicroSlats/README.md
- src/components/OrderSummary.tsx
- src/components/PaymentSelector.tsx
- src/components/ProductCard.tsx
- src/components/ProductDetailContent.tsx
- src/components/ProductLocalNav.tsx
- src/components/ProductPurchase.tsx
- src/components/ProductStatusBadge.tsx
- src/components/ProductVisual.tsx
- src/components/ProtectedLink.tsx
- src/components/RequireRole.tsx
- src/components/ScrollExpand/ScrollExpand.tsx
- src/components/ShineBorder.tsx
- src/components/SiteShell.tsx
- src/components/SolutionExplorer.tsx
- src/components/SupportButton.tsx
- src/components/TechText.css
- src/components/TechText.tsx
- src/components/VerificationLogin.tsx
- src/components/ui/shimmer-button.tsx
- src/data/products/robotdock.ts
- src/data/site-navigation.ts
- src/data/solutions.ts
- src/i18n/Elements.tsx
- src/i18n/LocaleProvider.tsx
- src/i18n/dictionary.ts
- tests/i18n-dictionary.test.cjs

## Recorded acceptance results

- npm run lint: passed. Independent npx tsc --noEmit: passed. npm run build: passed, static export produced successfully (38 generated routes).
- node --test tests/i18n-dictionary.test.cjs: passed.
- /tmp/one-six-audit/final-dev-results.json: 74 checks passed; no browser errors or asset failures. Covers bilingual pages, demo-user/admin UI, form/selection/session/URL preservation and 375/390/430px layouts.
- /tmp/one-six-audit/effect-results.json: 20 checks passed. Includes background pointer splats through the foreground, glyph drag, real Lanyard raycast/drag/release, no scene replacement on locale change, offscreen/hidden-tab pause, cleanup, native mobile touch scrolling and WebGL failure fallback. No runtime exceptions.
- /tmp/one-six-audit/final-static-results.json: direct static URLs, bilingual title/lang, full-refresh preference and package/payment/quantity preservation, all five GSAP Flip categories, legacy SONIC purchase-to-solution compatibility and six requested viewport sizes passed, without hydration or asset errors.

The full historical browser suite was not run; several of its files still target removed themes/old homepage/legacy product behaviour. No claim is made that these stale suites passed. Browser checks used local Chromium; other browser engines were not tested. WebGL-unavailable tests deliberately prevent context creation; normal-page checks have no runtime or asset errors.

Visual recheck before the subsequent shared-navigation update: the single product panel measures 280×246px, with six 15px links sharing the same left edge and no group headings. Final 375/390/430px portrait Lanyard framing and Chinese screenshots are recorded in final-snapshot-results.json (9 checks passed, no runtime/asset errors). Normal source changes were followed by a successful final build with exit code 0. Earlier interrupted build attempts were retried and are not treated as successful checks.

Representative screenshots:
- /tmp/one-six-audit/screenshots/final-home-zh-desktop.png
- /tmp/one-six-audit/screenshots/final-menu-en-desktop.png
- /tmp/one-six-audit/screenshots/static-home-en-375.png
- /tmp/one-six-audit/screenshots/lanyard-desktop.png
- /tmp/one-six-audit/screenshots/final-lanyard-zh-375.png


Subsequent homepage and shared-navigation updates: MicroSlats now uses the fixed page background #F7F4EE, brand blue #3A73D9 and white glints, with slatWidth 16 and slatHeight 35; its other requested settings remain unchanged. TechText keeps ONE - G and all interaction settings, with fontSize 240, color #17191D and accentColor #3A73D9. Desktop Canvas measurements confirm 240px at 1366/1440/1920px; mobile uses the original automatic fitting.

The shared Header is 44px on desktop and 48px below 1024px, with a 1040px content container, warm translucent background and full-width dropdown panels. Product-specific compact-panel rules were removed. Hover opens after 120ms, pointer departure closes after 180ms, and panel transitions take 240ms unless reduced motion is enabled. Closed panels are inert. Homepage remaining height, product local navigation and existing anchor offsets reference the shared height variable. The final navigation/layout browser audit passed all 76 checks with no runtime errors or asset failures; source interactions and cleanup were also checked. No purchase, authentication, contact or payment business logic changed in these follow-ups.
