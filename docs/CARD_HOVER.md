# 普通卡片统一悬停反馈

[README](../README.md) · [功能说明](FEATURES.md) · [架构](ARCHITECTURE.md) · [开发状态](PROJECT_STATUS.md)

## 实现与范围

共享样式：[card-hover.css](../src/components/card-hover.css)；稳定命中区域：[CardHover.tsx](../src/components/CardHover.tsx)。只通过 `data-card-hover-host` / `data-card-hover-surface` 显式接入，不模糊匹配所有矩形、article 或 rounded 类。

参数为 ONE-G 本次选择的 **上移 4px、200ms、cubic-bezier(0.22,1,0.36,1)**，并增加中性柔和阴影。这不是对参考 BentoGrid 原始整卡位移参数的声明；没有安装 BentoGrid、复制示例内容或引入新依赖。

| 现有页面/组件 | 接入对象 |
| --- | --- |
| 商品中心 / ProductCard | 外层保留商品 ID 与 Flip 身份，内层整卡表面移动；当前 9 张 |
| 首页 / 两组 LayoutGrid | 8 张未展开缩略卡；展开大面板和回位期间停用 |
| 方案中心 / SolutionExplorer | 4 张方案卡，图片、文字与操作整体移动 |
| RoboDock 详情 / ProductDetailContent | 特点与应用任务说明卡，当前 7 张 |
| SONIC Link 详情 | 现有内容说明卡，当前 10 张 |
| RoboDock 购买 / ProductPurchase | 4 张套餐卡和深度定制提示卡；加购仍禁用 |
| 深度定制 | 4 张范围说明卡和 4 张流程卡；流程保留 li 语义 |
| 管理员 Dashboard | 6 张卡片式模块入口，保留点击行为 |
| 购物车 | 实际商品/已有配置条目，保留数量与移除行为 |

About 正文与用户中心目前是分区/文字入口，没有对应普通说明或入口卡片；更多推荐只有“暂无”说明。因此未增加卡片。共享 ProductCard 的调用会自然使用相同规范，但不声称当前存在推荐商品卡。

Header 下拉面板容器（其中普通图片卡片除外）、登录整表单、客服弹窗/表单、Footer、普通按钮和输入框、首页滚动装饰拼贴、About ScrollExpand 品牌卡及 WebGL 吊牌、展开 Layout Grid 面板均保持原交互。

## 不改变布局与选中状态

原卡片的 padding、margin、尺寸、图片比例、圆角、边框、字体、链接、顺序与内容保留。移动由 CSS individual `translate` 完成，不使用 top、margin 或改变高度；稳定外层响应 hover，避免底边来回抖动。未新增 cursor:pointer、tabIndex、角色或高 z-index。

日间新增阴影为 `0 8px 20px rgba(23,25,29,.10), 0 2px 6px rgba(23,25,29,.06)`；夜间为 `0 10px 24px rgba(0,0,0,.42), 0 2px 6px rgba(0,0,0,.30)`。不改变主题配色、背景、照片或主题管理器。选中套餐原内阴影通过 `--card-rest-shadow` 与新增阴影叠加，移出后恢复。

现有图片容器继续保留 overflow:hidden 和圆角，卡片阴影在外部表面绘制；没有全局删除裁切。

## 动画职责分开

- **GSAP Flip**：测量/控制原商品外层；悬停只移动内层表面。已有 `data-filter-animating` 和 inert 标记即时停止新增位移，不修改 Flip 流程、不新增筛选定时器。
- **Motion Layout Grid**：原 slot 保留跨列身份；新独立表面包住整张 Motion 卡片，CSS 不操作 Motion 控制的 transform。展开前局部停用并即时复位，再测量共享布局起点；关闭/跨区域回位完成后解除，减少动画时直接解除。
- 不改变 layoutId、LayoutGroup、卡片 ID、展开正文、链接、关闭方式或语言更新机制。快速中断与组件卸载不会新增监听/动画实例；局部 DOM 标记随节点卸载销毁。

## 输入方式

只有 `(hover:hover) and (pointer:fine)` 启用悬停上浮。纯触屏不产生新增位移/阴影残留。`prefers-reduced-motion:reduce` 取消新增位移及过渡，可以即时显示轻微阴影。既有 focus-visible、禁用提示与访问控制保留；这不是生产认证或业务权限改造。

## 实际验证（2026-10-12）

- 修改前/后对比：7 类公开页面、1280px 桌面与390px手机，共14组卡片记录，宽高、padding、margin、圆角、边框、默认阴影一致。
- Chromium：上述7类公开页面的日间/夜间悬停与复位；稳定外层不移动，内层约-4px；指针停在底边500ms无反复抖动；套餐仍可选择并保留 inset；纯触屏点击及减少动画不抬升。
- GSAP：悬停时切换分类、连续快速切换、返回全部；动画期间新增位移停用，完成后无重叠、残余动画标记或永久偏移。
- Layout Grid：两组悬停、展开/关闭、回位恢复；既有1280×800与390×844回归检查包含响应式、共享布局中间帧、几何回位、键盘/焦点、全部链接、中英文、两区协调、减少动画和资源/水合错误检查。
- 额外检查：两组 Grid 直接交接、展开后立即 Escape 中断、减少动画偏好于挂载前启用时关闭，悬停停用标记均正常解除；Footer/Hero/About 没有新增普通卡片标记；Header 后续接入图片卡片的情况见下文。
- 隔离的临时源码副本开发预览：显式启用虚构 Mock，检查管理员6卡点击/回Dashboard、购物车条目悬停和数量修改；用户中心没有为本效果新增卡片。没有修改主仓库 Mock 开关或中断现有开发服务。
- lint、`npx tsc --noEmit`、build 通过；静态导出38页。没有新 npm 依赖、配置或主题修改。

回归脚本：[公开卡片检查](../tests/card-hover.browser.cjs)、[受保护卡片检查](../tests/card-hover-protected.browser.cjs)、[Grid 交接检查](../tests/card-hover-coordination.browser.cjs)，需外部 Playwright 工具和实际浏览器；后者须在显式 Mock 开发预览上运行，不能对生产静态站假装登录。

本次没有声称在真实触屏硬件或 Firefox 上验收；触屏检查使用 Chromium 的触屏上下文。未提交或推送。

导航图片卡片也已接入共享反馈：`HeaderImageMenu` 的真实 Link 是稳定宿主/Flip 节点，完整内层表面浮起；MenuToGrid 动画期间复用禁用标记，图片菜单、Header 分隔线与按钮本身不浮起。详见 [导航说明](NAVIGATION.md)。

## STEP 3：静态介绍卡片错开入场（2026-10-26）

`StaggerGroup.tsx` 仅显式接入 `ProductDetailContent` 的亮点、介绍与适用任务卡片，遥操作方案页的章节卡片，以及深度定制页的定制范围与实施流程。直接替换原 Grid 容器，保留 div/ol 语义和直属 CardHover 节点，不增加 Grid/Flex 包装层。此处外层 CardHover host 的 transform/opacity 负责一次入场，内层 surface 继续独立负责 hover translate；原 hover 参数、阴影和圆角不变。

复用项目已有的原生 Web Animations API 与 IntersectionObserver。内容默认可见，首次进入视口后才创建动画：350ms、opacity 0→1、translateY 8px→0、cubic-bezier(0.2,0,0.2,1)。同一可见批次相邻项延迟 100ms；每六项重开局部批次，最大延迟 500ms。手机长列表按各项首次进入视口分批，不跨页面或区块累计。

WeakSet 记录已播放节点，effect 不依赖主题、语言或普通重渲染。没有新增动态 key、业务状态机或轮询。动画只使用 backwards fill，结束后 cancel 回到原有可见样式；外部取消、初始化异常、Observer/WAAPI 不可用及禁用 JavaScript 均保持可见。focusin 或 pointerdown 立即取消当前卡片的入场；减少动态效果时直接显示，运行中启用 reduce 或页面隐藏会取消动画并断开 Observer。卸载清理 Observer、动画、焦点/指针/可见性和媒体查询监听，包含 React 开发严格模式的 setup/cleanup 周期。

有意排除：首页 Hero 标题及拼贴交接、两组 Motion Layout Grid、商品中心 GSAP Flip、导航 MenuToGrid 与面板、About ScrollExpand/Lanyard；解决方案筛选/展开、购买套餐、购物车、表单、校验、倒计时、金额、订单/支付状态均不接入。

回归入口：`tests/stagger-entrance.browser.cjs` 与 `tests/stagger-protected.browser.cjs`。沿用外部 `ONE_G_PLAYWRIGHT` / `ONE_G_BROWSER` / `ONE_G_TEST_URL`，不新增依赖。入场脚本默认把截图和测量结果保存到 `/tmp/one-g-stagger`；覆盖桌面/手机、中英文、日夜主题、首次进入/滚回、语言主题更新、中途焦点和站内操作、减少动态效果、初始化异常/取消、无 JS、快速导航和本轮 Observer 清理。保护区脚本按当前 DOM 检查 Layout Grid、Flip、导航和 About，避免旧脚本对历史结构的假设。

本轮实测结果：入场脚本 3 个实际页面 × 桌面/手机 × 中英文 × 日间/夜间共 24 组通过，并通过 7 种减少动态/异常/取消/隐藏降级、无 JS、中途焦点和点击、三次快速站内跳转与新增 Observer 清理检查。保护区脚本通过两组 Layout Grid 的展开/关闭/中断、桌面与触屏 Flip、桌面 MenuToGrid 与面板分类/关闭、手机导航，以及 About ScrollExpand 的滚动响应和 Lanyard 挂载/拖动冒烟检查。原有已跟踪 diff 与本轮开始时的快照逐字节一致。

`tsc --noEmit`、`npm run build`、本轮源码与两个新脚本的 ESLint、`git diff --check` 通过。全仓库 `npm run lint` 仍因既有 `docs/reviews/font-audit/home-stable.cjs` 的三处 `no-require-imports` 未通过。试跑的旧 `product-filter-flip.browser.cjs` 在第 117 行把内部 `.product-card` 当成带筛选标记的外层而失败；旧 `card-hover-coordination.browser.cjs` 在 About 页面把当前导航里的卡片也计入全局“应为零”断言而失败。旧脚本未修改；使用本轮保护区脚本的当前结构断言补测并通过，不能把这两份旧脚本记录为全绿。

## STEP 5：普通展示卡片的多层阴影（2026-10-26）

先在隔离浏览器试做日夜商品/方案卡片并核对尺寸，再通过 `data-card-depth` 显式接入 ProductCard 与 SolutionExplorer 的普通展示表面。`colors.css` 沿用原主题变量组织，新增默认 `--card-shadow`：日间 `0 1px 2px rgb(23 25 29/.05), 0 4px 12px rgb(23 25 29/.04)`；夜间 `0 1px 3px rgb(0 0 0/.24), 0 6px 18px rgb(0 0 0/.18)`。悬停复用原有日夜 `--card-hover-shadow`，不再叠加默认阴影，保持两层、单次上浮 4px 和原有 200ms 过渡。其余功能卡片仍按原规则组合 `--card-rest-shadow`，尤其套餐选中的 inset 不被覆盖。

日间仅把这两类装饰边框变透明，保留真实 1px 占位；夜间保留原 border 色 28% 的克制细边，并沿用现有 `--surface` 与页面底色形成层次。默认阴影与表面色只作用于显式标记，未修改全站背景、文字或品牌色。介绍页的章节分隔线仍保留；输入、套餐选择、警告/错误、focus-visible、反色按钮边框均不接入此变体。

Header、导航分隔线、Footer、登录/注册边界、客服表单、按钮、About 吊牌与现有弹窗阴影均未重设计，不新增浮层变量或另一套 Provider。图片独立裁切层、圆角、padding、网格与 gap 保留；没有全局删除 overflow。`forced-colors:active` 下，显式展示卡片改用系统 CanvasText 边框、关闭阴影，保留系统强制配色与原 outline，不设置全局 forced-color-adjust:none。

before/titles/after 同视口截图与几何数据位于 `/tmp/one-g-detail`，其中 titles 是 STEP 5 的直接修改前状态。最终 144 组合与 titles 对比，卡片/图片尺寸、border 占位、padding、radius、文字规格均未变化。`tests/depth-accessibility.browser.cjs` 另检查桌面/手机、中英文、日夜的 hover 层数、键盘焦点、套餐选中 inset、注册错误边界和系统强制颜色。缩放用与浏览器缩放相同的 CSS 视口及 DPR 组合模拟 125%/150%，不冒充原生快捷键测试；以实际文字边界是否超出视口判断可见性，保留原有英文词边界。

最终回归：数字 8 组（64 个真实倒计时样本，含 59→58、10→9、数量 9→10 与金额跨位数）通过；入场 24 页面组合与降级/清理通过；按当前 DOM 的 Flip、两组 Layout Grid、MenuToGrid/面板、手机导航和 About 检查通过。所有圆角值、裁切层与卡片尺寸均由 before/titles/after 实测保持。默认/hover 两层、单次 4px 上浮、8 组功能状态/焦点及日夜 forced-colors 均通过。四宽度 × 125%/150% × 中英文，共 16 个等效缩放组合（每组 5 个页面）和首页原中英文逐行揭示通过。缩放检查以实际文字 Range 是否超出视口为准；原有极窄视口长词在容器留白内多出约 2px 时仍完整可见，不为此拆词、缩字或改变宽度。

`npm run build`、`tsc --noEmit`、本轮源码与新脚本 ESLint、`git diff --check` 通过。全仓库 lint 仍只有之前的 `docs/reviews/font-audit/home-stable.cjs` 三处 `no-require-imports` 错误。开发服务并行/HMR 下曾出现初始化及测量时序错误；稳定服务、等待字体/客户端初始化后，使用不改变断言的临时副本完成数字和入场回归，前三步脚本本身未被覆盖。

同视口截图（STEP 5 的“前”取已完成标题平衡的 titles 阶段）：

| 场景 | 修改前 | 修改后 |
| --- | --- | --- |
| 390px 英文日间标题 | [前](reviews/interface-details/title-solutions-before-390-en-light.png) | [后](reviews/interface-details/title-solutions-after-390-en-light.png) |
| 1440px 中文日间商品卡片 | [前](reviews/interface-details/shadow-products-before-1440-zh-light.png) | [后](reviews/interface-details/shadow-products-after-1440-zh-light.png) |
| 1440px 中文夜间方案卡片 | [前](reviews/interface-details/shadow-solutions-before-1440-zh-dark.png) | [后](reviews/interface-details/shadow-solutions-after-1440-zh-dark.png) |
| 390px 英文夜间商品卡片 | [前](reviews/interface-details/shadow-products-before-390-en-dark.png) | [后](reviews/interface-details/shadow-products-after-390-en-dark.png) |

全部几何基线仍位于 `/tmp/one-g-detail`；摘要见 [summary.json](reviews/interface-details/summary.json)。测试不会发送真实验证码、创建真实订单或上传内容；客服和数量回归只临时启用项目已有本地演示，完成后恢复默认开发配置。未提交或推送，未继续扩展页面设计。
