# ONE-G 导航跳转与交互专项检查

## 1. 修复前复现与实际根因

只修改 ONE 主仓库，不写两个参考仓库，不提交、不推送。已有 Specular 等未提交修改完整保留；修复前二进制 diff 与状态快照位于 `/tmp/one-navigation-audit/before.patch`、`before-status.txt`。本报告列的是此次增量，不代表工作区所有 diff 都是本次修改。

修复前浏览器真实点击记录见 [before.json](navigation-interactions/before.json)。商品中心、解决方案是 **BUTTON、href=null**，点击命中按钮自身，URL 不变；原 `Header.tsx` 的 `item.groups` 分支只执行 `toggle(item.href, event.currentTarget)`。Logo、About、查看全部和图片则已经是 a/Next Link。不是透明层盖住这两个按钮，也不是它们的链接被 preventDefault；它们根本没有链接。

第二个独立问题在日夜扩散中复现：根级快照期间物理点击命中 HTML，不能命中真实链接。单独加 pointer-events:none 仍不足，因为被 root 快照捕获的后代本身会跳过命中测试，符合 [CSS View Transitions 规范](https://www.w3.org/TR/css-view-transitions-1/#view-transition-layer)。实测修复前扩散中 click 目标为 HTML、停留首页；修复后目标为 A，进入商品页并保留 dark 偏好。

还修复了：鼠标打开预览但焦点在 Header 外时 Escape 不生效；恢复焦点可能重开预览；键盘 Tab 无法自然进入图片面板；开发模式组合导航中 favicon 晚声明造成一次根 `/favicon.ico` 404；商品页静态 Suspense 加载占位过矮导致首屏布局跳动。

## 2. 导航入口、DOM 与实际目标

调用处仍使用 `/products` 等项目路由；由 Next 生成 basePath `/one-g`、尾斜杠、query/hash，未手工重复拼前缀。以下是生产 Chromium 的实际 DOM href 与最终 URL（仅省略测试主机）：

| 入口 | DOM | 实际 href | 最终目标/结果 |
| --- | --- | --- | --- |
| 商品中心（冷启动） | A / Next Link | `/one-g/products/` | 一致，通过 |
| 解决方案（展开期间） | A / Next Link | `/one-g/solutions/` | 一致，通过 |
| 商品中心（面板已开） | A / Next Link | `/one-g/products/` | 一致，通过 |
| 了解公司 | A / Next Link | `/one-g/about/` | 一致，通过 |
| Logo | A / Next Link | `/one-g/` | 一致，通过 |
| 查看全部商品 | A / Next Link | `/one-g/products/` | 一致，通过 |
| header-product-robotdock | A / Next Link | `/one-g/products/robotdock/` | 一致，通过 |
| header-product-g1 | A / Next Link | `/one-g/products/g1/` | 一致，通过 |
| header-product-g1-pro | A / Next Link | `/one-g/products/g1-pro/` | 一致，通过 |
| header-product-arm-a1 | A / Next Link | `/one-g/products/arm-a1/` | 一致，通过 |
| header-product-arm-a2 | A / Next Link | `/one-g/products/arm-a2/` | 一致，通过 |
| header-product-hand-d1 | A / Next Link | `/one-g/products/hand-d1/` | 一致，通过 |
| header-product-vision-v1 | A / Next Link | `/one-g/products/vision-v1/` | 一致，通过 |
| header-product-rgbd | A / Next Link | `/one-g/products/rgbd/` | 一致，通过 |
| header-product-lidar-kit | A / Next Link | `/one-g/products/lidar-kit/` | 一致，通过 |
| 查看全部方案 | A / Next Link | `/one-g/solutions/` | 一致，通过 |
| header-solution-handling | A / Next Link | `/one-g/solutions/#handling` | 一致，通过 |
| header-solution-inspection | A / Next Link | `/one-g/solutions/#inspection` | 一致，通过 |
| header-solution-teleoperation | A / Next Link | `/one-g/solutions/teleoperation/` | 一致，通过 |
| header-solution-ai | A / Next Link | `/one-g/solutions/#ai` | 一致，通过 |
| 从商品详情点击解决方案 | A / Next Link | `/one-g/solutions/` | 一致，通过 |

表中 9 个商品与 4 个方案图片逐一真实点击；Firefox 也逐一验证。搬运、巡检、智能任务保留方案锚点并展开对应内容。RoboDock 保留商品身份；SONIC Link 只有 `/solutions/teleoperation/` 方案目标。桌面与手机仍共用 HeaderImageMenu 的稳定 ID 与数据，不用展示名称拼路由。

额外实测：`/configure/robotdock/?package=base` → `/one-g/buy/robotdock/?package=base`；旧 configure/buy/products 的 SONIC Link 入口均 → `/one-g/solutions/teleoperation/`。见 [兼容与浮起记录](navigation-interactions/routes-and-hover.json)。

## 3. 修改文件与原因

| 文件 | 本次变化 |
| --- | --- |
| `src/components/Header.tsx` | 三个主栏目始终为 Link；点击立即导航并清理状态/计时器；精确鼠标 hover 独立预览；移动菜单文字 Link 与可见展开按钮分开；全局 Escape 仅在菜单打开时注册；焦点恢复保护；Tab 进入预览；保留路由变化卸载清理；增加实际已提交 pathname 的检查标记 |
| `src/components/HeaderBrand.module.css` | 只适配移动菜单内独立预览按钮宽度，不改顶部高度、颜色或桌面布局 |
| `src/i18n/dictionary.ts` | 补充“收起预览”英文；复用已有“展开预览”翻译 |
| `src/components/ui/animated-theme-toggler.tsx` | 新手势/原生导航/历史变化/卸载优先结束快照；目标主题只应用一次；取消/失败清 busy；过期 ready/finished 回调不影响新转换 |
| `src/components/ui/animated-theme-toggler.css` | 主题快照 pointer-events:none，保持圆形扩散和 400ms |
| `src/app/layout.tsx` | 将同一套既有 favicon 放进初始 head，避免流式/新标签页导航临时回退到根 favicon；Apple 图标保留，不新增素材 |
| `src/app/products/page.tsx` | 仅为原加载文案预留一屏高度并标记 aria-busy，减少加载占位替换时的 Footer 跳动；实际商品页面与 Flip 不变 |
| `tests/navigation-*.cjs`、`tests/navigation-firefox.webdriver.py` | 新增实际组合导航、身份与资源验收，复用已有浏览器与 Python 标准库 |
| `tests/button-effects.browser.cjs` | 更新主栏目从 button 到 Link 的测试选择器、手机独立展开入口，保留显式 Specular 范围验收 |
| README、NAVIGATION、FEATURES、DEVELOPMENT 与本报告 | 更新当前主链接职责、直接显示的语言/主题图标和验收结果 |

没有修改 ThemeProvider/LocaleProvider 的状态模型，没有重建主题系统；没有动 HeaderImageMenu、共享滑动高亮、CardHover、Lanyard、ScrollExpand、Layout Grid 的核心动画代码。Specular 调度器也未改，仍仅显式页面主操作挂载。

## 4. 日夜、语言与导航组合结果

Chromium 自动化覆盖用户清单 A–O：冷启动点击、未展开完点击、已开菜单点击、详情转方案、Ctrl/中键、新旧当前路由、菜单打开切主题、扩散中物理点击、切语言再筛选、快速来回切栏目、Grid 展开切主题/语言后点内容、商品快速筛选切主题后点图片、触屏一次点击、自然 Tab/Enter/Escape、前进/后退/刷新/新标签页。

- 主文字 Enter 保持原生链接；主链接聚焦可展开，Tab 进入面板真实链接/按钮，Escape 关闭并恢复焦点，恢复不重开。关闭中的面板立即 inert，关闭完成 hidden，不能再 Tab 进入。
- 桌面继续 120ms 打开、180ms 离开关闭、240ms 面板过渡与原 MenuToGrid；无主栏目下划线或箭头。移动菜单有明确可见的“展开预览/收起预览”，单点文字直接跳转。
- 日夜仅 light/dark，目标主题、html.dark、图标与 storage 一致。初始化不播放扩散。无 API、reduced-motion、startViewTransition 抛错、连续点与导航取消均检查，busy 可清理。新交互会提前结束装饰；不让路由等 400ms。
- 页面搜索输入、登录输入、Grid 稳定 ID、商品分类、购买套餐/数量/支付方式在主题/语言变化后保持。
- 独立开发 Mock 会话验证匿名 → 登录、用户 → account、管理员 → admin；购物车保留登录 returnTo 和原身份限制。三种身份的 session/cart/package/payment/quantity 保持。没有登录真实账号、发消息或创建订单；检查后恢复普通开发启动，不写 env 文件。见 [身份记录](navigation-interactions/auth.json)。
- 卡片实际测得内层 y=-4px、外层 y=0，保持 Flip 外层和 CSS hover 内层分离。导航、Chip、工具与小按钮没有 Specular 装饰/Canvas，页面主要操作保留。显式范围测试另行通过。

## 5. 阻塞点击与主题生命周期的处理

主栏目从 button 改为 Link 是职责修正；没有用更高 z-index、div onClick、额外 router.push、合成 click 或等待 timeline 来模拟跳转。Header 的 click 不 preventDefault，Next Link 自己的 SPA 处理保留。Escape 和键盘 Tab 的 preventDefault 仅用于对应键盘操作。

快照层保持 pointer-events:none；由于 root 捕获还会抑制原后代命中，在新的 pointerover/move/down 手势离开主题按钮时，先结束视觉快照，浏览器再对真实 DOM 进行原生命中。没有把 HTML 上丢失的点击转发成伪造链接。触屏扩散中立即点击菜单也只需一次。链接点击、popstate 和卸载同样结束转换，保留已选主题；applyTheme 一次性保护与转换归属检查避免旧 promise 清理新转换。

原 HeaderPanel 在关闭第一帧 inert/pointer-events:none；ImageMenu 和 Header 的旧 RAF、Flip、面板动画、打开/关闭 timer 在关闭/路由切换/卸载时清理。没有新增全屏遮罩或滚动锁。正常导航不恢复旧导航焦点；只有主动 Escape/关闭恢复焦点。

## 6. 动画、资源与性能实测

环境：Linux，本机 Chromium 153.0.8010.12、Firefox 158.0、geckodriver 0.37.1。Chromium 通过 Playwright，Firefox 通过标准 WebDriver。生产使用 `npm run build` 的静态 out 目录，只读本机预览，未部署。未新增框架或项目依赖。

实际点击到 URL 被观察到的自动化墙钟样本如下，包含驱动通信和浏览器工作，并非 FPS、网络 TTFB 或统一设备性能承诺：

| 生产操作 | 样本 |
| --- | --- |
| 商品中心（冷启动） | 63ms |
| 解决方案（展开期间） | 59ms |
| 商品中心（面板已开） | 53ms |
| 从商品详情点击解决方案 | 54ms |

源代码没有 500ms 人工导航延迟或 isAnimating 全局导航锁。开发模式包含首次编译成本，不以生产样本替代开发测试。完整原始数据见 [开发 Chromium](navigation-interactions/chromium-dev.json)、[生产 Chromium](navigation-interactions/chromium-production.json)。

生命周期采样：[原始资源记录](navigation-interactions/resources-before-catalog-height.json)。已明确排除 Playwright InjectedScript 自己的监听，统计 window/document/html 的非 once 监听；不是内存堆泄漏或所有定时器的完整 profiler。

- 商品页预热后 158 个全局监听（包括框架事件），10 次菜单开关后仍 158、RAF=0；路由往返后回到 158、RAF=0。Header 动画标记为 0。
- About 可见时因组件活动增加到 168，Lanyard/主题/语言切换后 DOM 身份保持。离屏 RAF=0，随后 400ms RAF tick 不增加；回商品页监听恢复基线。
- 首页拼贴节点和动画对象身份在主题/语言变化后保持，不重播整段入场。没有 WebGL context 警告堆积。
- 软件渲染器为 `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`。商品页菜单采样没有超过 50ms 的长任务；About 首次加载/软件绘制阶段有 36 个长任务，最大 979ms。这是本环境仍可观察到的 3D 开销，不能据此宣称全站无卡顿；未删掉吊牌效果或伪报硬件 GPU 表现。

该资源采样同时暴露修复前商品页首屏位移约 0.384：静态 Suspense 仅一行加载文字，Footer 先进入首屏再被完整网格推出。增加加载区预留高度后单独四视口采样：[加载布局复测](navigation-interactions/catalog-layout-after.json)。390px 没有记录偏移，768/1440/1920px 分别约 0.000046/0.000016/0.000009（主题图标挂载的小幅位置变化）。没有把含用户输入的语言/分类布局变化冒充生产 CLS 分数，也不声称所有条件下绝对零偏移。

## 7. 截图与视觉检查

人工读取了实际截图，核对主栏目无箭头/下划线、共享底板、语言图标、独立手机预览、卡片、主题和光效范围。没有在实体设备上手工操作或录制硬件帧率视频。

- [390px 英文夜间菜单](../images/navigation-interactions/390-en-dark.png)
- [768px 中文日间菜单](../images/navigation-interactions/768-zh-CN-light.png)
- [1440px 中文日间菜单](../images/navigation-interactions/1440-zh-CN-light.png)
- [1920px 英文夜间菜单](../images/navigation-interactions/1920-en-dark.png)
- [手机方案跳转后](../images/navigation-interactions/touch-solution.png)
- [Firefox 桌面](../images/navigation-interactions/firefox-1440-light.png)、[Firefox 窄窗口](../images/navigation-interactions/firefox-narrow-dark.png)
- [卡片浮起](../images/navigation-interactions/card-hover.png)、[About 吊牌](../images/navigation-interactions/about-lanyard.png)、[首页稳定拼贴](../images/navigation-interactions/collage-stable.png)

## 8. 自动化、手工与未执行范围

| 检查 | 实际结果 |
| --- | --- |
| Chromium 开发模式 | 21 组检查、21 次入口记录，错误/404/水合数组为空；另有 Ctrl/中键、触屏、自然键盘等断言 |
| Chromium 静态生产 | 同一套主流程通过；加载占位修正后额外四视口测量 |
| Firefox 开发/生产 | 所有主链接、查看全部、13 个图片、Ctrl/中键、键盘、主题与语言、历史与手机菜单功能通过；不宣称它执行了 Chromium 的每一项 Grid/性能 API 测试 |
| 视口 | Chromium 精确 390/768/1440/1920 × 1000 与 390×844 触屏模拟；Firefox 768/1440/1920 实际宽度，390 请求被无头窗口限制为 **500px**，截图与 JSON 记录实际宽度，没有声称 Firefox 测了 390 |
| Firefox 鼠标环境 | 无头默认 hover/fine 均 false；桌面测试 profile 显式设置 ui.primaryPointerCapabilities/ui.allPointerCapabilities=6，验证两项均 true。网站不为测试强开 hover |
| 资源/性能 | 原始 PerformanceObserver、RAF 和监听采样；Lanyard/ScrollExpand 离屏、路由清理和稳定身份断言通过 |
| 手工 | 实际截图视觉读取；未将自动化点击描述为实体设备手工测试 |
| 未执行 | Safari、macOS 原生 Cmd、实体手机、实体 GPU、真实认证/付款/邮件；Firefox 完整 console/Long Task 日志未采集，不宣称 Firefox 控制台零错误或全浏览器 FPS 通过 |

Firefox 原始功能记录：[开发](navigation-interactions/firefox-dev.json)、[生产](navigation-interactions/firefox-production.json)。无 View Transitions API 的直接切换与持久化另见 [fallback](navigation-interactions/theme-fallback.json)。旧导航脚本含 button-only 语义，未作为本次主链接通过的证据；当前脚本与环境说明见 DEVELOPMENT.md。

## 9. 工程检查与交付边界

- `npm run lint`：通过。
- 项目无独立 typecheck 脚本；执行已有 TypeScript 的 `npx tsc --noEmit`：通过。
- `npm run build`：通过，38 个静态页面，类型检查完成；静态生产页面也进行了实际浏览器交互检查。
- `git diff --check`：通过。
- 不提交、不推送；不新增页面、主题模式或动画库，不改变商品/套餐/付款/客服演示状态。主操作 Specular 改动和用户已有未提交内容保留。
- 普通开发服务恢复于 `http://localhost:3000/one-g/`，临时 Mock 标志已撤销。
