# ONE-G 字体来源、许可与实际使用审计

核对日期：2026-10-21。范围：当前 one-g 主仓库工作树与最终静态导出；不是已经部署到线上的版本。开始前保存 `/tmp/one-font-audit/before.patch`、`before.status` 与源码/资源哈希，保留此前未提交的媒体、按钮和业务改动。未提交、暂存、推送或修改参考仓库。

结论：本站主动提供的网页字体现为来源可追溯的 **Inter Variable 4.000** 与 **Noto Sans SC 2.004**，均随站保存原始 SIL OFL 1.1 许可与版权声明。它们允许按该许可证条件进行网页嵌入与分发。本次未修改字形、转换字体、制作自定义子集或改字体内部名称；字体不作为独立商品销售。这个结论不覆盖图片/Logo 内文字的历史授权，也不把访问者的系统字体当成本项目分发的开源字体。

## 修改前的真实状态

`src/app/layout.tsx` 没有 next/font；全局 CSS 的 body 与 Tailwind `--font-sans` 均为 `Arial, Helvetica, sans-serif`。源码没有活动的 @font-face、外部字体 stylesheet、字体 npm 包或 public 字体目录。Arial/Helvetica 是系统引用，不代表下载了其商业字体文件，更不据此判定侵权。

Chromium 的实际字形证据显示，本测试环境英文/数字由 **Liberation Sans** 渲染，中文由 **Noto Sans CJK SC** 渲染，`isCustomFont=false`；网页字体网络请求为 0。不能把 CSS 中写了 Arial 当成实际渲染 Arial。

唯一已有源码字体文件是 `src/components/fonts/InterVariable.ttf`，876,576 字节，版本 `4.001;git-66647c0bb`，wght 100–900、opsz 14–32。没有普通/动态 import、CSS 或构建输入引用，旧/最终 out 都未复制该 TTF。其随附 Inter-OFL.txt 保留；文件未被当作全局字体使用，也未因文件名相同就与此次官方 4.000 WOFF2 混为一谈。

已扫描全局 CSS、CSS Modules、行内 style、主题变量、Tailwind @theme、所有当前路由/组件引用、SVG text、Canvas/Three 文本调用、public/src 中 woff/woff2/ttf/otf/ttc、依赖/锁文件及构建产物。未从系统字体目录提取或复制字体。

## 分类清单

A＝已核实开源且许可完整；B＝已核实开源但项目缺少许可记录；C＝有商业授权但非开源；D＝来源/许可未完全确认；E＝系统字体引用、不随站分发；F＝文件存在但不被当前页面/发布构建使用。

[结构化字体清单](./reviews/font-audit/inventory.json)记录家族、字形/字重、来源与版本、页面、许可路径/官方依据、分发和真实加载状态。102 个新分发二进制的逐文件 URL、大小、SHA-256 另见 [sources.json](../public/fonts/sources.json)。

| 家族或配置 | 分类 | 修改前/实际使用 | 版本与许可依据 | 处理 |
| --- | --- | --- | --- | --- |
| Arial | E | 原全局首选系统名；本 Linux 测试实际匹配 Liberation Sans | 访问者 OS 负责提供，项目不含 Arial 文件 | 从全局首选移除；不是认定侵权；框架错误页系统栈不改 |
| Helvetica | E | 原全局第二系统回退；本环境未实测其字形 | 同上，不宣称 Helvetica 开源 | 从全局首选移除；不复制系统文件 |
| Liberation Sans | E | 修改前英文/数字实际字体 | 环境系统提供，非网站分发；版本随 OS | 作为环境记录，不打包 |
| Noto Sans CJK SC | E | 修改前中文实际字体；新字体缺字及断网时仍可系统回退 | 系统字体，不能与分发的 Noto Sans SC 混同 | 保留系统回退边界，不打包 OS 文件 |
| Inter Variable 4.000 | A（本次接入） | 修改后英文、数字、价格符号、按钮和输入框 | rsms/inter 官方 v4.0；完整 OFL 见下节 | 本地原始 WOFF2，正常字形，100–900 |
| Noto Sans SC 2.004 | A（本次接入） | 修改后常用中文、标签、姓名、标题 | Google Fonts v41；完整 OFL/metadata 见下节 | 本地官方 101 个可变 WOFF2 分片，正常字形，100–900 |
| 源码 Inter 4.001 | F（精确原始下载记录仍待核实） | 旧 TTF 未引用/未发布/未加载 | name 表声明 SIL OFL 1.1、2016 Inter 作者；随附旧文件为 2020 作者声明，均保留 | 不主动加载，不删旧资产；不能冒充已逐字节核实的 4.000 发布包 |
| system-ui / sans-serif / Emoji 系统回退 | E | 新全局栈尾部；罕见字/离线、Next 默认错误页可使用 | 由 OS 提供，版本、家族随访问者变化 | 保留，不分发；错误页的 Segoe UI/Roboto/Arial/Helvetica 等名称不是远程字体请求 |
| ui-monospace / SFMono-Regular / Menlo / Consolas / monospace | E，闲置配置 | 仅旧 TechText Canvas 标签栈；当前路由不引用该组件，没有当前代码展示区 | 仅系统引用，无等宽字体文件分发 | 保留配置，不给普通网页额外加载等宽字体 |
| Geist / Geist Mono 等依赖内部字体 | F | Next devtools/OG 与 Three 示例依赖内存在文件；无网站导出/页面请求 | 不以模板或依赖文件名推断本站使用；未纳入网站字体发布清单 | 不改依赖、不复制；最终 out 的字体文件只包含上述 102 个 |

没有发现当前主动提供的 C 类字体，也没有实际在用的 B 类字体需要“补个许可而换掉字体”。已有系统栈 E 并不属于违法网页字体；替换默认入口是为了满足“主动提供可核实开源字体”的要求。旧 Inter 的来源差异记录为未确认事项，不写成确定侵权。

当前 101 个中文分片都有有效 @font-face/unicode-range 引用。某个首屏没有请求某个分片，不等于该文件为 F；其它页面、姓名输入、符号等会按覆盖范围请求它，不能按首页字符删减。

## 官方来源、版本和许可证

### Inter Variable

- 官方发布：v4.0，提交 `2ce9119398be143fa289c3e180824db1b7ed803e`，二进制版本 4.000，345,588 字节。
- [原始 WOFF2](https://raw.githubusercontent.com/rsms/inter/2ce9119398be143fa289c3e180824db1b7ed803e/docs/font-files/InterVariable.woff2)，SHA-256 `8af7bd5b545567adffb3dfceb5bedb353a522d7bf1b3a2b8af7b6064156babc0`。
- 原始声明：Copyright (c) 2016 The Inter Project Authors (https://github.com/rsms/inter)。
- [该版本官方许可](https://raw.githubusercontent.com/rsms/inter/2ce9119398be143fa289c3e180824db1b7ed803e/LICENSE.txt)，完整保存到 [public/fonts/inter/OFL.txt](../public/fonts/inter/OFL.txt)，静态公开地址 `/one-g/fonts/inter/OFL.txt`。
- 没有将现有 4.001 TTF 重命名或转换成此文件；是直接取得官方已发布的 WOFF2。

### Noto Sans SC

- 官方 Google Fonts 网页分发 revision v41，字体 2.004（fontconfig `fontversion=131334`）；Google Fonts 提交 `47d54ca1ebb14fd864695f1d39dc734f39017c33`。
- [原始 CSS 请求](https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap)，取得日期及 User-Agent 已固定在 sources.json；响应存档为 [google-fonts-original.css](../public/fonts/noto-sans-sc/google-fonts-original.css)。这是来源证据，网站没有 import 该远程链接或原始存档。
- 101 个原始 WOFF2 共 4,500,544 字节，从 `fonts.gstatic.com/s/notosanssc/v41/` 取得。每个不可变分发 URL 与哈希均在 sources.json，文件名、字形、unicode-range、100–900 字重映射保留，实际 CSS 只将 src 换为同站 URL。
- [官方 METADATA.pb](https://github.com/google/fonts/blob/47d54ca1ebb14fd864695f1d39dc734f39017c33/ofl/notosanssc/METADATA.pb) 存档于 public，指向 noto-cjk 源提交 `523d033d6cb47f4a80c58a35753646f5c3608a78`。
- 原始声明：Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'。
- [该来源官方完整许可](https://raw.githubusercontent.com/google/fonts/47d54ca1ebb14fd864695f1d39dc734f39017c33/ofl/notosanssc/OFL.txt)，保存到 [public/fonts/noto-sans-sc/OFL.txt](../public/fonts/noto-sans-sc/OFL.txt)。没有删除保留字体名称或作者声明。

许可均为 SIL OFL 1.1，不是项目自定 MIT 许可；同时提供 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)。最终 out 已核对 102 个字体的哈希及完整许可文件，未缺失，见 [范围与导出检查](./reviews/font-audit/scope.json)。

## 最小实现

`src/app/layout.tsx` 只新增全局 `fonts.css` import；[src/app/fonts.css](../src/app/fonts.css) 集中注册两个家族，普通 CSS 本地托管，不新增 next/font、远程 stylesheet 或 npm 依赖。构建不需要请求 Google/Inter 字体服务。

`src/app/globals.css` 新增 `--font-ui: "Inter Variable", "Noto Sans SC", system-ui, sans-serif`，body 与已有 Tailwind `--font-sans` 都引用该入口。表单控件沿用现有继承机制；没有 `* { font-family: ... !important }`。

两个正常字形可变字体均支持真实 100–900，包括当前 650/800 及检查用 900。没有实际使用的斜体正文，不额外下载斜体。字体全部使用 `font-display: swap`，不挂载等待字体的隐藏遮罩。没有无差别预加载 101 个分片，最终无手工字体 preload。一次中间验证发现框架重复输出了手写 preload 标签，已移除并重建，最终网络测试通过。

没有修改字号、字重、行高、字距、按钮/卡片尺寸规则、颜色、圆角、页面宽度或动画参数，没有 scale 压扁文字。字体自然改变字宽，20 组修改前后代表场景记录到 25 处自然几何变化；取样的字号/字重/行高/字距差异为 0，104 组页面横向溢出为 0，不声称所有文字宽度不变。无需局部布局补偿。

## 实际渲染与网络

使用 Chromium `CSS.getPlatformFontsForNode`（DevTools Rendered Fonts 的实际字形接口）读取字体家族、PostScript 名称、`isCustomFont` 和 glyphCount；不是仅凭 getComputedStyle、document.fonts.check 或文件名。辅助的 font-ready 等待只用于同步，不作为字体身份依据。

- [修改前 20 组](./reviews/font-audit/before/rendered-fonts.json)：只读旧静态构建，系统 Liberation Sans / Noto Sans CJK SC，无网页字体请求。
- [修改后 104 组](./reviews/font-audit/after/rendered-fonts.json)：13 个代表页面 × 中英 × 日夜 × 1440/390px。覆盖首页、商品中心、普通商品、RoboDock 介绍/规格/购买、方案/遥操作、About、深度定制、登录、用户/管理员中心，Header/Footer 取实际文字节点。
- 结果：已取样的中文实际用 Noto Sans SC，英文/数字/CNY/小数实际用 Inter Variable，均 `isCustomFont=true`。Noto 的 PostScript 名为 `NotoSansSC-Thin` 是官方可变文件的默认名称；不表示 CSS 的 650/800/900 被强制成 100。
- 额外独立文字探针明确标记为 probes，检查中英、`¥12,800.50`、长邮箱、900 字重及罕见字；没有将探针当成页面原有文案。常见与“龘”使用本地 Noto；“𠮷”超出该发布版分片覆盖，在本环境由系统 Noto Sans CJK SC 补足。不能保证任意 OS 的所有 Unicode 姓名/Emoji 都有字形。
- [客服/导航/交互记录](./reviews/font-audit/interactions.json)：读取原生 input 的 user-agent shadow DOM，真实姓名“张龘”为 Noto，47 个邮箱字符为 Inter；中文/英文标签与按钮一致，手机/桌面弹窗均无横向溢出，仅本地预览，无发送。
- [网络/缓存/离线记录](./reviews/font-audit/network.json)：冷请求成功；缓存后刷新资源 transferSize 全为 0，字体仍实际参与字形渲染；主题和语言切换新增字体请求为 0，标题 DOM 未重建。阻断字体时显示系统回退，页面不因等字体而隐藏。延迟字体响应时导航仍可读；字体热缓存后断网切换中文也仍可读。这不等于整站已实现离线应用缓存。
- 正常 104 组检查中字体 HTTP 失败、字体/页面运行错误及横向溢出均为 0，未请求未知字体来源或旧源码 TTF。

## 请求与体积变化

| 项目 | 修改前 | 修改后 |
| --- | --- | --- |
| 主动分发的网页字体 | 0 | 2 家族，102 个官方 WOFF2，4,846,132 字节（约 4.62 MiB） |
| 中文分片是否全量预加载 | 无 | 否，只加载字符命中的分片 |
| 首页桌面冷加载实际字体请求 | 0 | 12 个，字体响应体 988,196 字节（约 965 KiB） |
| 首页手机冷加载实际字体请求 | 0 | 11 个，字体响应体 927,368 字节（约 906 KiB） |
| 缓存后字体刷新传输量 | 无网页字体 | 实测 0 字节；存在缓存命中响应，不冒充没有资源条目 |
| 语言/日夜切换新增字体请求 | 0 | 实测 0 |
| 字体 CSS | 无 @font-face | 111,347 字节；gzip 估算 31,004 字节，实际压缩由部署服务决定 |
| 已有源码旧 Inter TTF | 876,576 字节，不发布 | 原文件保留，不发布 |

上述冷加载数是实际页面、排除额外文字探针后的请求；不是把全部 101 个分片算作首屏下载。英文首访在偏好恢复前仍有现有中文 SSR 内容，因此可能先请求中文分片；没有为减少这部分请求重写语言或 hydration 系统。不同页面、字符和部署缓存策略会改变实际字节数。完整原始数据与自然尺寸变化见 [summary.json](./reviews/font-audit/summary.json)。

## 交互和资产边界

- Header 原 hook 已有 ResizeObserver、document.fonts.ready/loadingdone 重新测量，本次不改。中英文实测高亮底板 left/width 与目标一致，菜单文字与真实字体均正常。
- 首页“一智通万机”、定位行及英文逐行标题检查容器裁切；现有入场动画后截图另存。商品筛选/GSAP Flip、首页 Layout Grid 展开/链接、About ScrollExpand clip-path 变化、主题持久化及登录门禁回归通过，见 [regression.json](./reviews/font-audit/regression.json) 和 interactions.json。
- TechText/HomeTechTextHero 没有当前页面引用，未把历史 Demo 名称或字体栈当成当前字体。About 实际 Canvas 绘图探测中 fillText/strokeText 调用为 0；Lanyard 使用原有图片纹理，不需要新 Canvas 字体重绘代码。未重写动画或认证、主题、语言系统。
- 扫描到的正式 SVG Logo 为路径/图形，没有依赖网页字体的可编辑 text；保留。图片 Logo、产品照片、视频字幕、Lanyard 正反面与吊带印刷文字均未重画、未更换、未授权清洗。它们的字体出处及授权仍属单独待核项，不包含在此次网页字体通过结论中。

## 验证与限制

`npm run lint`、`npx tsc --noEmit`、`npm run build`（38 个静态页面）、font-audit / invert-actions / i18n-dictionary / auth-payment / mock-login / media-integration 六个测试文件均通过。package.json 无独立 typecheck 脚本。新字体测试校验原始哈希、WOFF2 格式、完整许可、unicode-range/字重与本地路径映射。git diff --check 通过。命令汇总见 [checks.json](./reviews/font-audit/checks.json)。

浏览器为 Chromium；390px 是触屏模拟，未测真实手机、Safari、Firefox、Windows/macOS 的具体系统回退。默认 404 的系统字体栈已做构建源码核对，未逐一测每种 OS 的实际字体。没有执行真实支付、订单或客服发送。可复跑浏览器脚本使用外部 Playwright，不新增项目依赖，输出临时目录后再归档，避免开发服务监听测试报告造成干扰。

源码/媒体/依赖哈希检查表明，本轮已有业务源码文件仅 layout.tsx、globals.css 改变，另新增 fonts.css；其它未提交的按钮、数据、图片和交互原内容保持。四个本地参考库仍干净且只读。本地测试登录服务已恢复，未开启交易服务。

## 截图

- 首页入场结束后 8 组裁切检查见 [home-stable.json](./reviews/font-audit/home-stable.json)：[桌面中文日间](./reviews/font-audit/home-stable-1440-zh-CN-light.png)、[桌面英文夜间](./reviews/font-audit/home-stable-1440-en-dark.png)、[手机中文日间](./reviews/font-audit/home-stable-390-zh-CN-light.png)、[手机英文夜间](./reviews/font-audit/home-stable-390-en-dark.png)。
- [桌面中文菜单](./reviews/font-audit/menu-zh-CN.png)、[桌面英文菜单](./reviews/font-audit/menu-en.png)。
- [手机英文客服表单](./reviews/font-audit/form-390-en.png)、[桌面中文客服表单](./reviews/font-audit/form-1440-zh-CN.png)。
- [RoboDock 手机英文夜间](./reviews/font-audit/after/products-robotdock-390-dark.png)、[技术规格桌面日间](./reviews/font-audit/after/products-robotdock-specs-1440-light.png)。
- [字体不可用时的回退](./reviews/font-audit/offline-fallback.png)。

复跑：`tests/font-audit.browser.cjs` 通过 ONE_G_PLAYWRIGHT/ONE_G_BROWSER 指向外部工具，通过 ONE_G_TEST_URL 指向静态导出、ONE_G_MOCK_URL 指向仅启用已有模拟登录的本地服务；默认输出系统临时目录。STAGE=before 仅用于事先保存的旧构建，不能在改完后冒充历史字体证据。
