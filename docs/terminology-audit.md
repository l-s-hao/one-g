# ONE-G 术语审计（未修改文案）

基线：`5eddc4e8b3c71b9e1b851e28e825cff2483d4cdc`；日期：2026-09-17。

扫描 git tracked 的 src/ 和已有 docs/，排除 node_modules、.next、out、.vercel、lockfile、图片与本轮新增报告。正则 `定制|customiz(?:e|ation)|custom build`，忽略大小写；每次匹配算一次，代码标识符中的 Customize 也计入。因此命中数不等于 UI 文案条数或预计修改数。

源码：17 个文件、55 个命中行、91 次匹配。其中中文“定制” 27 次、CUSTOM BUILD 1 次，其余为 customize 路径或代码标识符。已有文档：2 文件、3 行、4 次匹配。本轮替换次数为 **0**。

A：标准配置文案。包括 Header 桌面/移动共用导航、首页 CTA、About、Metadata、页脚数据、管理员占位、购物车/结算、旧入口和工作台提示。按用户术语映射改写；CUSTOM BUILD → YOUR BUILD。语句中的“完整定制”等应改写为自然的配置文案，不能只依赖逐字替换。

B：工程服务。当前命中行没有明确描述重新设计、开模、特殊协议、联合研发等的定制文案；保留清单为空，不为凑分类制造工程服务词条。未来出现真实工程服务时保留 Custom Engineering / 特殊定制。

C：旧代码、路径或历史记录。CustomizeWorkbench、CustomizeChoice/Scene/Scope、getCustomizeEntry/Query、customizeScenes/Scopes、CSS import 与 /customize 链接等。按依赖有序迁移，新业务链接指向 configure；旧页面兼容保留，不能全局 replace 后删除。已有 brand-audit.md 描述历史覆盖路径，应保留其历史含义；backend-plan.md 的标准配置术语可在实施时更新。

未在 src 中发现用户禁止的“无限定制”“任何需求都能做”“完全按客户需求研发”文案；仍需在最终实现后复核。下表记录 token 位置而不复制长 JSX 行；同一行可同时命中 A 与 C。docs 条目的 A/C 为语义标记，历史文档不机械改写。

| 文件与行 | 类别 | 命中 token（重复次数保留） |
| --- | --- | --- |
| `docs/backend-plan.md:16` | A | `定制` |
| `docs/backend-plan.md:53` | A | `定制` |
| `docs/brand-audit.md:9` | C | `customize`, `customize` |
| `src/app/about/page.tsx:11` | A | `定制` |
| `src/app/about/page.tsx:46` | A | `定制` |
| `src/app/admin/page.tsx:16` | A | `定制`, `定制` |
| `src/app/cart/page.tsx:28` | A | `定制`, `定制` |
| `src/app/cart/page.tsx:42` | A + C | `customize`, `定制` |
| `src/app/cart/page.tsx:44` | A | `定制` |
| `src/app/checkout/page.tsx:20` | A | `定制`, `定制` |
| `src/app/customize/page.tsx:5` | C | `Customize`, `customize` |
| `src/app/customize/page.tsx:6` | C | `Customize`, `Customize` |
| `src/app/customize/page.tsx:9` | C | `Customize` |
| `src/app/customize/page.tsx:11` | C | `Customize` |
| `src/app/customize/page.tsx:12` | C | `Customize` |
| `src/app/customize/page.tsx:15` | C | `Customize` |
| `src/app/customize/page.tsx:16` | C | `Customize` |
| `src/app/customize/start/page.tsx:7` | C | `customize`, `customize`, `Customize`, `Customize`, `Customize`, `customize` |
| `src/app/customize/start/page.tsx:12` | C | `Customize` |
| `src/app/customize/start/page.tsx:33` | C | `Customize` |
| `src/app/customize/start/page.tsx:39` | A | `CUSTOM BUILD` |
| `src/app/customize/start/page.tsx:41` | A | `定制` |
| `src/app/customize/start/page.tsx:45` | C | `customize` |
| `src/app/customize/start/page.tsx:48` | A | `定制` |
| `src/app/customize/start/page.tsx:49` | A | `定制`, `定制` |
| `src/app/customize/start/page.tsx:50` | C | `customize` |
| `src/app/customize/start/page.tsx:58` | C | `customize`, `Customize` |
| `src/app/customize/start/page.tsx:68` | C | `Customize` |
| `src/app/customize/start/page.tsx:72` | C | `Customize` |
| `src/app/customize/start/page.tsx:73` | A | `定制` |
| `src/app/layout.tsx:12` | A | `定制` |
| `src/app/page.tsx:15` | A + C | `customize`, `定制` |
| `src/app/products/[id]/page.tsx:15` | A + C | `customize`, `定制` |
| `src/components/CoreProductSection.tsx:52` | A + C | `customize`, `定制` |
| `src/components/CustomizeWorkbench.tsx:13` | C | `Customize`, `Customize`, `Customize`, `customize` |
| `src/components/CustomizeWorkbench.tsx:16` | C | `customize` |
| `src/components/CustomizeWorkbench.tsx:33` | C | `Customize`, `Customize`, `Customize` |
| `src/components/CustomizeWorkbench.tsx:278` | A | `定制` |
| `src/components/CustomizeWorkbench.tsx:279` | A + C | `customize`, `Customize`, `定制` |
| `src/components/CustomizeWorkbench.tsx:320` | A | `定制` |
| `src/components/HardwareEcosystemSection.tsx:2` | C | `Customize`, `Customize` |
| `src/components/HardwareEcosystemSection.tsx:15` | C | `Customize` |
| `src/components/HardwareEcosystemSection.tsx:16` | A + C | `customize`, `定制` |
| `src/components/Header.tsx:16` | A + C | `customize`, `定制` |
| `src/components/RecommendedBuild.tsx:9` | C | `Customize`, `customize` |
| `src/components/RecommendedBuild.tsx:16` | C | `Customize` |
| `src/components/SiteShell.tsx:19` | C | `customize` |
| `src/data/customize-entry.ts:3` | C | `Customize` |
| `src/data/customize-entry.ts:10` | C | `Customize`, `Customize` |
| `src/data/customize-entry.ts:14` | C | `Customize`, `Customize` |
| `src/data/customize-entry.ts:19` | C | `customize`, `Customize` |
| `src/data/customize-entry.ts:26` | C | `customize`, `Customize` |
| `src/data/customize-entry.ts:35` | C | `Customize` |
| `src/data/customize-entry.ts:37` | C | `customize` |
| `src/data/customize-entry.ts:38` | C | `customize` |
| `src/data/customize-entry.ts:42` | C | `Customize`, `Customize`, `Customize` |
| `src/data/site-content.ts:16` | A + C | `定制`, `定制`, `customize` |
| `src/data/site-content.ts:31` | A + C | `定制`, `customize` |
