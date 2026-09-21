# ONE-G 产品介绍、规格与首页自动轮播验收

仅修改 `/home/lsh/ONE`（`l-s-hao/one-g`）。本轮起点 diff 保存于 `/tmp/one-g-before-product-pages.patch`；保留之前未提交的 Header/Footer 改版。未修改两个参考仓库、数据库、普通商品数据、产品销售状态、Auth/Cart guard 或静态部署配置，未提交或推送。

参考：[Apple 产品页](https://www.apple.com.cn/iphone-18-pro/)。仅参考产品信息层级与局部导航形式；素材、文案、主题、字体和实现均沿用 ONE-G。浮条尺寸来自本次 ONE-G 实施要求，不作为 Apple 官方参数。

## 最终路由

现有两条产品详情路由已有正式介绍正文，因此按“优先复用”要求保留，不另外建立 `/robotdock` 或 `/sonic-link` 重复正文。

| 产品 | 介绍 | 技术规格 | 购买方案 |
| --- | --- | --- | --- |
| RobotDock | `/products/robotdock/` | `/products/robotdock/specs/` | `/configure/#robotdock` |
| SONIC Link | `/products/sonic-link/` | `/products/sonic-link/specs/` | `/configure/#sonic-link` |

浏览器路径使用现有 `/one-g` basePath。例如本机介绍页为 `http://localhost:3000/one-g/products/robotdock/`。业务链接通过 Next Link/Router 生成，不手工重复拼接 basePath。新增两个规格页由 `generateStaticParams` 输出，四个路径均已验证静态文件存在及直接刷新成功。

原 `/products/robotdock/`、`/products/sonic-link/` 保持原 URL，无需跳转或重复页面。旧首页 `/#robotdock`、`/#sonic-link` 由 `LegacyOfferingHash` 使用 `router.replace` 转入对应介绍页，并保留 query；监听 hash/history 变化并在离开首页时清理。

## 首页与内容迁移

首页现在只有共享 Header、原有两张产品广告 Carousel、共享 Footer。删除首页的 RobotDock 和 SONIC Link 长介绍、功能/用途/规格区块及首页客服悬浮按钮。未禁用 body 滚动，Footer 可以正常访问。

两张广告顺序仍为 RobotDock、SONIC Link，保留原图、定位、图注和预览状态。了解产品进入各自独立介绍页，查看配置定位对应套餐区域。

复用既有 `ProductDetailContent`，合并原首页介绍所依赖的内容：

- RobotDock：原 description、highlights、interfaces、interfaceNote、compatibilityNote、安装草图及现有适配信息。
- SONIC Link：现有 overview、system、workflow、showcase 区块及媒体/历史界面说明；继续排除完整套餐 modes 区块。
- 两产品用途与边界引用现有 `solutions` 数据，不新增或改写方案能力。
- 技术规格引用同一份 `product.specifications`，只按现有字段标签分组；兼容设备引用原 compatibility 数据。所有未确认、规划、暂未销售和非实物说明保留。
- 套餐仍仅在 `/configure` 集中展示。配置页本轮只改“了解产品”的旧首页锚点链接。

没有复制任何产品或套餐数据。`HomePage.module.css` 经引用检查后删除，介绍页统一使用复用组件的样式。Header 仅改搜索结果目标；Footer 仅更新产品链接所依赖的数据及介绍/规格面包屑，未改分组或样式。

## 购买入口

`getOfferingNavigation(product)` 是介绍首屏、局部导航和页面末尾购买入口的共享逻辑；路径使用现有 configurable offering anchor，状态复用 `getProductPolicy`。

当前两款分别为 concept / coming-soon，显示“查看购买方案”，进入公开套餐区域。原有“暂未开放销售/下单”说明保留，无直接加购或支付入口。未来已有逻辑判定开放销售时，入口文字为“购买”，仍先进入对应套餐区域。

普通商品的最终加入购物车动作继续使用原有登录检查。验证了登录 returnTo 保留站内 query/hash，登录返回后不会自动加购。没有更改用户/管理员权限、未知价格处理或 pending action 逻辑。

## 产品局部导航

共享 `ProductLocalNav` 只由这两个产品的介绍/规格组件使用，产品名、链接和购买状态通过 props 提供，不在导航内硬编码产品名称。

- 介绍页观察整个首屏的稳定底边（IntersectionObserver），首屏离开 Header 下方后显示，返回首屏收起。观察整个 Hero 能覆盖快速跳滚跨过细小标记的情况。
- 规格页无需 Hero，直接显示。
- ResizeObserver 实测全站 Header 高度，浮条 top 为该高度 + 8px。没有新增逐帧 scroll setState。
- 页面范围内 sticky，单个交互实例，桌面最高宽 860px/高度约 54px，手机约 48px；负占位抵消避免出现时推动正文。
- 层级低于全站 Header 下拉面板；页面末端观察与 sticky 作用范围共同避免覆盖 Footer。
- 隐藏时 inert、aria-hidden、不可点击；焦点仍在导航内时保持显示，直到焦点离开。
- 页面锚点/聚焦滚动留出 Header 和产品浮条高度。
- 手机提供当前页面菜单、购买入口；支持 Escape 关闭并恢复按钮焦点，跨断点/点击外部清理菜单。
- 桌面及手机共用同一组链接，当前项 aria-current="page"。约 200ms 轻淡入/位移动画；reduced-motion 使用静态实色背景、取消位移/模糊过渡。

## 自动轮播

复用原 `ProductAdvertisement`，`useCarouselPlayback` 使用唯一 requestAnimationFrame 时钟同时计算 6000ms 截止时间和进度条，未创建 interval。每次手动切换重置当张进度，暂停时冻结剩余时间，继续后从该位置运行。

自动运行需同时满足：

- 用户没有主动暂停；若主动暂停，必须点击播放才改变该选择。
- 鼠标没有悬停，Carousel 内没有焦点。
- 页面可见，Carousel 至少 25% 可见。
- 系统没有默认要求减少动画（用户仍可主动点击播放）。

保留左右箭头、01/02、键盘箭头、鼠标拖动和触摸滑动。隐藏 Slide 保留 inert。没有会周期播报营销文案的 aria-live，没有自动抢焦点。卸载时取消 RAF，断开 IntersectionObserver，移除 visibilitychange 和媒体查询监听。

## 本轮修改文件

| 文件 | 用途 |
| --- | --- |
| `src/app/page.tsx` | 首页仅保留 Carousel 与旧 hash 兼容组件 |
| `src/components/ProductAdvertisement.tsx` / `.module.css` | 自动轮播控制/进度、真实介绍和套餐链接 |
| `src/components/useCarouselPlayback.ts` | 单时钟与所有暂停条件 |
| `src/components/LegacyOfferingHash.tsx` | 旧首页产品 hash 兼容 |
| `src/components/ProductDetailContent.tsx` / `.module.css` | 复用介绍正文、单产品首屏、用途与分组规格 |
| `src/components/ProductLocalNav.tsx` / `.module.css` | 产品局部浮条与手机菜单 |
| `src/lib/offering-navigation.ts` | 共享购买/介绍/规格链接与规格字段分组 |
| `src/app/products/[id]/specs/page.tsx` | 两个规格页静态输出及 metadata |
| `src/data/site-navigation.ts` | 两条产品介绍链接 |
| `src/components/Header.tsx` | 仅更新产品搜索结果链接 |
| `src/components/Footer.tsx` | 仅更新产品与规格面包屑 |
| `src/app/configure/page.tsx` | 仅更新回到产品介绍的链接 |
| `src/app/HomePage.module.css` | 无引用后删除 |
| `tests/home-navigation.browser.cjs` | 同步首页结构及产品链接预期 |
| `tests/product-pages.browser.cjs` | 本轮可复跑验收 |

git status 中 Header/Footer 样式、globals、SolutionExplorer、HomeVideoHero 删除等其余改动均为本轮起点前已有内容，本轮未重做这些部分。

## 检查结果

- `npm run lint`：PASS，0 errors。1 条既有 `ScrollExpand.tsx:244` 的 `<img>` warning，未修改该组件。
- package.json 没有 typecheck 脚本；实际运行 `npx tsc --noEmit`：PASS。
- `npm run build`：PASS，34 个页面静态导出；两个规格页均实际输出 `index.html`。
- 浏览器主验收：PASS，375 / 390 / 768 / 1440 / 1920px，三个主题，首页及四个产品路由均无横向溢出。
- 浮条显隐、Header 间距、焦点保留、隐藏 inert、手机 Escape/焦点恢复、Footer 遮挡、唯一 ID/导航实例通过。
- 介绍/规格切换、直接刷新、前进后退、旧首页 hash、正确套餐锚点通过。
- 普通商品目录不出现两款可配置产品或配件分类，套餐不进入介绍页；预览产品没有加购按钮。
- 普通商品加购登录 returnTo 和登录后不自动加购通过。
- 用受控浏览器时钟检查 6 秒循环、单进度时钟和所有暂停条件；document.hidden 事件采用确定性模拟。另在静态预览中使用真实时间等待 6.3 秒确认自动切换。
- 静态导出预览：四条产品路由、390/1440px 导航、套餐定位、旧 hash/刷新、Header/搜索/Footer 链接均通过，无 basePath 重复。
- 实际 CDP touch 滑动通过；reduced-motion 默认不自动播放。
- 本轮测试中无 pageerror、console error、hydration 或 module not found 错误。

测试命令（本机工具路径可替换）：

```bash
NODE_PATH=/tmp/one-home-check/node_modules \
ONE_G_BROWSER=/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
node tests/product-pages.browser.cjs
```

支持 `ONE_G_TEST_URL` 和 `ONE_G_ARTIFACTS` 覆盖预览地址/截图目录。未向项目新增浏览器测试依赖。

## 截图与记录

生成图片保存在本机临时目录，未加入仓库。

- 首页：[375px](/tmp/one-g-product-review/home-375.png) / [390px](/tmp/one-g-product-review/home-390.png) / [768px](/tmp/one-g-product-review/home-768.png) / [1440px](/tmp/one-g-product-review/home-1440.png) / [1920px](/tmp/one-g-product-review/home-1920.png)
- RobotDock：[介绍桌面](/tmp/one-g-product-review/robotdock-overview-1440.png) / [介绍手机](/tmp/one-g-product-review/robotdock-overview-390.png) / [规格桌面](/tmp/one-g-product-review/robotdock-specs-1440.png) / [规格手机](/tmp/one-g-product-review/robotdock-specs-390.png)
- SONIC Link：[介绍桌面](/tmp/one-g-product-review/sonic-link-overview-1440.png) / [介绍手机](/tmp/one-g-product-review/sonic-link-overview-390.png) / [规格桌面](/tmp/one-g-product-review/sonic-link-specs-1440.png) / [规格手机](/tmp/one-g-product-review/sonic-link-specs-390.png)
- 浮条：[RobotDock 桌面](/tmp/one-g-product-review/robotdock-floating-nav-1440.png) / [RobotDock 手机](/tmp/one-g-product-review/robotdock-floating-nav-390.png) / [SONIC Link 手机](/tmp/one-g-product-review/sonic-link-floating-nav-390.png)
- 主题：[日间](/tmp/one-g-product-review/specs-caribbean-calcite.png) / [夜间](/tmp/one-g-product-review/specs-night.png) / [色觉友好](/tmp/one-g-product-review/specs-color-vision-safe.png)
- [主验收 JSON](/tmp/one-g-product-review/results.json) / [静态预览验收 JSON](/tmp/one-g-product-review/static-results.json)

本次范围内无未完成项。当前仍为原有概念/预览产品，真实销售和交付条件没有改变；没有部署、提交或推送。
