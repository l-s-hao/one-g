# ONE-G Lanyard — current TS-CSS implementation

Official registries (the downloaded files are identical):
- https://reactbits.dev/r/Lanyard-TS-CSS.json
- https://raw.githubusercontent.com/DavidHDev/react-bits/9f88cc7c7ea8d057b3bc43a846caf767de78a226/public/r/Lanyard-TS-CSS.json

TSX and CSS come from the same pinned official version. This version is built directly with three and declares three@^0.180.0. ONE-G retains its already-installed three 0.186.0, with matching @types/three 0.186.0. This is newer than the registry semver range; the required APIs were validated by typecheck, build and live rendering instead of downgrading the project. No Three ecosystem upgrades were made.

Current About props are frontImage, backImage, strapImage and imageFit="contain". The official default physical settings are retained. The former position/gravity-array/lanyardImage/lanyardWidth props, GLB loading, preload function and R3F/Rapier/Meshline implementation are no longer used.

Assets (unchanged formal artwork, existing static-export prefix):
- Front and back: /one-g/brand/one-g-mark.png — text-free ONE-G symbol.
- Strap: /one-g/lanyard/one-g-band.png — repeated text-free ONE-G symbols.

The section remains after About contact content and before Footer. It is 600px high on desktop and clamp(360px, 52svh, 480px) on mobile. The component fills its parent. A symbol fallback remains until successful rendering, including WebGL initialization failure.

Local source adjustments:
- Publish settings in the existing post-commit effect instead of mutating refs during render, to satisfy React 19 lint rules.
- Pause the existing RAF while the document is hidden, and remove the visibility listener on unmount.
- Respond to changes in prefers-reduced-motion through the existing settings/physics path; no new animation loop.
- Reserve more horizontal camera room on portrait screens after testing showed default swing clipping; physics and default props are unchanged.
- Mark successful rendering for the local CSS fallback and remove the mark on cleanup.

Official springs, rendering, drag and flip behavior are retained. The old card.glb, lanyard.png and previously installed ecosystem dependencies remain as unused historical assets/dependencies; the new runtime does not load them. Their removal is outside this integration change.
