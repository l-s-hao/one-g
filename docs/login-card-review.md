# ONE-G 登录卡片验收 · 2026-10-22

> 当前流程已被 [显式注册与登录验收](registration-auth-review.md) 更新。下文是先前阶段的实现与截图记录，不代表当前注册、人机验证或地区规则。


## 修改前证据

只操作 `/home/lsh/ONE` 主仓库；参考仓库没有写入。修改前 `git status --short` 与 `git diff --stat` 均为空，基线记录为 `/tmp/one-login-before-status.txt`、`/tmp/one-login-before.patch`。没有覆盖用户改动，没有提交、推送或部署。

已读取 `package.json`、实际 `package-lock.json`、`components.json`、`tsconfig.json`、根 layout 的 CSS 导入、`globals.css`、`colors.css`、PostCSS、Next 配置、字体入口、本地化元素/词典、登录/管理员兼容页、AuthProvider、验证码/快捷/密码适配器和安全返回逻辑。另读本地 Next 对 CSS 与 TypeScript 的版本文档。

| 核对项 | 证据与结论 |
| --- | --- |
| shadcn/ui | `components.json` 存在，new-york、rsc/tsx、Tailwind CSS 路径和 `@/components/ui` 别名均已配置；`tsconfig.json` 有 `@/* → ./src/*`。现有 ui 包括 layout-grid、shimmer-button、animated-theme-toggler；没有共享 input.tsx、label.tsx 或 Button。结论是已有 CLI/局部组件基础，并非完整标准 shadcn 表单套件。 |
| Tailwind v4 | 声明 `tailwindcss`、`@tailwindcss/postcss` 均 `^4`；锁文件和已安装均 4.3.3；PostCSS 使用 `@tailwindcss/postcss`，CSS 入口 `@import "tailwindcss"`、`@theme inline`；Next 16.3.4 的 webpack 构建实际通过。 |
| TypeScript | 声明 `^5`；锁文件/安装均 5.9.3；strict/noEmit/bundler/Next 插件；业务源码使用 ts/tsx；package.json 没有 typecheck 脚本，实际运行 `./node_modules/.bin/tsc --noEmit` 通过，生产构建类型检查也通过。 |
| 字体与主题 | 沿用已审计、本地托管 Inter Variable 与 Noto Sans SC（SIL OFL 1.1）；背景、表面、边框、文本、focus 均读取现有 Token。未改字体、ThemeProvider 或初始化策略。 |

没有升级 Tailwind、Next、React 或 TypeScript，没有重建 shadcn、迁移框架或改 PostCSS。没有新增 `suppressHydrationWarning`。

## 官方源码与兼容接入

完整读取：

- https://ui.aceternity.com/registry/signup-form-demo.json
- https://ui.aceternity.com/registry/input.json
- https://ui.aceternity.com/registry/label.json
- https://ui.aceternity.com/components/signup-form

registry 声明写入 `components/signup-form-demo.tsx`、`components/ui/input.tsx`、`components/ui/label.tsx`；单独 input/label registry 的目标与源码也已核对。demo 声明 Radix Label、Tabler icons，Input 实际导入 `motion/react`，Label 导入 `@radix-ui/react-label`。当前已有 Motion 13.4.0；锁文件中的 framer-motion 是现有 Motion 依赖，没有另装第二套。Radix Label 与 Tabler 不存在，本次不用其实现，无需安装。

**没有运行 shadcn add；package.json、锁文件、共享 ui 文件均未修改，新增依赖 0。** 复用本地原生 `LLabel` 和 `LButton`，新增 `LoginInput` + `VerificationLogin.module.css`，输入轻光仅限登录表单。CSS 用原生指针事件和媒体查询实现等价局部反馈，不需要给每个输入安装 Motion。

参考页的 `shadow-input` 示例中有非法 `0 px`，注册表还含 `dark:placeholder-text-neutral-600` 等不适用于当前方案的类。本次没有照抄这些类或添加全局 shadow 工具；专用 CSS 内使用合法 `0px` 等价长度的 shadow，键盘 focus 独立清晰。没有保留 any、底部光线、缺口边框、ShineBorder/SpecularButton 或全局鼠标效果。来源注释保留于组件/CSS及第三方声明。

## 最终结构与状态

`app/login/page.tsx` 为 Server Component，仅用 Suspense 包裹客户端 `LoginEntry`。`VerificationLogin` 管理一个 `email | phone | wechat | admin` 状态，同一根 AuthProvider 不变。

卡片：原品牌标识 → 登录 ONE-G → 一智通万机 → 当前表单 → 其他登录方式分隔线 → 手机号 / 微信扫码 / 管理员号三个纵向等宽次级按钮。默认邮箱，无姓名、普通密码注册、多余 Tabs 或第三方登录。卡片最大 448px、18px 圆角、轻阴影；主按钮继续复用 200ms 悬停反色。

三个入口均 `type=button`，只切换模式，已选入口再次点击不发请求。非邮箱模式可返回邮箱；微信还有手机号返回操作。每次只挂载当前有效表单。切换会清验证码、密码、旧错误/提示，abort 旧请求并 discard challenge；地址变更也解绑旧挑战。非敏感邮箱/手机号草稿与接收目标倒计时保留。当前方式/目标的请求由 AbortController 和 Provider revision 共同保护，旧验证响应不能写会话。

验证码是字符串，支持粘贴、numeric inputMode、one-time-code；标签与 id 对应；错误 aria-describedby/aria-invalid，失败焦点、发送/验证状态和防重入锁保留。触屏不启用指针高光；减少动画 CSS 禁用指针装饰和非必要过渡。语言/主题切换不重建表单。

## 认证与角色边界

| 方式 | 本阶段实际能力 |
| --- | --- |
| 邮箱/手机号 | 原内存 Mock send/verify，格式/错码/失效/重发/取消逻辑保留；演示请求不发送短信邮件。development/test + 显式 Mock 开关才启用，生产显示未接入。 |
| 普通快捷测试 | 仅显式启用的 development、Mock adapter 和精确普通测试白名单。A/B 沿用 user-demo/user-demo-b，手机和邮箱均映射已有稳定 ID。管理员邮箱已从此路径移除。 |
| 微信 | 没有真实微信配置、服务或后端；同卡片显示“微信登录暂未接入，请先使用邮箱或手机号登录。”中性消息图标占位，不生成二维码、不轮询、不虚构扫码成功或绑定身份。 |
| 管理员 | 原 `auth-client.authenticate` 与 `data/mock-users.ts` 的账号密码记录，仍受 Mock 环境开关限制；页面不展示管理员测试凭据。选择 admin 仅改变验证面板，不能直接改变角色。普通用户密码不返回管理员身份。 |

管理员验证增加可选 AbortSignal 的提交结果检查，避免切换后写入过期会话；没有第二套认证。旧 `/admin/login` 跳转统一卡片管理员模式，保留安全 returnTo，无跳转循环。

仍为静态前端演示，浏览器会话不能代替服务端授权。没有接后端/数据库/短信/邮件/微信/部署平台，正式认证没有被替换为 Mock。没有新增账号合并或随机用户 ID。

## 返回、范围与共享组件

先等待共享 AuthProvider 提交对应 user.id，再由路由正常导航。USER 无合法 returnTo 时去 `/account`，ADMIN 默认 `/admin`；复用原 safeReturnTo 与 Next `/one-g` basePath，拒绝外部、登录循环、角色不适用的返回路径。购买套餐/数量/支付查询参数保留；咨询 `openContact` 和 product 上下文由原 ContactProvider 消费并打开原前端预览。登录不会自动执行加入购物车。

Header、Footer、首页、商品/方案数据、购买按钮、支付方式、字体、公开范围均无修改。RoboDock 是商品，SONIC Link 是解决方案。客服/购买/资料/管理员非登录表单没有导入 LoginInput；没有共享 Input/Label 覆盖。客服仍只是填写、校验、预览，不发送邮件。

## 实际验证

- `node --test tests/mock-login.test.mjs tests/auth-payment.test.mjs tests/configuration.test.mjs tests/i18n-dictionary.test.cjs`：28/28 通过。覆盖稳定 ID、白名单、生产禁用、角色隔离、challenge 错码/失效/尝试次数/重发/取消、购买配置、安全返回与词典完整性。
- `./node_modules/.bin/tsc --noEmit`：通过。
- `npm run build`：通过，38/38 静态页面，保留 `/one-g` 和静态导出。首次沙箱执行无法解析 TypeScript showConfig，沙箱外重跑完成。
- `npm run lint`：**未通过**，现有 `docs/reviews/font-audit/home-stable.cjs:1` 有 3 个 `no-require-imports` 错误。该文件修改前已存在，本次没有修改它或放宽全局规则。本次修改的 ts/tsx、测试脚本定向 ESLint 通过。
- 生产 `tests/login-card.browser.cjs`（`ONE_G_PRODUCTION=1`）：通过；显式 flag/伪造会话不可启用登录、管理员兼容入口、四种面板和 8 组响应式截图，无浏览器/hydration/i18n 错误。
- Mock `tests/login-card.browser.cjs`：通过；邮箱前导零验证码/错码、手机 B 快捷身份、旧请求取消、切换后的重发倒计时、USER 拒绝管理员页/管理员密码、旧兼容入口、购物车/购买/咨询返回，8 组截图均已生成。原始结果在 `reviews/login/mock-results.json`；最终功能补验使用 `ONE_G_SKIP_SCREENSHOTS=1`，保留此前完整通过时的 8 张 Mock 截图。
- 开发预览多窗口期间遇到 Next 缓存 JSON 读取错误，旧 `.next/dev` 缓存已移动至 `/tmp/one-login-next-dev-cache` 保留，重启后有一轮完整 Mock 功能/8 组截图验收通过，但随后重复多窗口截图时仍偶发同类开发服务 500，不能声称已彻底修复。最终将开发功能回归与静态视觉验收分开执行；生产静态验收未出现。没有为规避此问题升级框架或修改主题初始化。

截图保存在 [reviews/login](reviews/login/)，命名包含 mock/production、1440/390、zh-CN/en、light/dark。Mock 与生产各 8 组，合计 16 张已生成。


## 截图索引

| 视口 / 语言 | Mock 日间 | Mock 夜间 | 生产日间 | 生产夜间 |
| --- | --- | --- | --- | --- |
| 1440 / zh-CN | [查看](reviews/login/mock-1440-zh-CN-light.png) | [查看](reviews/login/mock-1440-zh-CN-dark.png) | [查看](reviews/login/production-1440-zh-CN-light.png) | [查看](reviews/login/production-1440-zh-CN-dark.png) |
| 1440 / en | [查看](reviews/login/mock-1440-en-light.png) | [查看](reviews/login/mock-1440-en-dark.png) | [查看](reviews/login/production-1440-en-light.png) | [查看](reviews/login/production-1440-en-dark.png) |
| 390 / zh-CN | [查看](reviews/login/mock-390-zh-CN-light.png) | [查看](reviews/login/mock-390-zh-CN-dark.png) | [查看](reviews/login/production-390-zh-CN-light.png) | [查看](reviews/login/production-390-zh-CN-dark.png) |
| 390 / en | [查看](reviews/login/mock-390-en-light.png) | [查看](reviews/login/mock-390-en-dark.png) | [查看](reviews/login/production-390-en-light.png) | [查看](reviews/login/production-390-en-dark.png) |

补充验收：生产静态浏览器实测桌面指针高光、触屏不启用、减少动画时无指针渐变、键盘独立 focus；中英文/日夜实时切换后保留邮箱草稿。最终 Mock 功能补验通过并核对原购物车数量未变，没有重复加购。测试先等待认证初始化完成再输入，避免在 hydration 前操作控件。

未执行真实短信/邮件投递、真实微信扫码/回调或生产管理员认证（当前无对应服务）；旧版浏览器脚本未逐一重跑，其界面断言不适用于本次默认邮箱和管理员密码入口。上述单元、当前浏览器脚本、类型检查与构建均为实际执行。
