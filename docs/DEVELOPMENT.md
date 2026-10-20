# 开发指南

[项目首页](../README.md) · [架构](ARCHITECTURE.md) · [部署](DEPLOYMENT.md) · [状态](PROJECT_STATUS.md)

## 环境要求

- Node.js ≥ 20.9.0：来自当前 Next.js 包的 engines；GitHub Actions 使用 Node.js 20。
- npm：仓库有 `package-lock.json`，使用 `npm ci` 保持锁定版本；没有指定独立 npm engines 或 `.nvmrc`。
- 浏览器：常规页面不需要外部服务；互动吊牌依赖 WebGL。主题切换按实际 View Transitions 支持情况动画或回退。
- 没有启动数据库或机器人环境的前置要求；仓库不是机器人运行后端。

## 安装与启动

克隆或下载仓库后，在含 `package.json` 的根目录执行：

```bash
npm ci
npm run dev
```

访问 `http://localhost:3000/one-g/`。`dev` 实际为 `next dev --webpack`。需要指定端口时：

```bash
npm run dev -- --port 5556
```

这时打开 `http://localhost:5556/one-g/`。开发服务器会热更新；路径含 `/one-g/`，不是裸 `/`。

## 本地 Mock（可选）

默认不启用认证/订单演示。以下仅是公开的开关名和布尔值，不包含账号、密码、验证码或凭证：

```bash
# POSIX shell：仅开发环境的虚构登录演示
NEXT_PUBLIC_ONE_G_MOCK_AUTH=1 npm run dev

# 登录 + 本地订单演示
NEXT_PUBLIC_ONE_G_MOCK_AUTH=1 NEXT_PUBLIC_ONE_G_MOCK_COMMERCE=1 npm run dev
```

Windows 可在终端采用对应环境变量设置方式，或创建未纳入版本控制的 `.env.local`。修改开关后重启开发服务器。`lib/demo-mode.ts` 同时检查运行环境；正式 `npm run build` 始终禁用 Mock，设置同名变量也不能打开生产演示认证。

只使用本地测试身份，不在文档、截图或提交中披露凭证。快捷登录与验证码挑战都是 Mock；不用实际短信/邮件服务。没有真实支付调试模式。

## 质量检查与构建

| 命令 | 实际作用 |
| --- | --- |
| `npm run lint` | ESLint 检查 |
| `npx tsc --noEmit` | 根据 tsconfig.json 类型检查，无独立 npm script |
| `npm run build` | `next build --webpack`，静态输出到 out/ |
| `npm run start` | 定义为 next start，但不适用于当前静态导出预览 |

```bash
npm run lint
npx tsc --noEmit
npm run build
```

运行命令时保留完整错误输出。若类型检查依赖的 `.next` 路由类型尚未生成，先正常启动开发服务或成功构建一次。不要通过修改 Next 配置或扩大 suppressHydrationWarning 范围隐藏错误。

## 单元与浏览器检查

仓库没有 `npm test`。存在 Node 内置测试文件，可单独执行，例如：

```bash
node --test tests/mock-login.test.mjs
node --test tests/auth-payment.test.mjs
node --test tests/i18n-dictionary.test.cjs
```

这里只确认命令对应真实文件，不表示本次文档任务重新运行并通过了所有测试。部分旧测试校验历史文件哈希/旧功能，不能用“所有脚本通过”代替当前入口验收。`tests/legacy/` 及旧主题/展示测试尤其需要核对范围。

`tests/card-hover.browser.cjs`、`tests/home-previews.browser.cjs`、`theme.browser.cjs`、`theme-state.browser.cjs` 等需要外部 Playwright 工具及实际浏览器。Playwright **不在 package.json 依赖中**；部分脚本仍含开发机浏览器路径，需检查脚本支持的环境变量/可执行文件位置后运行，不应声称全新安装可直接执行全部浏览器测试。本次不修改依赖或测试脚本。

## 本地静态预览

见 [部署说明的本地预览](DEPLOYMENT.md#本地静态预览)。保持 `/one-g/` 前缀；不要用 `next start` 启动 `out/`。

## 修改位置与协作边界

- 页面：`src/app/`；业务/共享 UI：`src/components/`。
- 数据查询规则：`src/lib/`；真实内容与当前 Mock：`src/data/`。
- 品牌与中英文：`src/i18n/dictionary.ts`；日夜配色：`src/app/colors.css`。
- 公开图片放 `public/`，前端不使用用户机器绝对路径。
- 参考实现说明保留在历史 docs，不能把计划代码或残留组件当作启用功能。
- 执行任务前阅读 `AGENTS.md`、Git diff；不要覆盖未提交改动。当前文档任务不改业务代码或配置，不提交/推送。

## 常见问题

| 问题 | 核查方式 |
| --- | --- |
| 裸 localhost:3000 不显示预期页面 | 使用 `/one-g/`；核对启动端口 |
| 导出页面资源 404 | 预览根目录须包含 one-g 子目录；检查重复 `/one-g/one-g/`、尾斜杠和大小写 |
| 登录/获取验证码按钮不可用 | 默认和生产状态为服务未接入；本地演示需显式 Mock 开关并重启 |
| 购买页无法加购/付款 | RoboDock 是概念套餐预览，禁用行为符合当前边界 |
| 英文出现缺失文案日志 | 为新增中文文本补现有词典，不能靠整页重挂修复 |
| 主题圆形动画不播放 | 检查实际 startViewTransition 支持和减少动画偏好；直接换色是预期回退 |
| 吊牌不显示 3D / 浏览器测试无法启动 | 核对 WebGL、浏览器驱动与可执行路径；保留静态回退，不修改业务功能来迁就测试环境 |
| 旧测试失败 | 核对测试对应的历史架构与哈希基线，再判断是否属于当前功能回归 |

图片导航浏览器回归：`tests/header-image-navigation.browser.cjs`。沿用可选的外部 Playwright 环境，通过 `ONE_G_PLAYWRIGHT` 指定模块位置、`ONE_G_BROWSER` 指定 Chromium、`ONE_G_TEST_URL` 指定带 basePath 的站点地址，不新增生产或开发依赖。测试覆盖全量链接、Flip 中间帧、关闭、语言/主题及手机布局。

导航分类与悬停反馈回归：`tests/header-menu-feedback.browser.cjs`，复用上述 Playwright 环境变量，检查分类顺序/数量、URL 隔离、面板高度、4px 浮起与边缘稳定、无下划线、键盘焦点、减少动画和模拟触屏。

当前主文字已从展开按钮改为真实链接。导航专项使用 `tests/navigation-interactions.browser.cjs`，性能/生命周期采样使用 `tests/navigation-resources.browser.cjs`，Firefox 使用标准库脚本 `tests/navigation-firefox.webdriver.py`（先启动现有 geckodriver，通过 `ONE_G_WEBDRIVER` 指定地址）。`tests/navigation-auth.browser.cjs` 仅用于显式启用既有开发 Mock auth 的隔离会话。旧 `header-image-navigation` / `header-menu-feedback` 脚本仍含旧“主文字是 button”选择器，不应作为当前语义的验收依据。具体环境、执行结果和限制见 [专项报告](reviews/NAVIGATION_INTERACTION_AUDIT.md)。
