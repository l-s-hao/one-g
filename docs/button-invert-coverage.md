# ONE-G 跨页按钮反色适配

日期：2026-10-21。基于任务开始时的工作树继续修改，保留先前媒体整合与按钮改动；未提交、暂存或推送，未修改参考仓库。

## 清单与范围

读取 25 个现有 page 模板、所在 layout、静态组件引用，使用 TypeScript JSX AST 去重 109 处操作声明（按文件、行、列区分同一行多个操作）。清单包含直接 button、Link/a、SupportButton、弹窗、空状态、错误状态及受保护页面。动态商品详情共用模板；不把模板声明数当成线上按钮实例数。

[完整结构化清单](./reviews/invert-expansion/inventory.json)记录每个路由的依赖、操作 ID、改前 JSX、A/B/C 分类、变体与保留原因。

- A：16 处上一轮已适配的声明，本轮沿用主按钮；无仍运行的旧 Specular 实例。其中登录、结算补充 card 表面 Token。
- B：本轮新增 16 处，1 处主操作、15 处次操作。
- C：77 处导航、紧凑操作、危险移除或正文链接保持原样。

| 页面/区域 | 按钮或组件 | 本轮处理 | 变体/保持原因 | 验证位置 |
| --- | --- | --- | --- | --- |
| 首页 `/` | Hero、查看全部、展开预览里的链接 | 沿用 A，不新增 | 既有主操作；卡片触发/关闭不变 | matrix、interactions |
| 商品中心 `/products` | 筛选、商品卡片、小号了解更多/购买 | C 不变 | Tab、整体卡片和紧凑链接，保留 Flip/浮起 | matrix、regression、interactions |
| 商品介绍 `/products/[id]` | RoboDock 技术规格、返回介绍、相关方案链接 | B 3 处模板声明 | 次操作；原尺寸和 href 保留 | matrix、geometry |
| 普通商品详情 | AddToCartButton | 沿用 A | 主操作；登录守卫与 pending 保留 | matrix、单元测试；本轮未创建订单 |
| 技术规格 `/products/[id]/specs` | 查看技术规格、返回产品介绍 | B 2 处模板声明 | 次操作；兼容旧路由不新建页面 | matrix、geometry |
| 购买 `/buy/robotdock` | 购买确认、深度定制咨询 | 购买沿用 A；咨询 B | 主操作/次操作；不改变价格与开放状态 | matrix、geometry |
| 购物车空状态 `/cart` | 开始配置、浏览商品 | B 2 处 | 主操作/次操作；原 h-11、pill 圆角不变 | matrix、geometry、flows |
| 购物车已有内容 | 去结算、配置方案主操作 | 沿用 A | 主操作；移除、加减和返回购买 C 不变 | 静态审计；本轮未完整跑有货购物车流程 |
| 结算 `/checkout` | 订单操作 | 沿用 A，补 card 表面 | 主操作；仍受未接入服务的 disabled 约束 | matrix、flows |
| 订单结果 `/order-success` | 返回首页、查看用户中心 | C 不变 | 原正文文字链接，不放大为 CTA | matrix 无订单状态；成功订单状态仅静态审计 |
| 解决方案 `/solutions` | 联系我们 | 沿用 A | 主操作；筛选和紧凑详情/展开 C 不变 | matrix、flows、regression |
| 遥操作 `/solutions/teleoperation` | 技术说明锚点、相关系统链接 | B 2 处 | 次操作；保留真实 a/Link；短联系我们仍 C | matrix、geometry |
| 遥操作视频错误区 | 重试加载 | B 1 处 | 次操作；仅调用原有 load 重试 | flows：真实 404 → 重试 → 恢复播放 |
| 了解公司 `/about` | 联系我们 | 沿用 A | 主操作；About/Lanyard 未改 | matrix、范围哈希 |
| 深度定制 `/deep-customization` | 联系客服 | 沿用 A | 主操作；不新增发送或购买服务 | matrix |
| 登录 `/login`、`/admin/login` | 登录主提交 | 沿用 A，补 card 表面 | 主操作；方式切换/获取验证码 C 不变 | matrix、flows；管理员入口共享组件静态审计 |
| 用户中心 `/account` | 咨询客服、切换用户、退出登录 | 客服沿用 A；账户操作 B 2 处 | 主操作/次操作；订单、购物车文字链接 C | matrix、geometry、interactions |
| 管理员中心 `/admin` | 切换账号、退出登录 | 复用同一 B AccountActions | 次操作；导航 Chip、管理卡片不变，无保存表单可适配 | matrix、geometry；切换回调用户页实测 |
| 客服共享弹窗 | 预览需求、底部关闭、返回编辑 | 预览沿用 A；3 处 B | 预览为主；关闭/返回编辑为次；标题栏关闭 C | flows、geometry、interactions |
| Header、图片菜单、Footer | 导航、图标、语言、主题、联系短链接 | C 不变 | 保留原交互和无下划线 | matrix、regression、interactions |
| 共享空状态/无权限 | 正文返回链接 | C 不变 | 不扩成按钮，不新增弹窗/抽屉 | 清单及源码审计 |
| `/configure*`、`/customize*` | 兼容入口及重定向 | 不增页面/按钮 | 原路由行为保留 | 静态引用审计 |
| `/register`、`/forgot-password`、`/sonic-link` 及旧 SONIC 商品路径 | 兼容入口 | 不变 | 保留已有跳转，SONIC Link 仍为解决方案 | 静态引用审计 |

没有独立的新订单管理/管理员编辑/保存页面，不创建不存在的功能。HomeProductShowcase、shimmer-button 无现有页面引用，未启用。不存在本轮可迁移的独立抽屉 CTA。

## 共享实现

沿用 `src/i18n/Elements.tsx` 的 LButton、LocalizedLink、LA，增加显式 `effectVariant="secondary"`，默认 primary。外观 props 转为 data 属性，不泄漏到 DOM；ref、表单属性、href、事件、aria、disabled/loading 原逻辑保留。继续使用现有 CSS 与主题 Token，无技术栈迁移、无依赖安装、无新按钮 Store。

主操作：品牌填充/反差文字 → 所在容器表面/主文字/品牌边框。次操作：表面/主文字/轻描边 → 品牌填充/反差文字/品牌边框。仅在可 hover、fine pointer、可操作且非 aria-busy 时变化，颜色过渡 200ms。主按钮固定 2px、次按钮固定 1px 向内伪元素边框，两个状态尺寸不变；不改变 padding/border box，不挂载任何运行时绘图或指针追踪。

次操作保留自身圆角；购物车原 rounded-full 因旧共享 18px fallback 曾被覆盖，已用 `data-invert-native-radius` 让该处保留原 Tailwind 圆角。没有调整其它布局。焦点框独立、文字无下划线、减少动画无过渡、触屏不残留 hover。选中按钮没有 transform/filter/all 过渡。

清理 AccountActions 的旧 hover 配色、ProductPurchase 咨询入口的冲突 hover 背景，以及购物车空状态的旧白底黑字/150ms hover 类。本轮没有继续删除组件或依赖；上一轮删除的 7 个 Specular 专属文件仍无任何运行源码引用。其它 Canvas、Lanyard、ShineBorder 容器、Layout Grid、GSAP、MenuToGrid 保留。

## 验证证据与边界

- [尺寸前后及比较](./reviews/invert-expansion/geometry-results.json)：20 组场景、44 个实例，宽高、padding、圆角、字体、border-width、display 相同，文字 Range 位置/尺寸误差低于 0.1px。
- [页面状态矩阵](./reviews/invert-expansion/matrix.json) / [汇总](./reviews/invert-expansion/matrix-summary.json)：16 个页面 × 8 组中英/日夜/桌面触屏组合，共 128 组、224 个按钮检查，最终样式失败、运行错误、嵌套与误选数量均为 0；不存在 loading/disabled 状态的页面不伪造业务状态。公开页使用生产 out/ 静态服务，受保护页使用仅开启 Mock Auth 的本地服务。
- [客服/错误重试/登录加载](./reviews/invert-expansion/flows.json)：8 组中英×日夜×桌面/触屏；真实视频 404 后原按钮重试恢复播放；实际 OTP 加载禁用和高度保持；一次点击链接跳转；非 GET/HEAD 请求为 0。
- [跨组件交互](./reviews/invert-expansion/interactions.json)：主题/语言切换保留同一表单 DOM 与内容；账户切换保留目标路由；首页 Layout Grid 展开链接可跳转；商品卡片小按钮与 Header 不被迁移。
- [静态构建回归](./reviews/invert-expansion/regression-results.json)：主题切换/刷新持久化、图片导航/筛选/Escape/跳转、客服登录门禁及 returnTo、商品分类/GSAP Flip 通过。
- [范围哈希](./reviews/invert-expansion/scope-check.json)：对比本轮开始时已有的脏工作树，商品数据/媒体索引、AuthProvider、主题、语言持久化、Header、Layout Grid、Flip 核心和依赖/构建配置保持原内容。

生产构建、lint、直接 TypeScript 检查、五个相关测试文件和 git diff --check 已执行。package.json 没有独立 typecheck 脚本，使用 `npx tsc --noEmit`。构建生成 38 个静态页面。

浏览器为 Chromium，390px 是触屏模拟、1440px 是桌面；未测实体手机、Safari/Firefox，未执行真实支付、订单提交或客服发送。初期开发缓存/清单读取错误使部分巡检中断；备份并重建 .next 缓存后仍曾复现；最终隔离浏览器后台预取、将测试报告写入 /tmp 避免触发项目监听，并逐项补齐加载等待后重测通过，未修改构建配置或跳过类型检查。最终结果不把中断尝试计为通过。默认/hover/focus-visible、减少动画在存在且可用的按钮上检查；active 按下状态针对桌面，触屏另测一次真实 tap 跳转；loading 以真实 OTP 状态单独检查。

## 截图

| 场景 | 桌面日间 | 手机英文夜间 |
| --- | --- | --- |
| 商品介绍 | [截图](./reviews/invert-expansion/products-robotdock-1440-light.png) | [截图](./reviews/invert-expansion/products-robotdock-390-dark.png) |
| 技术规格 | [截图](./reviews/invert-expansion/products-robotdock-specs-1440-light.png) | [截图](./reviews/invert-expansion/products-robotdock-specs-390-dark.png) |
| 购买 | [截图](./reviews/invert-expansion/buy-robotdock-1440-light.png) | [截图](./reviews/invert-expansion/buy-robotdock-390-dark.png) |
| 购物车空状态 | [截图](./reviews/invert-expansion/cart-1440-light.png) | [截图](./reviews/invert-expansion/cart-390-dark.png) |
| 用户中心 | [截图](./reviews/invert-expansion/account-1440-light.png) | [截图](./reviews/invert-expansion/account-390-dark.png) |
| 管理员中心 | [截图](./reviews/invert-expansion/admin-1440-light.png) | [截图](./reviews/invert-expansion/admin-390-dark.png) |
| 客服编辑 | [截图](./reviews/invert-expansion/contact-edit-1440-light.png) | [截图](./reviews/invert-expansion/contact-edit-390-dark.png) |
| 客服预览 | [截图](./reviews/invert-expansion/contact-preview-1440-light.png) | [截图](./reviews/invert-expansion/contact-preview-390-dark.png) |
| 登录加载 | [截图](./reviews/invert-expansion/loading-1440.png) | [截图](./reviews/invert-expansion/loading-390.png) |

目录另有其余代表页面截图。截图中的蓝色次按钮可能处于 hover，focus-visible 外框独立显示；默认次按钮为轻描边。

次按钮四种外观：[桌面日间 hover](./reviews/invert-expansion/secondary-1440-light.png)、[桌面夜间 hover](./reviews/invert-expansion/secondary-1440-dark.png)、[手机日间默认](./reviews/invert-expansion/secondary-390-light.png)、[手机夜间默认](./reviews/invert-expansion/secondary-390-dark.png)。已实际查看代表截图；触屏仅即时状态，不模拟持久 hover。

可复跑的矩阵脚本为 `tests/invert-expansion.browser.cjs`：通过 `ONE_G_PLAYWRIGHT` 指向外部 Playwright 模块、`ONE_G_BROWSER` 指向浏览器，`ONE_G_TEST_URL` 指向静态生产预览，`ONE_G_MOCK_URL` 指向仅开启 Mock Auth 的开发预览。没有为测试安装项目依赖。默认输出至系统临时目录；完成后归档，以免触发开发服务监听。该样式状态测试阻止真实点击事件并隔离后台预取；真实跳转/业务事件由独立 flows/interactions/regression/touch 检查覆盖。

最终矩阵保留了需要复测的开发服务异常样本：[初次尝试](./reviews/invert-expansion/matrix-initial-attempts.json)。这些记录不计作最终通过；受影响组合已在最终 matrix.json 重新执行。真实单次触屏 tap 的结果见 [touch.json](./reviews/invert-expansion/touch.json)。

[命令与汇总](./reviews/invert-expansion/checks.json) · [22 组中英文完整刷新检查](./reviews/invert-expansion/hydration.json)：未发现 hydration 或新增词典错误。既有媒体文件及来源索引另与上一轮素材整合完成后的哈希比较，46 个文件一致。本地预览继续保留模拟登录，未开启模拟交易。
