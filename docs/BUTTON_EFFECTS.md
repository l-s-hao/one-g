# 页面主要操作的 Specular 光效

本次只修改 ONE 主仓库，无提交、推送；两个参考仓库未写入。开始时 `git status --short` 和 `git diff` 均为空，基线补丁记录于 `/tmp/one-specular-audit/before.patch`。

## 来源、安装与依赖

采用 React Bits **TS-CSS** 官方提交 `e12c22192ac7b4b452c5e2feb9b586d74765d696`：

- [组件说明](https://reactbits.dev/components/specular-button)
- [固定版本 TSX](https://raw.githubusercontent.com/DavidHDev/react-bits/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/Components/SpecularButton/SpecularButton.tsx)
- [同一版本 CSS](https://raw.githubusercontent.com/DavidHDev/react-bits/e12c22192ac7b4b452c5e2feb9b586d74765d696/src/ts-default/Components/SpecularButton/SpecularButton.css)

实时下载的 registry 已更新：包含 TSX 和 CSS 两个文件，`dependencies: []`，支持 `idleIntensity`、`glow`，使用原生 WebGL2。两个文件内容与该提交完全一致，不能继续按旧 registry 认为需要 ogl。`source.json` 保存地址、提交号、SHA-256 和比对结果，`upstream/` 保存完整配套原件（`.txt`，不加入生产运行或类型检查），同时保存官方 **MIT + Commons Clause** 许可证。

已执行 `npx shadcn@latest add @react-bits/SpecularButton-TS-CSS`，也用完整 JSON 地址重试；shadcn 4.22.1 两次都报 `other side closed`，没有生成组件。随后按固定提交下载同一套官方源码并手动接入。未新增项目依赖，`package.json`、`package-lock.json`、`components.json` 不变。现有 ogl 被 MicroSlats 使用，保留不动。浏览器验收工具仅安装于临时目录。

## 显式启用与当前范围

此次范围修正以前一轮未提交 diff 为基线，不 reset、不覆盖整个文件。额外基线保存在 `/tmp/one-specular-audit/before-scope-correction.patch`。以下范围取代先前“全站按钮”范围。

`src/i18n/Elements.tsx` 的 LButton、LocalizedLink、LA 默认不挂载任何 Specular 装饰。只有 `effect="specular"` 才输出 `data-specular-host`、SpecularEdge 和标签层。`intent="purchase"` 本身不启用效果，也不依据文案、尺寸测量或全局 button/link 选择器推断。SupportButton 也只转发可选 effect，默认无效果。

| 显式启用位置 | 操作 |
| --- | --- |
| HomeCollageHero | 首页 Hero 的商品中心、解决方案两个正常尺寸主入口 |
| ProductDetailContent | 产品介绍/技术规格正文的购买操作 |
| AddToCartButton、ProductPurchase | 详情加入购物车和购买页加入购物车（原禁用状态保留） |
| cart、checkout | 结算主入口及原禁用提示主按钮、演示订单主提交 |
| solutions、about、deep-customization、account | 页面级联系我们/咨询客服/提交深度定制需求 |
| VerificationLogin | 登录表单主提交 |
| ContactProvider | 填写需求表单的预览需求主提交 |

明确排除：整个 Header 和所有导航图片面板、ProductLocalNav 的紧凑购买、语言/日夜/搜索/用户/购物车/更多菜单、所有图标/关闭/箭头/分页、分类筛选和 Tab、获取验证码、商品卡片和首页展开卡片的紧凑购买/了解入口、返回/取消/辅助按钮、Footer 紧凑咨询入口、账户切换/退出与管理员模块选择。不存在依据“购买”字样自动启用的逻辑。

排除控件不输出 SpecularEdge/Canvas、不注册 scheduler。原生 LanguageSwitch、AnimatedThemeToggler、Layout Grid 关闭与 Hero 暂停按钮已移除前次加入的导入和装饰；Header 的用户/购物车链接恢复原调用形式。导航高亮、MenuToGrid、展开/收起、卡片浮起与日夜圆形扩散的逻辑保持不变。

共享光效仍在 `src/components/specular/`：SpecularEdge 为装饰注册入口，scheduler 为共享资源调度，shader 为固定官方 shader 与辅助数学。`button-effects.css` 的光效和缺省圆角仅匹配显式 `data-specular-host`，已删除专用于导航的光效样式。所有 button 和按钮式链接继续清除文字下划线，保留 focus-visible；正文链接不作全局清理。

现有 button/Next Link/a、ref、type、表单、aria/data 属性、事件和目标地址保持。仅启用时添加装饰；不新增按钮或业务行为，不统一放大尺寸，不改变套餐 radio、支付方式和输入框。

## 参数、主题和布局

共享配置为 `intensity=1`、`idleIntensity=0.35`、`shineSize=10`、`shineFade=34`、`thickness=1.2`、`glow=1`、`followMouse=true`、`proximity=250`、`autoAnimate=false`。没有全站自动旋转，也没有引入另一套动画库。

显式启用光效的文字按钮缺省圆角为 18px；已有组件的 pill、Chip、圆形关闭按钮和尺寸规则优先。Header 与小控件完全不使用光效或其圆角适配，不增加 padding、字号、导航高度或实色背景块。画布延伸 24px，但 `pointer-events:none`，仍在按钮自己的隔离层内；保留卡片、图片、弹窗和面板的原裁切规则。未改 CardHover、GSAP Flip、MenuToGrid、共享导航底板或 Layout Grid 的 transform 和业务代码。

| 颜色用途 | 日间 | 夜间 |
| --- | --- | --- |
| 页面 | 原 `--bg` #F7F4EE | 原 `--bg` #0E0F12 |
| 普通文字 | 原 `--text` #17191D | 原 `--text` #E8EAED |
| 普通高光 | `--accent` #3A73D9 | `--text` #E8EAED |
| 基础边线 | `--border` #858A92 | `--border` #4C5562 |
| 主操作 | 原 `--button-primary-bg` 实色及 `--button-primary-text` 反差文字 | 同一现有 Token 系统 |
| 实色主操作高光 | `--button-primary-text` | `--button-primary-text` |

已有实色主按钮 CSS 仅增加局部 `--specular-line` 映射；普通、secondary、ghost、selected 的填充与状态由原组件控制，未把全部按钮设成透明玻璃。购买按钮恢复实色主操作层级。未把 baseColor 当作背景，glow 仅控制原 shader 的柔光，不使用巨型阴影。

绘制时从装饰元素的**计算后 color/border-color** 获得 rgb 数值，再传给 uniform；不把 `var(...)` 字符串交给 Canvas 解析。主题 class 变化唤醒绘制并更新 uniform，不使用 `key={theme}`。服务端和首轮客户端均只输出同一装饰 span，所有浏览器读取在 effect/共享调度器内；不为光效重挂宿主、标签或表单。

## 性能与明确降级

这是 ONE-G 对官方光效的共享适配，**不是原版每实例一个 Canvas/WebGL 的原样部署**：

1. 指针尚未靠近、无键盘焦点时不申请 WebGL。全站最多一个离屏 WebGL2 context，依次运行同一官方 shader，将结果同步复制到最多 **4 个**按钮局部 2D canvas。键盘焦点优先，其余按距指针的距离选择。
2. 可见性使用共享 IntersectionObserver，几何变化使用共享 ResizeObserver，指针采集全站只有一组；没有每按钮 window pointermove 监听。每个绘制帧只有一个共享 RAF，插值稳定后立即停止，静止不会维持空转。
3. 离屏、hidden/inert/aria-hidden、CSS 隐藏、disabled、aria-disabled、aria-busy 的按钮不申请动态输出。页面后台停止并清理局部输出；闲置回落后 800ms 移除输出，仍保留一个可复用绘制器。全部宿主注销时释放 GL buffer、VAO、program/context 和监听/观察器。
4. 路由变化仅注册/注销装饰，宿主不因预算被替换；资源始终受 1 context/4 输出硬上限约束。DPR 上限 2。
5. 无预算的按钮始终保留主题静态边缘。未支持 WebGL2、初始化失败、2D 输出不可用或 context lost 时回退到 CSS 静态边缘，不清空文字和表单，也不改变可点击性。
6. 触屏不启用鼠标追踪，不需要点击两次。reduced-motion 下完全关闭动态资源、追踪插值和按压脉冲，保留稳定边框与独立 focus-visible。此适配所有模式均未添加原版按压脉冲。

静态边缘是 CSS 对 idle 层次的近似，资源不足、禁用、减少动画和触屏时不会呈现官方完整动态高光。原有常规边框保留，不以透明空按钮作为降级。

## 旧效果清理

已替换共享 `button-effects.css` 的 Cornerstone-04 分段描边、cssbuttons-io 缺口、clip-path 闭合、购买左侧短线与文字横移。共享 JSX 移除 `action-decoration` 和 top-key/bottom-key 三个节点。只留下用于原布局的 `action-text` 标签。

实际入口没有引用 ShimmerButton，迁移前的加入购物车等入口已通过共享 intent；因此没有叠加它的 shimmer/glow/ripple。无引用的历史 `ui/shimmer-button.tsx` 及其通用动画定义不作为本次按钮资源导入，未越界清理其它卡片/登录容器效果。

## 当前范围验收

`tests/button-effects.browser.cjs` 已替换为显式范围验收：商品页（含分类和菜单）要求零装饰、零光效 WebGL 创建，Header/Footer/Tab 无装饰；检查 Hero、详情购买、购买页禁用主操作、页面咨询和登录主提交的明确启用数量。检查真实高光输出、静止停止绘制、SPA 离开清理、语言/日夜、完整刷新、桌面 MenuToGrid/分类、390px 触屏菜单、键盘焦点、减少动画与水合错误。

`tests/button-business.browser.cjs` 保留前次的开发 Mock 业务回归脚本。本次只修正效果范围，没有改动业务处理；本次未重新启用 Mock 会话执行整套购物车/客服/管理员流程。前次业务验收不能当作本次新执行结果。

本次执行 `npm run lint`、`npx tsc --noEmit` 通过；`npm run build` 在沙箱中出现既有的 TypeScript --showConfig 输出解析错误，沙箱外重跑通过，38 个页面静态导出完成。

范围浏览器验收通过（Chromium）：

- 商品中心、展开的桌面菜单、分类 Tab：0 装饰、0 输出、0 光效 WebGL context 创建；英文夜间与刷新后仍为 0。排除控件的选择状态、点击及导航未变化。
- 首页 Hero 仅 2 个显式主操作，详情正文 2 个购买、购买页 1 个禁用主操作，解决方案/关于/深度定制页各 1 个咨询主操作，登录页仅 1 个提交主操作。均通过实例数量断言。
- 主按钮鼠标靠近真实创建局部光效 Canvas；稳定后 shader 绘制计数停止。减少动画下不绘制，键盘独立焦点框保留。点击主按钮跳转正常，SPA 离开后装饰和局部 Canvas 清理。
- 导航高亮、菜单展开、MenuToGrid/筛选、中英文、日夜圆形扩散保持。390px 触屏菜单打开、分类点击和布局通过；导航和小按钮没有光效实例，触屏没有遗留光效画布。
- 各状态无按钮下划线、无嵌套 button/a、无横向溢出，无新增水合或页面脚本错误。

实际计数见 [scope 验收 JSON](reviews/specular-scope-results.json)。当前截图：[日间主操作](images/specular-scope/hero-light.png)、[夜间主操作](images/specular-scope/hero-dark.png)、[手机首页](images/specular-scope/hero-mobile.png)、[桌面导航](images/specular-scope/navigation-light.png)、[手机导航](images/specular-scope/navigation-mobile.png)、[商品页夜间普通小按钮](images/specular-scope/products-dark.png)、[详情购买](images/specular-scope/detail-purchase.png)。`images/specular-buttons/` 与 `reviews/specular-buttons-results.json` 是前次全站范围的历史产物，不代表本次正确范围。新范围以本节及 scope 截图为准。

生产认证、真实短信/邮件、正式订单和真实付款不在本次范围；RoboDock 不可售与 SONIC Link 的方案身份保留。Firefox/Safari、实体手机/真实 GPU 本次未测试。
