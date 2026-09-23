# 统一登录框的本地测试说明

本说明更新 `auth-payment-integration.md` 中管理员独立密码入口的旧描述。现在只有 `/login` 一个表单；没有正式短信、邮件、认证后端或支付接入。

## 原因与实际复现

修改前，当前 `npm run dev` 已显式启用 Mock Auth，页面提示与白名单一致。浏览器复现：输入 `19900000001` 后登录按钮仍禁用，因为按钮要求已有 challenge；获取验证码后输入字符串 `004271` 可以成功进入 `/account/`，会话为原 `user-demo`。因此问题是“只输入账号”的测试路径没有实现，并非 currentUser 没有更新或角色保护把成功用户踢回登录。

管理员原先使用另一个密码表单，普通验证码适配器仅允许 USER。现在独立 Mock 快捷适配器按白名单查询原账号记录，不放开普通验证码的 USER 限制。

## 启用和使用

仅当以下三项同时成立才开启快捷登录：

1. `NODE_ENV === development`（实际 `next dev`）；
2. `NEXT_PUBLIC_ONE_G_MOCK_AUTH=1` 显式启用；
3. 当前验证码适配器标识 `mode === mock`。

```sh
NEXT_PUBLIC_ONE_G_MOCK_AUTH=1 npm run dev
```

现有开发进程已开启该标志。本次不改变支付配置。生产构建，即使设置该标志，也不能开启快捷登录。URL、localStorage、hostname 不参与开关判定。纯 `NODE_ENV=test` 下也不开快捷入口，相关单元测试显式模拟 development 环境验证。

访问 `http://localhost:3000/one-g/login/`，输入对应账号，保持验证码为空，主动点击“登录 ONE-G（演示）”。不用先获取验证码。

| 身份 | 手机号 Tab | 邮箱 Tab | 原稳定 ID | 角色 / 默认目的地 |
| --- | --- | --- | --- | --- |
| 普通测试 A | 19900000001 | demo-a@example.test | user-demo | USER /account |
| 普通测试 B | 19900000002 | demo-b@example.test | user-demo-b | USER /account |
| 管理员测试 | 无 | admin@one-g.com | admin-demo | ADMIN /admin |

管理员邮箱沿用既有 `mockUsers` 记录，本次没有新增 `admin@one-g.test`。管理员标识不显示在公开登录页面，没有管理员 Tab、角色选择器或隐藏入口。角色由 Mock adapter 找到的记录提供，不能由表单 role、邮箱子串或域名推断。

获取过验证码后，登录走原挑战验证路径；错误、过期或被作废的 challenge 不能通过快捷路径绕过。正确测试验证码仍是字符串 `004271`，保留两个前导零。切换接收地址/渠道仍作废旧挑战。

## 会话和导航

- 只有 AuthProvider 更新 currentUser 和既有 session 存储。页面等待 Provider 提交对应用户后才导航，不自己保存第二份 session。
- USER 默认 `/account`，ADMIN 默认 `/admin`；有 returnTo 时沿用 `safeReturnTo` 的站内、角色校验。不先把管理员带到用户中心。
- `/admin/login` 使用静态导出兼容的客户端跳转进入 `/login?returnTo=...`，不再显示密码表单。旧管理员退出目标也因此进入统一表单。
- 管理员中心和 USER/ADMIN 路由保护保留；Header 的原角色图标路由未修改。
- 原用户 ID、角色、购物车键和三种显示模式保持；退出只清当前 session，不删除用户自己的偏好。购买页套餐、数量、支付方式和登录后手动再次加购行为不改。
- `readDemoSession` 现在也对管理员应用 Mock 环境开关，修复旧逻辑允许生产恢复 admin-demo 的例外。生产的旧密码 adapter 同样关闭，不保留备用认证绕过。
- 演示仍是浏览器原型，不是可信服务端授权，只能接演示数据。

## 本次修改范围

应用代码仅修改：

- `src/components/VerificationLogin.tsx`
- `src/components/AuthProvider.tsx`
- `src/lib/auth/mock-login.ts`（新增）
- `src/lib/auth/verification.ts`（adapter 模式标识）
- `src/lib/auth-client.ts`（所有 Mock 会话/旧密码 adapter 的环境保护）
- `src/lib/auth-routing.ts`
- `src/lib/demo-mode.ts`
- `src/app/admin/login/page.tsx`

测试和说明：`tests/mock-login.test.mjs`、`tests/mock-login.browser.cjs`、更新原 `tests/auth-payment.browser.cjs` 和 `tests/auth-payment-production.browser.cjs` 的管理员入口断言、本文件。此前尚未提交的其它改动保留，不是本次扩展修改。

## 实际验证

- 修改前浏览器复现：账号单独输入时 disabled；原验证码成功创建 challenge，并建立 `user-demo` 会话进入用户中心。
- `node --test tests/mock-login.test.mjs tests/auth-payment.test.mjs tests/configuration.test.mjs`：27/27 通过。覆盖精确白名单、稳定 ID/角色、未知账号拒绝、取消请求、三个快捷开关条件、生产拒绝 USER/ADMIN 存储会话，以及原认证和购买配置回归。
- `tests/mock-login.browser.cjs`：通过 A/B 快捷登录、数据/主题隔离、管理员统一登录、刷新/退出、旧入口、USER 拒绝管理员页、错码提示、正确验证码、两个购买页套餐/数量/支付恢复、外部返回地址拒绝、无自动加购。无页面运行错误。
- `tests/auth-payment-production.browser.cjs`：生产静态文件通过。普通测试账号按钮禁用；伪造 admin-demo 会话、URL role/mock 参数、localStorage 开关不能进入管理员中心；旧管理员入口到同一个禁用的登录框；375px/1440px 无横向溢出或 hydration 错误。
- `npm run lint`：0 errors，保留原 `ScrollExpand.tsx:244` 的一个 `<img>` 性能 warning。
- `npx --no-install tsc --noEmit`：通过（package.json 没有单独的 typecheck 脚本）。
- `npm run build`：通过，36 个静态页面，原 `/one-g` 前缀和 GitHub Pages 导出配置不变。

没有修改两个参考仓库；没有连接真实服务；没有部署、提交或推送。

补充回归：更新管理员入口断言后的 `tests/auth-payment.browser.cjs` 全部 10 组通过，包括公开浏览、完整验证码错误/过期/重发/取消流程、用户隔离、购买往返和演示结算；无页面运行错误。逐文件内容比对确认本轮只改上述 7 个已有应用文件及新增 1 个 Mock adapter，首页、商品、购买布局、支付、About、深度定制、Header 和显示模式文件均未再次修改。
