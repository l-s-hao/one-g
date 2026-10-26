/** Only this current preference key is migrated; account/cart/draft keys are untouched. */
export const themeStorageKey = "one-g-appearance-v1";
export function normalizeStoredTheme(value: unknown): "light" | "dark" {
  return value === "dark" || value === "night" || value === "color-vision-safe" ? "dark" : "light";
}
// Runs before next-themes reads storage, keeping its first DOM application in the two-mode domain.
export const themeMigrationScript = `try{const key=${JSON.stringify(themeStorageKey)};const value=localStorage.getItem(key);if(value!==null){const next=value==="dark"||value==="night"||value==="color-vision-safe"?"dark":"light";if(value!==next)localStorage.setItem(key,next)}}catch{}`;
