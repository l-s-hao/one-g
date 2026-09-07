import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const ALL_IMAGE_EXTENSIONS = new Set([...IMAGE_EXTENSIONS, ".gif", ".svg"]);
const EXCLUDED_DIRECTORIES = new Set(["node_modules", ".next", "dist", "build", ".git", "coverage", "out", ".cache"]);
const EXCLUDED_IMAGE_NAMES = new Set(["logo", "icon", "icons", "favicon", "ui", "social", "arrow", "menu", "cart", "search"]);
const SITE_BASE_PATH = "/one-g";

function isExcluded(filePath: string) {
  return filePath.split(path.sep).some((part) => EXCLUDED_DIRECTORIES.has(part));
}

function collectFiles(directory: string, files: string[] = [], extensions = IMAGE_EXTENSIONS) {
  if (!fs.existsSync(directory) || isExcluded(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (isExcluded(fullPath)) continue;
    if (entry.isDirectory()) collectFiles(fullPath, files, extensions);
    else if (extensions.has(path.extname(entry.name).toLowerCase()) && !EXCLUDED_IMAGE_NAMES.has(path.basename(entry.name, path.extname(entry.name)).toLowerCase())) files.push(fullPath);
  }
  return files;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return hash >>> 0;
}

export function getProjectImages() {
  const projectRoot = process.cwd();
  const publicRoot = path.join(projectRoot, "public");
  const candidateRoots = ["public/images", "public/assets/images", "public/products", "public/hero", "images", "assets/images", "assets/products", "assets/hero"].map((directory) => path.join(projectRoot, directory));
  const discovered = candidateRoots.flatMap((directory) => collectFiles(directory));
  const uniqueFiles = [...new Map(discovered.map((filePath) => [fs.realpathSync(filePath), filePath])).values()]
    .filter((filePath) => !filePath.includes(`${path.sep}generated${path.sep}`))
    .sort((left, right) => stableHash(left) - stableHash(right) || left.localeCompare(right));
  const publicGeneratedRoot = path.join(publicRoot, "generated", "drift-wall");
  const byRoot = new Map<string, number>();

  const items = uniqueFiles.map((filePath) => {
    const relativeToPublic = path.relative(publicRoot, filePath);
    if (!relativeToPublic.startsWith(`..${path.sep}`) && relativeToPublic !== "..") {
      const bucket = path.dirname(relativeToPublic) || ".";
      byRoot.set(bucket, (byRoot.get(bucket) ?? 0) + 1);
      return { image: `${SITE_BASE_PATH}/${relativeToPublic.split(path.sep).join("/")}`, title: path.basename(filePath, path.extname(filePath)) };
    }

    fs.mkdirSync(publicGeneratedRoot, { recursive: true });
    const generatedName = `${stableHash(filePath).toString(16)}-${path.basename(filePath)}`;
    fs.copyFileSync(filePath, path.join(publicGeneratedRoot, generatedName));
    byRoot.set("generated/drift-wall", (byRoot.get("generated/drift-wall") ?? 0) + 1);
    return { image: `${SITE_BASE_PATH}/generated/drift-wall/${generatedName}`, title: path.basename(filePath, path.extname(filePath)) };
  });

  console.log(`Project image scan: ${[...byRoot.entries()].map(([directory, count]) => `${directory}: ${count}`).join(", ") || "none"}`);
  const allPublicAssets = collectFiles(publicRoot, [], ALL_IMAGE_EXTENSIONS);
  const selectedRealPaths = new Set(uniqueFiles.map((filePath) => fs.realpathSync(filePath)));
  const excludedUiAssets = allPublicAssets.filter((filePath) => !selectedRealPaths.has(fs.realpathSync(filePath))).length;
  console.log(`Excluded UI/icon assets: ${excludedUiAssets}`);
  console.log(`Unique images: ${items.length}`);
  return items;
}
