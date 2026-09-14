# ONE-G Lanyard

Based on the official React Bits TS-CSS registry source:
https://reactbits.dev/r/Lanyard-TS-CSS.json

The requested shadcn registry command was attempted, but its HTTPS requests
closed prematurely (including the local-JSON install's neutral color fetch).
Lanyard.tsx and Lanyard.css were therefore extracted directly from the downloaded
official JSON, then adapted for Next.js. No Vite configuration is used.

Official assets, copied without modification:
- public/lanyard/card.glb
- public/lanyard/lanyard.png

Upstream asset directory:
https://github.com/DavidHDev/react-bits/tree/main/src/assets/lanyard

Brand artwork:
- Front: public/brand/one-g-mark.png, unchanged copy of public/logo/1-01.png
  (original: /home/lsh/图片/logo/1-01.png). The source PNG is retained.
- Band: public/lanyard/one-g-band.png, rendered from one-g-band.svg. The
  unchanged Symbol path is repeated in white on a dark band, without text.
  The SVG source is retained; its rotation compensates for the rope UV direction.
- Back: public/brand/one-g-stacked.svg, the existing formal website copy of
  ONE-G Logo文件-09.svg (cropped artboard, unchanged paths).

Integration changes:
- Base-path-aware public URLs, no GLB module import.
- Client-only dynamic import, mounted only below About’s four content sections, before the shared Footer.
- Suspense inside Canvas keeps asynchronous model/physics loading from tearing
  down the WebGL context.
- Contain-fit face artwork; white letterboxing replaces underlying demo artwork.
- Source logo images load on CPU, only the composed atlas uploads to the GPU.
- Typed GLTF/materials and current meshline constructor arguments.
- Disposable custom textures; pointer cancellation resets dragging.
- Mobile DPR 1, original 30Hz physics, 16 curve segments and disabled clearcoat.
- Canvas fills its section; no fixed canvas or global stylesheet/theme changes.

The official rope joints, spherical joint, grab/drag and natural physics remain.
Desktop height: clamp(520px, 65vh, 680px).
Mobile height: clamp(360px, 52svh, 480px).
