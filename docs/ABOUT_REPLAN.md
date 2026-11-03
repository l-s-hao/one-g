# About 内容与双向入口规划

日期：2026-11-03。原规划已按确认内容实施；**第 5 段及本体设计待核内容暂不发布**。以下保留原规划，最新结果见文末实施记录。

## 范围与依据

目标：让访客理解 ONE-G 从哪里切入机器人开发，并能继续浏览对应商品、方案，或按现有规则咨询。

本轮只新增本文与本地取证文件；不改 About、业务组件、词典、素材清单、快照或依赖。不提交、推送。参考仓库只读，未向其写入文件。

实际主仓库为 `/home/lsh/ONE`，origin 为 `https://github.com/l-s-hao/one-g.git`；检查起点为 main / `b2f23c980262095d7e2360a0025157c0d6968055`。当前工作树包含上一轮解决方案布局、商品按钮等未提交成果，本文以工作树实际源码为准，不把它们视为已提交版本。

实际读取根 AGENTS.md、本机 Oil UI Pro 与 VibeHub；前者仅用于存量页面的信息架构和交互规划，后者用于准确区分现状、建议及能力边界。没有风格探索、Skill 安装或依赖安装。已有 `docs/ONE_PROJECT_REVIEW.md` 是项目审计，`docs/SOLUTIONS_LAYOUT.md` 是方案页规划，未找到专门的 About 规划，故建立本文；既有审计和素材记录不覆盖。

来源标记：**[V]** 本机视频关键帧/可见字幕；**[U]** 用户提供的时间摘要或已确认品牌；**[S]** 当前源码及已有素材记录；**[P]** 本次建议；**[Q]** 尚待核实，不可当作已交付事实。

### 视频实际读取范围

本机原文件可访问：`/home/lsh/图片/03ed7cd2109266b252f277716a72670e.mp4`。203.27 秒，967×544，16,653,173 字节；SHA-256：`b3a36ecf9c5993be07c707c474cef3d084afa947f185ac77c7338dd1edabc292`。

使用已有 Chromium/Playwright 打开原文件并在 24 个时间点采集原视频画面，实际查看其中关键帧及烧录字幕；没有完整实时观看/听写，也没有可提取的字幕轨。时间段叙述结合用户摘要，不冒称完整逐字转录。视频与帧图仅用于本地研究，未复制到 public、未发布、未裁除来源标识。

取证目录：`.oil-ui/about-planning-20261103/`。含 `video-source.json`、`video-metadata.json`、`frame-005.png` 等帧图、`inspect-video.mjs`；另有 `status-before.txt`、`worktree-before.patch`、`files-before.json` 保护原工作树。

## 当前页面与可复用事实

| 对象 | 当前实现及规划约束 |
| --- | --- |
| About | `src/app/about/page.tsx`：AboutHero → 愿景 `our-vision` → 定位 `our-positioning` → 联系我们 → Lanyard；Footer 由全站壳提供 |
| 品牌 | `src/i18n/dictionary.ts` 的 brandCopy：一智通万机；具身智能开发与应用平台；让更多人用得起、用得好机器人，让机器人真正帮人干活。原有中英文继续复用 |
| 首屏 | `AboutHero.tsx` 使用 ScrollExpand、既有服务机器人图 `/one-g/hero/one-g-service.png`、正式 BrandLogo。当前定位在后续正文，首屏没有本次拟议的两个入口 |
| 滚动 | 首屏已有 useWindowScroll、粘性展开和桌面/手机断点；只保留这一段的现有行为，不将六个区块做成六屏，也不锁 body |
| 愿景 | `AboutVision.tsx` 已有中英强调词处理，保留其语义，不用硬拼中文片段翻译英文 |
| 尾部 | `LanyardBrandSection.tsx` 的 `brand-lanyard`、延迟挂载、静态后备图、局部错误边界保持；正式标志 `/one-g/brand/one-g-mark.png` 与带纹 `/one-g/lanyard/one-g-band.png` 保持 |
| 商品 | `getProductById`、`getOfferingNavigation` 提供 RoboDock 对象及介绍链接；商品状态仍为 concept，暂未开售。不能把开发平台愿景改写成已上线设备管理服务 |
| 方案 | `/solutions` 当前四段连续正文已存在，稳定 ID 是 teleoperation、handling、inspection、ai；SONIC Link 有独立详情 `/solutions/teleoperation` |
| 分类 | `site-navigation.ts` 的 shopLinks 已有 `/products?category=robot`，类别键是 robot；现有分类筛选负责解释参数 |
| 联系 | 现有 SupportButton entry=about、ContactProvider、auth-routing 负责登录前置、安全返回和一次性打开预览；不新增联系方式或发送服务 |

## 推荐结构与线框

设计主线：[P] **从重复开发问题，讲到接入切入，再以现有产品、研究演示和有边界的实践解释平台方向。**

```text
全站 Header、图片抽屉（保持）
└─ About
   ├─ 1 品牌首屏：现有 ScrollExpand 图像/Logo/标语
   │    定位、了解 RoboDock →、查看解决方案 →
   │    愿景（保留 our-vision，正常文档流）
   ├─ 2 问题与路线 #platform-route
   │    一段问题说明 → 两条互补路线的简洁对照
   ├─ 3 从接入层切入 #integration-layer
   │    清楚的四层关系图 + 简短解释
   ├─ 4 产品与能力 #capabilities
   │    RoboDock → 遥操作/全身控制 → 场景本体设计
   │    连续图文，必要链接直接可见
   ├─ 5 团队过往实践 #team-practice
   │    康养 / 景区巡查 / 电力线路（发布前通过来源与归属核对）
   ├─ 6 可复用平台方向 #platform-direction
   │    浏览商品 → 查看方案 → 咨询客服 #contact
   └─ 现有 Lanyard #brand-lanyard
全站 Footer（保持）
```

桌面采用现有内容宽度、留白和图文交错；四层图清楚竖向排列，可在右侧配解释文字。手机按同一 DOM 阅读顺序上下排列，路线对照上下堆叠；不横向拖拽，不用整段白色卡片封装，不做展开列表。所有普通区块按内容自然增高。

**首屏动作的可达性需在实施时专门处理：**当前 ScrollExpand 的 overlay 随展开进度显现，不能仅把新入口塞进初始透明的 overlay，就宣称无需动画即可使用。建议由 AboutHero 自己提供始终可见的定位与操作区域，与现有展开画面组合；不重复创建可聚焦的隐藏按钮，不更改共享 ScrollExpand 默认行为。减少动态效果时同样可直接阅读和操作。具体排布需以实际截图验证，本轮未渲染新首屏。

## 六段中文草案与英文更新范围

以下 [P] 均为建议文案，尚未写入页面。已确认品牌原句 [U/S] 保留；待核部分 [Q] 不是可直接上线的宣传稿。

### 1 品牌首屏

- 标语 [U/S]：**一智通万机。**
- 定位 [U/S]：**具身智能开发与应用平台。**
- 愿景 [U/S]：**让更多人用得起、用得好机器人，让机器人真正帮人干活。**
- 两个直接入口 [P]：**了解 RoboDock**；**查看解决方案**。不增加购买、深度定制或标准配置入口。

英文：继续使用 brandCopy 已有译文；只新增两个动作的必要译文，沿用现有正式名称。保留现有首屏图和 Logo，不用视频中的发光背包替换实拍或概念说明。

### 2 问题与路线

标题 [P]：**换了机器人，为什么还要从头开发？**

正文 [P，依据 U/V]：换一种机器人、换一项任务，设备连接、软件适配与联调往往需要重新投入。我们用两个切入角度理解这件事：运控让机器人动得更稳、更准；接入与场景让设备和工具接得上，让任务用得起来。两者互补，共同走向机器人真正帮人干活。

对照短句 [P]：**运控：把动作做好。接入与场景：让任务用起来。**

边界：这是视频的解释框架，不是行业路线的穷尽分类；不写“唯一”“替代运控”或兼容全部机器人。

英文：新增问题标题、问题段、两条路线和互补说明；不要将“路线”翻成互斥产品套餐。

### 3 万机从哪里切入

标题 [P]：**从接入层切入，连接运控、本体与场景。**

正文 [P，依据 V 119s]：在视频的四层解释中，大脑负责感知理解与任务决策，小脑负责运动控制，接入层连接计算、供电、通信与外设，本体承载具体动作。万机从接入层切入，向上连接运控、向下理解本体，把这些工作落到具体场景。

四层图：大脑 → 小脑/运控 → **接入层（品牌蓝轻量突出）** → 本体。另以普通说明文字表达场景落地，不画成已经打通所有设备的数据链路。

| 图中层 | 可见解释 | 交互 |
| --- | --- | --- |
| 大脑 | 感知理解与任务决策 | 纯解释，不伪造产品入口或 hover 操作 |
| 小脑/运控 | 运动控制 | 明确文字链接“了解遥操作方案” |
| 接入层 | 计算、供电、通信与外设 | 明确文字链接“了解 RoboDock” |
| 本体 | 承载动作的机器人硬件 | 明确文字链接“浏览现有机器人产品”，注明非视频项目设备清单 |

英文：新增层名与说明；“小脑”以 motion control 表意，“大脑”解释为 perception and task decision-making，避免误成四款已发布产品。图中文字、ARIA 和链接标签一起翻译。

### 4 产品与能力

**RoboDock 背包与开发平台方向** [P，依据 V 128s + S]：围绕机器人计算、供电、通信和外设接入，RoboDock 探索背包式接入与开发配套，面向设备接入、环境配置和联调诊断。**当前为概念产品预览，暂未开售；接口、兼容范围和软件交付以产品页已确认说明为准。**

不把视频中的界面 Demo 当作设备已经接通或平台已经交付的证据。链接“了解 RoboDock”，不新增运行后台入口。

**人形机器人遥操作与全身控制** [P，依据 V 140s + S]：团队围绕人形机器人的遥操作与全身控制开展研究演示。现有 SONIC Link 方案介绍三点与全身遥操作方向；具体支持范围、版本及交付条件以方案页说明为准。

优先引用已入库的三点/全身演示，不声称新视频全部片段属于当前 SONIC Link 版本。链接“了解遥操作方案”。

**面向场景的本体设计** [P/Q，依据 V 149–155s]：视频介绍了面向具体任务的机器人本体设计与委外加工实践。不同场景对结构、末端工具和控制协同有不同要求。

该段不得扩写成开放承接定制制造或标准商品能力；团队角色核实前，仅作为视频叙事的内部草案。链接只可为“浏览现有机器人产品”，不暗示商品都是上述项目设备。

英文：三项用途、状态、素材说明与链接同步更新；区分 concept、research demonstration、previous team work、planned platform，不把“开发平台”默认译成 commercially available platform。

### 5 团队过往实践（待核后发布）

引言 [P/Q]：视频回顾了团队围绕康养服务、景区巡查与电力线路作业的实践。它们体现了不同场景对接入、控制和本体设计的要求，不等同于 RoboDock 或 SONIC Link 的标准交付能力。

- 康养 [P/Q]：围绕康养机构中的服务机器人需求开展实践。具体任务、团队参与范围与素材授权核实后补充；不添加机构名称、数量或健康效果。
- 景区巡查 [P/Q]：视频提及西溪湿地景区巡查实践。核对项目时间、参与角色、运行方式和场地名称发布权限；不能改写为现售产品已完成自主巡检部署。
- 电力线路 [P/Q]：视频展示双臂机器人在线路上的清障作业，并说明由地面人员遥操作。不得写成无人自主作业、安全认证或当前方案交付成果。

**发布门槛：**以上是待核工作文案，不是已核实案例。缺少归属和发布依据时，暂不发布对应名称、成果叙述或媒体，也不显示“成功交付”标签。上线阶段不能用三张缺素材大卡片占位。页面及反向链接中不出现尚未发布的空锚点。

英文：仅在中文事实、机构称谓及授权确认后翻译对应内容；不能先上英文以绕过核实。避免 customer success、deployed、certified 等未经证实词汇。

### 6 可复用平台方向与继续浏览

标题 [P]：**把实践经验，沉淀为可复用的平台。**

正文 [P，依据 V 185s]：接入、运控、本体与场景中的经验，正在沉淀为可复用的平台。我们希望减少重复开发，让更多人用得起、用得好机器人，让机器人真正帮人干活。

动作 [P]：**浏览商品中心**；**查看解决方案**；现有 **咨询客服**。前两项是普通 Link，咨询继续使用 SupportButton。说明 [S]：**登录后填写需求 · 当前仅支持前端预览**。

英文：新增平台方向段与必要动作译文，保留进行时语义及前端预览限定；不写“已实现通用平台全面交付”。

## 视频时间点 → 页面映射

| 视频时间 | 来源与本次实际核对 | 页面落点 | 允许表达 / 不能推断 |
| --- | --- | --- | --- |
| 00:05–00:33 | U 摘要；V 12s、28s 问题与四层图 | 2 问题、3 四层图 | 重复开发与解释框架；非全部行业路线/兼容承诺 |
| 00:35–01:35 | U 摘要；V 45s 运控、80s 接入底座 | 2 两个切入角度 | 目的与分工；不能把说明图变成功能验收结果 |
| 01:39–01:51 | U 摘要；V 105s 对比画面 | 2 互补关系 | 动得好、用得上；不是两者竞争排斥 |
| 01:53–02:15 | U 摘要；V 119s、128s 接入/运控/本体、背包与界面 | 3 切入点、4 RoboDock | 产品方向；背包渲染非实物，界面非实际接通证明 |
| 02:17–02:25 | U 摘要；V 140s 遥操作/全身控制 | 4 遥操作 | 团队研究演示；归属当前 SONIC Link 版本待核 |
| 02:29–02:59 | U 摘要；V 149s、155s 三类项目、175s 线路作业 | 4 本体设计、5 实践 | 视频标称团队过往项目；角色、权利、当前归属待核 |
| 03:03–03:19 | U 摘要；V 185s、199s 平台方向 | 6 平台方向 | “正在沉淀”；不能改成成熟通用平台已经全面交付 |

## 实际路由与拟议锚点

下表 href 是应用逻辑路径，使用现有 LocalizedLink；Next/basePath 负责部署前缀 `/one-g`，不要手动再拼一次。数据选择应复用真实对象与配置，不根据显示名称猜 slug。

| 来源/动作 | 目标 | 来源与状态 |
| --- | --- | --- |
| 首屏、接入层、RoboDock 能力段：了解 RoboDock | `/products/robotdock` | 已有；由 product id=robotdock、getOfferingNavigation.overviewHref 得到 |
| 首屏、末段：查看解决方案 | `/solutions` | 已有；保留全站导航配置 |
| 四层图运控、能力段：了解遥操作方案 | `/solutions/teleoperation` | 已有；solutions 中 id=teleoperation 的 detailHref，SONIC Link 不进入购物车 |
| 正文提到方案总览内遥操作分区 | `/solutions#teleoperation` | 已有稳定 section；不是旧卡片展开逻辑，不另造参数 |
| 本体、能力段：浏览现有机器人产品 | `/products?category=robot` | 已有 shopLinks 分类 href；不是视频项目设备列表 |
| 末段：浏览商品中心 | `/products` | 已有 |
| 站内目录：问题与路线 | `/about#platform-route` | 拟新增；本轮尚不存在 |
| 站内目录：接入层 | `/about#integration-layer` | 拟新增；本轮尚不存在 |
| 站内目录：产品与能力 | `/about#capabilities` | 拟新增；本轮尚不存在 |
| 站内目录：团队实践 | `/about#team-practice` | 拟新增；仅在有已核实发布内容时启用 |
| 站内目录：平台方向 | `/about#platform-direction` | 拟新增；本轮尚不存在 |
| 站内继续咨询 | `/about#contact` | 拟新增 section id；实际操作仍由此处唯一的 SupportButton 触发 |

不要使用 `href="#"`、旧 SONIC 商品/购买兼容地址或自建第二套方案查询协议。既有兼容路由和方案参数识别保持。

### 最小反向入口（未来实施）

1. **RoboDock 介绍 → About**：在 `ProductDetailContent.tsx` overview 分支的产品介绍文案后增加一个低优先级文字 Link“了解万机的平台路线” → `/about#platform-route`。仅 product.id=robotdock 生效；不放进购买主操作，不改变规格页，不改 RoboDock 数据与其哈希基线。
2. **方案总览 → About**：在 `src/app/solutions/page.tsx` 方案正文结束、Footer 之前增加一条次级入口“了解万机的平台路线” → 同一目标。无需给四个方案重复入口或修改共享图片导航。
3. **遥操作详情 → About**：可在 `technical` 段之后加入同样的次级文字入口，避免用户需先退回总览。此项属于第二阶段必要性评估，不是本轮已新增。团队实践核实并上线后，可将适合的单个入口改为 `/about#team-practice`；此前不链接空分区。

两个必要反向位置各一条即可形成商品/方案与 About 的双向连接；不把 About 大段文案复制到产品或方案数据。

### 锚点、历史与多语言

- 新 id 与语言无关；保留现有 `our-vision`、`our-positioning`、`contact-title`、`brand-lanyard`。建议第 1 段愿景继续使用 our-vision；第 3 段保留 our-positioning 为包裹区，在开头放 integration-layer 定位点。contact-title 保留 h2 ID，新增 contact 作为 section ID；不产生重复 ID。
- 复用 About CSS 现有 `scroll-margin-top: calc(var(--site-header-height) + 16px)`；为新增定位点设置同等偏移，不改全站 Header。目录简单普通链接，无 ScrollSpy、拖拽或动画后跳转。
- 直接刷新、前进后退、新标签页打开应定位到真实正文；支持静态导出与 basePath。若案例未发布，不输出它的目录与反向入口。
- 日夜与语言切换沿用全局单一来源，不把 locale/theme 用作 About 根 key；链接 href、id 不翻译。不能因切换偏好重置表单、产品选择或重新创建全部视频。
- 动态效果尊重减少动画偏好；没有动画时内容与链接仍可达。首屏原有 mobile/desktop key 是现有断点行为，不扩展为主题/语言重挂载。

## 咨询的现有边界与预期路径

保留单一主要咨询按钮，放在末段 `#contact`。其它位置若需提及咨询，只链接到这个分区，不复制多个相同 entry 的触发按钮，以免现有焦点回退命中首个同名入口。

未登录：用户在 `/about#contact` 点击 SupportButton → ContactProvider 在当前查询参数中设置 `openContact=about`，保留 hash → loginDestination/safeReturnTo 生成安全站内 returnTo → 登录后回到 `/about?openContact=about#contact` → 消费一次标记、仅移除 openContact → 打开现有需求预览。已有其它合法查询参数须保留。

已登录：直接打开当前预览，不重复打开。没有真实发送，不显示已发送或已联系客服。未配置真实认证的环境不得宣称正式登录已验收。

**实际限制：**About 的返回位置可以保留，但 ContactProvider 不会根据新的 About 能力/实践锚点自动填入某个产品或案例上下文；不能在规划中称其已有该能力。本轮不新增上下文参数、表单状态管理或鉴权逻辑。SONIC Link 的购买限制、注册/验证码/草稿边界全部保持。

## 媒体与案例清单

以 `docs/media-sources.md` 和 `src/data/media-sources.json` 为现有素材依据；已记录的用户展示授权限于其中选定资产，不能外推至新介绍视频及其中第三方内容。

| 素材 | 现有状态 | 建议使用与限制 |
| --- | --- | --- |
| About 现有服务机器人首屏图 | 已在 AboutHero 使用 | 保留；现有使用不等于新核实了其完整来源，不换成视频渲染冒充实物 |
| 正式 Logo、Lanyard 图纹 | 既有品牌资产，brand-audit 已记录 | 保留原组件与后备机制，无需重新绘制 |
| RoboDock 概念图、安装草图 | 台账明确为概念/非实物 | 第 4 段小幅图文，沿用标注；不作为安装完成或巡检部署证明 |
| 3pt-demo、wholebody-balance | 已入库研究演示；来源与三点/全身 SONIC 说明有关 | 第 4 段优先选择其中一段；实际版本、硬件及是否使用 RoboDock 不擅自补全 |
| wholebody-pick | 人工 VR 抓取演示 | 如确需解释操作研究可链接现有方案；不包装自主搬运成果，不必在 About 重复铺满 |
| camera-teleop、dance-video-motion、music-motion | 相关研究；部分版本归属未确认，music-motion 为仿真 | 本规划不新增堆叠；不能统称当前 SONIC Link 商用能力 |
| SONIC PICO 套件照片、抓取/动作照片 | 已有素材记录 | 核对图注后作为能力段替代静帧；不得改称实际整套交付清单 |
| software-console-early.png | 历史早期界面 | 如采用须标历史 Demo，不能当实时设备连接证据；优先不在公司页重复 |
| 新介绍视频 128s RoboDock 渲染与后台画面 | 本轮看过关键帧，尚未新增公开发布授权记录 | 作为来源研究；不直接截取上传，不省略概念/界面性质 |
| 新视频 28s 等第三方机器人图形 | 可见“宇树科技、智元机器人官方资料”来源标识 | 不搬用；四层图未来采用原创语义 HTML/CSS 排版，不复制图形 |
| 康养、景区、线路画面 | 视频中可见媒体标识；175s 有钱江及中国农业银行等标识 | 核实原媒体权利、第三方标识、项目归属和团队参与角色；不裁掉标识，不转成合作伙伴/客户背书 |

待核清单：每类实践的原项目时间、团队成员/主体及参与范围；是否属于 ONE-G 当前主体；可公开场地/机构名称；原始高分辨率素材、发布权和必要署名；遥操作片段与当前 SONIC Link 版本关系；背包图和界面的概念/原型/实物状态。未核实项写在内部台账，不在页面伪造事实或使用“待设计”占位文案。

本视频只有 967×544 且包含完整讲解版式，不能无限放大截帧作为大幅实拍。优先已有原素材；本轮不下载、不生成或发布新媒体。若后续完整介绍视频获准发布，采用独立点击播放器、controls、合适封面、preload=none；不要切换到 ScrollExpand 现有 autoplay/muted/loop 视频分支，不允许多段有声自动播放。

## 未来最小文件范围（全部尚未修改）

| 文件 | 拟议职责 |
| --- | --- |
| `src/app/about/page.tsx`、`about.module.css` | 六段正文、稳定锚点、连续图文与局部布局；保留旧 ID、尾部组件 |
| `src/components/AboutHero.tsx`、`AboutHero.module.css` | 保留 ScrollExpand，增加始终可达的定位/两个 Link；不改共享默认行为 |
| `src/components/AboutVision.tsx` | 优先原样复用；只在确有必要时调整承载位置，不重写愿景 |
| `src/i18n/dictionary.ts` | 未来同步新增段落、状态、链接与图注英文；当前不写入 |
| `src/components/ProductDetailContent.tsx` | 仅 RoboDock overview 增加一条 About 次级 Link |
| `src/app/solutions/page.tsx` | 增加一条 About 次级 Link；保留已完成方案分区、导航与兼容逻辑 |
| `src/app/solutions/teleoperation/page.tsx` | 第二阶段评估是否需要详情直达 About，不扩写方案能力 |
| `docs/media-sources.md`、`src/data/media-sources.json` | 只有实际新增公开媒体且核实后，才补来源与性质，不提前宣称授权 |
| 现有测试及小型针对回归 | 保护新链接、旧锚点、无障碍与主题/语言；不修改无关基线 |

如正文确需独立内容数据，后续可建立小型 About 专用数据文件；本轮不凭空创建。产品/方案完整事实继续引用现有集合，不复制第二份业务数据。Header、导航抽屉、首页 Layout Grid、商品分类/购买、About 以外按钮、Lanyard、Footer、注册/鉴权均不在改造范围。

## 分阶段实施与验收清单（未来工作）

**阶段 1：内容定稿与素材门槛。**确认本文草案和案例归属；保留 U/S 原句，逐项处理 Q。明确公开素材及必要标注。未确认案例不发布，不能以占位图凑齐六段。

**阶段 2：局部结构与双向链接。**先实现 About 连续正文、四层图和两个必要反向入口；保留 ScrollExpand/Lanyard/Footer 与旧 ID。四层图的三项真实链接可键盘访问，大脑不做假按钮。使用真实 Link，不等待动画结束再导航。

**阶段 3：真实画面和操作验收。**同版本采集 1440px 桌面、768px 平板、390px 手机，中英/日夜代表组合；检查长英文、焦点、减少动画、媒体控制与自然滚动。逐项核对：

- 首屏品牌、定位和两个入口可达；非六段满屏，手机无横向溢出。
- RoboDock 仍为概念预览；SONIC Link 无购物/购买入口；研究、历史、规划图注完整。
- 三个可点击层到真实页面/分类；新旧 About 锚点不被 Header 遮挡。
- 商品与方案反向入口均到准确段落；直接刷新、新标签、后退/前进保留目标。
- 切日夜、中英文不丢输入或购买选择、不重播整页、不重建全部视频。
- 现有客服未登录安全返回、登录后一次打开、关闭后焦点回退；只出现前端预览，无假发送。
- Lanyard 正常延迟出现或静态回退，Header 图片菜单、首页方案 Grid、Footer 未改变。

后续有运行时修改再按实际命令执行：`npm run lint`；`./node_modules/.bin/tsc --noEmit --incremental false`；相关 Node/浏览器回归；`node --test tests/*.test.mjs tests/*.test.cjs`；`npm run build`；`git diff --check`。浏览器优先复用 `tests/contact-preview.browser.cjs`、`tests/theme-state.browser.cjs`、`tests/multilingual-layout.browser.cjs`、`tests/solutions-layout.browser.mjs` 的能力，先读环境与独立证据输出路径，不覆盖历史记录。当前无 npm test/typecheck 脚本。

`tests/product-v2.test.mjs` 的完整字节基线包含 About 文件；未来合法改版若触发它，必须先解释具体字节差异与保护目标，再单独评估对应 About 项，不批量更新，不触碰 RoboDock 数据基线。本轮不运行或更新任何快照。

## 本轮检查与未执行范围

已执行：源码与实际路由核对、本机视频元数据及关键帧读取、品牌与素材记录核对、原工作树记录、现存文件哈希保护核验、`git diff --check`（详见同任务目录 `planning-verification.json`）。本文是规划文档，不是已完成的页面，也不是运行时或独立视觉验收报告。

未执行：新布局渲染、交互回归、独立视觉评审、lint、类型检查、Node 测试、build；本轮没有业务代码变化，不声称这些通过。截图是源视频取证，不是新 About 页面截图。

历史退出超时、首次输入丢失以及 hydration 记录保持原结论；本轮没有新增因果证据，不更新或宣称解决。实施须待下一次明确授权，本轮到此停止。

## 2026-11-03 实施追加记录（保留以上原规划）

已按既定方向实施：1 品牌首屏与愿景、2 两条互补路线、3 四层关系与真实链接、4 RoboDock 概念与已入库遥操作研究、6 正在沉淀的平台方向与咨询。第 5 段团队实践，以及第 4 段本体设计归属均未获新的确认，正式页面不渲染，也不输出空锚点或占位媒体。本轮没有创建开发预览，因此不存在可被误带入生产的未确认案例分支。

首屏保持 ScrollExpand 原组件、滚动距离与断点机制，操作区位于 AboutHero 的普通内容层。Lanyard、Footer、Header、全局状态、客服及认证源文件保持。RoboDock overview 和方案总览各增加一条“了解万机的平台路线”→ `/about#platform-route`，未增加可选的详情页第三入口。

测试基线定向变更理由：`product-v2-baseline.json` 中 About 页面原始字节保护的是旧三段正文。本次授权改版增加路线、四层图、概念/研究限定及新入口，旧字节不再是正确期望。仅更新 `src/app/about/page.tsx` 对应项；其余三个数据项（含 RoboDock）保持原值。新增 About 路由/发布边界测试和真实浏览器回归，继续保护商品/方案身份、稳定锚点与未确认案例不发布。旧历史基线文件不批量更新。

### 分段交付状态

| 原规划段落 | 实施结果 |
| --- | --- |
| 1 品牌首屏与愿景 | 保留正式 Logo、原图、ScrollExpand 与愿景组件；增加始终可达的定位、RoboDock 与方案入口 |
| 2 问题与路线 | 已实现互补路线说明，未宣称穷尽行业路线 |
| 3 从接入层切入 | 已实现四层语义列表；大脑无假入口，另外三层连接真实目标；保留旧 our-positioning |
| 4 产品与能力 | 已实现 RoboDock 概念图文与已授权全身研究演示；本体设计归属未核，不发布该子项 |
| 5 团队实践 | 未发布，无开发预览、空锚点或大块占位；康养、西溪湿地、线路作业继续待核 |
| 6 平台方向与咨询 | 已实现进行中语义、商品/方案链接及唯一 About 咨询入口；前端预览边界保留 |

### 已实现的双向链接

| 组件/位置 | 文案 | 逻辑 href | 目标 |
| --- | --- | --- | --- |
| AboutHero、接入层、RoboDock 能力段 | 了解 RoboDock | `/products/robotdock` | 现有商品介绍 |
| 四层图运控、遥操作能力段 | 了解遥操作方案 | `/solutions/teleoperation` | 现有 SONIC Link 方案详情 |
| 四层图本体 | 浏览现有机器人产品 | `/products?category=robot` | 现有商品分类 |
| 遥操作能力段 | 查看方案场景 | `/solutions#teleoperation` | 已显示的稳定方案分区 |
| 首屏、末段 | 查看解决方案 | `/solutions` | 现有总览 |
| 末段 | 浏览商品中心 | `/products` | 现有商品中心 |
| ProductDetailContent，仅 RoboDock overview | 了解万机的平台路线 | `/about#platform-route` | 问题与路线 |
| solutions/page，连续方案正文之后 | 了解万机的平台路线 | `/about#platform-route` | 同一分区 |

链接目标由 `src/lib/about-navigation.ts` 引用现有商品 helper、方案与导航配置；LocalizedLink 处理 basePath。没有修改旧兼容入口或全站导航数据。咨询沿用 SupportButton/ContactProvider 的安全返回，不添加新上下文协议。

### 验证与评审结果

- 修改前 Node 基线 14/14；新增 About 测试后 15/15 个测试文件通过。
- 类型检查通过；lint 0 错误、1 条既有警告：`.oil-ui/residual-20261102/session-cases.mjs:4` 的 events 未使用，未屏蔽规则。
- `npm run build` 通过。最初沙箱构建无法解析 TypeScript showConfig，原命令在允许的环境重跑成功，未改依赖或项目配置。
- 生产静态预览及隔离开发副本分别覆盖 1440/768/390 × 中英 × 日夜，共各 12 组。检查自然滚动、无横向溢出、稳定 ID、概念/研究说明、未发布案例不渲染、播放器 controls/preload/无自动播放。
- 实际点击商品、分类、方案详情、方案锚点及两个反向入口；验证直接锚点/刷新、前进后退和语言/主题切换保留同一视频元素。生产补验原生新标签打开与键盘 Enter，结果见验收 JSON。
- 隔离开发 Mock 中，虚构账号完成“About → 登录 → 原位置 → 单次预览 → 关闭焦点返回 → 刷新不再打开”3/3；未产生真实服务 POST，没有保存凭据截图或 trace。
- 正常动画下实际滚动 ScrollExpand，检查 overlay 进度；桌面/手机实际滚入 Lanyard，确认 WebGL ready，并以命中 grabbing 状态确认拖动。减少动画下吊牌完整直接显示，Footer 保留。
- 独立视觉截图复核 1 轮及同问题补证复核，另有独立真实 UX 走查 1 次。吊牌/概念图原整页截图空白经真实滚入补证解除；没有独立评审者假扮实际拖动。手机夜间首屏旧标题对银白机身局部低对比作为既有局限保留。
- 独立 UX 实际走通 About → RoboDock → 配置预览，发现既有“购买”文字与“概念预览”状态易混淆；购买链路被本轮明确锁定，记录而不顺带修改。

完整结果与原始失败均保留于 `.oil-ui/about-implementation-20261103/verification-summary.json` 所指的独立运行目录。生产截图包含 `1440-zh-CN-light-top.png`、`390-en-dark-top.png`、各语言/主题的 body/capabilities 截图；本地任务目录另有 scroll-expanded、lanyard-reduced 截图和独立评审报告。局部元素截图可能将固定 Header 叠入中段，不能据此判断真实正文中插入了导航。

### 环境限制与保留开放项

原用户开发进程曾出现脚本语法错误、实例变化、HTTP 500，原始失败保留；未停止或改配置。隔离开发副本又明确记录 Next 拒绝 127.0.0.1 开发资源来源，改用允许的 localhost 后同套检查通过。这不能证明最早的语法错误和实例变化均已找到根因；本轮未改框架或鉴权处理。生产预览最初 HEAD 404 来自本地取证服务器遗漏 basePath，修正服务器后完整通过，未过滤 console 错误。

未验证正式认证/客服后端（尚未接入）、真实硬件控制、媒体版权新增授权、全部浏览器引擎或全站逐页；未声称像素与旧页完全一致。新布局未做实时完整视频录制，交互由实际浏览器操作和状态断言取证。历史退出超时、首次输入丢失、hydration 开放项沿用原证据与结论，均未宣称解决。

### 本轮实际修改文件与证据入口

源文件：`src/app/about/page.tsx`、`about.module.css`；`src/components/AboutHero.tsx`、`AboutHero.module.css`；`src/lib/about-navigation.ts`（新增）；`src/components/ProductDetailContent.tsx`；`src/app/solutions/page.tsx`；`src/i18n/dictionary.ts`。

测试：新增 `tests/about-layout.test.mjs`、`tests/about-layout.browser.mjs`；仅定向更新 `tests/product-v2-baseline.json` 的 About 页面项。文档：本文、README、`docs/code-integration-audit.md`、`docs/media-sources.md`。其余原有未提交文件不受本轮写入。

最终生产截图目录：`docs/reviews/browser-runs/about-layout-2026-11-03T10-41-22-223Z-production-2e025aea-ccf2-4e1a-ab50-970513dfbe9b/`；开发目录：`docs/reviews/browser-runs/about-layout-2026-11-03T10-36-09-127Z-warm-2cb3a83d-8bb8-4e87-bcfc-59deb8ace349/`。每次运行独立保留时间、条件、UUID、命令、日志、时间线及结果，失败没有被成功运行覆盖。使用 Chromium，不能外推为 Firefox/Safari 验收通过。
