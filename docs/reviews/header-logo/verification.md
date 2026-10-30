# ONE-G Header Logo 描边动画验收

> 附件范围：本记录引用的截图、JSON采样和临时测试脚本保留在本地，未纳入本次GitHub提交。

日期：2026-10-30。分支 main，基线提交 `8fc2cf82e86b11d912bd99a68580877258779acc`。以本地工作树为主，保留本轮开始时全部未提交修改。未提交、推送或安装依赖。

## 范围与原始资产

仅修改Header的Logo调用，新增动画组件、局部样式、精确路径副本与一致性测试，并更新导航文档。机械展开独立原型 `/home/lsh/ONE-prototypes/one-g-hairline` 已按要求删除；未卸载Hairline Skill，本轮未用它重绘或构造Logo。

正式资产均未修改：

- 桌面：`public/brand/one-g-horizontal.svg`，viewBox `98 545 1222 328`。首条compound path包含圆外轮廓与内侧负形，其余4条中文路径、6条英文/连字符路径构成原字标；没有字体重排。
- 手机：`public/brand/one-g-symbol.svg`，viewBox `189 191 1040 1040`，继续只显示原圆标。
- `BrandLogo.tsx` 及其CSS保持原样，结束后仍由该组件用原SVG蒙版和currentColor绘制。

## 修改文件

- `src/components/Header.tsx`：只将两处BrandLogo调用交给HeaderLogo；不改HeaderNavigation的key、导航状态或事件。
- 新增 `src/components/HeaderLogo.tsx`：一次性首播、鼠标/键盘触发、取消、失效保护和动画层生命周期。
- 新增 `src/components/HeaderLogo.module.css`：原始路径描边/填充/文字时序；原尺寸布局，日夜继承前景色。
- 新增 `src/components/header-logo-paths.ts`：逐字复制两个正式SVG的路径；仅按闭合子路径边界拆开外/内轮廓，不重新绘制。
- 新增 `tests/header-logo-paths.test.mjs`：校验所有原路径、外内拼接、文字及viewBox完全一致。
- `docs/NAVIGATION.md` 与本验收目录：记录当前行为和证据。

哈希核对见 `integrity.json`：本轮已存在文件仅Header与导航说明改变，其他基线文件不变；构建源码匹配最终源码，正式SVG字节不变。

## 时序与交互

CSS Animation：外轮廓600ms；内轮廓与原填充在600ms后显现400ms；ONE-G和万机智能原路径在1000ms后淡入500ms，总计1500ms。使用克制的ease-out，没有旋转、缩放、弹跳或发光。独立SVG覆盖层绝对定位、pointer-events:none，不占布局。

Document WeakSet记录首播，不使用locale/theme key或存储开关；路由重挂载不会自动重播，刷新/新Document允许。首次动画未结束时忽略交互触发，避免叠加。支持hover且pointer:fine的鼠标pointerenter重播；pointerleave回到完整静态图，Tab的focus-visible也可触发。触屏不模拟hover。

结束时移除两个响应式变体的临时SVG及其animationend处理，清理1700ms失效保护计时器；无RAF、循环或持续绘制。快速进出、中途点击/失焦、页面隐藏、动态减少动画均恢复静态。必要的hover/focus/偏好监听保留以支持后续交互，并在组件卸载移除。无JS或减少动画时原Logo直接可见。

可访问名称由现有首页链接保留；整个图形子树及描边层aria-hidden，不增加重复朗读。动画中链接仍能点击。

## 实际检查

生产静态产物在本机3017验收，独立浏览器会话，无真实账号/支付/正式消息。源码全量复制到 `/tmp/one-header-logo-build`，未复制.env，依赖与public复用本机现有文件；没有写入正式部署。

| 命令/检查 | 结果 |
| --- | --- |
| `npm run lint` | 通过 |
| `./node_modules/.bin/tsc --noEmit --incremental false` | 通过 |
| `node --test tests/header-logo-paths.test.mjs` | 通过，全部正式路径及viewBox一致 |
| `npm run build`（独立源码副本） | 最终通过，38页静态导出 |
| 首次加载/刷新 | 首播可观察；刷新重播 |
| 桌面1440px | 动画前后Logo位置、104.3125×28px尺寸、颜色及68px导航高度稳定 |
| 完整悬停3轮、快速进出5轮、Tab | 通过；取消后保留原静态图 |
| 路由重挂载、前进后退、语言/主题 | 无自动重播，语言/主题不重挂Logo |
| MenuToGrid打开关闭、商品分类 | 不触发Logo重播 |
| 动画期间点击Logo | 正常返回首页 |
| 手机390px触屏模拟 | 圆标28×28px、导航56px；日夜/英文正常，touch pointerenter不重播 |
| 减少动画首次进入及动态切换 | 静态显示；中途切换取消，后续hover不播放 |
| 6倍CPU限速 | 最终无残留动画层，保持静态；不是帧率或真机性能认证 |
| 最终与原静态蒙版 | 同浏览器截图像素一致，形状/比例/颜色未改 |

主检查原始结果见 `checks.json`，补充可访问性/时序/无JS检查见 `extra-checks.json`。截图阶段通过浏览器暂停该组件CSS动画取证，分别为180/800/1250ms，正常功能检查未暂停动画。

## 视觉证据与评审

Oil UI Pro用于单组件实际画面核对，VibeHub用于需求和触发边界。该方案已由用户锁定，没有再探索品牌图形。

- `desktop-header-light.png`、`desktop-header-dark-en.png`：桌面整体。
- `mobile-light.png`、`mobile-dark-en.png`：手机整体。
- `desktop-outline-2x.png`、`desktop-symbol-2x.png`、`desktop-words-2x.png`、`desktop-final-2x.png`：200%阶段和终态。
- `hover.webm`：约5.5秒浏览器画面按时间采样的悬停演示，10fps，仅用于呈现动作，不是性能录制。
- `visual-review.md`：独立静态组件评审，没有视觉阻断项；未把静帧评审当作正常速度的动效验收。

主Agent实际查看了完整桌面、手机及放大阶段。初稿发现non-scaling-stroke与归一化dash结合时小尺寸轮廓进度不清晰，已去掉该组合，按原viewBox缩放描边宽度，重新构建与复验。文字保留任务必要信息，没有给Logo添加文案或装饰；也没有创建/改动正式品牌规范。

## 限制及执行异常

没有真实低性能手机或Safari/Firefox测试；触屏和CPU为Chromium模拟。未对所有背景、缩放倍率作认证。独立评审仅检查静态画面；运行交互由主Agent的浏览器流程检查负责。

首次构建命令误在/tmp运行，报缺少package.json，随后在正确副本目录执行。最终CSS调整后曾遇Next.js临时 `Could not parse output from TypeScript's --showConfig`，无配置修改重跑成功。没有把失败写成通过；最终产物已再次跑完整浏览器检查。

全宽、半透明吸顶、backdrop-filter、日夜/语言Provider、搜索/用户/购物车、共享滑块、MenuToGrid布局、数据与动画均保留本轮起点状态。没有顺带修改其他页面。
