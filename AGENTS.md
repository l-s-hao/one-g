<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 文档维护规则

每次完成一个较大的功能模块后，检查 `README.md` 和 `docs/` 中对应的功能说明、技术架构与开发状态。如果源码发生了变化，更新过时的文档；不要把未完成的功能写成已实现。

## 项目事实与入口

- npm 项目，使用 `package-lock.json` 锁定依赖。当前锁定 Next.js 16.3.4、React 19.2.8、TypeScript 5.9.3、Tailwind CSS 4.3.3；样式同时使用 CSS Modules、全局 CSS 和颜色变量。动画使用 GSAP、Motion、Web Animations 及 Three.js 相关组件，不新增另一套系统。
- `src/app/`：App Router 页面；`src/components/`：共享 UI 和业务组件；`src/i18n/`：语言状态、词典和本地化元素；`src/lib/`：纯规则、查询、服务适配器；`src/data/`：内容与 Mock 数据；`src/types/`：业务类型；`public/`：公开资产；`tests/`：Node 与可选浏览器检查；`docs/`：项目说明和历史审计。
- `src/app/layout.tsx` 的 `ThemeProvider → LocaleProvider → AuthProvider → SiteShell` 是根状态入口。主题由 next-themes 管理，语言由 `src/i18n/LocaleProvider.tsx` 管理；不得建立第二套持久化来源或因切换偏好重挂整页。`SiteShell` 内 `ContactProvider` 管理客服预览。
- 商品通过 `src/lib/products.ts` 查询，数据在 `src/data/products.ts` 和 `src/data/products/robotdock.ts`；方案在 `src/data/solutions.ts` 及 `src/data/solutions/sonic-link.ts`。导航数据在 `src/data/site-navigation.ts` 与 `footer-navigation.ts`。
- 共享按钮使用 `src/i18n/Elements.tsx` 与 `src/components/button-effects.css`；商品基础展示复用 `ProductCard`、`ProductVisual`，悬停和入场分别由 `CardHover`、`StaggerGroup` 管理。先查调用方，不造万能组件。
- 路径前缀以 `src/lib/route-paths.ts` 的 `BASE_PATH` 为准。`useAppPathname` 已返回无尾斜杠的逻辑路径（根为 `/`）；安全返回继续使用 `auth-routing.ts`，旧配置入口使用 `configuration-routing.ts`。图片字段通常已有 `/one-g/`，不能重复拼接。

## 业务与体验约束

- RoboDock 是商品，目前为概念套餐预览；SONIC Link 是解决方案，不能加购。主导航文字直接跳转，悬停图片预览保留。
- 文字按钮保持 200ms 反色；导航和小控件不恢复 Specular 高光。保留本地字体与字体审计、既有数值/圆角/入场/换行/阴影处理及兼容回退，不擅自宣称专项全部完成。
- 注册成功返回登录，不自动建立会话。保留大陆/海外地区规则、验证码与人机凭据用途/目标/有效期边界、管理员权限及注册离页保护。
- `src/lib/demo-mode.ts` 控制显式 Mock 开关，生产禁用 Mock；前端角色守卫不能代替服务器授权。客服只有填写/校验/预览，不能显示发送成功；未接入的认证、付款、短信、邮件和设备服务不得伪造成功或真实触发。
- 旧 URL、ID、存储键和兼容导出需确认所有引用与外部书签迁移后才可删除；静态导出的兼容页面仍须保留。`tests/legacy/` 和残留配置器不等于当前启用功能。

## 代码与中文注释

- 延续相邻 TypeScript/TSX 的缩进、引号与命名；保留严格类型，复用 `@/` 路径别名和现有业务类型。不得用 `any`、关闭检查、删除测试或更新哈希掩盖失败。
- 页面文案使用现有本地化元素并维护词典；不要把实现说明塞进产品流程。样式从共享变量/组件源头修改，禁止以无关全局覆盖解决局部问题。
- 关键中文注释解释原因、输入约定、异步过期处理、偏好初始化时机、动画创建与清理归属、旧入口保留原因和 Mock 边界；不逐行翻译，不以注释替代校验。删除过期描述与失效注释代码时先确认事实。

## 修改和验收

- 先确认 Git 根、remote，分别记录暂存/未暂存/未跟踪状态和已有失败；保留用户原有工作。没有明确授权，不 reset、clean、自动 stash、升级依赖、提交、推送或部署。
- 每批先列文件、重复职责、调用方、迁移与验证办法，一批只处理一条职责链；先迁移调用方/类型/导出，再搜索全部引用，最后删除旧实现。
- 实际命令：`npm run lint`；`./node_modules/.bin/tsc --noEmit --incremental false`；`node --test tests/*.test.mjs tests/*.test.cjs`（或明确相关文件）；`npm run build`；`git diff --check`。没有 `npm test` 或 `npm run typecheck`。构建与类型检查顺序执行，避免争用生成的 `.next` 类型。
- `npm run dev -- --port 3000` 后访问 `/one-g/`。当前为 `output: export`，产物 `out/`，不能用 `next start` 预览；`.github/workflows/deploy-pages.yml` 在 main 推送或手动触发时发布 GitHub Pages，本地验收不触发它。
- 浏览器脚本依赖可选外部 Playwright 和 Chromium，非项目已声明依赖；先读脚本默认端口、环境变量、写出路径及 Mock 要求，防止覆盖历史证据。受影响区域检查中文/英文、日间/夜间、桌面/手机及真实入口、表单、动画和清理。构建通过不等于全站验收。
- 验收报告区分本轮回归与旧失败，明确未执行项、环境限制、兼容保留项和证据路径。重构记录沿用 [代码整合审计](docs/code-integration-audit.md)，开发与架构细节见 `docs/DEVELOPMENT.md`、`docs/ARCHITECTURE.md`；不要复制本机 Skill、授权材料或密钥进项目。
