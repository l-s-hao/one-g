# Product architecture v2

2026-09-17. Supersedes the earlier homepage/system-overview reset where the two offerings appeared in the ordinary catalogue.

## Product responsibilities

- RobotDock is the primary configurable hardware offering. SONIC Link is teleoperation/control capability, presented second.
- Home: two product advertisements followed by RobotDock and SONIC Link introductions. Product explanation, interfaces, workflow, real demonstration photos and specifications; no bundle lists or bundle choices.
- `/configure`: four RobotDock packages, three SONIC Link packages, the existing optional gripper description, shared-system scope and contact/quote actions. No workbench, selection state, save, progress, price calculation or cart action.
- `/solutions`: existing independent task/application page, public access unchanged.
- `/products`: ordinary products only. Their names, images, prices, ordering and cart logic remain unchanged. RobotDock and SONIC Link remain in canonical Product data, but `isConfigurableOffering` filters them out of the catalogue in every category.
- Existing `/products/robotdock` and `/products/sonic-link` remain detailed-content URLs, not catalogue cards. Full package lists were removed there in favour of links to `/configure`.

## Shared data

`src/data/configurable-offerings.ts` holds product IDs, anchors and media indices, not copied Product objects. `src/lib/configurable-offerings.ts` resolves canonical Product records and exposes packages directly from `Product.detail.bundles`; there is no second editable package dataset. Facts remain in `src/data/products/robotdock.ts` and `sonic-link.ts`.

RobotDock: small backpack, backpack + dexterous hand, backpack + gripper, backpack + gripper + two wrist cameras. SONIC Link: three-point, full-body and dual-mode. Existing model/delivery unknowns are preserved. RobotDock remains concept; SONIC Link remains coming-soon. Neither has a formal price or package Cart operation. Contact uses site-contact via SupportButton.

The existing search icon is a placeholder, not a general content-search index; no search system was invented. Both offerings remain discoverable on the public homepage and via existing detail URLs.

## Advertisement interaction and media

Native React state, Pointer Events and CSS translate implement the two-slide carousel. Mouse drag, touch swipe, arrow buttons, keyboard left/right on the region and numbered pagination are supported. Current page is expressed with aria-current and an underline, not colour alone. Inactive slides are inert. Vertical scrolling remains available through touch-action: pan-y. Manual advance only, no autoplay timer. Reduced motion disables the transition.

Slide 01 reuses `/one-g/products/robotdock/robotdock-concept.png`, clearly labelled as an AI concept rendering, not a real product photograph. No real RobotDock device photo is present in the confirmed data. Slide 02 reuses `/one-g/products/sonic-link/device-pico-kit.jpg`, the team PICO-device photo. No stone photograph is used as a background. Intro sections also reuse installation-sketch and the two SONIC demo photos; all assets keep captions/alt text. Mobile uses contained images and separate copy instead of narrow crops.

## Themes

Preferred theme IDs: `caribbean-calcite`, `night`. Accessibility: null or `color-vision-safe`. Effective theme is accessibility override, then preferred theme, except `/about` retains its independent brand palette. Homepage has no brand lock.

| Token | Caribbean Calcite | Night |
| --- | --- | --- |
| --bg | #F0E6D2 | #0B0D0E |
| --surface | #F6EEDC | #141719 |
| --surface-2 | #E4D5B8 | #1D2225 |
| --color-primary | #7FC4C2 | #7FC4C2 |
| --color-secondary | #A8DCD9 | #A8DCD9 |
| --accent | #C9A97E | #7FC4C2 |
| --text | #38342E | #F4F4F1 |
| --text-muted | #655D50 | #A9B0B2 |
| --border | #CDBFA6 | #30373A |

ONE-G Dark (including stored dark / one-g-dark), zandan-green, aegean-blue, falu-red, burnt-brick and monochrome no longer exist as theme types or CSS selectors. Any unknown/retired preferred ID is rewritten to caribbean-calcite when that user's preference is read. Retired accessibility IDs become explicit null; color-vision-safe remains enabled. Other users' data and carts are not cleared.

Account/Admin use the same two radio appearance options and Standard/Color Vision Safe accessibility settings. Images are never inverted. About ScrollExpand and Lanyard behavior/assets remain intact; only the obsolete monochrome stylesheet rule was removed.

## Retirement

DriftWall, ResponsiveDriftWall, HeroLogoText, ShinyText, their dedicated CSS and the homepage image-scanning helper are removed after reference checks. ParticleText was already removed in the preceding reset and has no source references. Motion was used only by ShinyText and is removed from package.json/lockfile. GSAP and Three dependencies still serve other components and are retained.

ConfiguratorClient and ConfigurationWorkbench remain absent. Three old configure routes and two customize routes continue to redirect client-side to `/configure`, compatible with static export. Historical schema/storage code remains solely for existing snapshot compatibility/tests; it is not used by the new pages. No database work.

## Validation

Current tests: `tests/product-v2.test.mjs` (migration, resolver, package identity, catalogue ordering and protected hashes), `tests/product-v2.browser.cjs` (three themes across six pages, mobile widths, mouse/touch carousel, account/admin controls, package/catalogue split, redirects, About and Cart). Earlier reset browser tests describe superseded UI and are archived.

Lint/build and browser results are reported in the completion message. Reference repositories remain read-only and are verified against the audit baseline.

Final verification: lint PASS (only the existing ScrollExpand img warning), clean build PASS, offering/theme unit tests PASS, full browser regression PASS. Both reference working trees clean with unchanged HEAD and baseline file hashes.

## Subsequent focused UI adjustment

Solutions now contains only a compact hero, four cards and one shared CTA. The About-only brand exception has been removed from the resolver/provider/shell, and the unused BrandThemeBoundary/home-display stylesheet and brand palette have been removed. About, including ScrollExpand and the transparent Lanyard canvas wrapper, uses the same effective theme as all ordinary pages. This supersedes the About brand-lock statements above.

The Product Center hides the accessory filter; the internal category and all product records remain intact. Legacy `?category=accessory` resolves to the default All filter. Homepage, package page and ordinary product/cart data are unchanged.

## Standard configuration and deep customization

Standard Configuration `/configure` describes existing RobotDock packages and SONIC Link system options. Package consultation and quotes are ordinary presales assistance, not engineering customization.

Deep Customization `/deep-customization` covers needs outside standard offerings: nonstandard mechanical structures, dimensions/tooling, hardware interfaces/protocols, robot adaptation, sensing/software/algorithms and joint development. It explains four engineering areas and the requirement → assessment → agreement → development/integration process. No guaranteed price/timeline or backend submission is claimed; its contact disclosure reuses site-contact through SupportButton.

Solutions' former generic consultation CTA is replaced by “标准方案无法满足需求？” linking to Deep Customization and Standard Configuration. Configure adds an engineering escalation entry below its unchanged package content. Both footers link to Deep Customization; the four-item main navigation remains unchanged. Floating customer service and ordinary package quotes are retained.

### Solutions information architecture reference

Reviewed Tencent Cloud's official solution index: https://cloud.tencent.com/solution . Borrowed the organizational sequence of scenario categories, solution descriptions, related capabilities and a common next action. ONE-G uses five compact categories, four media cards, one-at-a-time inline details and a small system-role diagram. Product evidence and validation boundaries come from existing ONE-G data.

Did not copy Tencent's visual system, wording, industry mega-directory, cloud product catalogue or customer cases. No customer names, deployment counts or efficiency claims were added. Existing ONE-G assets only; RobotDock concept imagery stays labelled.

### Access model update

All browsing, including products and standard configuration, is now public. Only account/personal/transaction pages and add-to-cart actions require USER login; admin remains ADMIN-only. This supersedes older protected product/configure statements. See auth-access-model.md. Homepage carousel behavior, product records and reference repositories are unchanged.
