# ONE-G MicroSlats

Source: official TS-CSS registry https://reactbits.dev/r/MicroSlats-TS-CSS.json
Pinned equivalent: https://raw.githubusercontent.com/DavidHDev/react-bits/9f88cc7c7ea8d057b3bc43a846caf767de78a226/public/r/MicroSlats-TS-CSS.json
The downloaded registries match exactly. TSX and CSS were extracted together after the requested shadcn CLI failed with “other side closed”. Dependency: ogl@^1.0.11; installed 1.0.11. No alternate component/version was installed.

The component is mounted only behind TechText in HomeTechTextHero. All requested props are retained, including the swell preset, brand blue #3A73D9, page background #F7F4EE and white glints and cursor interaction. The existing Hero height remains unchanged. The background uses pointer-events:none: official window listeners translate event coordinates into the component's rectangle, so front glyph dragging and background fluid interaction both work without an event relay.

Local source changes are confined to initialization failure handling, dynamic reduced-motion preference changes, and pausing the existing loop while the browser tab is hidden. Official shader, fluid and interaction algorithms are unchanged. The wrapper has a local error boundary; a failed optional effect leaves the standard page background and dark, readable TechText intact. Existing observer/listener/resource cleanup is preserved.
