# ONE-G 架构审计

审计日期：2026-09-17。范围：STEP 1–2，静态源码与配置审计；本轮不重构、不运行构建、不发布。

## 仓库身份与边界

- 会话开始目录：`/home/lsh`。
- 唯一允许正式修改的仓库：`/home/lsh/ONE`，origin 为 `https://github.com/l-s-hao/one-g.git`。目录名虽然是 ONE，但远程身份确为 one-g，不使用旁边的 `/home/lsh/oneg`。
- 基线 HEAD：`5eddc4e8b3c71b9e1b851e28e825cff2483d4cdc`，初始 `git status --porcelain` 为空。
- 参考仓库位于 `/tmp/one-g-reference/`，不在主仓库内部。克隆完成后只执行读取、搜索、图片查看与 Git 状态检查；不运行其安装、格式化、构建、发布脚本，不修改权限或内容。
- 这是本次操作的写入边界，不表示操作系统已把参考目录挂载成只读。文件与 HEAD 完整性由最终检查核对。
- 适用仓库指令：`AGENTS.md`，`CLAUDE.md` 引用同一指令。编码前需阅读本机对应 Next.js 指南。

## 实际技术栈

| 项目 | 源码确认结果 |
| --- | --- |
| Framework | Next.js 16.3.4，App Router，webpack |
| UI | React / React DOM 19.2.8 |
| TypeScript | lockfile 为 5.9.3；strict、noEmit、isolatedModules；target ES2017；bundler 模块解析；react-jsx |
| JavaScript | tsconfig 允许 allowJs，但新增业务代码按现有 `.ts` / `.tsx` 风格实现 |
| CSS | Tailwind CSS 4.3.3 + PostCSS；CSS Modules；既有全局 CSS 与主题覆盖并存 |
| Lint | ESLint 9.39.5，Next core-web-vitals + TypeScript flat config |
| 依赖锁 | npm `package-lock.json`，lockfileVersion 3；CI 使用 npm ci |
| 图形/交互 | lucide-react、motion、GSAP、Three、React Three Fiber/Drei/Rapier、Radix slot |
| Alias | `@/*` → `./src/*` |
| 命令 | `npm run dev` / `npm run build` 均使用 webpack；`npm run lint` 为 eslint；没有 package test 脚本 |

依据：根目录 package.json、package-lock.json、tsconfig.json、next.config.ts、eslint.config.mjs、postcss.config.mjs、components.json。README 是脚手架说明，不能替代实际配置。

## 目录、路由与部署

业务代码在 `src/app`、`src/components`、`src/data`、`src/types`、`src/lib`。没有根级 app/components/data/types/lib/styles 业务目录；样式在 app 和组件旁。

现有页面包含首页、about、products、products/[id]、customize/start、customize、account、cart、checkout、order-success、login、register、forgot-password、admin、admin/login。尚无 configure 路由，也无 RobotDock / SONIC Link 数据。

`next.config.ts` 设置 `output: "export"`、`basePath: "/one-g"`、`assetPrefix: "/one-g/"`、`images.unoptimized: true`。GitHub Pages workflow 在 main push / 手动触发时，使用 Node 20、npm ci、npm run build，上传 out 并部署。当前 workflow 不跑 lint，正式验收仍需单独执行 lint。

应用 Link 使用 `/products` 这类逻辑路径，Next 负责 basePath；资源字符串目前显式使用 `/one-g/...`。正式 configure 浏览器路径应为 `/one-g/configure`，不要把前缀在 Link 上重复拼接。

商品详情用 `generateStaticParams()` 从 Product slug 生成；新增商品需要重新构建。新增固定产品路由与现有 `[id]` 静态参数必须避免重复输出同一路径，优先在现有详情入口按产品元数据选择详情组件。

本机 `node_modules/next/dist/docs/01-app/02-guides/static-exports.md` 明确列出 next.config redirects 不受静态导出支持。旧路由宜保留静态兼容页面，通过客户端 replace + 可点击链接转到新页面，并保留经校验的 scene/scope、query/hash；不能只配置服务端重定向。最终必须验收静态产物中的旧路径直接访问，而非只看 dev 模式。

## 页面壳、权限与主题

根布局：AuthProvider → ThemeProvider → SiteShell → 页面。实际公共组件叫 `Header`、`Footer`、`HomeFooter`、`BrandLogo`、`RequireRole`、`ProtectedLink`、`NavigationLink`、`SupportButton`；并不存在 SiteHeader/AuthGuard/CustomerSupport 这些同义组件，不能为满足命名而再复制一套。

`src/lib/auth-routing.ts` 只公开 `/`、`/about`、`/login`、`/admin/login`；普通业务路径默认 USER，admin 子路径要求 ADMIN。因此新增 products/configure 路由会自动被 SiteShell 守卫覆盖。ADMIN 与 USER 是分离角色，ADMIN 不自动获 USER 业务权限。

当前 Auth 是源码明确标注的浏览器 Mock：localStorage `one-g-auth-demo`，无后端鉴权。保持现有登录体验不等于静态页面或资源具有服务器访问控制。本轮不扩展成后端项目。

主题优先级：色觉友好 / 黑白全站主题 > 首页、about 的 brand 锁定 > 用户普通主题。五种普通主题为 dark、zandan-green、aegean-blue、falu-red、burnt-brick。新产品与配置页面走用户普通主题。

复用 tokens：`--bg`、`--surface`、`--surface-2`、`--text`、`--text-on-surface`、`--text-muted`、`--border`、`--accent`、`--effect-rgb`。注意 dark 的 surface 是白色，不能假定所有 surface 都是深色；背景和前景必须成对使用。新产品 CSS 使用 `.module.css` 局部作用域，不导入 Demo 全局 reset。

SiteShell 目前只将 `/customize` 识别为无 Footer、桌面视口工作台；新 `/configure/*` 必须同步工作台判定，`/configure` 产品选择入口保持普通页面壳。

## Product 与价格

`src/types/product.ts` 已有统一 Product：id、slug、name、category、subtitle、description、price?、images、status、featured、coreProduct、showcase。

- 分类：robot / arm / hand / vision / accessory。
- CatalogStatus：draft / active / coming-soon；缺 concept 与 discontinued。
- price 已是可选 number。未定价用 undefined；API null 在适配层转换。不用 0 代表未知。
- `formatPrice` 未定价显示获取报价；`sumPrices` 只要有未定价项，合计也未定价。
- 当前 8 个 Product：g1、g1-pro、arm-a1、arm-a2、hand-d1、vision-v1、rgbd、lidar-kit。均为明确标注的 Mock 数据；不能把 ONE-G G1 的 Mock ID 等同于参考仓库的宇树 G1。
- `getProducts` 只过滤 draft；`getCoreProduct` 与首页硬件选择要求 active。扩状态时必须审计目录展示与购买资格各自的判定。
- `AddToCartButton` 对非 active 只禁用按钮，仍显示加入购物车；预览产品应换成产品/配置预览、联系或报价入口。
- `addCartProduct` 拒绝非 active；`parseCart` 却只校验商品存在与数量，恢复历史购物车时没有 active 限制。新状态接入时应处理旧购物车里已变为概念/停产商品的购买资格。

## 配置和推荐

实际已有类型：RobotConfiguration、ConfigurationOption、ConfigurationStep、ConfigurationCategory；推荐结构叫 `SceneRecommendation`（定义于 data/recommendations.ts）。没有独立 CompatibilityRule / RecommendationRule / ConfiguratorSchema。

RobotConfiguration 用稳定 ID 保存 baseRobotId、armId、handId、visionIds[]、capabilityIds[]。配置选项使用 category、price?、compatibleWith?、status、legacyNames。步骤固定映射五个字段，base/arm/hand 单选，vision/capability 多选。

`src/components/CustomizeWorkbench.tsx` 同时用于完整工作台与首页 preview，已有模块库、当前配置、清单、推荐、进度和价格。桌面拖拽受 pointer/宽度限制；移动端有当前配置/模块库/清单 tabs、分类定位和底部操作。

现有耦合点：

1. 模块组、图标、标签、slot、多选判断硬编码五类；移动端进度写死 `/5`。
2. canSave 强制 baseRobotId，状态非 active 的选项不可选，不能承载 concept 产品的配置预览。
3. 存储使用唯一 `one-g-config`，仅理解 RobotConfiguration，保存后自动出现在购物车。
4. 推荐依赖场景、五类字段与当前机器人兼容校验；没有其他两产品的推荐证据。
5. `compatibleWith` 仅预留基础机器人 ID，当前 fixtures 未给出确认矩阵；未知被显示为待确认，不能宣传已验证兼容。
6. 原型配置 rgbd 与商品 rgbd 的价格不同，assemblyBindings 也明确是临时映射。本轮仅记录，不把这些 Mock 金额移植到新产品。

应从现有工作台提取共享 ConfigurationWorkbench，并让 robotSchema 适配现有数据和持久化；扩展同一类型体系承载产品组，不再建三套业务 UI。

## 风格、响应式和资源

组件采用 PascalCase 文件/函数名、函数组件、interface/type、camelCase props；lib/data 文件多为小写或 kebab-case，type-only import 已普遍使用。跨层使用 @/，同目录可用相对路径。数据由 data → lib → 页面/组件访问。

布局常用 Tailwind 响应式 utilities；工作台 CSS 主要断点 768 / 1280 / 1600，窄屏另有 479。桌面工作台内部滚动，移动正常页面流与 tabs。保留键盘、aria-live、可见焦点、reduced-motion、非单纯颜色反馈。

正式 Logo 来源由 `public/brand/README.md` 记录，BrandLogo 使用 public/brand 下正式 SVG mask；public/logo 中保留原始 PNG。不要换回 Demo 的 ONE-G Robotics 标识。

产品图当前在 public/hero，ProductVisual 使用 next/image，缺图时已有占位。新资源获许可后放 public/products/robotdock 与 public/products/sonic-link，使用本地主站路径。

额外耦合：`src/lib/get-project-images.ts` 会自动扫描 public/products 进入首页 DriftWall。以后迁入软件截图/草图/概念图时需显式筛选首页素材，避免新资源无意改变首页品牌展示或丢失概念说明。

本轮未改业务代码、依赖、配置或原有文档；详细差异和执行计划见 [reference-integration.md](./reference-integration.md)。
