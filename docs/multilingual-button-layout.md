# 多语言按钮布局补充（2026-10-29）

## 范围与基线

只修改 ONE-G 的按钮和现有操作栏布局，不实施 Props/商品模型重构，不新增语言、UI 库或正式服务。视频依据仅为用户摘要，未取得正文或字幕，本文不是视频作者原话或教程复现。

开始时 `git status --short`、`git diff --stat` 均为空；初始完整 diff 保存于 `/tmp/one-layout-initial.diff`。没有提交、推送或修改参考仓库。

正式按钮入口为 `LButton`、`LocalizedLink`、`LA` 与 `ProtectedLink`/`NavigationLink`，继续复用 `actionPresentation` 和 `button-effects.css`。项目没有独立标准 Button/ButtonLink，没有新增第二套；历史 ShimmerButton 不作为迁移入口。ProductCard 已存在，仅调整其操作链接 CSS。

## 复现与修复

长标签通过浏览器临时改写文本节点测试，没有写入词典。初测为反复带空格的英文加连续长词，不能把其比例等同真实翻译。正式中英文在 320 CSS px 下未复现这些页面的横向溢出，压力问题单独记录。

| 页面 / 控件 | 复现与观测 | 原因与最小修复 |
| --- | --- | --- |
| 登录、注册 / 验证码、密码显示、方式按钮 | 320px，中英文底稿注入长标签。初测注册页宽分别达到 1313/1304px，登录页 1401px；英文验证码按钮约 1259px | `auto` 网格轨道被 `nowrap` 状态预留标签撑大。验证码/密码行采用可换行 Flex，输入保留 8rem 弹性基准，操作受行宽约束。预留标签仍叠放但允许换行/断词。方式及确认网格用 `minmax(0,1fr)`，同时定义文本换行 |
| 购物车空态 / 开始配置、浏览商品 | 320px 长标签初测页面宽中文 811px、英文 841px；按钮约 1361px 且固定高 44px | 去除这两个按钮的固定高度、不收缩、不换行及按钮组桌面强制不换行；保留最小高度、字号、圆角和横向内边距，增加多行所需纵向内边距 |
| RoboDock 购买 / 禁用加购、深度定制 | 连续长词在 280px 按钮中产生约 782px 内容宽，伸出边框 | 共享反色标签允许正常换行及 `overflow-wrap:anywhere`，图标不收缩；定制链接受所属容器约束 |
| 首页 / 查看全部链接、暂停动画 | 320/390px，连续长词令页面宽约 489/575px；3 倍英文标签挤压暂停图标 | 首页预览标题区链接允许断词；暂停控件只增加所属场景的宽度约束、断词和图标保护，不改拼贴或展开动画 |
| 商品中心 / 详情与购买链接 | 四档视口下连续长词 | 仅在 ProductCard 操作链接增加可收缩、容器约束和断词；装饰箭头不收缩。没有迁移数据或改变卡片 DOM/业务 |
| G1 详情 / 返回商品中心、加购 | 返回链接长词撑宽页面，箭头会被长标签挤压 | 返回链接局部断词与宽度约束；加购外层允许收缩，按钮取消自身 `nowrap`，共享标签内图标保持尺寸 |
| 深度定制 / 返回购买 | 320px，连续测试词使链接宽约 558px、右边缘约 578px | 仅对本页 header 的操作链接允许断词，安全返回地址构建不变 |
| 需求预览 / 表头关闭、预览、返回编辑等 | 弹窗长标签及连续词压力测试 | 表头可重新排列，弹窗按钮受所属容器约束并允许断词；显式客服按钮允许多行，图标保持尺寸；不全局移除弹窗滚动或媒体裁切 |

未缩小字号、缩放文字、隐藏关键标签、运行时截断或新增紧凑译文，正式词典无变化。导航栏目、方形图标尺寸与移动导航结构保持。

## 操作栏空间

购物车以合计为辅助区（弹性基准 8rem），主操作占剩余空间（基准 11rem），间隙 16px；空间不足自然分行。合计不再受单行限制，金额、币种及重要状态不省略。checkout 只有现有主操作，不添加辅助控件。

`CheckoutBar` 只包装两处已有栏，透传 DOM props/children，不承载金额、登录、购物车或支付逻辑。ResizeObserver 读取真实高度，在页面末尾为移动固定栏预留同高滚动空间，包含原安全区内边距；字体、标签和视口变化后同步。将 footer 原先硬编码的 88px 补偿替换为实际栏高，使正文和页脚最后一项都可滚到栏上方。桌面不占额外空白，保留其它移动控件补偿和原有页面滚动。

## 语义、状态与动画

真实 Link、button type、disabled、aria、ref、点击/提交处理不变。继续使用 200ms 颜色反转、尺寸不变的内描边、键盘焦点和减弱动态效果规则，未恢复 Specular 或旧边框动画。

验证码三种预留标签和一个可见标签仍叠放；隐藏预留不被朗读，数字保持 `tabular-nums`。输入/发送行可重新排列，倒计时宽度预留没有取消。

商品名称、图片、状态、价格、稳定 ID、selector、路由构建、认证/地区规则、Provider、服务端/客户端边界没有变化。未改 GSAP Flip、Layout Grid、MenuToGrid、卡片上浮的 JS、ref、key、动画 ID 或事件层级。

## 测试与限制

`tests/multilingual-layout.browser.cjs` 通过临时浏览器扩展的 `chrome.tabs.setZoom` 设置真实 100%/200% 缩放，并等待 `innerWidth`/DPR 确认。布局宽为 **320/390/768/1440 CSS px**；200% 时测试视口设置为对应两倍像素宽。没有用 CSS zoom 或文字缩放替代浏览器缩放。

另外探测 **320/390 物理像素窗口在 200% 下的 160/195 CSS px**：现有导航图标区最低约 252px，仍会横向溢出。为遵守保留移动导航结构和图标点击尺寸的要求，本轮没有重排或隐藏工具。因此不能宣称所有物理窗口与缩放组合均已无溢出。

矩阵覆盖登录、注册、空购物车、含历史不可购买项的购物车、结算、RoboDock 购买、商品中心、G1 详情、需求弹窗、首页展开；中英文、日夜、默认、模拟 loading/disabled、原标签约 2/3 倍、带空格长标签、连续长词、泰语/越南语/阿拉伯语附加符号。阿拉伯语样本只给操作控件局部 `dir=rtl`，不翻转 Logo、图片、金额和邮箱。

压力改写保留文本节点、DOM 和原事件，不用 innerHTML 重建表单；装饰箭头/SVG 不改为长标签。逐行检查文本矩形、按钮 scroll 尺寸、页面横向尺寸、弹窗横向裁切、图标宽度和底栏占位。行框断言不等于所有操作系统的像素级字形覆盖，另结合截图及实际字体核对。

实际字体：泰语使用系统 **Loma** 回退，越南语使用现有 **Inter Variable**，阿拉伯语使用系统 **DejaVu Sans** 回退；由 CDP 实际 glyph 使用记录确认，没有安装字体或用缺字方框当作通过。局部 RTL/字形样本不代表正式支持这些语言，未覆盖完整 RTL 页面、所有输入类型、任务步骤、媒体或任务进度方向。

## 执行结果

- 最终布局矩阵：**2880 项，0 布局失败，0 捕获到的运行时/hydration 错误**，覆盖上述 320 CSS px 起的范围。
- 现有 `registration-flow.browser.cjs`：通过。覆盖地区必填/例外、人机门槛、验证码与邮箱变更、注册不自动登录、离页/历史保护、切换主题/语言保留表单、密码/验证码同一 ID、购买参数恢复、内存账号刷新失效与管理员隔离。
- 现有 `product-filter-flip.browser.cjs`：通过。覆盖筛选顺序、稳定 ID、快速切换、resize、history、touch、reduced motion、购买链接和干净样式；无 hydration/GSAP 错误。
- 当前样式检查：8 组中英文/日夜/390及1440px 通过，验证 200ms 颜色反转、hover 边框/尺寸稳定、禁用不反色、真实 Link/Enter 跳转、购物车金额及随栏高更新的滚动留白。
- 输入框补测：泰语、越南语、阿拉伯语样本实测字形高 17/16/22px，均低于现有 42px 可用高度；结合附加符号按钮截图未见裁字。
- 最终 lint、独立 `tsc --noEmit`、11 份现有单元/集成测试、生产 build：均通过，静态生成 38 页；`git diff --check` 通过。
- 旧 `button-effects.browser.cjs`：历史快照仍要求 Arial/Helvetica，本轮前项目已使用 Inter/Noto，其字体断言失败。未改字体或重写历史基线来消除失败，当前实际反色/边框另行检查。
- 注册浏览器首跑在账户步骤超时；构建结束后单独重跑通过。未把失败首跑记作通过；内存演示账号会受页面重载影响。

结果见 [矩阵摘要](reviews/multilingual-layout/matrix-summary.json)。截图：[注册长词](reviews/multilingual-layout/register-word.png)、[购物车 200%](reviews/multilingual-layout/cart-word-200.png)、[首页展开](reviews/multilingual-layout/home-word.png)、[需求弹窗](reviews/multilingual-layout/contact-word.png)、[泰语](reviews/multilingual-layout/glyph-thai.png)、[越南语](reviews/multilingual-layout/glyph-vietnamese.png)、[局部 RTL](reviews/multilingual-layout/glyph-arabic.png)。详细临时原始记录为 `/tmp/one-multilingual-layout/results.json`。

复测（Playwright 仅装于临时目录，项目依赖未改）：

```bash
ONE_G_PLAYWRIGHT=/tmp/one-layout-tools/node_modules/playwright-core \
ONE_G_BROWSER=/home/lsh/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
node tests/multilingual-layout.browser.cjs
npm run lint
./node_modules/.bin/tsc --noEmit
node --test tests/*.test.mjs tests/*.test.cjs
npm run build
```

业务回归使用显式 Mock 开发服务；生产 build 仍禁用 Mock。模拟 loading/disabled 布局与真实注册/验证码流程分别验证，不等同真实邮件、认证、支付或发货。

交付时已停止测试用 Mock 开发进程，恢复普通 `npm run dev`，地址为 `http://localhost:3000/one-g/`。
