# ONE-G 完整线条勾勒验收

> 附件范围：本记录引用的截图、JSON采样和临时测试脚本保留在本地，未纳入本次GitHub提交。

2026-10-30；main，基线提交 `8fc2cf82e86b11d912bd99a68580877258779acc`。以本轮开始的本地工作树为准，原有修改保留。最新用户要求将实施范围限定为Logo动画，因此本轮保留既有路由高亮与导航实现，不改其它页面，不提交或推送。

## Skills及原始结构分析

实际读取：Hairline Adopt `/home/lsh/.agents/skills/hairline-adopt/SKILL.md` 及其Create的源图分析步骤；Oil UI Pro `/home/lsh/.agents/skills/oil-ui-pro/SKILL.md`；VibeHub `/home/lsh/.codex/skills/vibehub/SKILL.md`。

Hairline的默认建模会重构几何。本轮按用户的品牌保护要求，只使用其官方read.mjs分析步骤，最终采用正式SVG独立描边层，没有生成替代商标或引入Hairline运行时。工具临时副本仅适配到已安装的Chromium启动路径，Skill安装内容未改。

正式来源：

- 桌面 `public/brand/one-g-horizontal.svg`，viewBox `98 545 1222 328`；手机 `public/brand/one-g-symbol.svg`，viewBox `189 191 1040 1040`。
- 两者均是fill路径；圆标外圆及内部G负形是同一条compound path里的两个闭合子路径，并非独立线稿。
- Hairline测量：横版圆标外形约323×323，内负形约180×184；手机圆标外形约1034×1034，内负形约577×589。源图/测量卡见 `hairline-*-source.*`。横版源图工具渲染存在局部裁边；几何判断同时核对了viewBox、测量卡、源文件与实际Header画面，没有据此修改正式资产。
- ONE-G与万机智能都是原有轮廓路径，不依赖网页字体排版。文字保留原路径及位置；英文6条路径、中文4条compound路径。
- 未发现独立的机械细节。所谓内部细节是原G路径右侧回折和收尾曲线，没有新增装饰线、齿轮或缺口。

## 实现及精确性

修改：`HeaderLogo.tsx`、`HeaderLogo.module.css`、`header-logo-paths.ts`、`tests/header-logo-paths.test.mjs`，以及导航说明中的Logo段落和本目录证据。

原始SVG和BrandLogo静态组件不变。仅在原内部路径的命令边界拆为主曲线、右侧连接、收尾三段：保留原相对曲线参数，新段起点换为该位置的精确绝对M；闭合段按原起点连接。没有拟合、采样重画、变形或更换商标。

单测把原路径与三段转换为绝对曲线/直线命令，逐项比较控制点和端点完全一致；同时检查原始外圆、填充、所有文字及viewBox。浏览器另比较三段长度之和与原内部路径长度，差异小于0.1原SVG单位，详见 `phase-checks.json`。

动画层绝对覆盖在原槽位，沿用原viewBox，overflow:hidden，不参与布局、不接受指针。最终移除SVG层，显示原始蒙版；正式比例、颜色、字体轮廓和间距均保留。

## 时序（毫秒）

| 内容 | 起止 | 方式 |
| --- | --- | --- |
| 圆形外轮廓 | 0～500 | stroke-dashoffset 1→0 |
| 内部G主要曲线 | 500～950 | 独立描边450ms |
| 右侧连接 | 580～930 | 原路径描边350ms |
| 收尾细节 | 660～1010 | 原路径描边350ms；与前一段错开80ms |
| 完整线稿停留 | 1010～1160 | 所有线条可见，填充仍透明 |
| 原填充接替 | 1160～1240 | 原compound path淡入80ms |
| ONE-G | 1240～1540 | 原字形淡入300ms |
| 万机智能 | 1400～1700 | 原字形随后淡入300ms |

总时长1700ms；文字整体阶段460ms，英文和中文略有交叠。1240ms后隐藏描边，1700ms卸载全部临时层。1900ms保护计时器在正常结束/取消时清理；没有持续RAF、循环或常驻绘制。

首播Document WeakSet、精确鼠标hover、键盘focus-visible、触屏不模拟hover等既有触发沿用。首播未完成不叠加；离开、失焦、点击、文档隐藏、减少动画时恢复静态。卸载清理必要监听。

## 实际检查

- `npm run lint`：通过。
- `./node_modules/.bin/tsc --noEmit --incremental false`：通过。
- `node --test tests/header-logo-paths.test.mjs`：原始路径及新分段一致性通过。
- `npm run build`：在 `/tmp/one-logo-complete-build` 当前源码副本构建，不复制.env，不安装依赖；成功静态导出38页，最终构建源码与正式工作树匹配。
- Chromium生产产物，本机3019：首播、刷新、悬停3轮、快速进出5轮、Tab、动画中点击回首页通过；普通路由重挂载、语言/日夜、MenuToGrid/分类不重播。桌面/手机尺寸稳定，终态与原静态蒙版截图像素一致。`checks.json`。
- 14次阶段检查：日夜各250/550/630/820/1080/1350/1530ms。验证真实dashoffset逐段变化、后段延迟、填充未提前遮挡、英文先于中文。1080ms时三个内部offset均为0而fill opacity为0，证明不是内部整体淡入。`phase-checks.json`。
- 单一Header首页可访问名称、结束后Logo getAnimations为空、无JS静态可见、实际CSS总时长1.7s：通过。`extra-checks.json`。
- 390px移动触屏模拟、首次/动态减少动画、6倍CPU限速最终回到静态通过。没有真实手机或全设备性能保证。

阶段检查最初把浏览器带px的dashoffset交给Number，产生NaN断言失败；改用parseFloat后通过。没有为迎合测试修改动画。未捕获页面异常不代表已完成所有浏览器兼容认证。

## 视觉检查与交付

Oil UI Pro两类检查分开：主Agent实际查看正式源图、完整线稿、日夜阶段及导航截图；独立单组件静态评审见 `visual-review.md`，9/10、无阻断项，未把静态评分当作时序或性能结论。没有新增方向、机械装饰或大规模重设计。

- `desktop-header-light.png`、`desktop-header-dark-en.png`：桌面整体。
- `mobile-light.png`、`mobile-dark-en.png`：390px手机整体。
- `phase-light-*-2x.png`、`phase-dark-*-2x.png`：2倍阶段图；截图时仅暂停Logo CSS动画，不改生产逻辑。
- `hover.webm`：约5.5秒悬停浏览器画面，按实际时间采样成10fps展示，不是GPU/帧率基准测试。

本轮不修改正式设计规范；现有方向由用户指定，删减为仅保留原图形、必要路径分段和淡入，不添加额外标签/光效。当前导航、全宽/高度、透明背景/回退、共享高亮、菜单与抽屉的实现及数据均保持本轮起点内容。完整性见 `integrity.json`。

## 通俗解释（VibeHub整理）

SVG路径是用起点、坐标和曲线控制点描述轮廓的指令。本次沿用原商标指令。

stroke-dasharray规定“实线一段、空白一段”的长度；本次把pathLength归一为1，使整条路径成为一段可控制的长线。

stroke-dashoffset规定这段虚线从哪里开始。把偏移从1逐渐降到0，就能让整条线从隐藏变为完整；不同路径安排不同延迟，于是先画外圆，再画G的主轮廓、连接与收尾。填充在勾勒完成之后才接替，最后显示文字。

VibeHub解析器已查询上述三个术语，但未返回可靠词条；因此没有编造词条链接。
