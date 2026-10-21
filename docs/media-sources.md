# 媒体来源与内容整合审计

读取日期：2026-10-21。目标：`l-s-hao/one-g`，基线提交 `0bae3782cb7a0614e071fc5a2022b002256f7f5e`。开始时 `git status --porcelain` 与 `git diff --binary` 均为空；原始记录在 `/tmp/one-media-audit/target-before.*`。本次不提交、不推送。

## 来源快照

| 仓库 | 实际默认分支 | 实际读取提交 |
| --- | --- | --- |
| [g1-humanoid-teleoperation](https://github.com/xuanqisun/g1-humanoid-teleoperation) | `main` | `0b1671685a9e075af44d60d16f89c75f090bc6aa` |
| [one-g-website](https://github.com/xuanqisun/one-g-website) | `main` | `0748e1a77f45d4a2360ab8183806a1a0d9b1fc9f` |
| [robotdock-demo](https://github.com/xuanqisun/robotdock-demo) | `main` | `4b0e92f0f40f652241a123417dd1d54a06678074` |
| [sonic-link-demo](https://github.com/xuanqisun/sonic-link-demo) | `main` | `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c` |

四个仓库均使用 Git 远程 HEAD 确认默认分支，再以独立浅克隆读取；没有根据 GitHub Pages 推断最新源码。未找到已有本地参考副本（历史文档中的 `/tmp/one-g-reference` 本次不存在），未改动任何参考文件、提交或分支，结束时四个工作区状态仍为空。读取位置为 `/tmp/one-media-audit/references/<repo>`。未运行参考库安装、构建、测试、部署或设备操作脚本；只读取其文本。媒体探测/转码与浏览器工具安装于独立审计目录，没有改目标依赖。

完整逐仓库实际读取文件清单、原始引用行、尺寸/码流/时长/大小、SHA-256、所有重复来源、授权与审核状态、网页副本信息、文案证据见 [`src/data/media-sources.json`](../src/data/media-sources.json)。此 JSON 不由网站导入，不作为公开目录资源提供。

## 扫描与去重

- 检查所有 tracked 文件，不限 assets：README、HTML、组件/脚本、CSS、配置、资源索引、构建/部署输入和 Git LFS 标识。扫描 src/data-src、source/video、poster、JS 路径、CSS url、远程媒体 URL、data URI 和 Base64。
- 48 个媒体文件出现记录，按完整内容 SHA-256 合并为 32 项：23 张图片（含 SVG）、9 段视频；保留全部来源，避免重复的 16 次出现。不是按文件名去重。
- 无 Git LFS 指针、嵌入的 data/Base64 媒体或缺失的字面量媒体路径。唯一远程媒体引用是 G1 页的 og:image，仓库已有对应 kick-poster.jpg；没有另行远程下载。HTML 内联 SVG 为品牌/外设图标，未整套搬用。
- `one-g-website/dist/assets/teleoperation-demo.mp4` 与 G1 的 `assets/videos/wholebody-pick.mp4` 哈希完全一致，只保留一个网页版本；这证明文件相同，不证明它由 RoboDock 驱动。
- `one-g-website` 说明的完整《工业设计.pdf》没有上传。未猜路径或声称已提取 PDF；仅有其页面渲染与扩背景图，本次无相应用途而未迁入。

## 画面、授权与边界

用户在本会话明确确认：“团队素材及 AI-CDR 视频均已获授权”。将其记录为本网站展示授权，不伪造开源许可证，也不宣称获得模型、算法源码或第三方品牌的再授权。四个来源未发现 LICENSE/COPYING/NOTICE。研究视频保留 AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）署名，保留 PICO、Unitree 等原画面标识，不改成 ONE-G 自研或独家合作。第三方模型的独立权属仍未核实，没有复制模型文件。

**视频检查方法与限度**：9 段原始视频均完成全时长解码；对从开头到末尾、每 0.5 秒抽取的时间序列画面进行了逐页检查，覆盖全部片段。原始连续实时音画未由人工逐帧观看，不能将该步骤描述为实时完整观影；也没有验证控制栈、设备在线状态或性能。选用的 6 段还完成网页副本全时长解码与浏览器从开始到结束播放检查（4 倍速）。本记录明确区分画面序列审核、解码成功与真实硬件验证。时间序列与解码日志保留于 `/tmp/one-media-audit/review/`。

| 视频 | 原始时长 | 画面分类 / 输入 | 方案关系与落点 |
| --- | --- | --- |
| `3pt-demo` | 00:00:21.78 | 实机；头显与双手柄，无脚环；来源描述摇杆移动 | /solutions/teleoperation/ |
| `camera-teleop` | 00:00:26.00 | 实机；单目人体动作采集，无穿戴 | /solutions/teleoperation/ |
| `dance-video-motion` | 00:00:15.60 | 实机舞蹈；“视频到动作”依据源文，片段未呈现输入视频/处理流程 | /solutions/#ai |
| `headset-hand-interaction` | 00:00:55.19 | 仿真；第一视角手部追踪/手柄两模式 | 未选用，仅记录候选 |
| `headset-only-teleop` | 00:01:04.27 | 仿真；头显手部追踪、夹爪与灵巧手 | 未选用，仅记录候选 |
| `music-motion` | 00:00:47.81 | 仿真；虚拟人形模型舞动，不能称实机 | /solutions/#ai |
| `wholebody-balance` | 00:00:15.13 | 实机；头显、双手柄、脚环；单腿平衡 | /solutions/teleoperation/ |
| `wholebody-kick` | 00:00:11.82 | 实机；全身腿部动作；与平衡演示用途重复，未迁入 | 未选用，仅记录候选 |
| `wholebody-pick` | 00:00:19.04 | 实机；VR 人工抓取/取放，不是自主搬运 | /solutions/#handling |

三点/全身模式的关联依据是 G1 源码中明确链接 `sonic-link-demo/?bundle=three|full`，而不是同仓库共存关系。所有演示的具体设备型号、软件发布版本、运行条件与 RoboDock 驱动关系均未证实。单目、舞蹈和音乐仅作相关研究候选，不列为 SONIC Link 正式功能或现售应用包。

SONIC 控制台截图保持“早期界面演示”说明：截图/检查记录不证明连接真实后台或设备，三点待开发为历史标注，GEM 不在方案范围内。来源没有可供验证的实时数据接口，因此没有写成真实在线控制台。

## 完整素材索引

表中为 32 个按哈希去重后的条目；每项完整 SHA、字节数、多个来源与文件位置见结构化清单。空落点不是“已复制”或“已发布”。

| ID | 类型 | 原路径（首个来源；保留多个出处于 JSON） | 出现次数 | 实际目标 / 审核处置 |
| --- | --- | --- | --- | --- |
| `image-61baa29fa5bc` | image | `g1-humanoid-teleoperation/assets/images/3pt-poster.jpg` | 1 | 未迁入 |
| `image-c7c8ce90328c` | image | `g1-humanoid-teleoperation/assets/images/balance-poster.jpg` | 2 | 未迁入 |
| `image-3ea943a410b9` | image | `g1-humanoid-teleoperation/assets/images/camera-poster.jpg` | 1 | 未迁入 |
| `image-acdb13d2bcb7` | image | `g1-humanoid-teleoperation/assets/images/dance-video-motion-poster.jpg` | 1 | 未迁入 |
| `image-d6f3f34dd7b5` | image | `g1-humanoid-teleoperation/assets/images/favicon.svg` | 1 | 未迁入 |
| `image-79677199e534` | image | `g1-humanoid-teleoperation/assets/images/g1-cutout.png` | 1 | 未迁入 |
| `image-68ca99ed8f39` | image | `g1-humanoid-teleoperation/assets/images/headset-hand-interaction-poster.jpg` | 1 | 未迁入 |
| `image-a2d9fcbe74bd` | image | `g1-humanoid-teleoperation/assets/images/headset-only-poster.jpg` | 1 | 未迁入 |
| `image-63fe0d79ed66` | image | `g1-humanoid-teleoperation/assets/images/kick-poster.jpg` | 1 | 未迁入 |
| `image-6a0664f1b41e` | image | `g1-humanoid-teleoperation/assets/images/music-motion-poster.jpg` | 1 | 未迁入 |
| `image-e2a622022ae3` | image | `g1-humanoid-teleoperation/assets/images/pick-poster.jpg` | 1 | 未迁入 |
| `video-d66a70232dec` | video | `g1-humanoid-teleoperation/assets/videos/3pt-demo.mp4` | 1 | /one-g/solutions/teleoperation/3pt-demo.mp4；网页副本 /one-g/solutions/teleoperation/3pt-demo.mp4, /one-g/solutions/teleoperation/3pt-demo-poster.webp |
| `video-a6d531d0395a` | video | `g1-humanoid-teleoperation/assets/videos/camera-teleop.mp4` | 1 | /one-g/solutions/teleoperation/camera-teleop.mp4；网页副本 /one-g/solutions/teleoperation/camera-teleop.mp4, /one-g/solutions/teleoperation/camera-teleop-poster.webp |
| `video-25a82aa2af0c` | video | `g1-humanoid-teleoperation/assets/videos/dance-video-motion.mp4` | 1 | /one-g/solutions/intelligent-tasks/dance-video-motion.mp4；网页副本 /one-g/solutions/intelligent-tasks/dance-video-motion.mp4, /one-g/solutions/intelligent-tasks/dance-video-motion-poster.webp |
| `video-344600905a91` | video | `g1-humanoid-teleoperation/assets/videos/headset-hand-interaction.mp4` | 1 | 未迁入 |
| `video-bfd6204854a4` | video | `g1-humanoid-teleoperation/assets/videos/headset-only-teleop.mp4` | 1 | 未迁入 |
| `video-7d355660562a` | video | `g1-humanoid-teleoperation/assets/videos/music-motion.mp4` | 1 | /one-g/solutions/intelligent-tasks/music-motion.mp4；网页副本 /one-g/solutions/intelligent-tasks/music-motion.mp4, /one-g/solutions/intelligent-tasks/music-motion-poster.webp |
| `video-1687f2756ac5` | video | `g1-humanoid-teleoperation/assets/videos/wholebody-balance.mp4` | 1 | /one-g/solutions/teleoperation/wholebody-balance.mp4；网页副本 /one-g/solutions/teleoperation/wholebody-balance.mp4, /one-g/solutions/teleoperation/wholebody-balance-poster.webp |
| `video-6daf4d5252ec` | video | `g1-humanoid-teleoperation/assets/videos/wholebody-kick.mp4` | 1 | 未迁入 |
| `video-da7736a3223f` | video | `g1-humanoid-teleoperation/assets/videos/wholebody-pick.mp4` | 2 | /one-g/solutions/handling/wholebody-pick.mp4；网页副本 /one-g/solutions/handling/wholebody-pick.mp4, /one-g/solutions/handling/wholebody-pick-poster.webp |
| `image-bf6d0ea6047c` | image | `one-g-website/dist/assets/demo-grasp.jpg` | 3 | /one-g/products/sonic-link/demo-grasp.jpg（任务前已有；按哈希复用） |
| `image-1b2ccecfb1dd` | image | `one-g-website/dist/assets/demo-motion.jpg` | 3 | /one-g/products/sonic-link/demo-motion.jpg（任务前已有；按哈希复用） |
| `image-038f625105e7` | image | `one-g-website/dist/assets/design-sketch.png` | 2 | /one-g/products/robotdock/installation-sketch.png（任务前已有；按哈希复用）；网页副本 /one-g/products/robotdock/installation-sketch.webp |
| `image-0fa355e6c7ea` | image | `one-g-website/dist/assets/industrial-design-extended.png` | 1 | 未迁入 |
| `image-2d60ab2fe7f0` | image | `one-g-website/dist/assets/industrial-design-page-1.png` | 1 | 未迁入 |
| `image-bb5466e7d782` | image | `one-g-website/dist/assets/one-g-header-logo.svg` | 1 | 未迁入 |
| `image-12b5b8e0dee3` | image | `one-g-website/dist/assets/one-g-logo.svg` | 3 | 未迁入 |
| `image-6fdd724655d2` | image | `one-g-website/dist/assets/one-g-symbol.svg` | 3 | 未迁入 |
| `image-57dcc0abdada` | image | `one-g-website/dist/assets/pico-kit.jpg` | 3 | /one-g/products/sonic-link/device-pico-kit.jpg（任务前已有；按哈希复用） |
| `image-ead4b3e68fbb` | image | `one-g-website/dist/assets/robotdock-concept.png` | 2 | /one-g/products/robotdock/robotdock-concept.png（任务前已有；按哈希复用）；网页副本 /one-g/products/robotdock/robotdock-concept.webp |
| `image-6b2233dac216` | image | `one-g-website/dist/assets/sonic-link-console.png` | 3 | /one-g/products/sonic-link/software-console-early.png（任务前已有；按哈希复用） |
| `image-57fc077ddba3` | image | `robotdock-demo/dist/assets/one-g-logo-horizontal.svg` | 1 | 未迁入 |

新增复制的来源图片 **0 张**：RoboDock 两图与 SONIC 四图在 ONE-G 已有，哈希匹配后复用；没有再次搬运。同批新增网页视频 **6 段**、从各自真实画面生成 WebP 封面 **6 张**、既有 RoboDock 原图的优化 WebP 副本 **2 张**。产品原始 PNG/JPG 保留；选中视频原始文件按内容哈希另存 `/home/lsh/one-g-media-originals/2026-10-21/`，不在 public 复制原片与网页片两份。未选媒体留在只读参考快照，不纳入正式发布资源。

视频采用 H.264/yuv420p + AAC，保留音轨，CRF 26、faststart、宽度不超过 960 且保持比例。每个封面来自对应视频，取帧时间与输出 SHA 见清单。播放器默认不自动播放、不循环、preload=none、controls/音量可用；第二段开始时暂停第一段，展开区关闭时卸载播放器。加载失败显示文字、来源链接与重试。图片按原比例显示，没有重绘产品或去水印。媒体 URL 沿用 `/one-g/` 前缀及当前资料层的公开资源路径方式，不改部署设置。

## 新增文案逐段出处

中文与英文均进入现有词典。英文沿用同一来源和限定；播放器错误与重试文案属于本站交互文案，不是设备能力声明。

### robodock-design-evidence

页面：`/products/robotdock/#design-evidence`；[固定提交中的原文](https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/README.md#L55)。
- 概念图依据团队草图生成，安装草图用于讨论背部安装、专用线束与手腕连接件；两者均不代表最终结构、接口数量或实物交付。

### robodock-compute-evidence

页面：`/products/robotdock/#compute-evidence`；[固定提交中的原文](https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/dist/index.html#L48)。
- 参考方案区分外部计算设备运行程序、背包内开发部署，以及按需适配预设应用三种使用方向。接入版主控暂定 Orin Nano 8GB，板载版暂定 Orin NX 16GB；这些是规划参数，尚非已验证规格。
- 基础 SDK、驱动与文档属于规划交付说明；ROS 2、DDS 与 Python 接口范围、存储容量、Web 功能及记录范围仍待验证或确认。应用示例限已验证组合，并需安装与标定，不代表所有外设或应用已交付。

### robodock-safety-evidence

页面：`/products/robotdock/#safety-evidence`；[固定提交中的原文](https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/dist/index.html#L78)。
- 集中供电与保护、CAN / RS-485 / Ethernet / USB 均为规划方案。电压、功率、取电方式、接口数量和电气规格没有确认数值；不能从概念图推导。
- 换装构想要求暂停任务、安全停稳、外设独立断电，换装后加载对应配置。G1+ 适配、分路供电控制与热插拔仍待验证；不将设计目标表述为带电换装能力。

### 3pt-demo

页面：`/solutions/teleoperation/`；[固定提交中的原文](https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L186)。
- 三点 VR 遥操作
- 头显与两个手柄提供头部、双手输入；来源说明通过摇杆控制前后移动，无需脚踝追踪器。
- 来源将此模式链接至 SONIC Link 三点方案；视频未确认采集设备具体型号、软件版本或 RoboDock 驱动关系。
- 真实设备 · 研究演示
- 研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）

### wholebody-balance

页面：`/solutions/teleoperation/`；[固定提交中的原文](https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L97)。
- 全身遥操作：单腿平衡
- 来源列出头显、双手柄与脚踝追踪器，画面展示操作者与 G1 的抬臂、抬腿和平衡动作。
- 来源链接 SONIC Link 全身方案；这是受控场地研究演示，不证明任意动作复现、通用稳定性或 RoboDock 接入。
- 真实设备 · 研究演示
- 研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）

### camera-teleop

页面：`/solutions/teleoperation/`；[固定提交中的原文](https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L322)。
- 单摄像头、无穿戴遥操作
- 来源说明使用单目相机捕捉人体动作，画面中操作者未佩戴头显或手柄，G1 配合展示上肢和身体动作。
- 相关演示候选：未找到此模式与当前 SONIC Link 软件或 RoboDock 的明确对应；相机型号与部署条件待确认。
- 相关研究 · 方案归属待确认
- 研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）

### wholebody-pick

页面：`/solutions/#handling`；[固定提交中的原文](https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L132)。
- 人工遥操作：抓取与取放
- 画面展示佩戴 VR 设备的操作者引导 G1 俯身抓取并提起玩偶。来源将其归为全身遥操作的抓取演示。
- 仅说明人工遥操作抓取验证；未证明自主搬运、载荷、节拍或由 RoboDock 驱动。
- 人工遥操作 · 真实设备
- 研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）

### dance-video-motion

页面：`/solutions/#ai`；[固定提交中的原文](https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L369)。
- 舞蹈视频到动作
- 来源将此片段描述为舞蹈视频动作复现；画面展示 G1 在室内完成连续舞蹈动作。
- 相关研究演示；片段未展示输入视频、处理流程或训练方法，不等于自主规划，也未确认属于 SONIC Link 应用包。
- 真实设备 · 相关研究
- 研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）

### music-motion

页面：`/solutions/#ai`；[固定提交中的原文](https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L418)。
- 音乐驱动动作：仿真
- 来源描述音乐驱动全身动作；实际画面为虚拟场景中的人形模型舞动，并非真实设备实拍。
- 仅作仿真研究展示；未确认模型权属、算法交付或与 SONIC Link、RoboDock 的集成，不代表通用智能或自主任务能力。
- 仿真 · 相关研究
- 研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）

### console-ui

页面：`/solutions/teleoperation/#workflow`；[固定提交中的原文](https://github.com/xuanqisun/sonic-link-demo/blob/d6f8b26b1cdc3f56f6b6e4091342a56228527b9c/README.md#L29)。
- Early console screenshot is UI demonstration; no real backend/device connection established. Historical three-point label retained.

### robodock-specifications

页面：`/products/robotdock/specs/`；[固定提交中的原文](https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/dist/index.html#L78)。
- 基础 SDK / 驱动 / 文档（规划）
- ROS 2、DDS 与 Python 接口范围待确认。
- 主控规划
- 接入版 Orin Nano 8GB；板载版 Orin NX 16GB
- 暂定规划，性能与适配仍需验证。
- 存储容量
- 容量与规格待确认

## 未补充或未确认的内容

- 巡检保留现状：未找到自主导航、异常/缺陷识别、巡检报告或实地巡检视频证据，没有给巡检卡片硬塞视频。
- 搬运只补人工抓取/取放，未加入载荷、节拍、自主搬运或量产交付承诺。
- 智能任务仅补实机舞蹈与音乐仿真，未声称自主规划、VLA 模型交付、训练平台或通用智能。
- RoboDock 的接口数量、电压、功率、尺寸、重量、热插拔与具体兼容型号均缺已确认数值，保留待确认。新版来源的 Orin Nano 8GB / Orin NX 16GB 标为暂定规划；软件接口范围与存储待确认。
- 最新来源的三种交付规划仅补充介绍/技术信息，没有迁移其选购器；ONE-G 的四档现有套餐、价格和未开放销售状态保留。
- 未迁来源旧品牌图、工业设计背景图、机器人抠图和无必要的额外长视频；独立第三方设计/模型权属未进一步核实。
- 旧 robotdock-demo 遥操作子页的三点待开发说法不作为当前 SONIC 模式状态依据，采用独立 sonic-link-demo 的说明并保留历史标记。
- 没有新增一级导航、SYSTEM CAPABILITIES、深度定制入口、下载/软件授权售卖、设备控制接口、邮件发送或真实支付。首页、导航菜单/滑动高亮、商品 Flip、主题逻辑、About、登录/支付实现文件未修改。仅在既有词典补齐了原本遗漏的两个日夜切换英文标签，使已有词典检查通过。

## 体积

`public` 文件内容总大小由 **14,835,336 B** 增至 **29,317,066 B**，增加 **14,481,730 B（13.81 MiB）**；统计不含目录元数据、git、原片归档与测试截图。6 个源视频共 28,823,627 B，网页副本共 14,114,288 B。public 内无重复内容哈希的视频。

## 验证记录

以实际命令输出和 JSON 为准；浏览器与最终构建结果见 [验收报告](./reviews/media-integration/verification.md)。截图和测试 JSON 位于 `docs/reviews/media-integration/`。

可重复检查命令：`npm run lint`、`npx tsc --noEmit`、`npm run build`、`node --test tests/i18n-dictionary.test.cjs tests/auth-payment.test.mjs tests/mock-login.test.mjs`。package.json 没有独立 typecheck/test 脚本，类型检查使用已有 TypeScript。
