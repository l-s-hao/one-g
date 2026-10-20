# 图片导航

共享 Header 高度、Logo 与语言/主题状态保持不变。商品中心、解决方案与了解公司均为真实 Next.js Link，点击直接进入对应总页；桌面悬停独立展开图片预览；业务栏目不再显示下划线或箭头，共享背景滑块继续负责悬停、焦点和路由反馈。图片菜单替换原文字目录，没有新增一级栏目。

## 主文字、预览与键盘

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
