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
