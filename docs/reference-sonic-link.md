# SONIC Link 只读参考审计

日期：2026-09-17；来源：[xuanqisun/sonic-link-demo](https://github.com/xuanqisun/sonic-link-demo)。

独立目录：`/tmp/one-g-reference/sonic-link-demo`。
初始 HEAD：`d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`；初始 `git status --porcelain` 为空。

## 技术与授权

dist/index.html + 原生 dist/app.js + styles.css/teleoperation.css，无 React、TypeScript、package.json、依赖安装或构建步骤。Node assert/vm 测试模拟 DOM；github-pages.mjs 管理部署，main/gh-pages 分离。所有这些文件只读，本轮没有执行管理脚本或测试。

未发现 LICENSE/COPYING/NOTICE；README 素材段说明照片和截图由团队提供、Logo 沿用公司矢量标识，未明确授予跨仓库复制许可。源码不直接搬运，资产暂不复制。来源说明保留在本文件及资产清单。

## 产品与状态

依据：README「方案内容」、dist/index.html 的 solution/software/delivery/configuration-form、dist/app.js 的 bundles、currentBundle 与 requestedBundle，以及 tests/teleoperation.test.mjs。

产品是面向宇树 G1 的遥操作软硬件方案：PICO 采集硬件 + 对应模式 SONIC Link 软件 + 通用小背包，夹爪可选。不包含机器人本体。不是主站里的通用 AI 功能包，也不是这个网页直接控制真实机器人。

源码明确：三点、全身遥操是两项已有技术；网站仍为方案展示，暂未开放下单，价格与交付条件待确认。建议在 ONE-G 以 `coming-soon` 表示未开放销售，另用产品元数据展示“方案预览 / 已有遥操技术”；不要标为 active，也不要误称三点技术还在概念开发。这个枚举映射是审计建议，不是源码已有字段。

适用目标是宇树 G1，需确认 EDU 版本与二次开发权限；G1+ 适配待确认。运行电脑/网络/部署环境没有正式规格，不能从 Linux 风格的软件截图推导支持 Windows/macOS/Linux 全平台，不能宣称支持任意机器人或其他头显。

## 真实套餐及选择规则

| 源 key | 软件模式 | 随包硬件 |
| --- | --- | --- |
| three（默认） | 仅三点 | PICO 头显 1、手柄 2、通用小背包；不含脚环 |
| full | 仅全身，不含三点 | PICO 头显 1、手柄 2、脚环 2、通用小背包 |
| dual | 三点 + 全身 | 共用 PICO 头显 1、手柄 2、脚环 2、通用小背包，不重复计算 |

所有套餐有独立、默认关闭的智元夹爪 checkbox；可随时取消，切换套餐保留选配状态。夹爪型号与数量待确认。不加购时沿用 G1 自带橡胶手，不额外交付橡胶手，也不把固定橡胶手描述为主动抓取执行器。

URL `?bundle=three|full|dual` 预选对应套餐，无值/非法值回退 three；预选不锁定套餐、不自动加购夹爪。三套餐 × 夹爪开关共六种当前展示组合，tests 源码对此有覆盖。

三点用户后续升级路径：保留原三点能力，解锁全身软件并另获 2 个脚环，继续使用已有头显、手柄、小背包。该升级不是首次配置的默认项，价格/办理方式未定，先放产品详情，不伪造第四个现售套餐。

sonicLinkSchema 建议：一个必选单选 PACKAGE 组（three/full/dual），一个可选 ADD-ON 组（智元夹爪，选择基数 0..1）。价格均未知，允许预览、不允许加入购物车。不要把校准、启动、截图、性能说明、GEM 变成配置选项。

## 软件能力与未确认项

页面描述了环境/连接检查、PICO 采样与机器人状态确认、人体校准、人工确认后启动遥操。仅是产品介绍和历史界面截图；检查记录不等于实时机器人在线状态。

没有确认的延迟、频率、精度、运行电脑规格、具体 PICO 型号、夹爪数量、软件许可期限、售后范围、交期。不能补写数值或承诺。GEM 明确不在本方案范围内。

## 页面与视觉交互

结构：方案预览状态条 → Demo Header / 面包屑 → 四图 gallery → 三个特点 → 方案组成 → 软件介绍与截图 → 交付说明 → 右侧套餐与夹爪选择 → 清单 dialog / 图片 dialog → Footer。

桌面采用详情页面滚动 + sticky 面板独立滚动，801px 开始；移动端纵向浏览。图集切换同步 alt/caption/计数/aria-pressed；放大弹窗同步当前图，支持关闭与点遮罩关闭。

视觉可参考现场图片、软件截图和设备清单的区分。两张实拍使用 16:9 居中 cover 隐藏原图黑边，CSS brightness(1.2) contrast(1.02)，缩略图/大图一致；硬件图与软件截图不提亮，原文件不重绘。未来在 ONE-G 独立实现并纳入主题、焦点和 reduced-motion 规则。

没有视频文件或 video/iframe 播放器；Demo 内容是两张静态实拍，不能写成已迁入视频。没有可直接复用的 React 组件，不能搬 Header/Footer/global CSS。

## 资产清单

| dist/assets/ 文件 | 尺寸 | 来源与语义 |
| --- | --- | --- |
| demo-grasp.jpg | 2400×1080 | 团队提供，抓取使用示例；不代表全部动作可复现 |
| demo-motion.jpg | 2400×1080 | 团队提供，全身动作使用示例 |
| pico-kit.jpg | 4000×3000 | 团队提供，头显与两个手柄实拍；图中未展示脚环 |
| sonic-link-console.png | 3374×1418 | 团队提供，早期软件界面，三点待开发为历史标注 |
| one-g-logo.svg / one-g-symbol.svg | SVG | 旧 Demo 标识不迁入 |

获明确使用许可后，四张产品图片才复制到 public/products/sonic-link。早期截图内含旧品牌和历史状态，作为历史产品证据保留说明，不把其中 Logo 用作 ONE-G 页面品牌组件。资产 SHA-256 见 audit-baseline.json。

## 来源冲突的处理

robotdock-demo 的 dist/teleoperation/index.html:71 与其 README 称三点仍待开发；独立仓库 dist/index.html:60–71、README 及 tests 则明确两模式已有技术，并解释截图历史标注。后续以本独立仓库固定 HEAD 为 SONIC 事实来源，保留历史说明；本次没有修改旧参考页面使它们“同步”。

最终状态见 [reference-integration.md](./reference-integration.md)。
