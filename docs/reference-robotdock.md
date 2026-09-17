# RobotDock 只读参考审计

日期：2026-09-17；来源：[xuanqisun/robotdock-demo](https://github.com/xuanqisun/robotdock-demo)。

独立目录：`/tmp/one-g-reference/robotdock-demo`。
初始 HEAD：`218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`；初始 `git status --porcelain` 为空。

## 技术、授权与来源边界

仓库为原生 HTML / CSS / JavaScript 静态页面，dist 是实际页面源码。无 package.json、lockfile、React、TypeScript、构建框架或模块组件系统；Node .mjs 仅用于测试和 GitHub Pages 管理。main 存源码，gh-pages 发布 dist；本轮未执行这些脚本。

检查 tracked 文件名、README、页面/脚本/CSS/SVG 文件头，未发现 LICENSE/COPYING/NOTICE 或明确代码复用许可。README 记录图片来源，但这不等于明确的跨仓库使用授权。仅形成事实摘要和独立实现建议，源码和图片均未复制入 ONE-G。

## 产品事实

证据：README「内容边界」「图片」、dist/index.html 的 details、compatibility、specifications、configuration-form，以及 dist/app.js 的 bundles/views。

RobotDock 是通用机器人电子小背包/拓展坞的暂定展示名称，规划集中供电管理、通信接入和设备驱动，配合线束与腕部连接件接入外设。它不是完整机器人，也不是已量产确认的通用兼容设备。

状态为概念预览、内部方案讨论、未开放销售；价格、型号、交期未定。适合在 ONE-G 映射 `status: concept`、不设置 price、只提供配置预览。此状态映射为集成建议，参考仓库自身没有 Product 枚举。

| 内容 | 源码事实与必须保留的限定 |
| --- | --- |
| 本体 | 宇树 G1 是首发适配目标，具体版本待确认；G1+ 适配尚待验证 |
| 智元夹爪 | 团队已有接入基础，型号待确认；接通过不代表量产验证 |
| 灵巧手 | 品牌、型号、控制功能仍待选定 |
| 通信接口 | CAN / RS-485 / Ethernet / USB 是拟定方案，数量和电气规格未定 |
| 软件接口 | ROS 2 / DDS / Python SDK 为规划支持 |
| 电源 | 集中供电与保护为规划，电压/功率/取电方式未确认 |
| 安装 | 背部安装、专用线束、手腕转接件 |
| 换装 | 规划外设独立断电、暂停任务并安全停稳后换装、加载配置；分路供电与热插拔能力待验证 |
| 尺寸重量 | 等结构设计和样机验证后公布，无可移植数值 |
| 本体交付 | 套装不包含机器人本体 |

不从概念图接口外观推导数量/电气参数，不把即插即用设计目标表述成任意外设兼容或带电热插拔。

## 页面与交互

页面顺序：概念状态条 → Demo Header → breadcrumb → 图集 → 三项设计重点 → 产品介绍 → 兼容规划 → 规格 → 右侧套装/清单 → Footer。桌面为详情页面滚动与 sticky 选购面板内部滚动，801px 起启用；移动端图集、选购、介绍纵向排列。

图集有概念图、原始安装草图、HTML/CSS 接口架构图三种视图。套装 radio 切换更新标题、说明、清单；提交仅打开 dialog，不支付、不下单。键盘焦点、aria-pressed、aria-live、reduced-motion 已有实现思路可参考。

CSS 使用 :root、html/body/*、全局 h1/dialog 等规则及自有青灰色 tokens，不能整体引入 ONE-G。JS 用 bundles/views 对象和 DOM 事件直接修改页面，迁入时以 ONE-G TS 数据、React state、CSS Modules 独立实现。

## 可配置内容：仅四档套装

| 源 key | 套装 | 实际清单 |
| --- | --- | --- |
| base | 小背包，默认 | 主机、基础软件与说明、本体连接线束 |
| hand | 小背包 + 灵巧手 | 主机、待选型灵巧手、专用线束、赠送连接件、对应驱动与安装说明 |
| gripper | 小背包 + 夹爪 | 主机、待定型号夹爪、专用线束、赠送连接件、对应驱动与安装说明 |
| gripper-camera | 小背包 + 夹爪 + 双腕相机 | 主机、待定型号夹爪、两台待定型号腕部相机、专用线束、赠送连接件、对应驱动与安装说明 |

robotDockSchema 建议只有一个必选单选 PACKAGE/BUNDLE 组，默认 base，保留以上稳定 key；预览可选择但不可购买，所有价格未知。兼容说明作为待验证的产品信息；源没有可执行兼容矩阵，不创造跨设备规则。不添加独立机械臂、AI、算力、相机品牌等选项。

## 资产

| 源文件（dist/assets/） | 尺寸 | README 来源与使用边界 |
| --- | --- | --- |
| robotdock-concept.png | 1254×1254 | image_gen 根据团队草图生成；必须标记 AI 概念效果图，不能作为实物证明 |
| design-sketch.png | 946×1208 | 用户提供的安装参考草图，非最终本体适配图 |
| one-g-logo.svg / one-g-symbol.svg | SVG | Demo 原版旧品牌标识；不迁入，使用 ONE-G 当前 BrandLogo |

接口架构是 DOM/CSS 图，不是独立 SVG；未发现产品视频、CAD 或 exploded-view 素材。图片尺寸和 SHA-256 见 audit-baseline.json。候选目标目录 public/products/robotdock 当前未创建；待明确使用许可再复制并记录来源。

## 同仓库旧 SONIC 子页

dist/teleoperation 是旧 SONIC 展示：基础完整方案配可选夹爪，三点/GEM 被描述为待开发。它与独立 sonic-link-demo 的现状有冲突，不作为 SONIC 当前配置或状态来源。只作为历史证据，详见 [reference-sonic-link.md](./reference-sonic-link.md)。

参考 tests/purchase-panel.test.mjs、tests/teleoperation.test.mjs 的源码了解既有行为约束，未执行测试或构建。最终状态在 [reference-integration.md](./reference-integration.md) 汇总。
