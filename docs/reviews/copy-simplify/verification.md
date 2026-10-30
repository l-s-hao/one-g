# ONE-G 全站文案精简与视觉整理

> 附件范围：本记录引用的截图、JSON采样和临时测试脚本保留在本地，未纳入本次GitHub提交。

2026-10-30；仓库 `/home/lsh/ONE`，main，基线提交 `8fc2cf82e86b11d912bd99a68580877258779acc`。以本地工作树为准；开始时的 diff、状态及文件哈希保存在 `/tmp/one-copy-simplify`。保留此前全部未提交修改，未暂存、提交、推送、安装依赖或修改部署配置。

## 结果与范围

采用现有设计内的文案减法，不重做结构、字体、配色或动效。源码删除重复文字，配合局部间距调整；没有用CSS隐藏文字冒充删除。商品、价格、套餐、技术内容、身份验证及交易/咨询限制保持。

实际使用 Oil UI Pro 检查修改前后的页面与截图，并进行存量界面独立视觉复核；VibeHub整理以下判断规则。Oil UI Pro 0.27.1，位置 `/home/lsh/.agents/skills/oil-ui-pro`；VibeHub位置 `/home/lsh/.codex/skills/vibehub`。本机未安装oil-tone，本轮按现有规则完成；后续如继续打磨长文案，可选用[oil-tone](https://github.com/oil-oil/oil-tone)，本轮没有安装。

## 精简规则

1. 一段文字至少帮助用户识别对象、作出选择或完成操作；只重复标题/分类的，删除源节点。
2. 同一事实保留一处完整说明；核心用途、适配和交付边界不可当作装饰删除。
3. 英文眉题与中文介绍从同一实际组件删除，中英文同步生效；新短句补充现有字典。
4. 价格、型号、核心能力、规格、套餐内容、表单/错误/验证提示、付款和订单状态、法律隐私、客服操作提示保留。
5. AI图、安装草图、演示/未开售/未接服务等说明影响购买判断，可压缩措辞，不能隐去其限制。
6. 不为填空增加文案；删除后只调相关标题、卡片、表单间距。已有主题、字体、图像、交互和动画沿用。

## 修改前诊断与逐页结果

先在浏览器读取20个页面/状态，再实施。修改前证据位于 `before/`；`before/pages.json`记录实际URL及文字，`overview.png`为辅助总览。

| 页面/模块 | 删除或缩短 | 保留与边界 |
| --- | --- | --- |
| 首页 | 标题上方平台定位小字、标题下重复愿景介绍 | ONE-G品牌导航、一智通万机、拼贴、两项主操作、产品/方案Layout Grid及展开提示；愿景仍在公司页 |
| 商品中心 | 标题下“探索…”介绍，缺图占位中的重复分类文字 | 9项名称、型号、价格、核心用途、状态、操作与分类；缺图占位可访问名称保留 |
| 商品卡片/预览 | RoboDock长状态说明及两条图片说明缩短；通用预览提示缩短 | AI非实物、未开售、名称/外观/接口/适配/交付待确认均仍表达；核心用途没有批量删除 |
| 商品详情/规格 | PRODUCT OVERVIEW、INTERFACE、COMPATIBILITY等眉题与动态英文段落标签；页尾重复的同一状态说明；通用详情重复分类眉题 | 正式产品名、描述、用途、参数、技术说明、兼容范围、媒体来源、规格与购买入口 |
| 购买配置 | “如有其他要求…”重复引言；只有“暂无推荐”的空推荐区块 | 套餐内容、数量、价格待确认、支付选项、未开售/未接支付提示、深度定制入口、URL参数 |
| 购物车/结算/订单状态 | ONE - G / CART、CHECKOUT、ORDER装饰眉题 | 空状态、名称/数量/金额、不可购买项目提示、订单与支付状态、原型限制 |
| 解决方案 | SOLUTIONS、通用开场段、卡片重复分类与“问题/方案”双重铺陈 | 方案名称、核心用途、相关系统、来源说明、展开/查看、详细适用任务与边界 |
| SONIC Link详情 | 重复“遥操作解决方案”眉题与段落英文标签 | 方案身份、宇树G1用途、PICO/软件说明、技术规格、演示与部署限制、视频 |
| 了解公司 | OUR VISION/POSITIONING等编号眉题、重复连接价值句、泛化联系邀约；联系标题本地化 | 愿景、定位、模型/软件/硬件关系、咨询限制、吊牌拖动提示。首屏ABOUT ONE-G与SCROLL是锁定特效的一部分，保留 |
| 深度定制 | DEEP CUSTOMIZATION、WHAT CAN BE CUSTOMIZED、PROCESS及重复导语；小节标题简为“定制范围/流程” | 机械/硬件/机器人/软件范围、评估和报价流程、前端预览限制、返回购买参数 |
| 登录/注册 | 装饰性“一智通万机”小字 | 地区依据、字段、密码规则、验证/错误、实名与手机号限制、服务未接入提醒、协议与操作 |
| 忘记密码 | 已足够简洁，未减字 | 重置服务未接入与返回登录说明 |
| 用户中心 | 已检查，必要资料/状态保留；修正英文邮箱冒号后空格 | 邮箱、用户角色、订单、地址暂未开放、客服、账户操作 |
| 管理员中心 | ADMIN CENTER、ADMIN CONSOLE及重复ADMIN装饰标签；Prototype英文前缀精简，英文邮箱排版修正 | 管理员资料、模块用途、无真实数据/只读/未接服务的提醒和操作 |
| 客服咨询 | 已检查，表单文案无需删除 | 必填/选填、来源、校验错误、预览/未提交/未发送说明、返回编辑与关闭焦点恢复 |

旧配置、自定义、旧SONIC Link等兼容入口沿用原跳转，没有另建页面。共用商品详情模板的改动覆盖相应型号；没有逐SKU分别手动拍摄全部主题/语言组合。

## 间距调整

- 商品标题至分类：48→32px；卡片状态下方12→8px，价格区顶部24→16px。
- 登录/注册删除标语后，标题下保留20px间距。
- 规格页顶部104→48px，手机88→32px，消除原先过大的标题前留白。
- 深度定制入口卡片内边距22→16px；删除空推荐区块及其保留间距。
- 清理首页、公司页、方案及定制页被删除文案的孤立样式；手机首页标题下多余间距收紧。

保留原首页首屏占屏与拼贴比例，不为减少文字缩小图片；独立视觉复核未发现明显空洞。没有新增组件、特效、动画库、Provider或业务状态。

## 文件范围

30份源码文件和README文档链接发生本轮修改，详见 `integrity.json`。

- 页面：about、admin/layout与page、cart、checkout、deep-customization、order-success、products及通用详情、solutions及teleoperation。
- 现有组件：HomeCollageHero、HomeProductsPreview、ProductDetailContent、ProductPurchase、ProductVisual、SolutionExplorer、VerificationLogin、RegistrationForm；相关CSS及ProductCard间距。
- 数据：`src/data/products/robotdock.ts`仅三条展示文案；`src/i18n/dictionary.ts`新增短句翻译并修正两条英文标签空格。历史兼容翻译键未批量清理。

原始品牌文案数据深比较不变；RoboDock对象去除上述三条文案后与基线深比较完全一致。产品价格/型号/套餐、所有媒体路径、solutions与catalog数据、业务服务、类型、路由、导航/Logo、ScrollExpand、Layout Grid与MenuToGrid实现均未改。源图片/视频未改。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| `npm run lint` | 最终通过，无警告 |
| `./node_modules/.bin/tsc --noEmit --incremental false` | 通过 |
| `node --test tests/i18n-dictionary.test.cjs tests/invert-actions.test.cjs tests/media-integration.test.mjs` | 8项通过；翻译完整、按钮行为契约与媒体来源保留 |
| `npm run build` | 当前完整源码副本 `/tmp/one-copy-simplify/after-app`，未复制.env，复用现有依赖；最终38页静态导出成功 |
| 20页面/状态 × 1440/390px × 日夜 × 中英文 | 160组通过，无文档横溢出、无待删除眉题残留、未捕获页面异常；`matrix.json` |
| 三轮本地交互 | 购物车39800→数量2/79600及刷新读回；咨询预览/返回编辑；套餐参数、不可加入购物车状态；方案分类/展开、Layout Grid、MenuToGrid、主题语言通过，业务POST为0；`smoke.json` |
| 三轮390px触屏咨询 | 可滚动操作预览/编辑/关闭，草稿保留与焦点恢复通过；`mobile-contact.json` |
| 关于公司首屏 | 1440×1000px前后视口PNG像素一致；首屏组件/效果源码未动 |
| 卡片/按钮 | 正常动态模式实测卡片上浮4px并归位，按钮主题反色正常；`preservation.json` |
| 源码/数据完整性 | 原有无关修改、业务服务、类型、导航/Logo/动效和资源保留；构建源码与最终源码匹配；`integrity.json` |

静态生产产物使用本机3021。账户/管理员/咨询等受保护界面使用 `/tmp/one-copy-simplify/after-mock` 的独立开发副本（3022），仅启用项目已有本地Mock、虚构fixture及隔离浏览器存储；没有真实账号认证、订单提交、扣款或消息发送。生产构建的Mock仍关闭，没有修改正式.env或安全配置。

早期取证误等待管理员布局不存在的全站主题按钮，后改为其实际内容标题。最终语言检查曾把语言切换按钮的原语名称“中文”误判为未翻译正文，已仅排除该原语控件名称后重跑160组；没有删除该必要控件。记录保存在 `matrix-language-control-check.json`，最终结果以 `matrix.json` 为准。

## 视觉复核和证据

Oil UI Pro采用存量界面、不评分的独立复核。`visual-review.md`保留首轮及增量复核：无明显空洞或必要信息丢失；发现的英文邮箱空格已修复，后台进一步减字后复核通过。主Agent查看了前后总览、商品/方案、手机英文与咨询实际视口。没有增加说服性宣传、无依据指标或主观完成度百分比。

- `before/overview.png`、`after/overview.png`：同视口辅助总览。
- `after/home-1440-light-zh-CN.png`、`after/home-390-dark-en.png`：首页。
- `after/products-*`、`after/solutions-*`、`after/deep-*`：主要内容页。
- `after/mobile-consultation-viewport.png`：真实390×844视口内的虚构咨询资料操作。
- `about-first-before.png`、`about-first-after.png`：关于公司锁定首屏对照。
- `before/pages.json`、`after/pages.json`：可追溯的实际路由及文案。

## 尚未处理与限制

没有遗漏用户列出的主要页面。用户中心、忘记密码和咨询表单的必要说明已检查并保留，不为减少数量而删状态或操作提示。

未使用真实手机、Safari/Firefox或真实客户数据；390px触屏为Chromium模拟。真实认证、数据库、订单支付与消息服务不属于本轮，也未被本地Mock检查证明可用。每个SKU没有逐一在八组合下人工看图，而是通过现有共享模板、产品数据校验和代表路由检查。截图和本地流程通过不等于完整业务上线验收。
