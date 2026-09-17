# STEP 4：配置路由迁移

日期：2026-09-17。仅修改主仓库 `/home/lsh/ONE`（l-s-hao/one-g）。本次在 STEP 3 的工作区成果上继续，未提交、推送或部署。未开始 STEP 5，未引入 ConfiguratorSchema，未迁入 RobotDock / SONIC Link 数据、页面、配置或资源。

## Old / New

| 旧 URL | 正式 URL | 职责 |
| --- | --- | --- |
| /customize/start | /configure | 原有场景、配置范围选择入口 |
| /customize | /configure/robot | 原有整机配置工作台 |

应用内路径不包含 basePath，由 Next Link / router 添加 `/one-g`。实际静态部署地址为 `/one-g/configure/` 与 `/one-g/configure/robot/`。

## 页面实现复用

- `src/app/configure/page.tsx`：服务端 metadata + `ConfigureEntry`。
- `src/components/ConfigureEntry.tsx`：从旧入口移出原有 UI，仍使用原场景、范围、MagicBento、CSS Modules 与移动布局。开始配置跳转到新整机路由。
- `src/app/configure/robot/page.tsx`：服务端 metadata + `RobotConfigurationWorkbench`。
- `src/components/RobotConfigurationWorkbench.tsx`：从旧整机页移出原有 Suspense / scene / scope 适配层，调用原 `CustomizeWorkbench`。没有复制工作台。
- 两个旧 page.tsx 现在仅提供 canonical metadata 和 `LegacyConfigurationRedirect`，不再维护另一套配置 UI。
- 旧 customize/layout.tsx 仍是无 DOM 包裹的 metadata layout；新页面在各自服务端 page 中提供 metadata。

## Compatibility Strategy

旧地址依然生成真实静态页面。SiteShell 先执行原有 USER 守卫；已登录用户进入兼容页后，由 `router.replace` 跳转到固定新地址。提供可点击的继续配置链接作为客户端备用入口。未使用 middleware、next.config redirects 或服务端 308。

`src/lib/configuration-routing.ts` 只匹配 `/customize`、`/customize/start`（可带尾斜杠）并映射到固定新地址，完整保留 query/hash。它不接受任意重定向目标；其他地址维持原值。

## Query Parameter Preservation

- 兼容页直接拼接 `window.location.search + window.location.hash`，保留 scene、scope、未知参数、重复参数以及编码值；不解析再丢弃附加参数。
- 入口使用原有 `getCustomizeEntry` 识别有效场景/范围。`getCustomizeQuery` 增加可选 search 参数，保留其他参数，只更新用户选择的 scene/scope；无有效选择时移除对应旧值。
- 入口开始配置携带当前 query 和 hash 到 `/configure/robot`。
- 工作台“修改配置方向”链接携带当前 query/hash 回 `/configure`，保留已选 scene/scope。`useLocationSuffix` 使用 SSR 空快照、客户端真实位置，兼容静态预渲染。
- 非法 scene/scope 仍按既有逻辑忽略，不创建新配置类别或推荐规则。

示例：`/customize?scene=inspection&scope=perception&extra=a&extra=b#details` → `/configure/robot?scene=inspection&scope=perception&extra=a&extra=b#details`。往返配置入口仍保留附加参数与 fragment。

## Auth Strategy

实际组件是 `RequireRole`，不是另建 AuthGuard。`requiredRole` 的公开路由白名单不变，其余业务路径默认 USER，因此新 configure 路径及未来子路径、旧兼容路径都已受保护。

`loginDestination` 在生成 returnTo 前将旧配置地址映射为新地址；`safeReturnTo` 完成原有本地 URL、安全字符、登录循环与角色校验后，再映射旧配置地址。旧书签和旧登录链接都回到新目标，参数不丢失。未放宽开放重定向校验。

未登录入口：`/login?returnTo=%2Fconfigure`；整机入口：`/login?returnTo=%2Fconfigure%2Frobot`，参数/fragment 在 returnTo 中编码。Next 负责实际链接上的 `/one-g` 前缀。

USER / ADMIN 模型保持：ADMIN 访问普通配置业务仍返回管理员中心，不自动获得 USER 业务权限。现有浏览器 Mock Auth 的边界也保持不变。

## Navigation

Header（桌面、移动共用）、首页第一屏、核心产品 CTA、完整配置 CTA、收尾 CTA、HomeFooter、购物车空状态均改为 `/configure`。

现有商品详情直接配置链接改为 `/configure/robot`，没有新增产品专属路由或按钮。入口开始配置使用 `/configure/robot`；工作台修改方向使用 `/configure`。

搜索源码旧主动链接后，只剩 configuration-routing.ts 内两条兼容映射字符串。`@/app/customize/...` 样式 import 和 legacy 标识符不是用户导航。

未发现现有 sitemap、Web App manifest 或独立 route map 需要修改；未为本阶段新增这些系统。

## Static Export / GitHub Pages

继续使用 Next.js App Router、`output: "export"`、`basePath: "/one-g"`、`assetPrefix: "/one-g/"`，GitHub Pages workflow 不变。

启用 `trailingSlash: true`，让 Next 原生生成目录式静态文件，GitHub Pages 可直接提供 `/one-g/configure/` 等地址。此设置影响全站静态输出形式：例如 about.html 变为 about/index.html；现有无扩展名逻辑 URL 保持，目录托管将不带尾斜杠请求规范化到目录地址。没有依赖服务器 rewrite。

Header、SiteShell、RequireRole 取 pathname 时移除末尾斜杠后判断，避免 `/about/` 失去品牌 Header、`/admin/` 壳判断失败或整机工作台退回普通页面布局。Theme Resolver 原本已规范化尾斜杠，无需修改。Footer/AccessibilityControls 只判断根路径，不受影响。

SiteShell 的工作台判定改为 `/configure/robot`：保持原桌面视口壳、无 Footer、左右滚动与中栏固定。配置入口仍使用普通壳。

构建后实际存在：

- out/configure/index.html
- out/configure/robot/index.html
- out/customize/start/index.html
- out/customize/index.html

## Metadata / Canonical

| 路径 | title | canonical |
| --- | --- | --- |
| /configure | ONE-G 配置中心 | https://l-s-hao.github.io/one-g/configure/ |
| /configure/robot | ONE-G 整机配置 | https://l-s-hao.github.io/one-g/configure/robot/ |
| /customize/start | ONE-G 配置中心 | 同新入口 |
| /customize | ONE-G 整机配置 | 同新整机页 |

入口 description：选择使用场景和配置范围，开始构建适合任务的 ONE-G 机器人方案。

整机 description：通过 ONE-G 标准模块和兼容规则配置机器人平台、执行机构、感知和功能能力。

Canonical 为正式站绝对 URL；应用导航仍使用 Next 本地路径，未用原生绝对 `/configure` 导航绕过 basePath。

## Legacy Internal Names / localStorage

保留 CustomizeWorkbench、CustomizeFromEntry、CustomizeChoice/Scene/Scope、customizeScenes/Scopes、getCustomizeEntry/Query、customize-entry.ts，以及旧兼容页面函数名。旧目录中的 start.module.css / workbench.module.css 被新组件继续引用，内容未改；统一命名与样式归位留待后续 cleanup。

配置仍存 `one-g-config`，购物车仍存 `one-g-cart`；这两个 key 不含 customize。没有清空、改名或迁移本地数据。Auth、普通主题、特殊主题存储键不变；购物车数据本身没有旧来源 URL 需要迁移。

## Validation

- `npm run lint`：PASS，退出码 0，0 errors，2 条既有 no-img-element warnings（DriftWall、ScrollExpand），未修改这些组件。
- `npm run build`：PASS，TypeScript 通过，26 个静态页面生成成功，新旧四路由均列于构建输出。
- 静态文件核对：四个 index.html 均存在，canonical 均指向正确新页面，资源路径带 `/one-g/_next/`。
- 路由纯函数检查：旧地址及尾斜杠、query/hash 映射；新旧路径 USER 权限；外站/双斜杠/编码斜杠/跨角色/登录循环 returnTo 拒绝；scene/scope 合并保留重复附加参数。
- 无头 Chromium 直接访问静态 out 产物（本地 `/one-g/` 挂载，不是 next dev）：未登录新旧入口登录回跳、实际 Mock 用户表单登录、完整 returnTo 保留均通过。
- `/configure/robot?scene=handling&scope=arm` 和 inspection/perception：推荐区显示、目标类别展开、Slot 高亮、ARM/HAND/VISION/CAPABILITY Slot 点击定位通过。
- 桌面 1440×1000：左右栏 overflow-y 为 auto，中栏 hidden，页面无整体纵向溢出，工作台无 Footer。
- 已登录旧地址 → 新地址保留重复 query/hash；修改配置方向 → 再开始配置往返保留参数。
- 保存配置继续写 one-g-config，加入购物车正常展示机器人配置。
- 普通 aegean-blue、color-vision-safe、monochrome 在新两路由生效；About 保持 brand；ADMIN 访问配置页仍回 admin。
- 移动 390×844：入口、移动导航新链接、三个工作台 Tab、无水平溢出通过。
- 浏览器测试零 pageerror、零 HTTP 资源错误。测试期间依赖仅安装到 /tmp/one-g-route-check，未修改主仓库 package/lockfile。
- `git diff --check`：PASS。CSS、配置数据模型、Product、cart 逻辑和主题解析与 STEP 4 开始快照相同。未引入 SmoothCursor。
- robotdock-demo：status 为空，HEAD 为 218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f。
- sonic-link-demo：status 为空，HEAD 为 d6f8b26b1cdc3f56f6b6e4091342a56228527b9c。
- 两参考仓库文件哈希均与审计基线一致，没有修改、安装、格式化、commit、push 或 PR。

本次验证本地静态托管行为，未发布到 GitHub Pages，也未声称验证远程线上部署。STEP 4 到此结束。
