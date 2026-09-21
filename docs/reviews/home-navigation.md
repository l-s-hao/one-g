# ONE-G 首页与共享导航改版验收

仓库：`l-s-hao/one-g`（`/home/lsh/ONE`）。只修改主仓库，未访问或修改两个只读参考仓库，未接数据库，未提交或推送。

执行前记录：`/tmp/one-g-before-navigation.patch`。已有首页删除 Video Hero 的改动完整保留；本轮未恢复任何废弃首屏或特效。

参考：[Apple 中国大陆首页](https://www.apple.com.cn/)，仅参考产品名称、定位、操作和大图的信息层级。未复制其品牌、图片、文字、字体、代码或业务分类。本轮对话未附截图原图，Footer 按用户明确给出的五列文字要求实现。

## 实现与文件

| 文件 | 改动 |
| --- | --- |
| `src/components/Header.tsx` | 保留四个一级 Link；独立展开按钮；120ms 悬停展开、180ms 离开关闭（键盘焦点在导航内时保持可操作）；搜索、分类、显示辅助互斥；Escape 恢复焦点；当前页面标记；移动端分组菜单与断点清理 |
| `src/components/HeaderBrand.module.css` | 64px 桌面、56px 手机 Header；1024px 以下移动导航；完整宽度绝对定位面板；主题变量和实色背景回退 |
| `src/data/site-navigation.ts` | 一级导航及产品、商品分类、方案链接，复用现有产品/方案路由与锚点 |
| `src/components/Footer.tsx` | 共享目录 Footer、真实产品面包屑、受保护账户/购物车链接、现有显示辅助 selector、未确认联系方式 |
| `src/components/Footer.module.css` | 桌面五列、中等宽度三列、手机单组折叠；轻分隔、13–14px 链接 |
| `src/data/footer-navigation.ts` | 桌面与手机共用五组 Footer 数据 |
| `src/components/SolutionExplorer.tsx` | 初次到达、同页链接和 hash 历史变化时展开真实方案卡片并定位；保留原折叠卡片结构 |
| `src/app/page.tsx` | 保留两个产品介绍的全部原有数据和边界说明；改用首页专用样式；移除独立 HomeFooter，统一由 SiteShell 渲染共享 Footer |
| `src/app/HomePage.module.css` | 首页阅读宽度、产品介绍图文排版、轻边框、响应式间距；不影响配置页样式 |
| `src/components/ProductAdvertisement.tsx` | 居中名称、原定位、两个 CTA、大图及产品状态；两张 Slide、原图/数据/链接/控件保持 |
| `src/components/ProductAdvertisement.module.css` | 48–64px 桌面标题、28–34px 手机标题；原色 contain 图片；紧凑纵向手机排版 |
| `src/app/globals.css` | 仅添加 Header/Footer 共用目录宽度/边距变量，并清理无引用的旧 `.home-footer` 样式 |
| `src/components/HomeFooter.tsx` | 确认无引用后删除，避免维护两套 Footer |
| `tests/home-navigation.browser.cjs` | 新增可复跑浏览器验收脚本；测试依赖安装于临时工具目录，未修改项目依赖 |

`HomeVideoHero.tsx` 和 `HomeVideoHero.module.css` 的删除属于本轮开始前已有改动。Auth、Cart guard、ThemeProvider、产品数据、套餐数据、metadata、Next.js 配置、GitHub Pages 配置和 package.json 均未修改。

首页顺序：Header → RobotDock / SONIC Link 两张广告 → RobotDock 介绍 → SONIC Link 介绍 → 共享 Footer。未在首页加入套餐列表。轮播没有自动播放，因此无需新增暂停状态；原左右箭头、01/02、键盘箭头、拖动和 Swipe 保留。隐藏 Slide 使用 inert，后续图保留 lazy 加载。

## Header 分组

| 主栏目 | 二级内容 |
| --- | --- |
| 配置 | 产品了解：RobotDock、SONIC Link；标准套餐：RobotDock 套餐、SONIC Link 系统组合；进一步沟通：深度定制 |
| 解决方案 | 搬运、巡检、遥操作、智能任务 |
| 商品中心 | 全部商品、机器人、机械臂、灵巧手、视觉系统 |
| 了解公司 | 直接进入 `/about`，无空面板 |

搜索使用现有产品和栏目数据，结果为真实链接。用户按钮继续使用现有登录/用户/管理员路径。移动菜单采用普通可滚动下拉，不使用模态遮罩或全页滚动锁定。

## Footer 链接映射

下表为传给 Next Link 的逻辑路径；`/one-g` 由现有 basePath 统一处理。

| 分组 | 文案 → 目标 |
| --- | --- |
| 产品与配置 | RobotDock → `/#robotdock`；SONIC Link → `/#sonic-link`；标准配置套餐 → `/configure` |
| 商品选购 | 全部商品 → `/products`；机器人 → `/products?category=robot`；机械臂 → `/products?category=arm`；灵巧手 → `/products?category=hand`；视觉系统 → `/products?category=vision` |
| 解决方案 | 搬运 → `/solutions#handling`；巡检 → `/solutions#inspection`；遥操作 → `/solutions#teleoperation`；智能任务 → `/solutions#ai`；深度定制 → `/deep-customization` |
| 账户与服务 | 用户中心 → `/account`；购物车 → `/cart`（均复用原认证跳转）；客服咨询 → 当前页面 `#one-g-contact`；显示辅助 → 展开现有 AccessibilityThemeSelector，共用 ThemeProvider |
| 关于 ONE-G | 了解公司 → `/about`；联系 ONE-G → 当前页面 `#one-g-contact` |

商品分类参数机制原本已存在，本次直接复用。Footer 不含配件、我的配置、管理员功能或虚构政策页。联系内容读取 `site-contact`；现有电话和邮箱均标注“未确认”，仅显示文字，不生成假 tel/mailto 链接。

## 验收结果

- `npm run lint`：PASS，0 errors；保留 1 条既有 `ScrollExpand.tsx:244` 的 `<img>` 警告。
- package.json 无 typecheck 脚本；实际运行 `npx tsc --noEmit`：PASS。生产构建的 TypeScript 阶段也通过。
- `npm run build`：PASS，32 个页面静态导出成功。
- 开发模式和本地静态导出预览均执行浏览器验收：PASS。
- 375、390、768、1024、1440、1920px：首页、配置、解决方案、商品中心、了解公司、深度定制均可匿名浏览且无横向溢出。
- 六种宽度验证导航断点、Logo 比例、首页紧接 Header、标题字号；手机 Footer 单组折叠。
- 三个模式通过真实 ThemeProvider 存储规则验证；六种宽度无溢出；Header、Footer 链接、主要 CTA 的文字对比度均 ≥ 4.5:1。
- 桌面悬停移入面板、键盘展开、Tab/Shift+Tab、Escape 焦点恢复、搜索过滤和面板互斥通过。
- Carousel 仅两张，左右、分页、键盘、真实鼠标拖动、真实 CDP 触摸滑动通过；隐藏链接无法聚焦；reduced-motion 下关闭过渡。
- Footer 所有链接目标 HTTP 200；四种商品分类正确选中；四个方案锚点展开；产品介绍锚点及真实产品名称面包屑通过。
- 未登录账户/购物车跳转带正确 returnTo；登录后的账户/购物车可进入；管理员登录规则独立；无新增 pending cart action。
- 无浏览器 pageerror/console error、hydration error、module not found 或首页视频请求。

浏览器测试使用本地 Chromium。测试脚本可通过 `NODE_PATH` 提供 `playwright-core`，通过 `ONE_G_BROWSER` 指定 Chromium 路径，通过 `ONE_G_TEST_URL` 指定带 `/one-g` 的预览 URL。`ONE_G_ARTIFACTS` 可更改截图目录。

## 截图与机器验收记录

截图是静态导出版本，位于当前工作机的 `/tmp/one-g-navigation-review`，未向仓库加入生成图片。

- [375px](/tmp/one-g-navigation-review/home-375.png) / [390px](/tmp/one-g-navigation-review/home-390.png) / [768px](/tmp/one-g-navigation-review/home-768.png)
- [1024px](/tmp/one-g-navigation-review/home-1024.png) / [1440px](/tmp/one-g-navigation-review/home-1440.png) / [1920px](/tmp/one-g-navigation-review/home-1920.png)
- [夜间](/tmp/one-g-navigation-review/home-night.png) / [色觉友好](/tmp/one-g-navigation-review/home-color-vision-safe.png)
- [桌面下拉](/tmp/one-g-navigation-review/header-panel.png) / [五列 Footer](/tmp/one-g-navigation-review/desktop-footer.png)
- [手机菜单](/tmp/one-g-navigation-review/mobile-menu.png) / [手机 Footer](/tmp/one-g-navigation-review/mobile-footer.png) / [手机 SONIC Link 广告](/tmp/one-g-navigation-review/mobile-sonic.png)
- [机器验收记录](/tmp/one-g-navigation-review/results.json)

## 未完成项与范围限制

本次功能范围已完成。真实联系方式仍需项目方确认；本次按要求明确保留“未确认”提示。未收到所述 Apple Footer 截图原图，因此不能核对该截图的细节；五列结构按文字规范完成。没有发布、提交或推送。
