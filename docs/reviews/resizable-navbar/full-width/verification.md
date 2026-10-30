# ONE-G 全宽导航验收

> 附件范围：本记录引用的截图、JSON采样和临时测试脚本保留在本地，未纳入本次GitHub提交。

日期：2026-10-30。基线：main，`8fc2cf82e86b11d912bd99a68580877258779acc`，以本地工作树为准。开始时已有 README、导航文档、Header、图片菜单及产品样式等未提交修改；本轮保留。没有暂存、提交、推送、安装依赖或修改参考仓库。

## 范围与实现

使用本机 Oil UI Pro 0.27.1（`/home/lsh/.agents/skills/oil-ui-pro/SKILL.md`）检查真实截图、层级与响应式；VibeHub（`/home/lsh/.codex/skills/vibehub/SKILL.md`）整理边界。目标是清晰、稳定的全宽品牌导航，保留当前图片抽屉与业务入口，不探索全站新风格。

复用既有 `src/components/ui/resizable-navbar.tsx` 的 Navbar、NavBody、NavItems、NavbarLogo、MobileNavToggle；没有替换 Header、引入 MobileNavMenu 或第二套状态。修改现有三文件：

- `src/components/HeaderBrand.module.css`：根及内部行全宽、max-width:none、无胶囊圆角；桌面左右24～56px、移动16px并考虑安全区域。桌面三段式，移动沿用原功能分布。工具触控高度44px，Logo28px/图标18px不放大。
- `src/app/colors.css`：只更新导航高度变量，桌面68px、≤1023px为56px，加顶部safe-area；既有正文占位与锚点自动共用。抽屉gutter变量不改。
- `src/components/ui/resizable-navbar.tsx`：保留原100px被动滚动订阅，订阅表面模式并写data属性；不改变路由和面板事件。

新增 `src/components/ui/navbar-surface.ts` 与 `tests/navbar-surface.test.mjs`。导航文档同步；截图与脱敏记录仅放本目录。完整性结果见 `integrity.json`。

## 表面、降级与层级

背景伪元素使用现有主题RGB，顶部alpha0.90、滚动0.96，背景和轻阴影220ms过渡；标准及webkit backdrop-filter均为12px。滚动不改变高度、Logo/工具坐标或transform，文字和图标整体opacity为1。

SSR/初次水合/无JS默认不透明主题色。检测 `CSS.supports("backdrop-filter", "blur(1px)")`；不支持、减少透明、减少动画或saveData启用时回退纯色。仅当可用内存提示≤2GB且线程提示≤2时保守回退；单独少线程、缺失或无效提示不降级。不做UA判断、每帧性能采样或动态压力测试；偏好与连接监听有卸载清理。CSS亦处理减少透明和动画偏好。

这些可选信号是近似提示，不证明实际硬件性能。参考 [deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory)、[hardwareConcurrency](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency)、[saveData](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)、[减少透明偏好](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency)。

保留已有z-index 50，模糊仅施加背景伪元素，没有给浮层祖先加filter。原生dialog仍在浏览器顶层；没有以极大z-index掩盖问题。现有用户入口为页面链接，没有凭空新增/宣称验证用户下拉菜单。

## 实际验证

命令均在隔离/本机环境执行，无真实账号、支付或正式消息。

| 检查 | 结果 |
| --- | --- |
| `npm run lint` | 通过 |
| `./node_modules/.bin/tsc --noEmit --incremental false` | 通过 |
| `node --test tests/navbar-surface.test.mjs tests/i18n-dictionary.test.cjs tests/route-preference.test.mjs tests/invert-actions.test.cjs` | 10/10通过，含降级选择、动态通知与清理 |
| `npm run build` | 独立完整源码副本 `/tmp/one-navbar-fullwidth/build`，不复制.env，复用本机依赖，静态导出38页成功 |
| Chromium生产静态产物 | 本机3014，`/one-g/`路径，非远端版本；矩阵16/16通过 |

浏览器矩阵 `matrix.json`：390、768、1440、1920 × 日/夜 × 中/英文，均验证根和内部行全宽、无横溢出、正常12px模糊、滚动前后位置稳定、搜索不被导航遮挡、图片抽屉9入口与关闭命中、主题切换不重建Header。亲自查看宽屏日间顶部、手机夜间英文抽屉及纯色回退截图。`top-*`、`scroll-*`、`drawer-*`为对应真实画面。

`fallbacks.json`：8条件×2主题，16/16通过。包含正常、不支持blur、减少透明、减少动画、省流量、组合低资源、单独少线程、缺失提示；降级时纯色、不模糊且布局/点击不变。偏好动态更新亦验证。`dynamic-preference-*`截图是正常用例随后动态启用减少透明的最终画面，并非默认blur截图；正常blur见矩阵顶部图。

`interactions.json`：真实精确指针悬停/共享滑块/离开关闭、快速操作最后状态、主题转换时点击、文字与图片直接跳转、前进后退、页底固定各3轮通过；首页标题未被遮挡，exceptions为空。

`touch.json`：模拟粗指针无hover触屏3轮，开关/分类/图片跳转通过，关闭无遗留滚动锁，语言主题与刷新持久化通过。手机端账户沿用现有移动导航入口，没有新增第二套状态。

`layers-performance.json`：原生注册离页确认对话框覆盖导航且无点击穿透，关闭后恢复点击；首页实际产品预览遮罩与搜索可同时出现。6倍CPU限速正常blur时滚动至1200px、顶部保持0且搜索可用，但记录一次187ms长任务，不能声称所有低性能设备不卡顿，也不能据此把长任务归因于导航。`cpu-solid.json`：6倍CPU加组合低资源提示，纯色模式、滚动/菜单正常，此次无长任务；并非严格性能对照基准。

## 保留与限制

Header、HeaderPanel、HeaderImageMenu及其CSS、共享滑动高亮、主题/语言Provider、商品/方案/导航数据和图片路径均与本轮开始时一致。MenuToGrid抽屉没有被替换，布局、图片数量、分类、Flip及展开关闭动画未改；按钮延续上一轮样式，本轮没有改抽屉按钮。RoboDock仍为商品、SONIC Link仍为方案。没有业务页面、依赖、数据库或部署修改。

未使用真实低性能手机、真实刘海设备、Safari或Firefox。安全区域CDP命令不可用，env规则已实现但真机效果未验证。CPU/触屏/资源提示均为模拟，不是硬件测量。不支持blur场景以启动前能力检测模拟，不等于测试了全部旧浏览器。截图可确认当前画面，但不等于全背景全设备可读性认证。没有测试不存在的用户下拉菜单或真实登录后端。

早期测试记录 `*-initial.json`、`matrix-tool-error.json`、`layers-tool-error.json`、`matrix-panel-transition.json` 保留以供追溯：包括冷启动超时/通用异常、测试表达式序列化、旧选择器及面板动画未结束就取坐标。修正测试工具与等待条件后使用最终JSON复验；没有通过改产品动画来迎合测试。冷启动通用异常根因未确认，后续生产矩阵与交互检查未捕获异常。
