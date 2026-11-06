# 系统架构

[项目首页](../README.md) · [功能](FEATURES.md) · [开发](DEVELOPMENT.md) · [状态](PROJECT_STATUS.md)

## 范围与运行方式

这是 Next.js App Router 网站，页面在构建时导出 HTML、JS、CSS 和静态资源。React 在浏览器接管交互；构建使用服务器组件不等于部署了业务服务器。当前没有 `src/app/api/`、数据库模型/迁移或对接真实业务服务的 HTTP 请求流程。

公司“具身智能开发与应用平台”是品牌定位；本站展示机器人商品和方案，不负责下发机器人控制命令、训练模型或管理实际设备。

```mermaid
flowchart TD
  Visitor[浏览器用户] --> Pages[App Router 页面]
  Pages --> UI[展示与业务组件]
  UI --> ProductLib[商品与方案查询/规则]
  ProductLib --> Fixtures[data 本地数据]
  UI --> State[React Context / URL 状态]
  State --> Browser[localStorage / sessionStorage]
  UI --> Auth[认证适配器]
  UI --> Commerce[订单适配器]
  Auth --> Gate{开发/测试且显式开启 Mock?}
  Commerce --> Gate
  Gate -->|是| Mock[本地演示身份 / 浏览器演示订单]
  Gate -->|否| Unconfigured[未接入提示 / 拒绝真实业务操作]
  CI[GitHub Actions] --> Export[Next.js 构建 out/]
  Export --> Hosting[GitHub Pages 静态托管]
```

## 页面壳与状态来源

`src/app/layout.tsx` 中根级 `ThemeProvider → LocaleProvider → AuthProvider → SiteShell` 提供统一状态。`SiteShell` 内 `ContactProvider` 管理需求预览。管理员页面有独立展示壳，登录页和公开页面使用共享 Header。

| 状态 | 代码 | 来源/持久化 |
| --- | --- | --- |
| 当前用户与初始化 | `components/AuthProvider.tsx`、`lib/auth-client.ts` | Mock 身份映射、受环境保护的演示会话；不是服务器 session |
| 语言 | `i18n/LocaleProvider.tsx`、`dictionary.ts` | 中文 SSR 默认、挂载后恢复本地偏好；更新正文而非整页重挂 |
| 外观 | `components/ThemeProvider.tsx`、`ThemeToggle.tsx` | 单一 next-themes；light/dark；`one-g-appearance-v1` |
| 首页展示 | `HomeLanding.tsx` → `lib/home-content.ts` | 五区正常文档流；分类与详情使用正式集合/导航 URL，无首页筛选或展开状态 |
| 商品筛选 | `app/products/page.tsx` | URL category 参数与 GSAP Flip 布局状态 |
| 套餐与数量 | `ProductPurchase.tsx` | 本地组件状态及 URL package/quantity 参数 |
| 支付方式 | `lib/payments.ts`、`usePaymentPreference.ts` | URL 与用户 localStorage/访客 sessionStorage；不发起付款 |
| 客服需求 | `ContactProvider.tsx`、`lib/contact-preview.ts` | 已登录用户的前端填写、校验、预览；没有发送端点 |

没有 Redux、Zustand 或全局业务数据库。剩余 `lib/configuration/` 和旧 schema 是历史兼容/迁移代码，不代表旧配置工作台仍启用。

页面壳、导航、权限入口与客服预览统一消费 `lib/use-app-pathname.ts`：它将部署路径转为逻辑路径并去除尾斜杠，根路径保留 `/`，调用方无需重复处理。该 hook 不替代 `auth-routing.ts` 对不可信返回 URL 的权限检查，也不替代 `configuration-routing.ts` 的旧入口迁移。

## 商品与解决方案

- `data/products.ts` 与 `data/products/robotdock.ts` 是商品数据来源，`lib/products.ts` 统一查询，`types/product.ts` 定义形状。
- `data/solutions.ts` 是四个方案的数据来源，SONIC Link 长内容在 `data/solutions/sonic-link.ts`。方案可引用商品 ID，但不因此成为商品。
- `/solutions` 正文由 `SolutionSections` 连续输出，`lib/solution-sections.ts` 仅保存本页阅读顺序与演示ID引用；不改变共享方案集合。目录为原生锚点，四个稳定方案ID及旧 `solution-ID` 标题入口保留，无分类筛选或正文展开状态，详见 [本页布局约定](SOLUTIONS_LAYOUT.md)。`EvidenceVideos` 的 feature 布局只放大本页媒体，默认详情网格不变。
- 首页只保存展示 ID 列表；通过现有数据派生标题、状态和链接，不维护第二份商品数据库。
- `lib/product-policy.ts` 判断展示状态和加购许可。RoboDock 为 concept，购买页只允许套餐预览。Mock active 商品也不代表真实销售/库存已核实。
- `public/` 保存公开媒体；Next Link 根据 basePath 处理页面路由，现有图片字段通常已经含 `/one-g/`，不能再次拼接。

## 认证与角色边界

`lib/demo-mode.ts` 要求 development/test 环境及显式 Mock 开关；正式构建始终关闭。普通入口默认邮箱验证码，也支持密码。`auth/policy.ts` 集中定义大陆/海外渠道与注册字段规则，`auth/human.ts` 管理单次模拟人机凭据，`auth/verification.ts` 按用途/地区/目标管理挑战，`auth/accounts.ts` 和 `account-service.ts` 管理内存普通账户与显式注册。注册成功返回登录，不建立会话。正式服务均未接入，详见 [注册/登录契约](registration-auth-contract.md)。

`RequireRole`、`auth-routing.ts` 和 `safeReturnTo` 在前端控制访问和安全返回。它们改善演示流程，不能代替生产后端授权。旧 `/admin/login` 只进入统一登录流程；`/register` 现在是显式资料表单；只有 Mock 环境创建短期内存 USER，刷新失效。`/forgot-password` 仍不执行密码重置。注册范围内的导航保护仅在有未保存内容时启用，未修改全站导航组件。

认证地区/渠道规则仍由 `lib/auth/policy.ts` 负责；与客服预览相同的邮箱格式检查复用 `lib/validation.ts:isEmailAddress`。这个纯函数不裁剪或规范化输入、不验证邮箱所有权、不触发服务；认证先规范化账号，客服只 trim 后检查，保留草稿原文及自身必填/错误提示。

## 购物车、订单与支付

`lib/cart.ts` 按演示用户隔离本地购物车。`lib/commerce/service.ts` 定义服务契约：Mock 启用时仅创建 DEMO 前缀、pending 状态的本地订单并校验幂等输入；未启用时拒绝创建。没有成功收款、订单持久化数据库或真实银行收款资料。浏览器记录即使被修改，也不能作为 paid 结果。

`PaymentSelector` 只选择支付宝、微信支付或对公转账。`initiatePayment` 当前明确返回渠道未接入/资料待配置，不调用支付网关。`order-success` 查询演示订单，不能依据 URL success 参数认定付款成功。

## 兼容入口

`LegacyConfigurationRedirect`、`LegacySonicLinkRedirect` 与首页旧锚点映射保留旧链接访问能力。`/configure`、`/customize` 等进入当前商品/购买内容；旧 SONIC Link 商品、购买和规格入口进入遥操作方案。它们是客户端兼容导航，不是新功能，也不是 Pages 服务器 301 配置。

## 普通卡片悬停与动画边界

共享规则在 `components/card-hover.css`，由根布局加载；`CardHover.tsx` 只提供稳定的外层命中区域。普通卡片显式使用 `data-card-hover-host` / `data-card-hover-surface`，不会根据 div/article 或模糊类名自动匹配。CSS individual translate 和 box-shadow 完成 200ms/-4px 反馈，不添加依赖、鼠标位置状态或每帧事件。

商品中心保留外层 Product ID、Grid 身份与 Flip transform，完整视觉表面位于内层；已有 `data-filter-animating` / inert 标记即时停用新增位移。保留的旧首页 Grid 实现中，slot 感知 hover，独立包装层承载悬停，Motion article/img 保持原 layoutId 和布局动画；2026-11-05 新首页不再挂载这些组件。展开前设置局部停用标记，回位完成事件解除；减少动画关闭路径直接复位，两个 Grid 选择状态仍由原 Provider 协调。

选中套餐的内阴影通过局部 `--card-rest-shadow` 与新增阴影叠加。只有 hover:hover、pointer:fine 设备启用位移；减少动画取消新增位移和过渡。日夜只改变新增阴影，沿用原主题颜色和状态。范围与实际验收见 [卡片交互说明](CARD_HOVER.md)。

## 后续服务接入

认证、商品/订单数据库、服务端报价、支付通知、需求提交和管理员 CRUD 均是待完成项。现有 TypeScript service 接口为后续接入提供边界，但目前没有真实服务接入证据。[历史后台规划](backend-plan.md) 与 [历史数据库规划](database-plan.md) 仅供设计参考，不列作当前技术栈。

图片导航使用 Header 局部状态和 `HeaderImageMenu`，从公开商品集合与方案集合派生入口；React 管理缩略图/网格布局，GSAP Flip 仅控制导航链接外层，完整内层表面复用共享 CSS hover。商品导航分类状态独立于商品中心和 URL，仅按原商品 category 筛选当前面板。其选择器、ID 和生命周期与商品筛选隔离。详见 [图片导航](NAVIGATION.md)。

## 按钮装饰边界

本地化基础按钮和链接均默认无 Specular，只有调用位置显式传 `effect="specular"` 才挂载装饰；`intent` 只保留用途语义与已有填充。导航和小按钮没有装饰实例，不注册追踪或动画资源。原宿主和业务事件保留。共享调度器使用一个按需 WebGL2 绘制器、最多四个局部 2D 输出、共享指针与可见性观察器，静止停止 RAF，资源不足时使用主题 CSS 静态边缘。翻译先于包装；装饰不控制外层 Motion/Flip transform，不改变原主题管理。详见 [BUTTON_EFFECTS.md](BUTTON_EFFECTS.md)。

- 内容视频统一由 `ContentVideo` 控件与 `lib/content-playback.ts` 注册协调；会话内首次可见静音自动播放一次、暂停画面柔和模糊、结束停止，规则与回退见 [内容播放器](CONTENT_PLAYER.md)。

- 等待状态由 `BrandLoader` / `PendingLabel` 统一呈现，调用方保留请求和取消所有权；150ms纯视觉防闪烁，无全局开场屏障。规格与接入列表见 [品牌加载指示](BRAND_LOADER.md)。

- 内容图片叶子层 `ContentImage → LocalizedImage/Next Image` 统一等待/缓存/失败与原品牌Loader；页面继续保留原服务端边界。Header仍有单一panel状态，显示设置复用原locale/theme Provider，不引入全站图片加载状态。详见[SURFACE_AND_IMAGE_LOADING.md](SURFACE_AND_IMAGE_LOADING.md)。

- 公开搜索通过 `lib/site-search.ts` 适配现有商品、方案与导航资料；`SearchBox` 共用原生提交/匹配/候选，Header 与 `ProductSearch` 分别持有 query 与范围，不另建服务或 Provider。正式 Link 保留离页保护，短型号歧义与相近词不猜测跳转。见 [SEARCH_NAVIGATION.md](SEARCH_NAVIGATION.md)。

  搜索反馈使用显式destination/query/correction动作与提交快照，草稿变更废弃旧选择和提交；同步本地索引不制造pending。输入建议最多6项，提交后完整列表与数量一致，异常重试独立于无匹配；单一状态播报区域避免每键播报。见 [SEARCH_FLOW.md](SEARCH_FLOW.md)。
