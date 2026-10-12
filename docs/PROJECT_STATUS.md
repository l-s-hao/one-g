# 项目开发状态

[项目首页](../README.md) · [功能说明](FEATURES.md) · [架构](ARCHITECTURE.md) · [部署](DEPLOYMENT.md)

核对日期：2026-10-12。范围：当前工作区源码，包含此前未提交的首页、品牌、导航和主题改动；不代表 GitHub 线上已经部署该版本。

## 状态定义

| 状态 | 含义 |
| --- | --- |
| 已实现 | 当前网站代码有可用的展示/交互实现；不代表产品或外部服务交付完成 |
| 前端演示 | UI、本地 Mock 或浏览器流程存在，缺少正式业务服务或确认资料 |
| 开发中 | 有明确的进行中实现证据但尚未完成；本次未用此状态推测后端进度 |
| 计划中 | 当前缺失或仅有设计/占位，需要后续任务实现 |

## 当前 18 个功能模块

| 功能模块 | 当前状态 | 主要代码位置（src/ 下） | 已完成内容 | 尚未完成内容/限制 |
| --- | --- | --- | --- | --- |
| 1. 品牌首页 | 已实现 | `components/HomeCollageHero.tsx`、`i18n/dictionary.ts` | 定位/标语/愿景，图片拼贴，14.6s 滚动、入场、暂停、响应式 | 部分照片型号未确认；不是机器人控制平台 |
| 2. 首页商品预览 | 已实现 | `components/HomeProductsPreview.tsx`、`ui/layout-grid.tsx`（位于 components 下） | 四商品、不等宽网格、点击展开、状态/详情入口 | 展示资料不等于正式商品核实；Vision 媒体对应待确认 |
| 3. 首页方案预览 | 已实现 | `components/HomeSolutionsPreview.tsx`、`HomePreviewProvider.tsx` | 四方案预览、命名空间隔离、两 Grid 协调 | 不展示未经验证的部署或效率承诺 |
| 4. 导航/搜索/Footer | 已实现 | `components/Header.tsx`、`HeaderPanel.tsx`、`Footer.tsx` | 响应式菜单、开关/切换过渡、关闭清理、本地搜索 | 没有远程搜索服务 |
| 5. 商品中心/筛选 | 已实现 | `app/products/page.tsx`、`components/ProductCard.tsx`、`lib/products.ts` | 9 商品统一网格、分类 URL 状态、GSAP Flip | 8 个原型条目仍含 Mock 数据；正式目录待核实 |
| 6. 产品详情/规格 | 已实现 | `app/products/[id]/`、`components/ProductDetailContent.tsx` | 内容、图片说明、兼容/接口与局部导航 | RoboDock 多项规格待验证；普通商品简化内容 |
| 7. 解决方案中心 | 已实现 | `app/solutions/page.tsx`、`components/SolutionExplorer.tsx` | 分类、展开、hash 定位、能力边界 | 部分方案是讨论/验证基础，不是自主作业交付 |
| 8. SONIC Link 详情 | 已实现 | `app/solutions/teleoperation/page.tsx`、`data/solutions/sonic-link.ts` | 遥操作工作流说明与已有媒体 | 本仓库未接机器人运行控制服务 |
| 9. RoboDock 套餐配置 | 前端演示 | `app/buy/[id]/page.tsx`、`components/ProductPurchase.tsx` | 四套餐、数量、URL 恢复、定制返回 | 价格待确认，加购禁用，无销售/交付闭环 |
| 10. 支付方式选择 | 前端演示 | `components/PaymentSelector.tsx`、`lib/payments.ts` | 支付宝/微信/对公预选与偏好保存 | 无真实支付、商户、银行资料和回调核验 |
| 11. 登录/访问控制 | 前端演示 | `components/VerificationLogin.tsx`、`AuthProvider.tsx`、`lib/auth/` | 本地验证码/快捷演示，角色隔离、安全返回与退出 | 正式短信/邮件验证码、注册和服务器 session 未接入 |
| 12. 购物车/结算/订单 | 前端演示 | `app/cart/`、`app/checkout/`、`lib/cart.ts`、`lib/commerce/service.ts` | 用户隔离本地记录、Mock pending 订单与幂等校验 | 无数据库、库存、服务端价格/真实成交；生产禁用 Mock |
| 13. 用户中心 | 前端演示 | `app/account/page.tsx`、`components/AccountOrders.tsx` | 演示资料、订单、购物车、咨询、切换/退出 | 地址管理未开放，资料/订单无服务端同步 |
| 14. 管理员中心 | 前端演示 | `app/admin/page.tsx` | 模块切换、只读说明、演示角色保护 | 无真实管理数据、CRUD、后台权限体系 |
| 15. 中英文 | 已实现 | `i18n/LocaleProvider.tsx`、`dictionary.ts`、`Elements.tsx` | 展示文本/可访问属性、偏好和页面语言同步 | 新文案需维护词典；无多语言 URL/CMS |
| 16. 日夜外观 | 已实现 | `components/ThemeProvider.tsx`、`ThemeToggle.tsx`、`app/colors.css` | 仅 light/dark、圆形转场、SSR/减少动画/异常回退 | 不支持转场的浏览器直接换色，不增加其它模式 |
| 17. About/品牌互动 | 已实现 | `app/about/`、`components/AboutHero.tsx`、`LanyardBrandSection.tsx` | ScrollExpand、愿景/定位、物理吊牌及静态回退 | WebGL 能力影响吊牌体验；不代表机器人算法已实现 |
| 18. 客服/深度定制需求 | 前端演示 | `components/ContactProvider.tsx`、`lib/contact-preview.ts`、`app/deep-customization/` | 登录后填写、校验、前端预览、来源与购买上下文 | 无邮件发送、服务器需求保存、自动报价或后台分派 |

上述分类共 **11 个已实现的网站模块、7 个前端演示模块**；其中服务缺口另列为计划中。不能从这两个数字计算公司产品或业务完成率。

## 真正接入服务的情况

- 配置层面：已有 GitHub Actions → GitHub Pages 静态部署工作流。本次没有操作 GitHub 或核验线上发布结果。
- 网站业务层面：**没有正式认证、数据库、订单、支付、短信、邮件或客服提交服务接入**。TypeScript 服务契约和浏览器 Mock 不算真实后端。
- SONIC Link 数据中的团队技术/演示说明是内容来源，不证明当前网站实现了设备控制连接。

## 待完成项

| 后续模块 | 当前状态 | 当前证据/缺口 |
| --- | --- | --- |
| 正式认证与用户持久化 | 计划中 | 验证码服务未配置，生产 Mock 关闭；首次登录建号未开放 |
| 商品/价格/库存后台 | 计划中 | 本地 Product fixtures，部分媒体/参数/价格待确认 |
| 订单数据库与服务端交易校验 | 计划中 | 仅本地 pending 演示订单，无服务器报价和库存扣减 |
| 真实支付与对公收款核验 | 计划中 | 渠道调用拒绝，真实银行资料返回空值，无通知处理 |
| 需求提交与邮件发送 | 计划中 | 表单只前端预览，没有发送端点 |
| 用户地址与管理员 CRUD | 计划中 | 地址未开放，后台模块只读/占位 |

这些是现有缺口，不是已批准的交付日期、实现方案或正在进行的后端开发。

## 不属于当前功能的内容

- 多主题选择、护眼和色觉模式：没有当前入口，不能用历史截图宣传。
- 旧配置工作台：原有 URL 兼容进入当前内容，不视为独立工作台。
- 旧首页 TechText/MicroSlats、独立 RoboDock/SONIC Link 大展示：不再由首页引用。
- 3D 商品圆环：不是当前商品中心或首页预览；About 物理吊牌仍是独立品牌效果。
- SONIC Link 商品或购物车身份：已从当前业务目录排除；旧链接兼容不恢复销售身份。

历史组件、配置 schema、规划文档和旧测试可能保留，应按实际 import、路由和数据引用判断功能是否启用。

## 本次文档验证边界

核对代码、锁文件、部署工作流和已有文档；获取当前本地静态导出的四张真实截图；检查 Markdown 链接、图片、标题/代码块及业务源码保持不变。没有修改前后端、配置、用户系统或产品数据；没有提交、推送、生产部署或真实交易测试。
