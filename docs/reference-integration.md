# ONE-G 参考集成差异报告与实施顺序

日期：2026-09-17。本轮仅完成 STEP 1–2：读取三个仓库，输出审计与差异报告。**没有执行 terminology refactor、路由改造、Schema 编码、Product 新增、资产迁入或页面开发。** 下文“计划/建议”均不是已实现功能。

## 审计产物与事实源

- [ONE-G 架构](./one-g-architecture.md)：主仓库技术、类型、Auth、Theme、资源与构建约束。
- [RobotDock 参考](./reference-robotdock.md)：仅从 robotdock-demo 提取概念产品、四档套装、规格边界。
- [SONIC Link 参考](./reference-sonic-link.md)：仅从独立 sonic-link-demo 确认三档套餐、夹爪选配、升级路径与当前状态。
- [术语清单](./terminology-audit.md)：可重现搜索口径、命中位置与分类。
- [基线清单](./audit-baseline.json)：HEAD、初始/最终状态、参考文件哈希与资产尺寸。

RobotDock 来源：`https://github.com/xuanqisun/robotdock-demo`，只读。
SONIC Link 来源：`https://github.com/xuanqisun/sonic-link-demo`，只读。
唯一正式修改仓库：`https://github.com/l-s-hao/one-g.git`，本地 `/home/lsh/ONE`。本轮仅新增 docs 审计文件。

## 主要差异与处理方案

| 维度 | ONE-G 当前 | 参考内容 / 目标 | 计划 |
| --- | --- | --- | --- |
| 技术 | Next App Router + React + strict TS | 两参考均原生 HTML/CSS/JS | 独立 TS/TSX 实现，保留主站依赖与风格 |
| 路由 | customize/start + customize | configure 入口 + 三个产品配置 | 新路由与静态旧路由兼容，保留 query/hash |
| 工作台 | CustomizeWorkbench 固定五类整机字段 | 三种不同配置组 | 抽取一个 ConfigurationWorkbench，Schema 驱动 |
| 推荐 | SceneRecommendation + Mock | 新产品无推荐算法 | robot 保留；另两种无证据不造推荐 |
| 产品 | 8 个 Mock 产品，三种状态 | 新增两产品，支持 concept/discontinued | 扩展统一 Product/CatalogStatus，不建平行 Product 基础类型 |
| 价格 | price? 已支持获取报价 | 两产品没有确认价格 | 复用未定价机制，不填 0 或虚构金额 |
| 可选与可买 | 非 active 即不可选 | 概念/预览可选但不可买 | 分开配置预览资格、销售状态、兼容证据 |
| 保存 | one-g-config 单一整机，保存即入购物车展示 | 多产品独立预览 | 带 schemaId/version 的命名空间或记录，兼容旧整机数据；预览不写现有购物车配置 |
| CSS / Theme | Tokens + CSS Modules + Tailwind | Demo 全局青灰配色 | 仅学习视觉层次/交互，局部 CSS 使用主站 tokens |
| Auth | SiteShell 默认保护业务路由 | 新 products/configure 都要求 USER | 复用守卫，保持登录回跳与角色分离 |
| 品牌 | 正式 BrandLogo + public/brand | Demo 旧 ONE-G Robotics 标识 | 复用当前 Logo，不迁旧页头页脚 |
| 资源 | 主站本地资源 + 自动 DriftWall 扫描 | 概念图、草图、现场图、历史截图 | 授权明确后复制到 products，记录来源并控制首页扫描 |
| 销售 | Mock 购物车与结算 | 两参考均不下单不支付 | 新产品显示预览/报价/联系；底层和恢复购物车都检查资格 |

## 关键纠偏

1. SONIC 以独立仓库为准。RobotDock 内的旧遥操子页有过时状态与不同套餐结构，不能混用。
2. 参考源码把三点与全身列为已有技术，不代表商业交付条件已确认；SONIC 仍不设 active。
3. RobotDock 的 CAN/USB、软件协议、功率、热插拔等带有规划/待验证限定，不从渲染图推导新规格。
4. 主仓库已有 Product.price?；无需重复增加 nullable 价格类型。缺少的状态扩在现有 CatalogStatus。
5. CompatibilityRule / RecommendationRule 并不存在；实际兼容为 compatibleWith，实际推荐为 SceneRecommendation。先复用这些语义，确有需要才扩展。
6. 主站 Mock ONE-G G1 与参考中的 Unitree G1 不能仅因名称相似就视为同一产品或兼容 ID。
7. Static export 不支持 next.config 服务端 redirects；保留两个可静态输出的旧路由兼容页面。
8. 两参考无明确 LICENSE；团队提供素材的来源线索已记录，但本轮未确认使用授权，未复制源码或资产。

## 计划中的 Product 数据（尚未写入）

| id / slug | 产品 | 建议 status | price | 分类建议 | 用户动作 |
| --- | --- | --- | --- | --- | --- |
| robotdock | RobotDock 通用机器人小背包 | concept | undefined | accessory，元数据区分拓展坞 | 产品预览、配置预览、联系 |
| sonic-link | SONIC Link 遥操作解决方案 | coming-soon | undefined | accessory，元数据区分遥操方案 | 方案预览、配置预览、获取报价 |

两者都不设为 robot，避免被现有 getProductsByCategory("robot") 自动变成整机 base 选项。沿用 Product，按需增加强类型 specifications、来源/状态说明、configurationSchemaId 等扩展。未获许可时 images 可空，复用缺图占位，不引用参考 GitHub Pages 图片 URL。

## 共享 Schema 设计边界（非最终代码）

在 src/types/configuration.ts 的现有体系中扩展，避免 ConfigOption 与 ConfigurationOption 维护同义字段。可先使 ConfigurationOption 对组 ID 可扩展，再由 ConfigGroup 描述 single/multiple、必选性、默认值与最大选择数；ConfigOption 若保留名称，应作为复用现有类型的别名/派生，而非平行模型。

ConfiguratorSchema 需要稳定 id、产品关联、groups、默认状态、预览/保存/购买行为、可选推荐/校验适配器；ConfigurationState 表达 schemaId、版本、各组稳定 option IDs。组是否完成应依据必选/可选规则，取消夹爪不能被判为未完成。

ConfigurationWorkbench 按 Schema 渲染模块库、槽位、摘要、进度与价格；纯函数负责选择、兼容、计价与列表，UI 不依赖具体产品。summary 可从现有工作台抽出一个共享 ConfigurationSummary，不复制三份。

| schema | 真正配置组 | 默认与约束 |
| --- | --- | --- |
| robotSchema | BASE PLATFORM、ARM、END EFFECTOR、PERCEPTION、CAPABILITY | 适配现有 RobotConfiguration；保持场景推荐、价格、兼容提醒、保存和移动交互；COMPUTE 仅留未来扩展，不造现有选项 |
| robotDockSchema | PACKAGE/BUNDLE 单选 | base 默认；hand/gripper/gripper-camera；后面三档赠连接件；最后一档两台腕部相机；仅预览 |
| sonicLinkSchema | PACKAGE 单选 + ADD-ON 可选 | three 默认；full/dual；智元夹爪默认无；套餐切换保留选配；query 仅接收 three/full/dual；仅预览 |

SONIC 升级放详情说明，不默认添加软件/脚环；所有已有套餐内硬件作为清单内容而非额外自由选项。未知兼容性显示待确认，不等于可承诺交付。

## 严格实施顺序

| STEP | 后续范围 | 阶段验收 |
| --- | --- | --- |
| 1 | 三仓只读审计 | 已完成，基线与参考事实固定 |
| 2 | 差异报告 | 已完成，本文件及配套报告 |
| 3 | 仅 ONE-G 术语与定位 | A 类标准配置文案替换；B 类工程服务保留；C 类旧代码兼容；主定位使用用户给定标准文案 |
| 4 | configure 路由骨架 | 入口询问配置对象；robot/robotdock/sonic-link 独立路由，共享 Auth/Theme/壳；不先复制工作台 |
| 5 | 共享 Schema/Workbench | 先让 robotSchema 复现原整机能力，旧存储仍可解析；preview 无写入副作用 |
| 6 | RobotDock 产品资料/页面 | 使用概念状态与真实规格限定；授权明确后才本地复制资产 |
| 7 | robotDockSchema | 四选一、赠连接件、相机数量和清单正确；不入购物车 |
| 8 | SONIC 产品资料/页面 | 采用独立仓库事实，说明历史截图；授权明确后才复制资产 |
| 9 | sonicLinkSchema | 三套餐 × 夹爪六组合、深链回退、升级边界正确 |
| 10 | customize 兼容入口 | /customize/start → /configure；/customize → /configure/robot；保留有效场景参数与登录回跳 |
| 11 | ONE-G 重复代码清理 | 同一工作台、类型、品牌/主题/权限组件；无 Demo 根组件、全局 CSS、iframe、运行时外站资源 |
| 12 | 正式验收 | 只在 ONE-G 执行 npm run lint / npm run build；验收静态路径、Auth、主题、移动端和旧数据；再次比对参考 HEAD/status |

STEP 3 的定位为“ONE-G — 可配置的智能机器人平台”，辅助文案“标准模块，自由组合，为不同任务快速构建机器人。” 配置页显示“ONE-G 配置基于标准模块和兼容规则。” 超范围需求指向“该需求超出标准配置范围，需要工程评估。” 真实机械结构研发、开模、特殊协议、全新算法等工程服务不做机械替换。

STEP 4 到 STEP 10 之间旧页持续保留，已有链接不会因提前删除旧目录而失效。新产品只进入商品中心/配置中心，不增加顶级导航。

## 本轮结果与下一阶段验收关注点

已吸收的是审计文档中的产品事实、视觉/交互分析和配置规则；进入正式页面的数据/图片/源码数量均为 0。未迁入的内容包括整个 Demo 网站、Header/Footer/Logo/reset、部署脚本、旧 SONIC 子页、未确认规格、GEM、未确认购买/价格与缺少授权的图片。

新增 ONE-G 业务组件 0；新增 Product 0；实际术语替换 0；Schema 和 configure 路由尚未编码，旧路由尚未改动。现阶段未发现必须保留为工程服务的已命中业务文案；完整 A/B/C 分类见术语清单。

lint/build 本轮未执行：本次是只读业务审计与新增 Markdown/JSON 报告，不能将以前开发服务成功启动等同于本次生产构建通过。最终重构 STEP 12 必须实际运行并记录结果。

主要回归点：旧整机 localStorage 解析、场景推荐只覆盖指定组、首页 preview、未知价格合计、非销售产品与历史购物车、登录携带 query/hash、静态直接访问新旧路由、普通主题/品牌锁/特殊主题、移动端非拖拽操作、资产进入 DriftWall 的副作用。

参考仓库最终复核：robotdock-demo 和 sonic-link-demo 的 `git status --porcelain` 均为空，HEAD 分别保持 `218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f` 与 `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`。没有修改、格式化、安装、commit、push、PR 或恢复操作。机器记录见 audit-baseline.json。

## STEP 6 — RobotDock 接入商品体系（2026-09-17）

以上 STEP 1–2 内容为历史审计记录；本节记录 STEP 6 的实际实施结果。只修改 `l-s-hao/one-g`，未实施 STEP 7。

### 来源、状态与授权边界

来源：[robotdock-demo](https://github.com/xuanqisun/robotdock-demo)，再次核验的 commit：`218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`。事实依据为 README「内容边界」「图片」、dist/index.html、dist/app.js 的 bundles。仍无 LICENSE/COPYING/NOTICE，页面、JS、CSS 文件头也无代码复用许可。本次没有直接复制参考仓库源码；不移植其 Header、Footer、Logo、CSS、JS、App Shell 或部署脚本。

图片使用依据：本次用户明确允许迁入项目自有图片；README 记录 design-sketch.png 为用户提供的设计草图、robotdock-concept.png 为依照该草图由 image_gen 生成的图片。本次按该项目资产来源及用户授权复制这两张 PNG，仅用于 ONE-G。此授权依据不等同于仓库获得开源许可证，也不扩展到其他资产。

RobotDock 为暂定展示名称、通用机器人电子小背包/拓展坞；首代概念方案、内部讨论、未开放销售。价格、型号、交期未定，接口/兼容性/交付内容仍待确认。Product 为 `concept`，price 省略；图注持续注明 AI 概念图而非实物。保留原 Demo 的 noindex/nofollow 意图，正式 metadata/canonical 位于 ONE-G 本地详情路由。

### 迁入资源

| 原文件（dist/assets/） | ONE-G 路径 | 尺寸 / 大小 | 使用 |
| --- | --- | --- | --- |
| robotdock-concept.png | public/products/robotdock/robotdock-concept.png | 1254×1254 / 2,004,460 bytes | Hero 与商品卡；标注 AI 概念效果图、非实物 |
| design-sketch.png | public/products/robotdock/installation-sketch.png | 946×1208 / 662,255 bytes | 安装参考；标注非最终适配图 |

两文件保持原始字节与比例，未重生成或加工。next/image 提供 width/height、sizes，Hero preload、草图默认懒加载；沿用 static export 的 unoptimized 设置，资源路径含 /one-g/，没有运行时跨站图片。为保留原始资产可追溯性，本阶段未转换格式。产品页 CSS 不使用 invert；Monochrome 下保持原始图片色彩，文字与界面由主题 tokens 控制。

原仓库没有独立接口图/SVG、套装照片、视频、尺寸图；未创造这类素材。旧 Logo、SONIC 子页面资源全部未迁入。首页自动图片扫描显式排除该概念资料目录，避免 AI 概念图/草图无说明地进入 DriftWall。

### 数据、Section 与独立实现

Product 位于 `src/data/products/robotdock.ts`，由现有 products 集合导出；复用 `accessory`（配件），没有新增产品专属 category。共享 Product 仅扩展 concept 状态、可选 specifications/detail；没有 RobotDockProduct 基础类型。

吸收的事实：规划集中供电、统一通信、面向已适配设备的换装；拟定 CAN/RS-485/Ethernet/USB；规划 ROS 2/DDS/Python SDK；宇树 G1 为首发目标、版本待定，G1+ 待验证；智元夹爪已有接入基础而非量产验证；灵巧手待选型；供电数值、尺寸重量未知；暂停任务/停稳/独立断电换装与热插拔待验证的边界。没有虚构任何数值规格。

保留四档套装名称与清单：小背包、小背包+灵巧手、小背包+夹爪、小背包+夹爪+双腕相机；后三档赠连接件，相机为两台、型号待定；所有套装不含机器人本体。本阶段用四张信息卡展示全部清单，不建立选择状态或 ConfiguratorSchema。

Original concept：产品图/安装参考 + 核心价值 + 接口规划 + 兼容阶段 + 四套装清单 + 规格与状态。

ONE-G implementation：`ProductDetailContent.tsx` 与同名 scoped CSS Module，以共享 Product 内容驱动 Hero、设计重点、接口、兼容与草图、套装、规格、状态区域；基于 ONE-G tokens 独立编写 JSX/CSS。沿用 `products/[id]`、generateStaticParams、SiteShell 内 Header/BrandLogo/Footer/RequireRole/ThemeProvider；直接复用 SupportButton 和 site-contact，不添加另一套客服信息。

没有现成 ProductCard/规格组件可直接调用，原商品卡内联于 products/page.tsx；现提取同样布局为 ProductCard，概念产品增加文字状态和图片性质说明，卡片只链接本地详情。普通商品布局与行为保留。规格以语义 dl 展示，不为此大规模改造其他商品页。

### 路由、购买和本阶段边界

`/products/robotdock` 由现有动态详情入口静态生成，不新增独立站点或 iframe。未登录仍经原 RequireRole 跳登录，returnTo 保留该目标；普通用户主题和两种特殊主题生效，产品页不锁品牌主题。

RobotDock 无加入购物车、购买或配置 CTA：其状态 concept 且 STEP 7 尚未实施。Hero 只提供查看套装/了解规格锚点；统一客服入口可用。AddToCartButton 对非 active 产品隐藏；addCartProduct 原有 active 检查保留，parseCart 增加 active 校验，避免通过历史 localStorage 恢复概念产品。整机配置快照与工作台未改。

当前没有真正的商品搜索功能，Header 的“搜索”只是 /#search 占位链接；本阶段没有另建搜索系统。RobotDock 可从全部商品和配件分类找到。featured=false，不改变首页核心产品或硬件推荐。

未创建 /configure/robotdock、robotDockSchema、RobotDock 工作台或 SONIC Link 产品/资源；/configure 入口、registry、robotSchema、推荐逻辑保持 STEP 5。

### STEP 7 待处理

只能按真实四档套装建立一个单选 Bundle 组，不拆出不存在的自由组合。必须继续表达预览、未知价格和不可购买；当前通用工作台以 active 可选、保存即进入购物车，需要在 STEP 7 明确“可预览但不可销售”的行为边界。保留赠送连接件、两台相机、型号待定、本体不包含；参考源码没有可执行兼容矩阵，不制造兼容规则。

### STEP 6 验收结果

- `node tests/configuration.test.mjs`：9 项 PASS，包括 STEP 5 原有 8 项与新增 concept 商品查询/分类/featured/Robot 选项隔离/加入及恢复购物车拦截测试。
- `npm run lint`：PASS，0 errors；DriftWall、ScrollExpand 的两条既有 no-img-element warnings 保留。
- `npm run build`：PASS，27 页；`out/products/robotdock/index.html` 及两张本地图片存在，basePath 为 /one-g/。首页图片扫描仍为原有 hero 3 张。
- 静态产物浏览器验证：未登录访问 RobotDock → login，实际 Mock 登录后回原产品路径；原 Header/BrandLogo/Footer、统一客服正常。
- 五种普通主题及 Color Vision Safe / Monochrome 均生效；图片加载成功且无 invert。390px、320px 无水平溢出，Section 顺序和套装/规格锚点正常。
- 商品中心概念状态、图片性质与获取报价文案正确，配件筛选可找到 RobotDock；原 G1 详情仍可加入购物车。
- `/configure/robot?scene=handling&scope=arm` 默认价格、推荐应用、100% 进度、配置加入购物车通过；与 STEP 6 前快照比较，configuration 目录、工作台、configure 路由源码未改。
- 浏览器零 pageerror、零 HTTP 资源错误；正式产品页面没有 iframe、购买或 RobotDock 配置链接。静态 HTML 只有一个 canonical，指向 ONE-G 产品 URL。
- 两参考仓库 git status --porcelain 为空，HEAD 与审计基线一致，全部已记录文件 SHA-256 相同。
- 两张图片原样复制的 SHA-256：robotdock-concept.png `ead4b3e68fbb9b81f64f0c056e28d433569ff5b455e1a35101329a94b77053d2`；installation-sketch.png `038f625105e7396aa71002d0cfd8c8cacafaa237ca8d48450ce282fd14df9d1d`。

验证对象为本地 GitHub Pages 同路径静态托管产物，未发布远程站点。STEP 6 完成，到此停止。

## STEP 7 — RobotDock Configuration Schema

以 STEP 6 已迁入的 Product.detail.bundles 为事实源，映射成唯一 ConfigurationGroup `bundle`（PACKAGE，single，required，min=max=1），默认 base。四档 Product bundle 的 id/name/description 原样映射 ConfigurationOption，items 映射 metadata.includes；没有重录另一套套装数据。

固定线束/连接件/相机数量保留在 Includes；接口与兼容目标仍为产品详情，不增加 accessories/platform/arm/vision 等选择组，不创造推荐或兼容矩阵。原参考仓库仅用于状态完整性核验，本次未复制任何资源或源码。

/configure/robotdock 使用共享工作台；/configure 增加概念预览入口；产品页增加配置预览 CTA。概念配置使用自己的版本化存储键，不生成购物车快照、不加入购物车。普通 Robot 的旧存储、推荐与购物车行为保持。具体规则和测试见 [robotdock-configuration.md](./robotdock-configuration.md)。未开始 SONIC Link。

STEP 7 验收：12 项规则/存储/商品契约测试 PASS；浏览器桌面与 375/390 移动、七种主题、登录回跳、四套装及 Includes、保存隔离与整机回归 PASS；lint PASS（两条既有 warning），build PASS（28 页）。两参考仓库 clean，HEAD 与审计文件哈希不变。

## STEP 8 — SONIC Link 接入商品体系（2026-09-17）

仅修改 l-s-hao/one-g，保留 STEP 3–7 已有工作。来源为只读 [xuanqisun/sonic-link-demo](https://github.com/xuanqisun/sonic-link-demo)，commit `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`。再次完整核对 tracked 源文件、README、页面、脚本、样式、测试、部署脚本及资产文件头；未运行参考仓库任何脚本、安装、格式化或部署。

### 事实与映射

- SONIC Link 是面向宇树 G1 的遥操作软硬件方案，PICO 动作采集 + 对应模式软件 + 通用小背包，不含机器人本体。
- 三点与全身为已有技术，源页面明确暂未开放下单；映射 `coming-soon`，UI 显示「即将开放」并说明方案预览、技术已具备。price 省略，运行时 undefined；卡片获取报价，详情价格待定。没有承诺销售日期。
- 三点：头显 1、手柄 2、三点软件，无脚环/全身软件。全身：头显 1、手柄 2、脚环 2，仅全身软件。双模式：共用上述一套全身采集硬件，包含两模式软件。智元夹爪属于可选说明，型号/数量待确认；未选配沿用 G1 橡胶手，不额外交付、不赋予固定橡胶手主动抓取能力。
- 后续升级保留三点、解锁全身、另获两脚环，沿用原硬件；升级价格/办理未定。不创建升级配置选项。
- G1 EDU 版本与二次开发权限需确认，G1+ 待确认；没有推断电脑 OS、延迟/频率/精度、许可期限、售后或交期。

数据在 `src/data/products/sonic-link.ts`，由原 products 集合注册；仍使用 Product，category=accessory（现有配件分类承载机器人外设方案，不污染 robot 基础平台列表）。没有 SonicLinkProduct、availability/metadata 的重复事实字段。status/statusNote 表达销售状态，specifications/detail 表达产品信息。

ProductDetailContent 增加可选通用 editorial sections（段落、信息卡、媒体、内部链接），旧 RobotDock 详情字段部分改可选；保留 bundles 契约，不修改任何配置类型/Schema/引擎/工作台/路由。SONIC Link 的方案卡从同一 bundles 内容派生，没有选择状态。没有新增分类、依赖或独立产品页壳。

### 资源、实现与内容边界

四张团队图片使用本阶段允许复制项目自有资源的授权，来源是参考 README「素材」；这不是开源许可证声明。仓库无 LICENSE/COPYING/NOTICE 或源码复制许可，页面 JSX/CSS 按 ONE-G 独立实现。完整大小/哈希/来源见 [媒体来源](../public/products/sonic-link/README.md)。

| 迁入内容 | 路径 / 用途 |
| --- | --- |
| PICO 设备实拍 | public/products/sonic-link/device-pico-kit.jpg；Hero/商品卡，脚环未入镜 |
| 早期控制台 | public/products/sonic-link/software-console-early.png；流程区，明确历史状态和 GEM 不在范围 |
| 抓取使用实拍 | public/products/sonic-link/demo-grasp.jpg；Showcase |
| 全身动作实拍 | public/products/sonic-link/demo-motion.jpg；Showcase |

没有视频文件或 video 播放器，故迁入视频数量为零；不伪造播放按钮、autoplay 或视频规格。原图不加工/反色，保持比例，非 Hero 图片 lazy。约 5.6 MB 原始资源沿用 unoptimized 静态图片策略。首页扫描排除该目录，防止产品素材改变 DriftWall。

Reference behavior → ONE-G implementation：

- Demo 图集/放大弹窗 → 按媒体语义分布到 Hero、流程和 Showcase 的带 alt/图注静态图片；没有照搬 DOM 交互代码。
- Demo 套餐表单/清单 → 三档只读方案说明；夹爪与升级是产品说明，选择/保存/URL 预选留 STEP 9。
- Demo 小背包外链 → `/products/robotdock` 内部详情链接。
- Demo sticky 选购面板 → ONE-G 正常纵向详情、锚点和既有客服；Mobile 不使用全屏 Section。
- 源码产品资料/交付表 → 统一 Product.specifications，演示画面另归 Showcase，不当作技术规格。

页面沿用 products/[id] 的 generateStaticParams/generateMetadata：Hero → 产品定位 → 遥操方式 → 系统组成 → 软件流程 → Showcase → 规格 → 状态/客服。统一 SiteShell 的 Header/BrandLogo/Footer、RequireRole、ThemeProvider、SupportButton/site-contact。产品页不锁品牌主题，仍仅首页/about 锁品牌。CSS 局部化，无 body/html/:root reset，无 iframe、运行时外站产品路径或媒体。

未迁入：配置逻辑与选购表单、Demo App Shell/Header/Footer/旧 Logo/全局 CSS、部署脚本、GEM、未经确认规格、外部 G1 遥操网站。独立 SONIC 源码未指向 g1-humanoid-teleoperation，不添加凭空的外站入口或占位。历史软件截图中的标识只属于原始界面图，不用作主站品牌组件。

商品中心复用 ProductCard；非 active 卡片显示文字状态与「了解产品」，无购买或加购。已有购物车添加/恢复均拒绝 SONIC Link。无配置 CTA、/configure/sonic-link 或 sonicLinkSchema。当前主站没有商品搜索功能（Header 仍为占位），未另建搜索系统；名称、定位、三点/全身/PICO/G1 均存在可供未来搜索的真实数据中。类别和 status 数据过滤已验证。

### STEP 9 待解决（本阶段未实施）

依据三档真实方案确认一个必选套餐组、一个可选智元夹爪组，三档 × 夹爪开关六组合；切换套餐保留夹爪状态、默认不选夹爪。确认 bundle URL 预选/非法值回退与硬件不重复计数。沿用共享预览策略、独立存储、未知价格和不可购物；校准/算法能力/软件截图不应成为配置项。升级属于后续路径，价格/办理/许可/设备型号/兼容与交付条件仍须确认。不要把三点已有能力误记为待开发。

### STEP 8 验收结果

- `node tests/configuration.test.mjs`：13 项 PASS，含新增 SONIC 商品可发现、分类/status 过滤、未知价格、无 Schema/配置 CTA、加入及恢复购物车拦截；Robot 与 RobotDock 原有规则/存储测试继续通过。
- `npm run lint`：PASS，0 errors，保留 DriftWall/ScrollExpand 两条既有 no-img-element warnings。
- `npm run build`：PASS，29 个静态页面；SONIC、RobotDock、所有既有产品、两个配置页正常导出。沙箱内 TypeScript 子进程输出解析失败后，授权沙箱外构建通过。
- `tests/sonic-link.browser.cjs`：PASS。本地静态产物验证真实 Mock 登录回跳、Header/Footer 正式 Logo、客服、metadata/canonical、七种主题、全部图片可解码且无 invert、320/390/1440 无横向溢出、商品中心/配件分类、全部十个产品详情和两个配置页。无 pageerror/HTTP 错误。浏览器脚本复用现有 Playwright 安装，不新增依赖。
- 静态 HTML 及直接访问页面 canonical 均只有一个且指向 ONE-G；登录客户端跳转时曾观察到两份相同 canonical 的瞬态 DOM，不影响直接访问或静态输出。测试服务器 4174 后续无响应，改独立 4175 后完整复跑通过。
- `tests/step8-baseline.json` 保存阶段开始时配置路径、引擎、类型与工作台哈希，最终逐一一致；未开始 STEP 9。首页图片扫描仍为 hero 3 张。
- sonic-link-demo：`git status --porcelain` 为空，HEAD=`d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`。
- robotdock-demo：`git status --porcelain` 为空，HEAD=`218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`。
- 两参考仓库全部审计记录文件 SHA-256 与 STEP 1–2 一致。`git diff --check` PASS。未提交、推送或发布，本阶段到此停止。

## STEP 9 — SONIC Link Configuration Schema

实施前先落盘 [设计草案与实现记录](./sonic-link-configuration.md)，然后新增 `src/data/configuration/schemas/sonic-link.ts`、Registry 项与 `/configure/sonic-link`。三个产品共用 ConfigurationWorkbench，不复制任何配置 UI，不接数据库/报价后台/Admin CRUD。

事实仍来自 STEP 8 Product 和独立 sonic-link-demo commit `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`，本阶段无资源或参考源码复制。三个套餐（软件与硬件整体）映射 required/single `bundle`；智元夹爪映射 optional/multiple 0..1 `add-on`，默认 three、无夹爪。夹爪的既有文字提取为 Product 通用 addOns，与详情共用。切换套餐不更改夹爪，双模式硬件不重复计算，橡胶手不另交付。

展示实拍、历史软件截图、校准/检查/启动流程、升级说明留在产品页，不变成选项；机器人平台只有适配目标而无自由选择证据，故不添加 target/platform。没有真实场景推荐或不兼容组合，不编造 RecommendationRule/CompatibilityRule；通过套餐固定清单表达模式配套。

Reference behavior → ONE-G implementation：参考 bundle URL 预选通过 Schema.querySelections 和通用初始化函数重写；显式 query 优先于保存、非法回默认、不会自动加夹爪；参考套餐/checkbox 行为通过共享单选/多选引擎表达。状态 coming-soon、价格 undefined、无 Cart Item，预览保存使用原通用版本化存储且不生成 snapshot。客服获取报价沿用 site-contact。

/configure 新增“SONIC Link · 即将开放 · 配置预览”，RobotDock 显示“概念预览 · 配置预览”，整机保持“可配置”；Product CTA 新增“配置预览”进入站内 SONIC 路由。状态取 Product，metadata 不声称正式购买。工作台无 schema.id === "sonic-link" 特例。具体通用扩展见 configurator-schema 的 Actual Example 3。

STEP 9 验收：15 项核心测试 PASS；配置浏览器六组合、URL/保存、七主题、桌面/移动、报价、入口、Robot 推荐/Cart、RobotDock 四套装及存储隔离 PASS；产品页全量回归 PASS。lint PASS（两条既有 warning），build PASS（30 静态页面）。1280×720 发现的双插槽最小高度裁切已通过通用少组自然高度规则修复并复验。两个参考仓库 git status --porcelain 均为空，HEAD 和全部审计文件哈希不变。未开始下一阶段。
