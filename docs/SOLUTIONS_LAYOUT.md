# 解决方案正文布局

2026-11-03：按用户明确指定的阅读结构改造 `/solutions`，不是全站视觉升级。保持原暖白/夜间配色、字体、按钮和焦点规则。

## 结构与数据

面包屑 → 场景首屏（标题下联系我们，右侧实拍封面）→ 行内场景目录 → 遥操作 · SONIC Link → 搬运 → 巡检 → 智能任务 → 原 Footer。

`src/data/solutions.ts` 仍是唯一方案集合，稳定 ID 和集合顺序不变。`src/lib/solution-sections.ts` 仅指定本页顺序和演示 ID，引用原对象；`SolutionSections` 输出默认可读的语义化 section。原 `SolutionExplorer` 的分类、展开状态及其 CSS 已移除；不存在需要删除的共享 SolutionCard，`CardHover`、Header 图片抽屉和首页 Layout Grid 保留。

桌面正文最大宽度1280px，媒体约占55%；分区间距88px，手机52px；这些是本页实现值，不是参考站 CSS。桌面交错通过 CSS 网格定位，DOM 始终先正文后媒体；手机和768平板的智能任务恢复自然单列阅读，平板两段研究媒体并排。内容不依赖动画可见，不锁定视口高度或 body 滚动。

## 媒体与业务边界

| 使用位置 | 已有本地媒体 | 说明 |
| --- | --- | --- |
| 首屏 | `products/sonic-link/demo-motion.jpg` | 团队提供的全身动作实拍；只是封面锚点，不重复创建播放器 |
| 遥操作 | `wholebody-balance` | 来源明确链接 SONIC Link 全身方案的受控场地研究演示，不保证任意动作/场地能力 |
| 搬运 | `wholebody-pick` | 人工遥操作抓取/取放验证，不代表自主搬运交付、载荷或节拍 |
| 巡检 | 方案原有 RoboDock 概念图 | 小幅硬件规划参考，明确非巡检部署实拍、非实物照片；没有伪造巡检媒体 |
| 智能任务 | `dance-video-motion`、`music-motion` | 分别为实机相关研究与仿真研究，不承诺通用自主任务或算法交付 |

所有素材已在 [来源清单](media-sources.md) 与 `src/data/media-sources.json` 登记。本轮只补全全身平衡演示的本页 placement，不下载、生成或修改媒体文件。`EvidenceVideos` 的 feature 布局放大本页媒体，保留 controls、preload=none、完整画面、错误重试和第二段播放暂停第一段；默认详情页网格不变。

SONIC Link 仍只有 `/solutions/teleoperation` 独立详情入口；其余正文直接呈现，不制造空“查看方案”动作。本页“联系我们”仍使用 `SupportButton`/`ContactProvider`：未登录按安全 returnTo 登录，已登录填写与预览，不发送需求。首屏简短说明登录前提和当前预览边界，未改变认证、地区、验证码或接口规则。

## 兼容与导航

- `#teleoperation`、`#handling`、`#inspection`、`#ai` 是真实 section ID。旧 `#solution-ID` 正文 ID 作为标题 ID 保留。
- 目录是原生链接。`scroll-margin-top` 读取现有 `--site-header-height`，没有新增滚动监听、过滤、平滑滚动依赖或 ScrollSpy。
- 当前源码及历史实现没有查询参数展开解析；没有猜造新查询协议。无关有效参数保留，无效锚点不隐藏方案内容。直接刷新、历史返回与新标签使用同一份已显示正文。
- Header、首页、搜索和 Footer 的方案链接仍由原集合派生，未重新分类或改写导航结构。

## 验收边界

基线为13个 Node测试文件，新增方案契约文件后为14个。专项浏览器脚本为 `tests/solutions-layout.browser.mjs`，使用项目既有外部 Playwright，可指定唯一证据根；不安装另一套框架。完整结果、失败过程、实际覆盖、独立评审及未完成项记录在 [代码整合审计](code-integration-audit.md) 的本轮章节。

参考链接的文档响应可取得，但实际浏览器被人机验证页阻挡；只学习已取得的内容组织，不声称完整查看或复刻其视觉、动效。未使用参考站素材、品牌、客户数据或能力陈述。
