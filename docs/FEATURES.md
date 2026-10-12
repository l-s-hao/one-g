# 功能说明

[项目首页](../README.md) · [架构](ARCHITECTURE.md) · [开发状态](PROJECT_STATUS.md)

本文核对当前路由和实际引用组件，共 18 个模块。“已实现”指网站功能存在；“前端演示”指界面/本地流程存在而真实业务未接入。部分模块的展示已实现，但产品事实或业务服务仍有明确限制。

## 1. 品牌首页

- 页面：`/`；组件：`HomeCollageHero`。
- 来源：`i18n/dictionary.ts` 的统一品牌文案、现有商品媒体。
- 已实现：定位行、主标题“一智通万机”、完整愿景、商品/方案入口；三列错位拼贴及空间允许时的额外列。
- 14.6 秒交替方向无缝滚动、逐行入场、暂停、视口/页面不可见时暂停、减少动画静态回退。图片为装饰，不是购买入口。

## 2. 首页产品预览

- 页面：`/#home-products`；组件：`HomeProductsPreview`、`ui/layout-grid`。
- 从统一 Product 数据选取 RoboDock、ONE-G G1、Arm A1、Vision V1，不改变商品中心顺序。
- 已实现：2+1 / 1+2 网格、名称/展开提示、共享布局转场、局部遮罩、状态说明和详情入口。
- RoboDock 概念说明保留。Vision 图片与型号对应关系待确认，不能视为已确认商品照片。两个 Grid 共享一个选择 ID，产品区域 namespace 为 `home-products`。

## 3. 首页方案预览

- 页面：`/#home-solutions`；组件：`HomeSolutionsPreview`、`ui/layout-grid`。
- 来源：Solution 数据；顺序为遥操作 · SONIC Link、巡检、搬运、智能任务。
- 已实现：同一 Layout Grid 核心、关闭按钮、Escape、遮罩关闭、返回焦点与中英文更新；namespace 为 `home-solutions`。
- 遥操作进入 `/solutions/teleoperation/`，其余进入 `/solutions/#inspection`、`#handling`、`#ai` 并定位/打开方案。首页不自动播放四个视频。

## 4. 导航、搜索与页脚

- 共享组件：`Header`、`HeaderPanel`、`Footer`；导航来源：`data/site-navigation.ts`、`footer-navigation.ts`。
- 已实现：桌面下拉、120ms 悬停延迟、180ms 离开关闭、240ms/6px 面板过渡、手机点击菜单、Escape/外部关闭、关闭中 inert。
- 搜索过滤内置产品/栏目，不调用远程索引。登录/购物车入口遵循现有访问规则。

## 5. 商品中心与筛选

- 页面：`/products/`；组件：页面内 `ProductCatalog`、`ProductCard`。
- 来源：`lib/products.ts → data/products.ts`，按稳定 ID 去重；9 个当前商品条目，含 RoboDock 与 8 个原型商品。
- 已实现：统一网格、全部/分类筛选、category URL 参数、GSAP Flip 入退场、快速切换清理与减少动画。
- 其它商品含 Mock 型号/价格、占位或待确认图片；不能当作正式销售目录。

## 6. 产品详情与技术规格

- 页面：`/products/[id]/`；RoboDock 另有 `/products/robotdock/specs/`。
- 组件：`ProductDetailContent`、`ProductLocalNav`、`ProductStatusBadge`、`ProductVisual`。
- 来源：Product detail/specifications，现有图片说明。已实现详情、功能/兼容内容、局部导航及规格入口。
- RoboDock 规划接口、AI 概念图、安装草图与待确认内容明确标注。普通商品没有完整 detail 时使用简化详情；不能承诺每个商品都有独立规格路由。

## 7. 解决方案中心

- 页面：`/solutions/`；组件：`SolutionExplorer`；来源：`data/solutions.ts`。
- 已实现：四个真实内容条目、分类、展开面板、hash 定向定位及能力边界。
- 搬运/巡检/智能任务以既有技术素材和规划讨论为基础，不是已交付自主作业方案，不包含购买/价格/购物车操作。

## 8. SONIC Link 遥操作详情

- 页面：`/solutions/teleoperation/`；来源：`data/solutions/sonic-link.ts`。
- 已实现：PICO 动作采集、软件与机器人端接入流程介绍、已有演示媒体、说明和边界。
- 浏览器页面不建立机器人控制连接，未提供运行控制后端、驱动或可下载生产 SDK。旧商品入口仅兼容跳转，不恢复 SONIC Link 商品身份。

## 9. RoboDock 购买配置

- 页面：`/buy/robotdock/`；组件：`ProductPurchase`；来源：RoboDock detail.bundles 与 offering 适配器。
- 前端演示：四种套餐、数量、URL 保存/返回、状态说明、深度定制入口。
- 价格待确认，加入购物车按钮禁用，不下单、不付款。现有套餐选择不等于旧多步骤配置工作台。

## 10. 支付方式预选

- 页面：购买页与 `/checkout/`；组件：`PaymentSelector`、`usePaymentPreference`。
- 来源：`lib/payments.ts`；前端演示支付宝、微信支付、对公转账三种预选及访客/用户偏好。
- 无商户渠道、收款接口、真实二维码、银行资料或支付回调；登录方式不决定支付方式。

## 11. 登录与访问控制

- 页面：`/login/`，旧管理员/注册/找回入口兼容；组件：`VerificationLogin`、`AuthProvider`、`RequireRole`。
- 前端演示：手机号/邮箱校验、Mock 挑战与取消、登录返回、用户切换、退出、USER/ADMIN 区分；本地开发有显式白名单快捷路径。
- 来源：`lib/auth/verification.ts`、`auth/mock-login.ts`、本地虚构身份。生产默认未接入；不发送真实验证码，不注册真实用户，不执行密码重置。

## 12. 购物车、结算与订单

- 页面：`/cart/`、`/checkout/`、`/order-success/`；组件：`OrderSummary`、`AccountOrders`。
- 来源：`lib/cart.ts`、`lib/commerce/service.ts`；用户 ID 隔离的浏览器演示记录。
- 前端演示：数量/金额、支付预选、Mock 订单及幂等校验、订单查询；需相应 Mock 开关和角色。
- 不持久化到服务器，不建立真实订单或支付状态。RoboDock 不可售；SONIC Link 被明确排除。

## 13. 用户中心

- 页面：`/account/`；组件：`AccountOrders`、`AccountActions`、`SupportButton`。
- 前端演示：用户资料、演示订单、购物车入口、咨询、切换与退出。
- 用户资料来自 Mock 会话，不可当作注册用户库。用户名未设置；收货地址管理未开放。

## 14. 管理员中心

- 页面：`/admin/`；组件：页面内模块选择、`AccountActions`。
- 前端演示：Dashboard 与用户、商品、订单、配置方案、推荐规则、网站设置入口及只读说明。
- 没有真实列表数据、编辑保存、增删改、服务器权限管理或配置后台。管理员与普通用户演示角色隔离，不等于生产安全系统。

## 15. 中英文

- 全站组件：`LanguageSwitch`、`LocaleProvider`、`i18n/Elements.tsx`。
- 已实现：中文默认、英文词典、展示文本/可访问属性更新、本地偏好、文档语言和标题同步。
- 没有独立语言 URL、第三方翻译服务或 CMS；新增文本需补词典，遗漏会输出提示。不会用 locale key 重建整站。

## 16. 日夜外观

- 全站组件：根级 `ThemeProvider`、导航 `ThemeToggle`、`ui/animated-theme-toggler`。
- 已实现：light/dark；默认日间，主动选择持久化；400ms 从按钮中心圆形扩散，互斥/清理、SSR 稳定控件、unsupported 与 reduce 直接切换。
- 来源：`next-themes` 与 `app/colors.css`。照片保持原色；没有 system 选项、护眼、色觉模式或多主题面板。

## 17. 了解公司与品牌互动

- 页面：`/about/`；组件：`AboutHero` / `ScrollExpand`、`AboutVision`、`LanyardBrandSection` / `Lanyard`。
- 已实现：首屏展开品牌卡片、标语、完整愿景、具身智能定位、模型/软件/硬件关系、按需加载的 WebGL 物理吊牌及静态回退。
- 原图/正式 Logo 与吊牌图案继续使用本地资源；品牌内容来自统一词典，不把愿景写成已验证能力。

## 18. 客服需求与深度定制

- 页面：About、方案、用户中心、Footer 入口，以及 `/deep-customization/`。
- 组件：`SupportButton`、`ContactProvider`、`PurchaseReturnLink`；来源：`lib/contact-preview.ts` 与商品套餐上下文。
- 前端演示：普通用户登录要求、姓名/邮箱/需求校验、来源提示、前端预览、购买选择返回。深度定制介绍工程范围和评估流程。
- 不发送真实邮件，不保存客户需求到后台，不自动报价。公开生产站因认证未接入，不能把受保护需求流程当作已经对外可用的提交服务。
