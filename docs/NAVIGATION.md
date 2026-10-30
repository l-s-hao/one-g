# 图片导航

共享 Header 的 Logo 与语言/主题状态保持不变。商品中心、解决方案与了解公司均为真实 Next.js Link，点击直接进入对应总页；桌面悬停独立展开图片预览；业务栏目不再显示下划线或箭头，共享背景滑块继续负责悬停、焦点和路由反馈。图片菜单替换原文字目录，没有新增一级栏目。

## 2026-10-30：当前路由胶囊高亮

- 沿用一个共享背景滑块，圆角9999px；桌面高42px、左右留白16px，1024～1199px高40px、左右留白10px。背景绝对定位，不改变原链接、导航高度或布局；1023px及以下保持原移动导航。
- 颜色沿用主题accent与surface混合，日间强调色18%、夜间28%，选中文字使用主题text。位置与宽度350ms自然缓动，减少动态效果时直接切换。
- 实际选中仍由去除basePath后的pathname决定：精确匹配栏目路径或以“栏目路径/”开头。首页不选中，hover临时预览，移出导航文字区域恢复真实路由。
- 保留现有路由重挂载生命周期；Document级WeakMap只暂存上一帧几何，令同一个滑块实现跨路由移动，不缓存路由选中状态。没有新增Motion组件、计时器或RAF。
- 截图、运行检查与限制见 [胶囊高亮验收](reviews/nav-pill/verification.md)。

## 2026-10-30：全宽表面与透明效果降级（当前）

- 复用现有 Resizable Navbar 组合入口；外层和顶部行均 `width:100%; max-width:none`，取消胶囊外框。当前桌面高度76px，1024～1199px为72px，1023px及以下56px，另加顶部安全区域；共用高度变量同步正文占位和锚点。
- 内部尺寸同步放大：≥1200px横版Logo约119×32px，主文字15px/400、栏目间距36px，SVG图标20px、工具点击区44×44px、间距8px。1024～1199px采用30px高Logo、14px文字、24px栏目间距及42×44px工具区，避免窄桌面挤压。768～1023px保留移动导航，横版Logo高30px、工具间距4px。手机保留28px圆标、18px原SVG工具图标、20px语言图标和44px点击区；原移动栏目状态不变。尺寸调整见 [验收记录](reviews/navbar-scale/verification.md)。
- 桌面左右内边距24～56px，手机16px，均取与安全区域的较大值。三段布局与移动菜单状态不变；图片抽屉仍保留自己的原有内容宽度。
- 背景独立放在根的无指针伪元素，沿用主题 `--primary-rgb`：正常透明度0.90，滚动超过100px为0.96，220ms背景/阴影过渡。12px模糊保持恒定，根元素不设置整体透明度，不改变高度或transform。
- `navbar-surface.ts` 检查 CSS支持、减少透明/动画偏好、省流量及可选资源提示。不支持、减少透明/动画、省流量时使用主题纯色；内存≤2GB且线程≤2才按保守启发式降级，单独少线程或缺失提示不降级。这些提示不是实测性能结论。SSR/初始水合/无JS为纯色，偏好和连接监听随卸载清理；无逐帧检测。
- 保留原z-index 50及原生dialog顶层。模糊仅作用于背景伪元素，未给抽屉/弹窗祖先添加filter。Header、图片抽屉、共享高亮、Provider、数据和URL源码均保持本轮开始时状态。
- 当前验证与已知限制见 [全宽验收](reviews/resizable-navbar/full-width/verification.md)。下节为上一轮实现记录，其44/48px尺寸与表面过渡已被本节替代。

## 2026-10-30：Resizable Navbar 顶部适配

- 实际读取 [Aceternity 官方源码](https://ui.aceternity.com/registry/resizable-navbar.json)，本机原无该组件。新增 `ui/resizable-navbar.tsx`，使用 Navbar、NavBody、NavItems、NavbarLogo、MobileNavToggle 五个组合入口，继续传递现有原生 props/ref 与 LocalizedLink，不复制示例内容、第二套高亮或 MobileNavMenu。
- 顶部固定，等高占位维持正文起点：桌面44px、平板/手机48px，仍用原高度变量；桌面三列左右平衡、中间主导航居中，移动端复用同一组 Logo/工具，不挂两套语言和主题按钮。
- 以100px滚动位置切换表面状态；240ms只过渡伪元素的背景、边缘、圆角、阴影与模糊。容器不做宽度/位移/缩放动画，Logo与工具坐标稳定。减少动画直接切换。被动scroll订阅随Navbar卸载移除，没有新Provider、RAF、滚动锁或全屏遮罩。
- 顶部和抽屉分层：透明根不截获空白区域指针，顶部行与现有panel接收事件，背景伪元素不接收指针。共享滑动高亮、HeaderPanel的240ms过渡、MenuToGrid的Flip/清理代码保持不变。
- 抽屉只改按钮外观：查看全部为主要反色入口、分类为次级/选中反馈、关闭为紧凑图标、移动预览按钮为次级；图片卡片仍是完整单个Link，只给原文字区域加反色表面，不嵌套按钮、不改变图片或卡片几何。按下只用内阴影，无位移、Canvas或追光。
- 方案抽屉原本没有分类按钮，本次不凭空增加。商品与方案来源/ID/路由不变，RoboDock仍是商品，SONIC Link仍是方案。
- 出处、前后几何、12组合截图、真实鼠标和触屏记录见 [本轮验收](reviews/resizable-navbar/verification.md)。历史报告只代表其各自检查时点，不覆盖本轮结果。

## 主文字、预览与键盘

### Header Logo：原始路径描边（2026-10-30）

Header中的两处静态品牌图合并为HeaderLogo，静态层仍使用原BrandLogo及正式SVG蒙版；桌面横版、手机圆标继续保持原尺寸。动画路径逐字复制自 `public/brand/one-g-horizontal.svg` 与 `one-g-symbol.svg`，未改原始资产；路径一致性测试防止副本漂移。

外轮廓0～500ms；内部G主曲线500～950ms，连接580～930ms、收尾细节660～1010ms（原路径命令边界拆分，错开80ms）。完整线条保留至1160ms后原填充80ms接替；ONE-G在1240～1540ms、万机智能在1400～1700ms淡入，总计1700ms。当前Document内只自动介绍一次，沿用HeaderNavigation的路由重挂载，不改变导航生命周期；刷新或新文档可重播。精确鼠标hover或Tab聚焦可重播，首播进行中不叠加，移出/失焦/点击/文档隐藏/减少动画时恢复静态。触屏不触发hover。

动画层无指针、无独立可访问名称；首页链接保留唯一可访问名称。结束移除SVG层并清理1900ms失效保护计时器，无RAF或循环。减少动画及无JS直接显示原静态图。永久交互与偏好监听在组件卸载时移除。机械展开的独立原型已删除，没有安装或调用Hairline来改造正式Logo。

原始首轮记录见 [Logo验收](reviews/header-logo/verification.md)；当前完整G线条与文字顺序见 [完整描边验收](reviews/logo-complete/verification.md)。

- Logo → `/`，商品中心 → `/products`，解决方案 → `/solutions`，了解公司 → `/about`。调用处保留无 basePath 的项目路由，由 Next.js 生成 `/one-g/` 与 trailingSlash，支持 Enter、Ctrl/Cmd 与中键。
- 桌面精确鼠标保持 120ms 悬停打开、180ms 离开关闭；主链接 click 只附带清理菜单状态和计时器，不 preventDefault、不另调 router.push、不等待动画。点击当前栏目也会关闭菜单。
- 键盘聚焦商品/方案主链接可展开预览；Tab 进入预览内部，Enter 仍是原生跳转。Escape 从 Header 外焦点也能关闭鼠标打开的菜单；恢复焦点有抑制标记，避免立即重新打开。关闭面板保持 hidden/inert/aria-hidden。
- 手机菜单内部，栏目文字是直接跳转的 Link，旁边独立的可见“展开预览/收起预览”按钮负责图片区域。桌面没有新增箭头或按钮。
- 语言与日夜图标直接显示在工具栏，未藏回更多菜单。导航、小按钮与筛选没有 Specular 装饰或绘制资源。
- 主题圆形扩散继续为 400ms；View Transition 快照不接收指针，捕获阶段会在新的指针手势、导航、历史变化或卸载时先结束装饰，保留已经选择的目标主题，随后由浏览器原生处理真实链接。没有转发合成点击。

本次根因、入口表、组合操作、资源采样与截图见 [导航专项检查结果](reviews/NAVIGATION_INTERACTION_AUDIT.md)。

## 数据与真实入口

`HeaderImageMenu.tsx` 从 `getCatalogProducts()`（去重、过滤草稿、保持排序）及 `solutions` 派生导航项，没有复制商品数据库。链接沿用项目的 LocalizedLink，部署时包含 basePath 和静态尾斜杠。

| 入口 | 目标路由 | 图片或说明 |
| --- | --- | --- |
| RoboDock | `/products/robotdock` | `/one-g/products/robotdock/robotdock-concept.png`，AI 概念图、非实物；尚未开放销售 |
| ONE-G G1 | `/products/g1` | `/one-g/hero/one-g-service.png`，现有渲染图、正式产品图待确认 |
| ONE-G G1 Pro | `/products/g1-pro` | 图片待补 |
| ONE-G Arm A1 | `/products/arm-a1` | `/one-g/hero/one-g-arm.png`，现有渲染图、型号待确认 |
| ONE-G Arm A2 | `/products/arm-a2` | 图片待补 |
| ONE-G Hand D1 | `/products/hand-d1` | 图片待补 |
| ONE-G Vision V1 | `/products/vision-v1` | 图片待补 |
| ONE-G RGB-D | `/products/rgbd` | 图片待补 |
| ONE-G LiDAR Kit | `/products/lidar-kit` | 图片待补 |
| 搬运 | `/solutions#handling` | `/one-g/products/sonic-link/demo-grasp.jpg`，已有遥操作演示 |
| 巡检 | `/solutions#inspection` | `/one-g/products/robotdock/robotdock-concept.png`，方案数据已有概念素材，不代表巡检部署实拍 |
| 遥操作 · SONIC Link | `/solutions/teleoperation` | `/one-g/products/sonic-link/demo-motion.jpg` |
| 智能任务 | `/solutions#ai` | `/one-g/products/robotdock/installation-sketch.png`，安装参考草图 |

查看全部商品进入 `/products`，查看全部方案进入 `/solutions`。无独立详情的方案复用 SolutionExplorer 的 hash 定位与自动展开机制。SONIC Link 不在商品菜单。6 个缺图商品继续保留真实文字与链接；本地现有硬件图片缺乏这些型号的确定匹配证据，没有迁入新素材或修改媒体数据。

## 布局过渡与清理

- 新组件：`src/components/HeaderImageMenu.tsx` 和局部 CSS Module。
- 复用已安装 GSAP 3.15.0 / Flip，未安装 Parcel、imagesloaded 或新动画依赖。
- 初始菜单关闭、缩略图布局确定。打开后在 requestAnimationFrame 中等待父 HeaderPanel 的 layout effect 使局部节点可测量，再读取 `Flip.getState`。
- React 提交同一组稳定链接的目标网格，layout effect 执行 `Flip.from`。无 prepend、克隆或全局选择器；每个真实入口只有一个可聚焦节点。
- 桌面 4 列，布局过渡 0.5 秒、`power4.inOut`，交错总延迟最多 0.15 秒；手机 2 列、0.4 秒。名称局部淡入 0.2 秒。窄于 340px 使用单列。
- 面板标题、查看全部和关闭位于内部滚动网格之外。页面不锁滚动，面板不推动正文。
- Header 保留 120ms 打开、180ms 离开关闭及 240ms 面板过渡；关闭中的父面板立即 inert。图片菜单不新建计时器，快速切换、关闭和卸载会清理 Flip、RAF 与监听。
- 图片卡片外层 Link 负责 Flip 和稳定鼠标命中，完整内层表面复用 `card-hover.css`，上浮 4px、200ms；动画期间复用 `data-card-hover-disabled` 即时复位，完成后恢复。不新增悬停计时器。全站其它卡片反馈不变。
- 减少动画时直接展示最终网格，不执行 Flip。图片加载失败保留名称、链接与图片待补提示，图片盒比例固定。

## 参考与许可证

仅借鉴 [Codrops MenuToGrid](https://github.com/codrops/MenuToGrid) 的缩略图到目标网格关系和 `Flip.getState` / `Flip.from` 顺序；没有复制其全屏布局、字体、演示图片、随机入场或滚动锁定。参考为 MIT，授权文本如下：

```
MIT License

Copyright (c) 2009 - 2021 [Codrops](https://tympanus.net/codrops)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

## 本次验证

Chromium 153 检查通过：全部 13 个入口及菜单资源 HTTP 200、直接商品导航和方案 hash 展开、真实 Flip 中间帧、快速切换、Escape/关闭焦点恢复、中英文、日夜、减少动画、390px 手机及模拟触屏滚动到最后商品。开发站完整刷新无新增水合错误。lint、TypeScript 无输出类型检查通过；Next.js 构建曾遇到临时 `--showConfig` 解析错误，独立重跑后成功导出 38 个页面。未进行真实手机硬件或 Firefox 验证。

## 商品菜单分类

分类行仅提供全部、机器人、机械臂、灵巧手、视觉系统；映射来自 `getCategories()`，结果按商品真实 `category` 从同一公开集合派生。初始全部，按钮使用 aria-pressed 和填充背景。分类仅更新当前菜单组件状态，不写 URL、商品中心状态或搜索。切换时结束已有 Flip 后提交结果，不重播缩略图入场，也不新增动画库；零结果保留简洁空提示。RoboDock 现有分类为 robot，全部和机器人中均保留。手机分类行局部横向滚动。

Header 中原 hover/当前页文字下划线已移除，菜单链接与分类文字均不使用底线；结构分隔线、卡片边界与 focus-visible 保留。网格保留原列数、卡片宽高，精确指针设备通过等量内边距与负边距预留局部阴影空间。触屏不抬升，减少动画时只保留即时阴影。

本次增量 Chromium 检查通过：菜单分类数量为机器人 3、机械臂 2、灵巧手 1、视觉系统 3，全部 9；筛选 URL 不变、面板高度适应结果，商品和方案完整表面上浮 4px、底边无抖动、日夜阴影、键盘焦点、减少动画 0px、模拟触屏筛选与直接跳转、刷新无新增水合错误。

## 顶部工具入口

工具区依次为语言图标、日夜切换、搜索、用户、购物车。手机沿用账户在移动菜单中的入口，顶部语言和日夜直接可用，末尾保留移动导航按钮。“更多”原来只有语言和外观，现已删除触发按钮、面板及专属样式，移动设置中的重复控件也已移除。

语言图标来自用户本机 `/home/lsh/图片/语言切换.svg`，原样复制到 `public/icons/language-switch.svg`，沿用 BrandLogo 的 SVG mask 和 `/one-g/` 静态部署路径，以 currentColor 适配日夜。Header 使用 LanguageSwitch 的 iconOnly 模式；管理页原有文字模式保持不变。点击调用既有 setLocale，提示表达目标语言。主题组件仅调整挂载位置，保留初始化、400ms 按钮圆心扩散、减少动画、回退及原有存储机制。

本次工具区验证：lint、`npx tsc --noEmit`、build 均通过，静态导出 38 页。Chromium 桌面 1440px、手机 390px 的中英文及日夜组合布局检查通过，320px 无横向溢出；语言和主题刷新持久化、400ms 圆形扩散的按钮中心坐标、搜索聚焦、图片菜单、账户与购物车原有目标、移动菜单无重复控件、减少动态与不支持 View Transitions 的直接切换均通过。完整刷新未捕获浏览器错误或 hydration mismatch；手机为浏览器模拟，未使用真实硬件。
