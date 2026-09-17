# Browsing and action access model

Public browsing is the default. The former public-page allowlist / default USER guard is retired.

## Public

`/`, `/about`, `/solutions`, `/deep-customization`, `/configure`, `/products`, `/products/*`, public search if added, login/register/password-help pages and all existing legacy configuration redirects. No standalone search page was added in this change.

Header's four navigation items and homepage business CTAs use ordinary Next Link. Product cards/details remain directly accessible. SiteShell no longer wraps public routes in RequireRole.

## Personal and transactional

USER-only roots and descendants: `/cart`, `/checkout`, `/orders`, `/account`, `/order-success`. Orders routes without an existing page are policy coverage, not newly implemented pages. Route matching uses path boundaries, so `/cartoon` is not treated as Cart.

ADMIN-only: `/admin` and descendants, except public `/admin/login`. Existing strict USER/ADMIN separation is retained. Header Cart continues through ProtectedLink to login?returnTo=/cart when anonymous.

## Add to Cart action

AddToCartButton waits for AuthProvider hydration, checks currentUser and USER role before calling the existing cart adapter. Anonymous users cannot write a cart via this UI action. The only application caller of addCartProduct is this guarded button.

Before login it stores a tab-local `one-g-pending-cart-action` hint containing action=add-to-cart, productId, canonical pathname and timestamp. Login receives the original logical pathname plus query/hash in returnTo, using the existing safeReturnTo validation. No basePath is manually duplicated.

After a successful USER login on the matching product page, the hint is consumed once and an accessible status message says “登录成功，请继续加入购物车。” The user clicks again to add. No automatic replay, quantity increment on reload or anonymous cart mutation occurs. Hints expire after 15 minutes. Storage failure still permits login/return navigation and a manual click. No credentials or contact information are stored in this hint. An in-flight click guard avoids concurrent writes.

## Implementation boundary

Static export continues to use client-side SiteShell/RequireRole; no middleware, server sessions or database were introduced. This remains the project's mock frontend authentication, not production server-side authorization. Deep customization contact disclosure is public and has no form submission backend.

Tests: public/role/returnTo/pending-action cases in configuration.test.mjs, and full anonymous→login→return→manual add flow in public-access.browser.cjs.
