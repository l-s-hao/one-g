# Resizable Navbar 顶部适配验收

> 附件范围：本记录引用的截图、JSON采样和临时测试脚本保留在本地，未纳入本次GitHub提交。

2026-10-30；ONE-G主仓库 `/home/lsh/ONE`；main，提交 `8fc2cf82e86b11d912bd99a68580877258779acc`。使用实际安装的 Oil UI Pro 0.27.1 与 VibeHub。用户已经明确方向和保留项，本轮直接实施单一适配，不探索风格、不重做图片抽屉。

## 改动与设计边界

- 新增 `src/components/ui/resizable-navbar.tsx`，本机原没有此组件。借鉴 [官方组件](https://ui.aceternity.com/components/resizable-navbar)及[registry源码](https://ui.aceternity.com/registry/resizable-navbar.json)的组合、居中与主题表面层次，实际使用 Navbar、NavBody、NavItems、NavbarLogo、MobileNavToggle。出处/原响应哈希见 [source.json](source.json)。
- 官方源码导入 React、motion/react、Tabler icons 与 cn；项目已有 React/Motion/Lucide。适配继续使用 Lucide/Elements，未安装Tabler、未运行安装CLI，package.json和锁文件不变。没有复制DummyContent、示例栏目、示例Logo或固定黑白配色。
- Navbar通过被动scroll订阅及useSyncExternalStore读100px阈值，不新建Provider；同一NavBody响应式布局持续挂载，移动端不复制一套工具，更未引入MobileNavMenu。此处没有声称直接复用了官方完整文件/API。
- 固定顶部，桌面44px、768/390下48px；等高占位维持原main起点及现有锚点偏移。桌面Logo左、主导航居中、原工具右；移动端沿用Logo、语言、主题、搜索、购物车和菜单，用户仍从原移动菜单进入。
- 滚动只给独立背景伪元素做240ms背景透明度/边缘/圆角/阴影/模糊变化。没有宽度收缩、Logo缩放或顶部transform，避免移动真实链接和图标；减少动画下为0s。
- 根容器透明区域pointer-events:none，顶部行和原panel恢复auto，背景伪元素不接收指针。没有新增全屏遮罩、滚动锁、RAF、动画库或新的点击代理。已有theme/locale Provider、HeaderNavigation的路径key及计时器/事件均保留；没有theme/locale key。

## 实际文件范围

| 文件 | 修改 |
| --- | --- |
| `src/components/ui/resizable-navbar.tsx` | 新增5个适配组合及被动滚动订阅/卸载清理 |
| `src/components/Header.tsx` | 接入组合；添加等高占位；保留状态、事件、原链接、drawer实例及挂载次序；移动预览按钮接入反色 |
| `src/components/HeaderBrand.module.css` | 固定顶部、居中三列/移动两列、独立表面与减少动画；panel仅增加pointer-events恢复，不改几何 |
| `src/components/HeaderImageMenu.tsx` | 仅按钮class/effect和原文字块反色外观属性，不改数据、筛选/打开/关闭逻辑 |
| `src/components/HeaderImageMenu.module.css` | 只追加动作外观，保留所有原网格/图片/动画CSS；按下使用内阴影，不位移 |
| `README.md`、`docs/NAVIGATION.md`、`docs/BUTTON_EFFECTS.md` | 更新与本轮导航/按钮直接相关的说明与历史约定边界 |
| `docs/reviews/resizable-navbar/` | 本次出处、基线、截图、测试结果与独立视觉记录 |

开始时已存在 `src/app/products/products.module.css` 的末尾换行差异，以及未跟踪的全栈审查报告/证据。本次保留原样；未顺带修改其他页面或全栈报告，不暂存、提交、推送。参考只从官方registry读取到临时目录，未写任何参考仓库。

## 下方图片抽屉的保留证据

- HeaderPanel整文件哈希与改前相同；240ms面板展开关闭/inert逻辑不变。
- HeaderImageMenu中完整useLayoutEffect动画、Flip参数、RAF/resize/减少动画清理块逐字相同，分类处理和回调函数未改。桌面4列、移动2列、极窄单列以及缩略图到网格的关系保持。
- HeaderImageMenu CSS原文件作为完整前缀保留，只追加按钮相关规则；useNavigationHighlight整文件未变，仍是唯一共享滑动高亮。
- `src/data/`、商品/方案集合、图片路径及public均与开始哈希相同。商品9项、方案4项；RoboDock为商品、SONIC Link为方案。方案抽屉原无分类，本次未新增。
- 改前后12组合测量比较 [baseline.json](baseline.json) 与 [after.json](after.json)：header高度、商品抽屉grid、9张卡片和图片几何/链接、图片路径均零差异。此项是商品抽屉完整几何对比；方案抽屉另实际确认4个原入口及交互，未声称另有完整方案前后几何矩阵。

## 内部按钮

查看全部使用现有主要invert；分类使用次级/选中反馈；关闭仍是紧凑X图标；移动展开/收起使用次级。图片卡片仍是完整单个Link，原文字区加相同反色表面，不嵌套button、不添加新图层控制卡片transform。200ms背景/文字/边缘过渡沿用button-effects.css，按下仅内阴影。去掉重复可见的物理分类边缘色，保持其边框宽度与几何；无固定文字宽度。没有恢复SpecularButton、Canvas、追光、缺口或鼠标跟随效果。

## 运行结果

服务为本轮启动的本机开发地址 `http://127.0.0.1:3013/one-g/`。Chromium153独立临时会话；桌面显式启用fine/hover能力，并验证matchMedia为true，鼠标事件真实派发；触屏另用无精确指针的独立会话，coarse=true/hover=false，使用touchStart/touchEnd实际操作。不是把桌面改窄当作触屏。

| 检查 | 实际结果与证据 |
| --- | --- |
| 1440/768/390 × 中英 × 日夜 | 12/12；高度、滚动前后Logo/工具坐标一致；无页面横向溢出/按钮内容溢出；分类正确；主题/语言切换不替换Header/row；[interactions.json](interactions.json) |
| 商品抽屉几何 | 12组相对位置、尺寸、图片路径零差异；[after.json](after.json) |
| 悬停/共享高亮/离开关闭 | 3轮通过；商品/方案真实hover，高亮位置改变，离开关闭；没有加箭头/下划线 |
| 主文字/图片/主题期间点击 | 3轮直接到产品/关于/G1详情；主题期间仍能打开并点击；动画装饰结束，URL/basePath保留；前进后退3轮通过 |
| 快速切换 | 3轮；连续hover产品/方案最后为方案4项，连续分类最后为全部9项，关闭可点；[edge-checks.json](edge-checks.json) |
| 触屏 | 3轮菜单开关、分类、图片跳G1、关闭后可滚动；语言/日夜切换及完整刷新持久；[touch.json](touch.json) |
| 搜索/用户/购物车 | 搜索聚焦、无结果/匹配结果及关闭通过；用户和购物车仍走既有登录入口和returnTo，未改变认证业务 |
| 页底/首页/锚点 | 页底导航仍在top0；首页标题不被导航覆盖；方案handling锚点不被遮挡 |
| 减少动画 | 新表面过渡0s；容器transform为none；原drawer减少动画逻辑未改 |
| lint | `npm run lint` exit0 |
| 类型 | `./node_modules/.bin/tsc --noEmit --incremental false` exit0 |
| 相关单元测试 | `node --test tests/i18n-dictionary.test.cjs tests/route-preference.test.mjs tests/invert-actions.test.cjs`，7/7通过 |
| build | 当前源码同字节隔离副本 `/tmp/one-resizable-navbar/build` 执行 `npm run build`，exit0、38静态页；未部署，也未改依赖/配置；与本地dev缓存隔离 |
| diff检查 | `git diff --check`通过；未提交/推送；保护结果见 [integrity.json](integrity.json) |

脚本实际位置：`/tmp/one-resizable-navbar/{baseline,after,interactions,touch,edge-checks}.mjs`；结果保留在本目录。没有执行或宣称全部历史Playwright脚本通过；它们部分仍依赖旧导航契约和外部工具环境。没有测试真实手机状态栏/软键盘、Safari/Firefox、所有业务页面或长时间性能；模拟视口不等于真机安全区验证。本次未增加body滚动锁，因此不存在本轮新锁需要释放。

## 独立视觉与取证纠正

独立上下文 `/root/navbar_visual_review` 按 Oil UI Pro 进行一轮无评分存量组件视觉复核，实际看当前三宽/中英/日夜截图；[visual-review.md](visual-review.md)。只改顶部与按钮，未开展全站设计或独立业务UX审查。

最初组合探针在同URL完整导航时未等待新文档提交，后续hover超时；[interactions-initial.json](interactions-initial.json)保留。单独真实指针检查证实菜单正常，修正工具为等待CDP导航loader提交后，12组合和3轮交互均通过，没有为测试修改产品逻辑。

最初截图截到200ms颜色过渡的中间帧，按钮灰化；现等待有限CSS/WAAPI过渡结束并补采，独立评审复看后撤销该疑点。没有为此修改按钮色值。最终top/menu截图按 `{width}-{locale}-{theme}` 命名；before/after为原始几何代表。保留品牌字体、暖底与蓝色、导航数据、卡片/图片/抽屉布局与动画，不新增无关效果。没有新增或删减业务文案。

本轮到上述改动和验证停止。
