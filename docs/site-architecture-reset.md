# ONE-G site architecture reset

2026-09-17. Current business direction supersedes the multi-product configuration platform described in STEP 5–10 documents.

RobotDock is the core hardware product. SONIC Link is presented as teleoperation/system capability. The site now separates system explanation, task applications and the existing catalogue.

## Information architecture

- `/`: existing DriftWall / ONE - G / ShinyText Hero, three CTA links (配置、解决方案、商品中心), HomeFooter and existing support control. All subsequent homepage business sections removed. Hero media, visual components and About remain unchanged.
- Shared desktop/mobile and home footer navigation: 配置 `/configure`, 解决方案 `/solutions`, 商品中心 `/products`, 了解公司 `/about`. Utility controls unchanged. Interior Footer retains its existing logo-only design.
- `/configure`: system introduction; dominant RobotDock hardware section (concept image, status, functions, interfaces, compatibility, expandable package contents); secondary SONIC Link capability section (actual modes, equipment, workflow); role diagram; task links and real photo showcase; expandable canonical specs; support/solutions/catalogue CTA. No interactive configuration or purchasing of a complete system.
- `/solutions`: public editorial overview with four anchor sections: handling 搬运, inspection 巡检, teleoperation 遥操作, ai 智能任务. Each describes tasks, supported/planned capabilities, related systems and limits. Not a scene picker and not customer deployment evidence.
- `/products` and existing detail routes remain. Catalogue files, product fields, order, prices, media and cart logic are unchanged. RobotDock/SONIC (and former robot configuration links) now use the independent product-actions resolver to link to `/configure` with “查看系统配置”.

## Content and status

The system page reads `src/data/products/robotdock.ts` and `sonic-link.ts` directly. Images are reused at their existing `/one-g/products/...` paths, with source captions/alt text; no new assets, iframe or external demo navigation. Demo content is static photos, not video or technical specification.

RobotDock remains concept, without price. SONIC Link remains coming-soon, without price. Planned interfaces and unconfirmed G1 permissions/versions, device models and delivery terms remain explicit. The system diagram describes roles only: RobotDock's specific integration with the SONIC package is not falsely represented as a production-validated topology.

`Solution` and `solutions.ts` replace the four scene concepts in the formal flow. Names/IDs derive from existing scene records, while copy is grounded in current product facts. No scene→module recommendation maps are moved. Autonomous inspection/AI deployments and performance numbers are not invented.

## Routes, auth and themes

All five legacy URLs statically export and converge on `/configure`, ignoring scene/scope. They remain USER guarded; login returnTo canonicalizes to `/configure`. Solutions is public. Products/account/cart access policies are unchanged. Normal and accessibility themes apply to both new pages. Brand lock remains only `/` and `/about`; media is not inverted.

## Retirement and data protection

See `configurator-retirement-audit.md` and `site-reset-deleted-files.txt`. The workbench UI was disconnected, built successfully, then deleted after reference verification. The old schema/engine storage chain needed by Cart and legacy unit tests remains. No user storage was wiped. Historical browser scripts are not acceptance tests for the new strategy.

Search remains its existing Header placeholder; this repository has no general page-content search index to extend. Product catalogue search is unchanged.

## Verification

- `npm run lint`: PASS, existing img warnings in DriftWall and ScrollExpand only.
- `npm run build`: static export includes solutions, configure and all five compatibility pages.
- `tests/site-reset.browser.cjs`: route/auth, Hero section count, navigation/CTA, legacy redirects, seven themes, responsive layout, brand lock, storage preservation, product cart; additional mobile/support/media checks.
- `tests/configuration.test.mjs`: retained legacy engine/storage/snapshot regressions.
- `tests/site-reset-baseline.json`: hashes preserve canonical product data, Hero components, About page and cart implementation.
- References remain read-only: robotdock-demo `218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`; sonic-link-demo `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`.

No fourth product, database, admin CRUD, homepage visual redesign or About redesign.
