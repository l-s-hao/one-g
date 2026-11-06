import { getCatalogProducts, getCategoryName } from "./products";
import { solutions } from "../data/solutions";
import { navigation } from "../data/site-navigation";
import { getOfferingNavigation } from "./offering-navigation";
import { isConfigurableOffering } from "../data/configurable-offerings";
import { english } from "../i18n/dictionary";

export type SearchScope = "all" | "products";
export type SearchItem = {
  id: string; kind: "product" | "solution" | "page"; name: string; href: string;
  aliases: string[]; keywords: string[]; image?: string;
};
export type SearchMatch = { item: SearchItem; match: "exact" | "alias" | "partial" | "approximate"; score: number };
const en = (name: string) => english[name as keyof typeof english] ?? name;
export const normalizeSearch = (query: string) => query.normalize("NFKC").toLowerCase().trim().replace(/[‐‑‒–—−_\-\s·]+/g, "");

/** 只映射正式公开集合，不复制商品资料；概念/尚未销售不等于未发布。 */
export const searchIndex: readonly SearchItem[] = [
  ...getCatalogProducts().map(product => ({
    id: `product:${product.id}`, kind: "product" as const, name: product.name, href: isConfigurableOffering(product.id) ? getOfferingNavigation(product).overviewHref : `/products/${product.slug}`,
    // RobotDock是历史名称。背包/小背包有robotdock.ts正式subtitle与套装资料依据。
    aliases: [product.slug, product.name.replace(/^ONE-G\s+/i, ""), ...(product.name.match(/\b[A-Z]+\d+\b/g) ?? []), ...(product.id === "robotdock" ? ["RobotDock", "背包", "小背包"] : [])],
    keywords: [getCategoryName(product.category), en(getCategoryName(product.category)), product.category],
    image: product.detail?.imageNotes[0]?.webSrc ?? product.images[0],
  })),
  ...solutions.map(solution => ({
    id: `solution:${solution.id}`, kind: "solution" as const,
    name: solution.content ? `${solution.name} · ${solution.content.name}` : solution.name,
    href: solution.detailHref ?? `/solutions#${solution.id}`,
    aliases: [solution.name, en(solution.name), ...(solution.content ? [solution.content.name, `${solution.name}方案`] : [])],
    keywords: [en(solution.name)], image: solution.media.src,
  })),
  ...navigation.map(item => ({ id: `page:${item.href}`, kind: "page" as const, name: item.label, href: item.href, aliases: [en(item.label)], keywords: [] })),
];

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row.push(Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)));
    previous = row;
  }
  return previous[b.length];
}

export function searchSite(raw: string, scope: SearchScope = "all"): SearchMatch[] {
  const query = normalizeSearch(raw);
  if (!query || query.length > 128) return [];
  const ranked: SearchMatch[] = [];
  const approximate: SearchMatch[] = [];
  for (const item of searchIndex) {
    if (scope === "products" && item.kind !== "product") continue;
    const name = normalizeSearch(item.name), aliases = item.aliases.map(normalizeSearch), keywords = item.keywords.map(normalizeSearch);
    if (query === name) { ranked.push({ item, match: "exact", score: 0 }); continue; }
    if (aliases.includes(query)) { ranked.push({ item, match: "alias", score: 1 }); continue; }
    const terms = [name, ...aliases, ...keywords].filter(Boolean);
    if (terms.some(term => term.startsWith(query))) { ranked.push({ item, match: "partial", score: 2 }); continue; }
    if (terms.some(term => term.includes(query))) { ranked.push({ item, match: "partial", score: 3 }); continue; }
    // 模糊只用于足够长的拉丁名称；数字型号与短中文不作编辑距离猜测。
    if (!/^[a-z]{5,48}$/.test(query)) continue;
    const candidates = [name, ...aliases].filter(term => /^[a-z]{5,48}$/.test(term));
    const best = candidates.reduce((score, term) => {
      const d = distance(query, term), length = Math.max(query.length, term.length);
      return d <= (length >= 8 ? 2 : 1) && 1 - d / length >= .8 ? Math.min(score, d / length) : score;
    }, Infinity);
    if (Number.isFinite(best)) approximate.push({ item, match: "approximate", score: 4 + best });
  }
  return (ranked.length ? ranked : approximate).sort((a, b) => a.score - b.score || a.item.id.localeCompare(b.item.id));
}

/** 商品回车只允许唯一明确名称/别名；G1等短型号仍须排除Pro变体歧义。 */
export function directProductMatch(raw: string, matches = searchSite(raw, "products")): SearchItem | undefined {
  const exact = matches.filter(match => match.item.kind === "product" && (match.match === "exact" || match.match === "alias"));
  if (exact.length !== 1) return;
  if (/^[a-z]{1,3}\d{1,3}$/.test(normalizeSearch(raw)) && matches.length > 1) return;
  return exact[0].item;
}

export const quickSearchItems = ["product:robotdock", "solution:teleoperation", "page:/products", "page:/about"].flatMap(id => {
  const item = searchIndex.find(item => item.id === id); return item ? [item] : [];
});

export type SearchAction =
  | { id: string; kind: "destination"; item: SearchItem }
  | { id: string; kind: "query" | "correction"; query: string };

/** 建议最多六项；查询/修正是操作，目标才是链接，不按显示文案推断动作。 */
export function searchSuggestions(query: string, scope: SearchScope, matches: SearchMatch[]): SearchAction[] {
  if (!query.trim()) return scope === "all" ? quickSearchItems.map(item => ({ id: item.id, kind: "destination", item })) : [];
  const correction = matches.find(match => match.match === "approximate");
  const actions: SearchAction[] = correction ? [{ id: `correction:${correction.item.id}`, kind: "correction", query: correction.item.name }] : [];
  actions.push(...matches.slice(0, correction ? 4 : 5).map(({ item }): SearchAction => ({ id: item.id, kind: "destination", item })));
  if (matches.length) actions.push({ id: "query:current", kind: "query", query });
  return actions;
}

export type SearchSubmission =
  | { phase: "results" | "empty"; committedQuery: string; matches: SearchMatch[] }
  | { phase: "error"; committedQuery: string };

/** 同步索引没有等待状态。保留异常与无匹配的区别，重试只重做明确的提交。 */
export function submitSearch(query: string, scope: SearchScope, run: typeof searchSite = searchSite): SearchSubmission {
  try {
    const matches = run(query, scope);
    return { phase: matches.length ? "results" : "empty", committedQuery: query, matches };
  } catch {
    return { phase: "error", committedQuery: query };
  }
}
