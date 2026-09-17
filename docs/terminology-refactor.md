# STEP 3 术语重构记录

范围仅 ONE-G 文案与 metadata；旧 URL、Auth、主题、布局、组件名、存储键和数据模型保持不变。不实施 STEP 4，不迁移参考产品。STEP 1–2 报告保留原始审计口径。

## 修改前分类

使用 `rg --json -i '定制|customiz(e|ation)|custom build' src public docs`，匹配次数按 token 算，标识符与旧 URL 也计入。以下逐行列出全部命中（同一行重复 token 合并显示次数）。

A：标准产品配置，修改用户可见中文、英文标签及当前开发规划里的标准配置语义。
B：真实工程研发语义，当前业务页面没有命中。历史报告中工程定制示例/禁用词仅为规则记录，保留原文，不视为现站产品承诺。
C：旧路由、内部 Customize 标识符与相关 import，暂留至后续路由迁移，避免同时重命名造成风险。历史审计记录属于 C-记录例外：保留旧词作为修改前证据，不是用户可见文案。

| 文件:原始行 | 分类 | 全部命中 token / 次数 |
| --- | --- | --- |
| `docs/reference-integration.md:22` | C-记录 | `customize` × 2 |
| `docs/reference-integration.md:23` | C-记录 | `Customize` × 1 |
| `docs/reference-integration.md:84` | C-记录 | `customize` × 3 |
| `docs/brand-audit.md:9` | C-记录 | `customize` × 2 |
| `docs/one-g-architecture.md:35` | C-记录 | `customize` × 2 |
| `docs/one-g-architecture.md:57` | C-记录 | `customize` × 1 |
| `docs/one-g-architecture.md:78` | C-记录 | `Customize` × 1 |
| `docs/backend-plan.md:16` | A | `定制` × 1 |
| `docs/backend-plan.md:53` | A | `定制` × 1 |
| `src/components/SiteShell.tsx:19` | C | `customize` × 1 |
| `src/components/HardwareEcosystemSection.tsx:2` | C | `Customize` × 2 |
| `src/components/HardwareEcosystemSection.tsx:15` | C | `Customize` × 1 |
| `src/components/HardwareEcosystemSection.tsx:16` | A / C | `customize` × 1, `定制` × 1 |
| `src/components/CustomizeWorkbench.tsx:13` | C | `Customize` × 3, `customize` × 1 |
| `src/components/CustomizeWorkbench.tsx:16` | C | `customize` × 1 |
| `src/components/CustomizeWorkbench.tsx:33` | C | `Customize` × 3 |
| `src/components/CustomizeWorkbench.tsx:278` | A | `定制` × 1 |
| `src/components/CustomizeWorkbench.tsx:279` | A / C | `customize` × 1, `Customize` × 1, `定制` × 1 |
| `src/components/CustomizeWorkbench.tsx:320` | A | `定制` × 1 |
| `src/data/customize-entry.ts:3` | C | `Customize` × 1 |
| `src/data/customize-entry.ts:10` | C | `Customize` × 2 |
| `src/data/customize-entry.ts:14` | C | `Customize` × 2 |
| `src/data/customize-entry.ts:19` | C | `customize` × 1, `Customize` × 1 |
| `src/data/customize-entry.ts:26` | C | `customize` × 1, `Customize` × 1 |
| `src/data/customize-entry.ts:35` | C | `Customize` × 1 |
| `src/data/customize-entry.ts:37` | C | `customize` × 1 |
| `src/data/customize-entry.ts:38` | C | `customize` × 1 |
| `src/data/customize-entry.ts:42` | C | `Customize` × 3 |
| `src/components/Header.tsx:16` | A / C | `customize` × 1, `定制` × 1 |
| `src/data/site-content.ts:16` | A / C | `定制` × 2, `customize` × 1 |
| `src/data/site-content.ts:31` | A / C | `定制` × 1, `customize` × 1 |
| `src/components/CoreProductSection.tsx:52` | A / C | `customize` × 1, `定制` × 1 |
| `src/components/RecommendedBuild.tsx:9` | C | `Customize` × 1, `customize` × 1 |
| `src/components/RecommendedBuild.tsx:16` | C | `Customize` × 1 |
| `docs/terminology-audit.md:5` | C-记录 | `定制` × 1, `custom build` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:7` | C-记录 | `定制` × 1, `CUSTOM BUILD` × 1, `customize` × 1 |
| `docs/terminology-audit.md:9` | C-记录 | `CUSTOM BUILD` × 1, `定制` × 1 |
| `docs/terminology-audit.md:11` | C-记录 | `定制` × 2 |
| `docs/terminology-audit.md:13` | C-记录 | `Customize` × 3, `customize` × 2 |
| `docs/terminology-audit.md:15` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:19` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:20` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:21` | C-记录 | `customize` × 2 |
| `docs/terminology-audit.md:22` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:23` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:24` | C-记录 | `定制` × 2 |
| `docs/terminology-audit.md:25` | C-记录 | `定制` × 2 |
| `docs/terminology-audit.md:26` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:27` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:28` | C-记录 | `定制` × 2 |
| `docs/terminology-audit.md:29` | C-记录 | `customize` × 2, `Customize` × 1 |
| `docs/terminology-audit.md:30` | C-记录 | `customize` × 1, `Customize` × 2 |
| `docs/terminology-audit.md:31` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:32` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:33` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:34` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:35` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:36` | C-记录 | `customize` × 4, `Customize` × 3 |
| `docs/terminology-audit.md:37` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:38` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:39` | C-记录 | `customize` × 1, `CUSTOM BUILD` × 1 |
| `docs/terminology-audit.md:40` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:41` | C-记录 | `customize` × 2 |
| `docs/terminology-audit.md:42` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:43` | C-记录 | `customize` × 1, `定制` × 2 |
| `docs/terminology-audit.md:44` | C-记录 | `customize` × 2 |
| `docs/terminology-audit.md:45` | C-记录 | `customize` × 2, `Customize` × 1 |
| `docs/terminology-audit.md:46` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:47` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:48` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:49` | C-记录 | `定制` × 1 |
| `docs/terminology-audit.md:50` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:51` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:52` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:53` | C-记录 | `Customize` × 4, `customize` × 1 |
| `docs/terminology-audit.md:54` | C-记录 | `Customize` × 1, `customize` × 1 |
| `docs/terminology-audit.md:55` | C-记录 | `Customize` × 4 |
| `docs/terminology-audit.md:56` | C-记录 | `Customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:57` | C-记录 | `Customize` × 2, `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:58` | C-记录 | `Customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:59` | C-记录 | `Customize` × 2 |
| `docs/terminology-audit.md:60` | C-记录 | `Customize` × 1 |
| `docs/terminology-audit.md:61` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:62` | C-记录 | `customize` × 1, `定制` × 1 |
| `docs/terminology-audit.md:63` | C-记录 | `Customize` × 1, `customize` × 1 |
| `docs/terminology-audit.md:64` | C-记录 | `Customize` × 1 |
| `docs/terminology-audit.md:65` | C-记录 | `customize` × 1 |
| `docs/terminology-audit.md:66` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:67` | C-记录 | `customize` × 1, `Customize` × 2 |
| `docs/terminology-audit.md:68` | C-记录 | `customize` × 1, `Customize` × 2 |
| `docs/terminology-audit.md:69` | C-记录 | `customize` × 2, `Customize` × 1 |
| `docs/terminology-audit.md:70` | C-记录 | `customize` × 2, `Customize` × 1 |
| `docs/terminology-audit.md:71` | C-记录 | `customize` × 1, `Customize` × 1 |
| `docs/terminology-audit.md:72` | C-记录 | `customize` × 2 |
| `docs/terminology-audit.md:73` | C-记录 | `customize` × 2 |
| `docs/terminology-audit.md:74` | C-记录 | `customize` × 1, `Customize` × 3 |
| `docs/terminology-audit.md:75` | C-记录 | `定制` × 2, `customize` × 1 |
| `docs/terminology-audit.md:76` | C-记录 | `定制` × 1, `customize` × 1 |
| `src/app/page.tsx:15` | A / C | `customize` × 1, `定制` × 1 |
| `src/app/layout.tsx:12` | A | `定制` × 1 |
| `src/app/admin/page.tsx:16` | A | `定制` × 2 |
| `src/app/checkout/page.tsx:20` | A | `定制` × 2 |
| `src/app/cart/page.tsx:28` | A | `定制` × 2 |
| `src/app/cart/page.tsx:42` | A / C | `customize` × 1, `定制` × 1 |
| `src/app/cart/page.tsx:44` | A | `定制` × 1 |
| `src/app/products/[id]/page.tsx:15` | A / C | `customize` × 1, `定制` × 1 |
| `src/app/customize/page.tsx:5` | C | `Customize` × 1, `customize` × 1 |
| `src/app/customize/page.tsx:6` | C | `Customize` × 2 |
| `src/app/customize/page.tsx:9` | C | `Customize` × 1 |
| `src/app/customize/page.tsx:11` | C | `Customize` × 1 |
| `src/app/customize/page.tsx:12` | C | `Customize` × 1 |
| `src/app/customize/page.tsx:15` | C | `Customize` × 1 |
| `src/app/customize/page.tsx:16` | C | `Customize` × 1 |
| `src/app/customize/start/page.tsx:7` | C | `customize` × 3, `Customize` × 3 |
| `src/app/customize/start/page.tsx:12` | C | `Customize` × 1 |
| `src/app/customize/start/page.tsx:33` | C | `Customize` × 1 |
| `src/app/customize/start/page.tsx:39` | A | `CUSTOM BUILD` × 1 |
| `src/app/customize/start/page.tsx:41` | A | `定制` × 1 |
| `src/app/customize/start/page.tsx:45` | C | `customize` × 1 |
| `src/app/customize/start/page.tsx:48` | A | `定制` × 1 |
| `src/app/customize/start/page.tsx:49` | A | `定制` × 2 |
| `src/app/customize/start/page.tsx:50` | C | `customize` × 1 |
| `src/app/customize/start/page.tsx:58` | C | `customize` × 1, `Customize` × 1 |
| `src/app/customize/start/page.tsx:68` | C | `Customize` × 1 |
| `src/app/customize/start/page.tsx:72` | C | `Customize` × 1 |
| `src/app/customize/start/page.tsx:73` | A | `定制` × 1 |
| `src/app/about/page.tsx:11` | A | `定制` × 1 |
| `src/app/about/page.tsx:46` | A | `定制` × 1 |

## 完成统计

修改前全量扫描 src/public/docs：128 个命中行、251 次旧词匹配。源码 91 次（27 次中文“定制”、1 次 CUSTOM BUILD、63 次旧 URL/内部标识符）；public 无命中；docs 160 次（含前阶段历史审计，不应与 UI 文案数混为一谈）。

消除原始旧词 30 次：源码 28 次 + docs/backend-plan.md 2 次。其余历史文档保留。另完成 14 次相关文案调整（推荐配置、整机配置、保存提示、品牌定位等），共 **44 次既有文本替换**，其中源码 42 次、开发文档 2 次。一次指下表旧文本的一次出现，不按改动行数/渲染次数计数；共用 Header 文案一次修改覆盖桌面和移动。

另外增加配置入口边界说明和配置页 metadata（不计入既有文本替换次数）。没有新增 URL、redirect、Product 或 Schema，没有重命名现有文件/组件，没有迁入任何 Demo 源码/资产。

## 已执行替换明细

| 文件 | 修改前 | 修改后 | 次数 |
| --- | --- | --- | --- |
| `src/components/Header.tsx` | `label: "在线定制"` | `label: "配置中心"` | 1 |
| `src/app/page.tsx` | `label: "在线定制"` | `label: "开始配置"` | 1 |
| `src/components/CoreProductSection.tsx` | `>在线定制<` | `>开始配置<` | 1 |
| `src/components/HardwareEcosystemSection.tsx` | `开始完整在线定制` | `开始完整配置` | 1 |
| `src/data/site-content.ts` | `title: "定制"` | `title: "配置"` | 1 |
| `src/data/site-content.ts` | `label: "在线定制"` | `label: "配置中心"` | 1 |
| `src/data/site-content.ts` | `开始在线定制` | `开始配置` | 1 |
| `src/data/site-content.ts` | `从一个基础平台开始，组合适合你的机器人。` | `标准模块，自由组合，为不同任务快速构建机器人。` | 1 |
| `src/app/customize/start/page.tsx` | `CUSTOM BUILD` | `YOUR BUILD` | 1 |
| `src/app/customize/start/page.tsx` | `定制方向` | `配置方向` | 2 |
| `src/app/customize/start/page.tsx` | `你希望定制什么？` | `你希望配置什么？` | 1 |
| `src/app/customize/start/page.tsx` | `定制范围` | `配置范围` | 2 |
| `src/data/customize-entry.ts` | `name: "整机方案"` | `name: "整机配置"` | 1 |
| `src/components/CustomizeWorkbench.tsx` | `定制方向` | `配置方向` | 2 |
| `src/components/CustomizeWorkbench.tsx` | `完整定制` | `完整配置` | 1 |
| `src/components/CustomizeWorkbench.tsx` | `推荐方案` | `推荐配置` | 3 |
| `src/components/CustomizeWorkbench.tsx` | `方案已保存到当前浏览器。` | `配置方案已保存到当前浏览器。` | 1 |
| `src/components/RecommendedBuild.tsx` | `推荐方案` | `推荐配置` | 4 |
| `src/data/recommendations.ts` | `推荐方案` | `推荐配置` | 1 |
| `src/app/products/[id]/page.tsx` | `>在线定制 ` | `>开始配置 ` | 1 |
| `src/app/cart/page.tsx` | `定制方案` | `配置方案` | 2 |
| `src/app/cart/page.tsx` | `category: "在线定制"` | `category: "机器人配置"` | 1 |
| `src/app/cart/page.tsx` | `进行定制` | `开始配置` | 1 |
| `src/app/checkout/page.tsx` | `商品与定制配置` | `商品与机器人配置` | 1 |
| `src/app/checkout/page.tsx` | `ONE - G 定制方案` | `ONE-G 机器人配置` | 1 |
| `src/app/admin/page.tsx` | `定制方案` | `配置方案` | 2 |
| `src/app/about/page.tsx` | `label: "在线定制"` | `label: "配置中心"` | 1 |
| `src/app/about/page.tsx` | `定制方案` | `配置方案` | 1 |
| `src/app/about/page.tsx` | `硬件与能力可以自由组合。` | `标准硬件与能力按兼容规则组合。` | 1 |
| `src/components/AboutHero.tsx` | `构建可理解、可选择、可组合的机器人产品。` | `ONE-G — 可配置的智能机器人平台。` | 1 |
| `src/app/layout.tsx` | `title: "ONE - G / 万机智能机器人"` | `title: "ONE-G — 可配置的智能机器人平台"` | 1 |
| `src/app/layout.tsx` | `description: "机器人产品展示、购买与在线定制平台"` | `description: "通过 ONE-G 标准模块与兼容规则，配置适合不同任务的机器人方案。"` | 1 |
| `docs/backend-plan.md` | `定制器` | `配置器` | 1 |
| `docs/backend-plan.md` | `定制步骤` | `配置步骤` | 1 |

## 新增说明与 Metadata

- 配置入口 /customize/start 新增一次“ONE-G 配置基于标准模块和兼容规则。超出标准配置范围的需求需要进行工程评估。”，复用已有文字样式，不改 CSS。
- 首页收尾沿用 BUILD YOUR ONE-G，只将原辅助句改为“标准模块，自由组合，为不同任务快速构建机器人。”，不在其他 Section 重复。
- About 原品牌说明改为“ONE-G — 可配置的智能机器人平台。”；品牌锁、ScrollExpand 参数和 Logo 未改。
- 根 metadata title：ONE-G — 可配置的智能机器人平台；description：通过 ONE-G 标准模块与兼容规则，配置适合不同任务的机器人方案。
- 新增 src/app/customize/layout.tsx，仅提供服务端 metadata 并返回 children，不添加 DOM 层级；为已有 /customize 与 /customize/start 设置 ONE-G 配置中心标题及同一 description。没有改变路径或权限边界。当前并无单独 OpenGraph/keywords 旧词需要修改。

## 保留项与残留复核

执行用户指定 rg 搜索，并增加忽略大小写的完整检索：`rg -n -i '定制|customiz(e|ation)|custom build' src public docs`。

- src/public 中“定制”、CUSTOM BUILD、推荐方案、整机方案均无残留。
- 源码剩余 63 次全部为 C 类旧代码/路由。保留 /customize、/customize/start、CSS 路径和相关 import；路径、returnTo、场景参数及存储行为保持不变。
- 内部保留：CustomizeWorkbench、CustomizePage、CustomizeStartPage、CustomizeFromEntry、CustomizeChoice、CustomizeScene、CustomizeScope、getCustomizeEntry、getCustomizeQuery、customizeScenes、customizeScopes、customize-entry.ts；后续路由/Schema 阶段再按依赖处理。新 metadata wrapper 命名 ConfigurationLayout，没有新增 Customize 同义类型。
- MODULE LIBRARY、CURRENT BUILD、CONFIGURATION SUMMARY、CONFIGURATION PROGRESS、CONFIGURE YOUR ONE-G、YOUR BUILD、RECOMMENDED BUILD 均保持；本次没有用户可见 CUSTOMIZE / CUSTOMIZATION 标签可改，实际英文替换只有 CUSTOM BUILD → YOUR BUILD。
- 工程服务业务文案没有命中，因此没有需要保留的现站“特殊定制”词条；历史审计中工程定制/Custom Engineering 示例和禁止词属于规则说明，保留原始证据。
- 既有 docs 残留 158 次是 STEP 1–2 快照、历史路径、A/B/C 分类例子和计划描述；不回写旧审计数字。这份新报告自身的旧词也是重构对照/兼容性记录，全部为文档证据例外，不参与“修改后业务文案残留”统计。

### 源码剩余匹配的逐行清单

全部 C 类；原因相同：STEP 3 明确禁止路由迁移、大规模内部重命名。行号是本轮完成后的源码位置。

| 文件:行 | 残留 token |
| --- | --- |
| `src/data/site-content.ts:16` | `customize` |
| `src/data/site-content.ts:31` | `customize` |
| `src/data/customize-entry.ts:3` | `Customize` |
| `src/data/customize-entry.ts:10` | `Customize`, `Customize` |
| `src/data/customize-entry.ts:14` | `Customize`, `Customize` |
| `src/data/customize-entry.ts:19` | `customize`, `Customize` |
| `src/data/customize-entry.ts:26` | `customize`, `Customize` |
| `src/data/customize-entry.ts:35` | `Customize` |
| `src/data/customize-entry.ts:37` | `customize` |
| `src/data/customize-entry.ts:38` | `customize` |
| `src/data/customize-entry.ts:42` | `Customize`, `Customize`, `Customize` |
| `src/app/page.tsx:15` | `customize` |
| `src/app/customize/start/page.tsx:7` | `customize`, `customize`, `Customize`, `Customize`, `Customize`, `customize` |
| `src/app/customize/start/page.tsx:12` | `Customize` |
| `src/app/customize/start/page.tsx:33` | `Customize` |
| `src/app/customize/start/page.tsx:46` | `customize` |
| `src/app/customize/start/page.tsx:51` | `customize` |
| `src/app/customize/start/page.tsx:59` | `customize`, `Customize` |
| `src/app/customize/start/page.tsx:69` | `Customize` |
| `src/app/customize/start/page.tsx:73` | `Customize` |
| `src/app/cart/page.tsx:42` | `customize` |
| `src/app/customize/page.tsx:5` | `Customize`, `customize` |
| `src/app/customize/page.tsx:6` | `Customize`, `Customize` |
| `src/app/customize/page.tsx:9` | `Customize` |
| `src/app/customize/page.tsx:11` | `Customize` |
| `src/app/customize/page.tsx:12` | `Customize` |
| `src/app/customize/page.tsx:15` | `Customize` |
| `src/app/customize/page.tsx:16` | `Customize` |
| `src/components/CoreProductSection.tsx:52` | `customize` |
| `src/components/HardwareEcosystemSection.tsx:2` | `Customize`, `Customize` |
| `src/components/HardwareEcosystemSection.tsx:15` | `Customize` |
| `src/components/HardwareEcosystemSection.tsx:16` | `customize` |
| `src/components/RecommendedBuild.tsx:9` | `Customize`, `customize` |
| `src/components/RecommendedBuild.tsx:16` | `Customize` |
| `src/components/SiteShell.tsx:19` | `customize` |
| `src/app/products/[id]/page.tsx:15` | `customize` |
| `src/components/CustomizeWorkbench.tsx:13` | `Customize`, `Customize`, `Customize`, `customize` |
| `src/components/CustomizeWorkbench.tsx:16` | `customize` |
| `src/components/CustomizeWorkbench.tsx:33` | `Customize`, `Customize`, `Customize` |
| `src/components/CustomizeWorkbench.tsx:279` | `customize`, `Customize` |
| `src/components/Header.tsx:16` | `customize` |

## 验收结果

- Header 桌面和移动共用 navigation 均显示配置中心；HomeFooter 的导航数据同步。普通 Footer 仅有 Logo，没有可遗漏的业务导航。
- 首页第一屏/核心产品/收尾 CTA 为开始配置，完整体验 CTA 为开始完整配置；链接目标原样保留。
- 入口配置方向/配置范围/整机配置、推荐面板/应用确认弹窗/通知/无障碍标签均已同步。
- 购物车为配置方案、机器人配置、开始配置；结算为商品与机器人配置；管理员为配置方案管理。
- 用户中心没有新增我的配置/我的定制；客服仍为咨询客服。
- 对照修改前快照：现有 page.tsx 路由文件集合完全相同，所有源码 legacy customize token 顺序完全相同；无 configure 目录。
- lib、types、Product 数据、AuthProvider、ProtectedLink、RequireRole、SiteShell、ThemeProvider、所有现有 CSS 均未改变；未修改动效、Logo 或响应式规则。
- 静态导出 HTML 实际检查：首页标题与 description 正确；customize.html、customize/start.html 标题均为 ONE-G 配置中心。
- npm run lint：PASS，退出码 0，0 errors / 2 warnings。两条既有 @next/next/no-img-element 警告分别位于 DriftWall.tsx:261 和 ScrollExpand/ScrollExpand.tsx:244，文件未修改。
- npm run build：PASS，退出码 0，TypeScript 与 24 个静态页面生成成功；输出仍列出 /customize 与 /customize/start。
- git diff --check：PASS。
- robotdock-demo：git status --porcelain 为空；HEAD 保持 218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f。
- sonic-link-demo：git status --porcelain 为空；HEAD 保持 d6f8b26b1cdc3f56f6b6e4091342a56228527b9c。
- 两参考仓库全部审计清单文件的 SHA-256 与 audit-baseline.json 一致；未执行修改、安装、格式化、commit、push 或 PR。

本轮验证为源码差异、构建与静态产物检查，未声称完成浏览器交互/截图回归。移动端共用文案已核对，文字复用原有自动换行样式；未增加视觉系统改动。

STEP 3 完成后停止，未开始 STEP 4。
