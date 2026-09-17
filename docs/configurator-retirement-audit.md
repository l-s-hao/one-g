# Configurator retirement audit

2026-09-17 · Information architecture reset, after STEP 10.

## Evidence and sequence

1. Read current Product records, route dependencies, the static-export guide and component references using `rg`.
2. Replace formal `/configure` and all five legacy route bodies; disconnect product CTA from the Registry. First lint and static build passed before deleting UI.
3. Check references again, remove isolated UI trees; TypeScript/build verify the remaining imports. `docs/site-reset-deleted-files.txt` is the complete removal manifest.
4. Current browser coverage is `tests/site-reset.browser.cjs`; old STEP 9–10 interaction scripts are historical evidence under `tests/legacy`, not current acceptance criteria.

## A — Removed after reference verification

Home-only CoreProductSection, HardwareEcosystemSection, CapabilitiesSection, AboutCTASection and their CSS. Their only homepage usages were removed. FinalCTAParticleTitle and ParticleText (including CSS) had no other callers and were removed. No image assets or shared animation dependencies were removed.

ConfigureEntry, ConfiguratorClient, RobotConfigurationPreview, ConfigurationWorkbench, RecommendedBuild, their dedicated CSS, useLocationSuffix and SiteShell's desktop workbench stylesheet were removed after formal routes passed the first build. Also removed unused capabilities fixtures/adapter/type and old configuration metadata helper.

This removes the actual workbench UI, not merely its links. No application route renders module selection, drag/drop, progress, dynamic pricing, save or configuration cart actions.

## B — Required compatibility and historical data readers

The five static pages `/configure/robot`, `/configure/robotdock`, `/configure/sonic-link`, `/customize`, `/customize/start` remain. One LegacyConfigurationRedirect renders an accessible fallback link and uses router.replace('/configure') after login. Canonical metadata targets `/configure`; legacy pages are noindex. Old scene/scope/query/hash are ignored. No Next server redirect or rewrite is required.

`configuration-routing.ts` also normalizes login returnTo for these exact legacy paths. Auth routing continues to reject external destinations and role-incompatible URLs.

`cart.ts → robotSchema / configuration/storage / configuration/policy` remains a live dependency. It reads old Robot snapshots and freezes saved names/prices while checking sale eligibility. The engine, shared configuration types, Robot adapter, options and migration reader therefore cannot all be deleted without changing existing cart behavior. Existing storage is never proactively cleared by this migration.

## C — Retained for explicit legacy test coverage, not future product UI

RobotDock/SONIC schemas, Registry, configuration catalog/action helpers and compatibility/recommendation rules are still exercised by `tests/configuration.test.mjs`. They are not imported by the new configure/solutions pages or product navigation resolver. Robot scene/scope data remains part of the retained robotSchema and old storage tests; Solutions has independent editorial data without recommendations.

These are transitional technical debt, not a commitment to restore the configurator. A subsequent bounded cleanup can split the historical snapshot reader from authoring/selection logic, then remove schemas and tests that no longer protect stored data. No database work is included.

Old homepage display CSS may still contain dormant section selectors; shared Hero/About styling is intentionally not broadly rewritten. ProductStatus's legacy configuration-oriented wording and old browser acceptance scripts are historical cleanup candidates.
