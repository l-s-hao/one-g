# 显式注册与登录验收 · 2026-10-22

## 当前交付与真实边界

已完成现有 Aceternity 风格下的注册/登录表单、地区规则、状态机、人机/验证码适配边界和注册离页保护。**没有真实身份后端、邮件验证码供应商、人机供应商、持久用户库、短信绑定或实名核验服务。** 微信仍未接通，管理员仍是原本地演示。没有新增 POST API、数据库、付费服务或部署平台。

注册仅在 development/test 且 `NEXT_PUBLIC_ONE_G_MOCK_AUTH=1` 时创建虚构 `.test` 邮箱的临时内存 USER。正式构建始终关闭，不假称邮件已发出或持久开户。注册成功回登录，不调用 AuthProvider、不创建 session。新账号只能在本次 JS 运行期间通过 Next 站内导航测试，刷新/关页/完整文档导航后失效。原固定测试身份继续可用。

当前开发预览：`http://localhost:5556/one-g/login/`、`/one-g/register/`。生产静态预览用于验收，不代表部署。所有修改留在工作区，没有提交或推送。

## 修改前检查与保留

先读取 /login、/register、/admin/login、AuthProvider、Mock 密码/验证码/快捷适配器、用户结构、微信状态、safeReturnTo、购买选择与咨询返回、SiteShell/Next 导航和 GitHub Pages workflow。确认原 `/register` 只是兼容说明；原登录只认固定虚构身份，并非正式“首次登录建号”系统。本轮不把该快捷能力当成注册系统，普通表单不再调用仅输入账号的快捷路径。

开始时已有上一轮未提交登录页和文档改动。先记录 `git status --short`、`git diff --stat` 和 `/tmp/one-registration-before.patch`，在该状态上继续修改，没有 reset/checkout 或覆盖其它页面。参考仓库只读，未写入。

仍为 Next 16.3.4 / React 19.2.8 / Tailwind 4.3.3 / TypeScript 5.9.3，`output: export`、`/one-g` basePath、GitHub Pages 构建配置未变。没有新增依赖、重建 shadcn 或升级框架。字体、日夜 Token、200ms 主按钮反色保持原方案。

## 本轮实际源码文件

新增：

- `src/components/RegistrationForm.tsx`：资料、验证、显式提交、离页对话框。
- `src/components/AuthFields.tsx`：服务地区、密码显示/隐藏、人机状态的本地化字段。
- `src/components/useAuthVerification.ts`：人机/发送/提交锁、challenge、错误、倒计时、取消和销毁。
- `src/components/useRegistrationLeaveGuard.ts`：注册范围内的链接/程序导航确认、beforeunload 和受支持历史导航。
- `src/lib/auth/policy.ts`：地区/渠道、用途、格式和新注册密码规则。
- `src/lib/auth/human.ts`：单次短期 Mock 人机凭据，生产未配置适配器。
- `src/lib/auth/accounts.ts`：资料模型、可信绑定查找、临时账户、密码校验与稳定 ID。
- `src/lib/auth/account-service.ts`：独立普通密码登录、失败限制、幂等注册边界。

修改：`app/register/page.tsx`、`components/LoginEntry.tsx`、`VerificationLogin.tsx`、`VerificationLogin.module.css`、`AuthProvider.tsx`、`AuthCard.tsx`、`lib/auth/verification.ts`、`auth-client.ts`、`auth-routing.ts`、`data/mock-users.ts`、`i18n/dictionary.ts`。保留上一轮其余登录代码。

测试新增 `tests/registration-auth.test.mjs`、`tests/registration-flow.browser.cjs`，更新 `tests/auth-payment.test.mjs` 适配新的人机/用途必需参数。README、架构、功能、状态、本地测试说明、旧阶段报告与当前两份报告/契约同步更新。

Header、Footer、ThemeProvider、字体、商品/解决方案数据、支付配置和购买按钮未修改；无全站导航拦截。既有共享 Input/Label 未覆盖，仍用登录专用样式。

## 字段、地区与身份

| 项目 | 中国大陆（+86） | 中国大陆以外 |
| --- | --- | --- |
| 注册资料 | 昵称、密码、邮箱、手机号、所属类型 | 昵称、密码、邮箱、所属类型；不显示/要求手机号 |
| 所属类型 | individual 明确记录个人；组织须填写单位 | 同左 |
| 注册验证 | 人机验证 → 注册用途邮箱验证码 | 同左 |
| 普通登录 | 邮箱密码/验证码；原已验证手机密码/验证码；微信未接入面板 | 只有邮箱密码/验证码，不显示手机/微信入口 |
| 管理员 | 原独立账号密码验证，没有公开注册 | 同左；不能接受普通账号绕过地区规则 |

地区来自集中 policy，不由语言、邮箱后缀或精确位置推断；用户选择不等于可信地理限制。适配层同样检查地区/渠道，不只隐藏按钮。切海外清除待提交手机号与不适用验证状态，保留昵称、邮箱、所属等仍适用信息。

原来没有注册密码策略，本次本地及待接入契约定义 12–128 字符、字母加非字母；不截断、trim 或改写密码，允许粘贴和密码管理器。旧测试密码仍可用，没有强制迁移成新密码。原明文夹具已换为带盐 PBKDF2 校验值；新账号只在内存保留带盐校验值。**客户端密码校验不是正式密码服务或服务器授权。**

新注册只有邮箱 challenge 完成后才记录 `emailVerified=true`；手机号 `phoneVerified=false`，既不用于登录/找回，也不合并账号。原明确预绑定的虚构手机号归属保持不变。nickname 只是显示资料，没有当作唯一登录标识。注册拒绝传入 role，创建固定 USER。

实名入口默认折叠，仅显示尚未开通，无证件字段，无“已实名”状态，不阻止普通注册；海外不要求中国身份证或护照。

## 状态流与会话

注册：填写并校验资料 → 模拟人机凭据（仅 Mock） → send(register) 消耗一次凭据 → 输入字符串邮箱码 → 明确点击注册 → 资料校验 + 消费对应 challenge + 幂等创建 USER → 清空资料/密码/码/令牌并解除离页保护 → `/login?registered=1&region=...&returnTo=...`。

验证码登录：选择账号渠道与验证码方式 → 人机凭据 → send(login) → 验证 login challenge → 只查找已有用户 → AuthProvider 提交共享 session → 正常返回。注册码不能登录、登录码不能注册或绑定手机号。未知账号不自动创建，也不会自动跳转开户。

密码登录：选择账号渠道与密码方式 → 查可信已验证标识 + 校验原密码 → 失败次数/时间限制 → AuthProvider → 返回。两种登录方式不是双因素认证。

challenge 绑定用途/地区/渠道/目标、创建/过期时间；内存记录失败次数，成功删除，5 次失败作废。Mock 为 6 位字符串（保留前导零）、5 分钟、60 秒重发。每次发送需要新的人机凭据，最终注册不重复兑换同一个凭据。更换邮箱/方式/地区/用途清理旧 challenge 和失效请求；服务端接入约束见 [认证契约](registration-auth-contract.md)。

注册发送只处理邮箱/用途/地区/安全令牌，不发送完整资料草稿。内存注册通过 requestId + 不含秘密的资料签名去重；邮箱插入前再检查唯一性，不能覆盖旧账号。提交已到服务器时，关页/AbortController 不代表事务回滚。

普通用户无允许的 returnTo 时到 `/account`，管理员默认 `/admin`。safeReturnTo 现在也拒绝回注册页形成循环。保留 `/one-g` 和购买套餐、数量、支付参数/咨询上下文，不传密码、验证码、证件，不自动加购。管理员必须来自原可信演示验证结果，选择入口不提权。

## 离页保护覆盖与限制

| 场景 | 本轮处理/验证 |
| --- | --- |
| 注册没改动 | 直接离开，不显示确认 |
| Header、注册标识、返回登录等当前站内链接 | 只在 dirty 注册页捕获离开操作；确认后恢复原目标；无全站永久 preventDefault |
| 取消注册等本页程序导航 | 统一 guard.request；取消和确认均测试 |
| 继续填写 | 保留内容，焦点默认在“继续填写”；Esc 同继续 |
| 确认离开 | 先清内存、abort/discard、解除监听，再导航；重新进入空表单 |
| 注册成功 | guard.allow 后清理并回登录，无额外离页确认、无 session |
| 日夜/语言/密码显示/实名展开 | 不是离页，不提示；语言和主题保留表单内容 |
| 查看邮件、切应用 | 不监听 blur/visibilitychange 清空；浏览器中已触发对应事件验证资料保留 |
| 刷新/关闭 | dirty 时 beforeunload，使用浏览器原生提示；取消刷新已测试保留资料 |
| 后退/前进 | Chromium 的可取消 Navigation API traverse 已测试：取消留在原页，确认后后退，前进返回空表单；history.length 不增加；不使用 popstate.preventDefault 或反复 pushState |
| 页面实际离开/BFCache | pagehide 和 pageshow(persisted) 清旧内存，不建持久草稿 |

注册目前没有弹窗和 Footer（保持原登录/注册壳）；因此不存在关闭注册弹窗和本页 Footer 的实际操作路径，没有伪称测试了不存在的控件。捕获链接机制对该注册范围内实际链接生效。

**限制**：仅实际验收当前 Chromium。旧浏览器不支持/不允许取消 Navigation API 遍历时，不能保证 same-document 后退拦截；跨文档离开可按浏览器能力触发原生 beforeunload。未实测 Firefox/Safari 或手机强制结束浏览器，原生对话框不保证显示指定中文，也不能保证强制结束时触发。没有添加历史哨兵困住用户。Next 的未来外部程序导航需使用本页 guard 边界；没有修改全局 router 方法。

网站不写注册草稿到 localStorage/sessionStorage/URL/日志；原演示会话只写 version/userId。浏览器自身密码管理器/自动填充由浏览器控制，不代表本站保存草稿。

## 实际检查结果

- `npm run build`：通过，38/38 静态页面，含 /login、/register；没有新增服务器端点。
- `./node_modules/.bin/tsc --noEmit`：通过；package.json 没有 typecheck 脚本。
- `node --test tests/registration-auth.test.mjs tests/auth-payment.test.mjs tests/mock-login.test.mjs tests/configuration.test.mjs tests/i18n-dictionary.test.cjs`：**34/34 通过**。
- 本次源码与测试的定向 ESLint：通过；`git diff --check` 通过。
- `npm run lint`：**未通过**。原有 `docs/reviews/font-audit/home-stable.cjs:1` 有 3 个 `no-require-imports` 错误；未修改该既有脚本或放宽全局规则。
- Mock 浏览器：`ONE_G_SKIP_SCREENSHOTS=1` 执行 `registration-flow.browser.cjs` 通过。覆盖国内手机/组织必填、海外/个人例外、人机门槛、邮箱变更清码、实名无证件输入、注册无会话、密码和验证码同 ID、购买恢复、内存账户刷新失效、老 USER 拒绝后台、原管理员密码、存储中无密码/验证码/资料、离页/刷新/历史导航。原始结果 [mock-results.json](reviews/registration/mock-results.json)。
- 生产静态浏览器：`ONE_G_PRODUCTION=1` 执行同脚本通过。正式注册/登录/发送/人机模拟均不可用，不显示测试验证码，离页/历史导航有效，两个地区共 16 张中英文/日夜/桌面/手机截图，无横向溢出或浏览器/hydration/i18n 错误。[production-results.json](reviews/registration/production-results.json)。
- 开发多上下文截图曾触发与前阶段相同的 Next 缓存 JSON 读取 500，未声称解决框架问题。最终开发功能验收与生产静态视觉验收分开执行，构建前停止开发进程，避免并行缓存写入。开发目录下少量 Mock 图片为过程记录，完整视觉矩阵以下列生产截图为准。
- 未执行真实邮件投递、人机供应商校验、短信绑定、实名核验、微信授权或持久账号注册：均无相应服务。没有伪称已接通。更早界面的历史浏览器脚本未逐一运行。

## 截图索引

| 地区 / 视口 / 语言 | 日间 | 夜间 |
| --- | --- | --- |
| mainland / 1440 / zh-CN | [查看](reviews/registration/production-mainland-1440-zh-CN-light.png) | [查看](reviews/registration/production-mainland-1440-zh-CN-dark.png) |
| mainland / 1440 / en | [查看](reviews/registration/production-mainland-1440-en-light.png) | [查看](reviews/registration/production-mainland-1440-en-dark.png) |
| mainland / 390 / zh-CN | [查看](reviews/registration/production-mainland-390-zh-CN-light.png) | [查看](reviews/registration/production-mainland-390-zh-CN-dark.png) |
| mainland / 390 / en | [查看](reviews/registration/production-mainland-390-en-light.png) | [查看](reviews/registration/production-mainland-390-en-dark.png) |
| international / 1440 / zh-CN | [查看](reviews/registration/production-international-1440-zh-CN-light.png) | [查看](reviews/registration/production-international-1440-zh-CN-dark.png) |
| international / 1440 / en | [查看](reviews/registration/production-international-1440-en-light.png) | [查看](reviews/registration/production-international-1440-en-dark.png) |
| international / 390 / zh-CN | [查看](reviews/registration/production-international-390-zh-CN-light.png) | [查看](reviews/registration/production-international-390-zh-CN-dark.png) |
| international / 390 / en | [查看](reviews/registration/production-international-390-en-light.png) | [查看](reviews/registration/production-international-390-en-dark.png) |

导航方案参考本地 Next 16.3.4 Link/navigation 文档及 [MDN Navigation navigate 事件](https://developer.mozilla.org/en-US/docs/Web/API/Navigation/navigate_event)。实际支持和测试限制以上表为准。
