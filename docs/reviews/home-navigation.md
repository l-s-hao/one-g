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


## 2026-11-05：五区自然滚动首页（当前实现）

此节取代上文历史首页广告/拼贴及两组点击展开 Grid 的结构要求；历史验收记录保留，不代表当前首页仍挂载旧组件。Header、导航图片抽屉、About、商品中心及 Footer 不属于本次改版。

### 统一方向与阶段

先看清 RoboDock，再以分类和真实详情查找产品/方案，最后进入公司与咨询。参考 Apple 的单主角与文字媒体分离、FA 平台的分类直达、宇树的产品/应用路径；不是复制三个网站。实际读取 Apple、宇树、MISUMI、三菱可访问页面结构；KEYENCE 请求超时，未取得完整页面，不宣称视觉或动效复刻。不使用参考站素材或商业事实。

- A：`HomeLanding` 组合五区，`getHomeContent` 从统一商品/方案/导航数据取记录；类型、词典、相关 Node 与首轮生产构建通过。
- B：暖白/夜间及双语、390/768/1440/1920 自然响应式；产品按真实 16:9 素材完整展示，无大白框，无新增装饰动画。独立静态评审首轮 8/10；按建议移除上下色带与后半页重复分隔线。英文首屏仍沿用正式数据中的完整条件，未为减行删掉事实。
- C：全矩阵截图、原生视频播放、分类/产品/方案真实跳转、Header 与 About 冒烟、咨询安全返回、旧 hash 与键盘/触屏检查。真实结果与运行号见 `.oil-ui/home-rebuild-20261105/verification-summary.json`，失败原件不覆盖。

### 页面与真实入口

| 区域 | 内容与真实目标（逻辑路径；站点自动应用 `/one-g`） |
| --- | --- |
| 品牌与主图 | 一智通万机 / RoboDock，`/products/robotdock`、`/solutions`；概念、暂未开售和 AI 非实物说明保留 |
| 分类 | `shopLinks`：`/products?category=robot`、`arm`、`hand`、`vision`，全部 `/products` |
| 产品 | 同一 Product 集合的 `g1`、`arm-a1` → `/products/g1`、`/products/arm-a1`；只有两项有合适现有图，均渲染参考，型号/参数/交付待确认；不显示 Mock 价格/购买 |
| 方案 | SONIC Link → `/solutions/teleoperation`；观看演示 → `#home-demo`；搬运/巡检/智能任务 → `/solutions#handling`、`#inspection`、`#ai` |
| 公司与咨询 | `/about`；原 `SupportButton(entry=general)`，未登录经原安全 returnTo 返回首页上下文，真实认证未接，当前仅前端预览 |

### 素材与源码清理

- RoboDock：既有 `product.detail.imageNotes[0].webSrc`，`/one-g/products/robotdock/robotdock-concept.webp`，完整概念主图，优先加载。
- G1/Arm A1：统一商品 `images[0]` 的现有 `hero/one-g-service.png`、`hero/one-g-arm.png`（准确文件路径以数据为准），非确认实物/型号证明，不扩充展示项。
- SONIC Link：`solutionDemos` 的 `wholebody-balance`，复用既有本地视频与封面。一个原生 controls、preload none 播放器，无自动播放。受控场地研究性质以及非任意动作/通用稳定性/RoboDock 集成证明的限定在方案正文一次表达。AI-CDR 必需署名在本页唯一资料来源区；没有逐媒体注释。
- 首页不再 import `HomeCollageHero`、`HomePreviewProvider`、`HomeProductsPreview`、`HomeSolutionsPreview`，所以不会创建其图片克隆、拼贴动画、暂停状态、Observer 或旧 Grid 事件。共享旧实现和兼容导出保留；没有删除公共媒体或依赖。`LegacyOfferingHash` 继续保留 robotdock/sonic-link 和查询参数。

### 评审与边界

独立视觉评审和独立真实页面 UX 走查分别保存。UX 走查确认生产咨询止于未开放登录，RoboDock 的购买入口当前是套餐预览，均为原有业务边界；本轮不改认证、购买或客服业务，不新增公开电话/邮箱。未验证真实账号登录后预览、付款、真实服务；不把前端路径测试称为上线闭环。历史退出超时、首次输入丢失及 hydration 开放项维持原结论。
