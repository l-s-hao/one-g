# ONE-G 统一显示模式

## 最终模型与入口

唯一生效模式为 `DisplayMode = "standard" | "eye-comfort" | "night" | "color-vision-safe"`。沿用唯一 ThemeProvider，不再有 preferredTheme/accessibilityTheme 两层状态。三个开关的 checked 直接由 displayMode 派生；开启任一模式替换当前值，关闭当前模式或恢复标准按钮写入 standard，关闭未开启的开关无操作。没有 previousTheme 或关闭后恢复底层主题的逻辑。

`ThemeSelector` 现在是共享显示模式组件，用户中心、管理员中心、Header/移动菜单、管理员原有弹层以及页脚原有显示菜单都复用它。标准显示只有恢复按钮，不是第四个开关。只调整设置区域，没有新增全局入口或改动导航排序。

`ThemeProvider.setDisplayMode` 继续校验初始化就绪和合法模式；四种模式对匿名、USER、ADMIN 均开放，不再有护眼身份检查或登录提示。认证恢复仍用于选择正确的用户偏好存储键，不用于限制模式。

退出登录保留当前显示模式（含 eye-comfort），写入匿名主题偏好；原账号的记录保留。登录或切换账号仍读取该账号自己的记录，不把 A 的设置作为 B 的偏好。

## 配色 Token

| Token | 标准显示 | 护眼模式（原值） | 夜间模式 |
| --- | --- | --- | --- |
| `--bg` | #DEEAF0 | #F0E6D2 | #1F2226 |
| `--surface` | #F1F7FA | #F6EEDC | #262A2F |
| `--surface-2` | #CBDDE6 | #E4D5B8 | #2A2F35 |
| `--text` / `--text-on-surface` | #0C2B4E | #38342E | #E6E8E5 |
| `--text-muted` | #3E5C73 | #655D50 | #919AA4 |
| `--border` | #5B7C90 | #CDBFA6 | #76808A |
| `--border-strong` | #0C2B4E | #877961 | #919AA4 |
| `--accent` | #2FBBD2 | #C9A97E | #E6E8E5 |
| `--button-primary-bg` | #2FBBD2 | #7FC4C2 | #E6E8E5 |
| `--button-primary-text` | #0C2B4E | #243D3B | #1F2226 |
| `--button-secondary-bg` | transparent | transparent | transparent |
| `--button-secondary-text` | #0C2B4E | #38342E | #E6E8E5 |

标准深色按钮的背景/文字为 #0C2B4E / #DEEAF0。标准的小号文字、焦点和控件边界用深海靛或足够深的派生色，不用浅青正文或青底白字。夜间不再使用青色强调，卡片是小幅提亮的深灰。

护眼保留原 Caribbean Calcite 完整 Token 块和原有公共适配规则，不根据五种基础色重建外观。浏览器逐项对比了修改前后 23 个实际计算 Token，全部相同。色觉友好原背景、强调色、状态色、选中辅助和焦点保留；仅补齐缺失的 `--text-on-surface-2: #F7F7F2`，使用既有文字颜色，防止输入框继承浅色模式的深色字。

原生控件/滚动条使用显式 color-scheme：standard/eye-comfort 为 light，night/color-vision-safe 为 dark。不读取系统深色偏好，不使用图片滤镜、invert 或全屏色卡。Logo 继续用原 SVG mask 随背景对应文字色；图片、About ScrollExpand 和 Lanyard 机制没有改动。

实测计算对比度：

- 标准正文/背景 11.65:1；辅助文字/背景 5.74:1；青色主按钮文字/背景 6.23:1。
- 夜间正文/背景 12.96:1；辅助文字/最亮卡片 4.73:1；主按钮文字/背景 12.96:1。
- 标准控件边界/背景 3.62:1；夜间控件边界/卡片 3.36:1。

## 真实旧存储与迁移

沿用用户键 `one-g-theme:<user.id>`，匿名使用旧 `one-g-theme` 键。新格式：

```json
{"version":2,"displayMode":"standard"}
```

旧普通主题为该键下的裸字符串；旧辅助状态是 `one-g-accessibility-theme:<user.id>`（用户）或 `one-g-accessibility-theme`（匿名），更早匿名键是 `one-g-home-accessibility`。

- 旧色觉友好覆盖已开 → color-vision-safe，丢弃底层主题的恢复含义。
- 旧 caribbean-calcite → eye-comfort，匿名和登录用户一致。
- night 和 color-vision-safe 保留；无偏好、黑白旧模式、未知 ID → standard。
- 旧辅助键为字符串 null 时，不复活更早的 home-only 覆盖。
- 新版本记录一旦存在，不再读取旧覆盖键；用户手动保存 standard 不会在刷新时被旧数据覆盖。
- 迁移只写主题键，保留旧辅助记录作为历史数据但不再应用；没有 localStorage.clear，没有删除用户、购物车、订单、套餐或身份数据。
- Provider 等待 AuthProvider 就绪再按真实当前用户读取，不在读取前写默认值。SSR 与首个客户端都为 standard；没有 suppressHydrationWarning。

## 本次应用文件

- `src/data/themes.ts`
- `src/lib/theme-resolver.ts`
- `src/lib/user-preferences.ts`
- `src/components/ThemeProvider.tsx`
- `src/components/ThemeSelector.tsx`、`ThemeSelector.module.css`
- `src/components/AccessibilityControls.tsx`、`AccessibilityControls.module.css`
- `src/components/Header.tsx`、`Footer.tsx`（原显示菜单接入共享组件）
- `src/app/account/page.tsx`、`src/app/admin/page.tsx`（合并设置区域）
- `src/app/layout.tsx`（SSR 默认值）
- `src/app/themes.css`
- 删除原覆盖式 `src/lib/accessibility-preferences.ts` 和 `src/components/AccessibilityThemeSelector.tsx`，避免两套状态入口。

新增 `tests/display-modes.test.mjs`、`tests/display-modes.browser.cjs`、`tests/display-modes-production.browser.cjs`；相关旧测试的主题断言更新为新模式。两个参考仓库未修改，未提交、推送或部署。

## 原显示模式改版验收与截图（历史记录）

以下记录来自原改版；其中护眼身份限制已由当前规则取消。最新回归见 tests/display-modes.test.mjs、tests/display-modes.browser.cjs 和 tests/theme-hydration.firefox.cjs。

- 单元/回归：`node --test tests/display-modes.test.mjs tests/mock-login.test.mjs tests/auth-payment.test.mjs tests/configuration.test.mjs`，31/31 通过。
- 浏览器：首次访问（含系统深色）、匿名可用模式、护眼禁用、两个关闭示例、刷新、退出、账号隔离、管理员菜单/中心与 Header/用户中心同步均通过；迁移后 standard 不复活旧覆盖；购物车和订单存储保持。
- 四种模式分别生成 1440px/390px 截图，无横向溢出。另有管理员、用户中心、About、登录表单及手机菜单截图。全站使用同一模式，无页面或 hydration 错误。
- `npm run lint`：0 errors，1 条原 `ScrollExpand.tsx:244` 的 `<img>` 性能 warning。
- `npx --no-install tsc --noEmit`：通过；package.json 没有单独的类型检查脚本。
- `npm run build`：通过，生成 36 个静态页面，原 GitHub Pages 和 /one-g 配置保留。

截图位于 `/tmp/one-display-review/`：

| 模式 | 桌面 | 手机 |
| --- | --- | --- |
| 标准 | standard-1440.png | standard-390.png |
| 护眼 | eye-comfort-1440.png | eye-comfort-390.png |
| 夜间 | night-1440.png | night-390.png |
| 色觉友好 | color-vision-safe-1440.png | color-vision-safe-390.png |

其它：`admin-night.png`、`account-standard.png`、`about-night.png`、`login-standard.png`、`mobile-settings.png`。`palette.json` 为实际 Token，`results.json` 为浏览器验收记录。

生产静态页面额外验收通过：禁用 JavaScript 且系统偏好深色时，SSR 仍是 standard 的寒冰白底；匿名旧 caribbean-calcite 安全回标准；夜间/色觉友好可用；护眼受登录限制；键盘关闭色觉友好回标准并刷新保持；无效的旧 Mock 用户会话不会导致该用户的主题记录被改写；无 hydration 错误。
