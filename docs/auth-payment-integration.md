# ONE-G 验证码登录与订单支付边界

## 核查结果（2026-09-23）

当前主仓库为 Next.js 16.3.4、React 19、TypeScript，`output: export`，GitHub Pages 部署，`basePath: /one-g`。没有运行中的后端适配、动态 API、数据库、短信/邮件发送商、支付商户或已确认对公账户。两个参考仓库未修改。没有安装数据库、执行迁移、部署或开通付费服务。

原认证是 `mock-users` + 浏览器 session ID；原购物车为无用户归属的 `one-g-cart`；原结算只跳到生成时间戳订单号的模拟成功页，没有可复用正式订单模型或服务。现在复用原 AuthProvider，服务边界分离，并删除无订单也展示成功的行为。

## 登录模式

- `/login`：手机号、邮箱两种验证码入口。无普通密码或第三方登录入口。旧 `/register`、`/forgot-password` 入口指向验证码登录说明，不创建账号。
- 默认（含生产构建）：验证码服务未接入，获取/登录按钮禁用，不发送消息，不接受测试验证码，不恢复旧普通用户演示 session。
- 显式开发演示：`NEXT_PUBLIC_ONE_G_MOCK_AUTH=1 npm run dev`。还须 `NODE_ENV !== production`，生产构建即使传入标志也不会开启。
- 短信/邮箱演示共用 VerificationService：send / verify / discard。仅内存 challenge；6 位字符串验证码（保留前导零）、60 秒间隔、5 分钟过期、最多 5 次失败、成功即作废。切换地址/渠道取消请求并作废 challenge。只在成功创建演示 challenge 后提示“演示验证请求已就绪，未发送真实短信/邮件”。普通错误不披露账号存在性。
- Mock 限制属于测试模拟，刷新可清除内存限流，绝不能当成服务端防护。正式服务返回 codeLength / resendAt / expiresAt，表单按响应工作；正式限流、次数限制和作废必须在服务端完成。
- `/admin/login` 保持原独立管理员密码演示策略，普通验证码接口没有 role 参数，返回的用户必须为 USER。管理员现有原型仍不是正式后台授权；未把它冒充为生产安全体系。

测试身份仅限预置虚构夹具，无真实投递。手机号是测试标识，不表示归属验证。测试码只显示在显式开启的开发演示界面，不存入 URL/localStorage/log。

| 原稳定 ID | 预置绑定的测试手机号 | 预置绑定的测试邮箱 | 原资料邮箱（保持不变） |
| --- | --- | --- | --- |
| user-demo | 19900000001 | demo-a@example.test | user@one-g.com |
| user-demo-b | 19900000002 | demo-b@example.test | user-b@one-g.com |

这是夹具中明确预绑定的两个标识，不是根据姓名、相似邮箱或资料联系电话合并账号。真实手机号/邮箱归属及绑定仍须后端验证。目前不开放首次验证建号。以后允许时应在提交前说明首次登录会创建 ONE-G 普通账号；后端只创建 USER，并按既有已验证标识查找原 ID，不覆盖管理员角色。

## 用户数据兼容和隔离

- 保留 `CurrentUser` 模型及 `user-demo`、`user-demo-b` 等已有 ID；主题 `one-g-theme:<user.id>` 不变。
- Color Vision Safe 登录后按 `one-g-accessibility-theme:<user.id>` 保存；未登录继续保留旧设备无障碍偏好。旧无归属偏好不会被自动分配给某一账号。
- 购物车使用 `one-g-cart:<user.id>`，适配器验证当前演示 session 的 ID/角色。账户切换时受保护页面子树重建，避免异步加载闪现前一用户购物车/订单。
- 原 `one-g-cart` 和无归属旧配置原封不动保留，但不能确定归属，不自动导入任何账号。未来应增加经过确认的归属迁移；不为了兼容而泄露旧购物车。带明确 owner 的配置键为 `one-g-config:<schema>:user:<user.id>`。
- 当前演示存储仍是可编辑的浏览器数据，不是真实数据安全边界。正式 API 必须从 session 确定 user ID，并在每个购物车/订单查询中执行所有权鉴权，不能信任客户端 userId。

## 支付与订单

`src/lib/payments.ts` 是唯一支付方式定义：`alipay` 支付宝、`wechat-pay` 微信支付、`bank-transfer` 对公转账。与登录渠道无关联。

购买页仅预选，URL 保留合法 package / quantity / payment，无价格、账号凭据或自动购买标志；支付偏好按用户保存，未登录为当前标签页访客偏好。深度定制只接受已知产品目的地并保留合法选择。返回路径由既有 offering navigation 生成，Next Link 统一添加 `/one-g`。

- RobotDock / SONIC Link 套餐仍为无报价预览：可以选择套餐、数量和支付方式，加入购物车仍禁用。
- 可售演示普通商品加购仍先检查登录；安全 returnTo 返回原页；用户需再次点击，不自动添加。
- 默认构建不能创建订单、发起支付；原模拟成功页改为通过订单 ID 查询状态，无订单不显示成功，忽略 success=true。
- 本地演示订单须再显式开启 `NEXT_PUBLIC_ONE_G_MOCK_COMMERCE=1`，同时要求 Mock Auth 开启。结算先创建 `DEMO-...` 待支付订单，不请求任何支付网关；按 user.id 保存，记录三种渠道之一，页面标明非真实交易，不触发发货。
- 演示只根据目录中有效商品 ID/数量计算示例金额，不接受客户端总价；拒绝概念、未知商品、未知价格及非法数量。正式计算必须由后端重新报价。
- 相同结算内容使用标签页持久化幂等键，重试/刷新不重复创建同一演示订单。正式订单与支付的幂等还须由服务端实现，不能依赖浏览器锁。
- 订单状态契约：pending、processing、awaiting-verification、paid、failed、closed。当前演示仅支持 pending；从浏览器记录中不接受已支付状态。没有定时成功回调、二维码、支付成功按钮或我已转账操作。
- 所有支付渠道均未正式接入。对公收款配置为 null，显示“对公收款信息待配置”，不提供虚假账户。已有订单摘要预留经确认的公司户名、开户银行、账号、应付金额、订单号/备注区域，当前不展示占位收款账号。

## 待接入服务契约（尚未部署）

静态托管不能运行动态 Next API。本次没有创建虚假动态接口。需在后续确定独立后端或支持服务端的托管方案后替换现有适配器，禁止把私钥放入 NEXT_PUBLIC 环境变量。

| 能力 | 客户端意图 / 响应 | 必需的后端保证 |
| --- | --- | --- |
| send verification | channel、recipient → challengeId、codeLength、expiresAt、resendAt | 真实 SMS/邮件投递商、密钥保密、发送限流、防枚举 |
| verify verification | challengeId、channel、recipient、字符串 code → 稳定 CurrentUser | 地址绑定、有效期、次数限制、成功原子作废、USER 账号查找/受控创建、HttpOnly session |
| get current user/logout | 当前 session → CurrentUser/null | session 生命周期、CSRF、撤销、角色来自后端 |
| create order | 有效商品/套餐 ID、quantity、payment、idempotencyKey → Order | 持久化、session 所有权、库存/资格/金额/币种复核、幂等 |
| initiate payment | 已存在 orderId → 获准的渠道支付参数 | 商户配置、桌面/手机实际获准场景、防重复支付；不能要求所有手机扫码自己屏幕 |
| query payment status | orderId → 可信 Order 状态 | 订单所有权、主动查询网关、禁止 URL 成功标记 |
| bank configuration | 订单付款区域 → 已确认账户/null | 公司收款户名、银行、账号、付款备注规则来自受控配置 |

正式支付通知必须校验来源和签名、商户、订单、金额、币种、交易状态，保证重复回调幂等，必要时主动查询。对公转账由“待支付 → 用户线下转账 → 待核实到账 → 授权财务核实 → 已支付”，用户声明和凭证都不能直接证实到账。本次无凭证上传、银行接口或财务后台。

仍缺：验证码发送服务、认证后端、持久化用户/标识绑定/订单存储、服务器商品套餐报价、支付宝/微信商户与获准支付场景、支付通知地址、对公真实账户资料、财务核实权限和流程。

## 验证命令

```sh
npm run lint
npx --no-install tsc --noEmit
npm run build
node --test tests/auth-payment.test.mjs
# 本地演示，显式开关；不要作为生产认证使用：
NEXT_PUBLIC_ONE_G_MOCK_AUTH=1 NEXT_PUBLIC_ONE_G_MOCK_COMMERCE=1 npm run dev
# 浏览器依赖可在仓库外临时目录准备，不修改主仓库依赖：
ONE_G_PLAYWRIGHT=/path/to/playwright-core ONE_G_BROWSER=/path/to/chrome node tests/auth-payment.browser.cjs
```

真实联调未执行：没有正式认证后端、发送商、订单后端、支付商户或对公资料。演示验收不能视为真实投递/认证/收款通过。

## 本次修改文件

认证：
- `src/app/login/page.tsx`
- `src/components/VerificationLogin.tsx`
- `src/components/AuthCard.tsx`（旧注册/找回入口兼容说明）
- `src/components/AuthProvider.tsx`
- `src/lib/auth-client.ts`
- `src/lib/auth/verification.ts`
- `src/lib/demo-mode.ts`

购买与支付选择：
- `src/components/ProductPurchase.tsx`
- `src/components/PaymentSelector.tsx`
- `src/components/usePaymentPreference.ts`
- `src/lib/payments.ts`
- `src/app/deep-customization/PurchaseReturnLink.tsx`（延续上一任务，增加数量/支付恢复）
- `src/app/deep-customization/page.tsx`（保留上一任务尚未提交的返回链接改动）

购物车、结算、订单与用户隔离：
- `src/components/AddToCartButton.tsx`
- `src/lib/cart.ts`
- `src/lib/configuration/storage.ts`
- `src/app/cart/page.tsx`
- `src/app/checkout/page.tsx`
- `src/lib/commerce/service.ts`
- `src/app/order-success/page.tsx`
- `src/components/OrderSummary.tsx`
- `src/components/AccountOrders.tsx`
- `src/app/account/page.tsx`
- `src/components/SiteShell.tsx`
- `src/components/ThemeProvider.tsx`
- `src/lib/accessibility-preferences.ts`

验证与说明：
- `tests/auth-payment.test.mjs`
- `tests/auth-payment.browser.cjs`
- `tests/auth-payment-production.browser.cjs`
- `tests/configuration.test.mjs`（更新购物车调用为明确用户归属，并断言无归属旧记录不自动迁移）
- `tests/product-v2-baseline.json`（仅更新本次已授权修改的 cart 文件哈希）
- `docs/auth-payment-integration.md`

## 实际验证记录

- `npm run lint`：0 errors；保留原 `ScrollExpand.tsx:244` 的 `<img>` 性能 warning。
- `npx --no-install tsc --noEmit`：通过。
- `npm run build`：通过，36 个静态页面生成成功，仍是原 GitHub Pages 导出配置。
- `node --test tests/configuration.test.mjs tests/auth-payment.test.mjs`：25/25 通过。
- 本地演示浏览器：10 组通过，包括公开浏览；格式/发送错误；发送和验证锁、错码、过期、重发；切换渠道/地址与取消旧请求；两渠道同一稳定 ID/主题；两产品套餐/数量/支付往返与登录恢复；结算预选、订单幂等、三个渠道未接入说明；跨用户隔离及忽略 success 参数；普通商品登录后再次手动加购；管理员密码登录。无页面运行错误。
- 额外执行 `tests/product-v2.test.mjs`：主题测试通过；产品冻结哈希测试失败在既有 `src/app/about/page.tsx` 基线。该文件工作区和 HEAD 的 SHA256 都是 `2ef2f8361eb1b34bb51c1f9696b8205cd3ac512dfd318d1cca01e6610ca13322`，旧基线为 `360c13abc263497164db67380bf57cb593f2e0a782c9f1f23b3f0e45ca88184c`。本次未修改 About，也未改其基线来掩盖差异。
- 所有成功结果仅代表原型/演示与静态构建验证，不代表真实短信、邮件、订单或支付联调。
- 正式导出浏览器验收：通过。375px/1440px 下手机号和邮箱获取/登录按钮禁用、没有测试码和普通密码；旧普通演示 session 不能访问账户/购物车/结算/订单；两产品公开购买及深度定制返回保留支付预选与 `/one-g`；无横向溢出或页面/hydration 错误。
- 当前本地开发服务为显式开启的演示模式（测试用）。生产导出仍默认禁用普通验证码 Mock；没有更改部署配置或提交/推送代码。
