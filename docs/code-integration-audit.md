# ONE-G 代码整合审计

本报告随 A–E 分组实施更新，不代表未接入的正式服务已经实现。

## 2026-11-03 截图 hydration 警告：确认采集干扰并修正

本轮仅核实上一轮截图警告，实际读取本机 Oil UI Pro/VibeHub、适用规范和原始日志。仓库与 origin 未变，开始暂存区为空；原工作树保留于 `.oil-ui/hydration-20261103/status-before.txt`、`worktree-before.patch`。无应用源码、依赖、部署、注册规则、离页保护、草稿存储、RoboDock 基线或卡片修改；参考仓库只读，未提交/推送。

**原现场**为上一轮索引中的 `registration-flow-2026-11-03T01-09-53-594Z-warm-7c7404a6-b265-4301-94ae-e5d493ee63bd`，不是 01:09:45 的连接失败。代码提交为 `b4743102df8bf24c6f93138c16ff89c588527f70`，另有未提交修改，原 sourceSha256 为 `ede784fbedb9d269c90ee451be870ccdcce22ebf7886d7d9cad767c647ad086a`；Chromium 153.0.8010.12、Node 24.20.0/Linux、开发 Mock。截图子页面为 `http://127.0.0.1:5558/one-g/register/?region=mainland` 或 international，各使用全新匿名 context，地区×1440/390×中英文×日夜共16组，高950。run.json 的1280×720是主功能页，不是截图视口。原错误收集器合并了各页日志，不能精确倒推每条历史警告的语言/主题；原归档未存 Document HTML。完整警告及组件栈仍保留原处，全部原文件校验不变。

**当前复现和具体差异**：未改截图选项的完整注册＋16截图路径本轮再次失败，独立运行号为 `registration-flow-2026-11-03T01-26-35-146Z-warm-aa0d45b6-9e4d-45fa-8e55-0d8719ceccf0`。定向对照 `hydration-2026-11-03T01-27-11-366Z-warm-fdcf8043-20ff-4b5b-9e84-0b8aeef0eb9b` 中，开发直开4组及完整刷新4组均无警告/样式变化；旧截图路径4组各出现2条警告、12次输入样式写入/恢复。当前实际导航的原始 `Response.text()` 截取为 `*-document-inputs.html`，输入标签原本无 caret-color；MutationObserver 记录截图时写入 `caret-color:transparent!important`。React 警告唯一差异是多出的 style，涉及 Header → HeaderPanel → LInput#site-search，以及 RegisterPage → Suspense → RegistrationForm → ProfileInput/LoginInput → LInput（昵称、密码、邮箱、手机号、验证码）。这里警告的服务端侧是水合时已有 DOM，不能等同于网络最初响应。

**根因已确认属于测试采集干扰**：本机 Playwright 当前1.64.1的 `lib/coreBundle.js:22755` 对所有 input/textarea/contenteditable 临时设置该内联样式，截图结束恢复；默认 caret=hide。与实际属性事件、原始响应和警告精确吻合。[官方截图 API](https://playwright.dev/docs/api/class-page#page-screenshot)说明 `caret:'initial'` 不改变光标行为。原截图调用本来已遮蔽输入，无需再由工具改变光标。

**最小修改**仅为 `tests/registration-flow.browser.cjs` 的截图选项增加 `caret:'initial'` 及原因注释。保留16组合、mask、全量 console/pageerror 错误断言及全部业务步骤，无过滤或忽略警告。新增 `tests/hydration.browser.mjs`：无偏好全新打开1种、已存合法偏好的直接打开/刷新/截图各4种，共13种条件；核对保存偏好恢复、真实输入可编辑、主题/语言切换不丢值，并断言截图不改写输入框 style。开发另检查购买套餐/支付/数量保留、悬停图片预览、文字导航直达。

根 html 的既有 suppressHydrationWarning 单独核对了 next-themes 0.4.6、实际 class/storageKey 配置及[官方 App Router 要求](https://github.com/pacocoursey/next-themes#with-app)，保留原一级根属性处理，没有扩大范围或重写 Provider。生产旧截图设置当前13条件未输出警告，但仍产生临时样式写入；不以生产控制台安静证明没有采集干扰。

**验证**：修正后完整注册功能＋16截图在开发、生产各通过1次，均无 console/pageerror/hydration/i18n 错误；覆盖两地区、中英文、日夜、桌面/手机和登录购买返回。定向13条件在开发、生产各连续3次通过；开发新增购买/菜单检查的最终版本也连续3次通过。全量 Node **13/13 测试文件，0失败、0跳过**（浏览器脚本另计），类型检查通过；lint 0错误，保留历史 `residual-20261102/session-cases.mjs:4:528` 未使用 events 的1条警告；build和diff结果见本轮摘要。构建在208个应用源码/配置/锁文件逐字节一致的临时副本执行，避免与用户3000开发服务争用 `.next`，没有改构建配置。已实际自查同条件前后脱敏截图，没有页面改版，不宣称独立视觉评审或像素完全一致。

诊断探针的失败也保留：人为延后应用脚本直到截图结束时没有警告，初版“必定出现警告”的探针断言失败，标记 artificial:true，不作为产品故障；购买回归初版在支付查询参数恢复完成前采样，现明确等待数量、套餐和支付实际选中后比较，不增加 sleep或改业务。详见本轮 `findings.md` 和逐次归档。

补充限制：针对用户仍在运行的3000开发地址，独立探针完成直接打开及刷新并定位到输入框，但随后等待主题按钮 data-theme-toggle 超时；失败原件 `normal-open-2026-11-03T01-38-41-781Z-warm-fcf2a259-c22f-4906-bdce-247ab7510de8` 保留。该探针未在失败前归档 console 集合，不能声称此额外路径交互通过或控制台干净，也不将超时当作本条 hydration 复现。未更改或重启用户3000服务，不扩展排查；本轮已通过的明确条件为源码一致的隔离开发环境和静态生产构建。

**两个独立开放项保持不变**：首次取消刷新丢值仍因原证据不足而根因未知；原退出超时仍根因未知。本条截图警告的修正不用于解释或关闭它们。完整证据索引为 `.oil-ui/hydration-20261103/verification-summary.json`，原始日志/截图只读保留。本轮结束，不扩展重构或接入外部服务。

## 2026-11-03 注册取消刷新：取证与测试修正

本轮只调查“取消刷新后输入丢失”。仓库为 `/home/lsh/ONE`，origin 为 `https://github.com/l-s-hao/one-g.git`；开始暂存区为空，用户已有修改保留，状态和原 diff 存于 `.oil-ui/refresh-cancel-20261103/`。实际读取本机 Oil UI Pro 与 VibeHub；仅自查离页交互，不重新设计、不派发视觉重构。参考仓库未写入，无提交、推送、服务接入；注册业务源码、RoboDock 哈希和卡片均未修改。

### 首次失败能证明和不能证明的事

从上一轮摘要的真实索引读取的目录是 `.oil-ui/visual-fixes-20261102/evidence/registration-flow-2026-11-02T10-42-56-795Z-warm-69eeaeb7-e08e-4f0a-b5b7-e67541edb329/`。环境为 Node 24.20.0/Linux、开发 Mock，命令为 `node tests/registration-flow.browser.cjs`，运行条件标为 warm。原日志确认旧脚本第 30 行断言昵称为空；约 10:42:59.397 与 59.951 有相同注册 pathname 导航记录，59.905 失败。原截图已遮蔽输入。

旧脚本先在 `once('dialog')` 回调中检查 beforeunload 类型、增加计数，再 `await dismiss()`，但外部没有等待该回调，只执行 `await page.reload().catch(()=>{})`。所以原记录只能确认**进入取消处理分支**，不能确认浏览器完成取消。原时间线没有文档 loader、实例 ID、React 挂载记录或原生提示关闭确认；相同 URL 不足以区分刷新和同文档导航。**首次是否真正取消、是否新文档/重挂载、在哪个清空分支丢值，仍未知**。上一节“原生刷新被取消后”的表述据此限定，不改写原始档案，也不以后三次通过替代它。五个原始文件本轮前后逐字节校验一致，见 `original-evidence-checksums.json` 和 `original-evidence-integrity-final.json`。

### 已证实的测试问题及最小修正

1. 按原步骤重跑旧等待方式：原生关闭事件 `accepted=false`，同一文档、同一表单、昵称保留，但 `page.reload()` 等新 load 达 30 秒后抛 TimeoutError。这是 E 类等待错误；取消刷新本来不产生新 load。
2. 阅读实际 Playwright 安装源码 `lib/coreBundle.js` 的对话框分发：没有监听时，beforeunload 默认接受。人为控制实验中，在首次取消完成后明确触发第二次真实刷新：第一次 `accepted=false`、第二次 `true`，产生新文档、空表单，旧 reload 等待反而成功。此实验标记 `artificial:true`，**仅证明 C 类误判机制可发生，不证明原失败确由第二次导航或 HMR 引起**。
3. `tests/helpers/registration-lifecycle.mjs` 新增仅测试使用的持续对话框控制器：触发前检查 page/context 无其他 handler；明确等待原生取消完成；真实 CDP `Page.reload` 后核验关闭结果、同一文档/表单、唯一可见输入框及所有登记字段相等。不等待取消后的 load，不吞掉任意错误。未知第二次提示被取消并令用例失败；人为控制回归确认该保护确实触发。测试结束移除 handler，不把诊断 ID 用作 React key。
4. `tests/registration-flow.browser.cjs` 仅替换旧 once/reload/catch 链并接入控制器；认证、验证码、退出和路由顺序不改。新 `tests/registration-refresh.browser.mjs` 补针对性回归。证据复用既有时间＋条件＋UUID 独占目录；只保存实例标识、空值/相等布尔及事件，不记录密码、验证码、敏感字段散列、Cookie、Token 或完整网络 trace。

旧等待实验见 `evidence/refresh-diagnosis-2026-11-03T00-46-09-363Z-warm-c6d0643a-5d2c-4385-a538-ae956581cd0d/`；第二次导航控制见同根 `refresh-diagnosis-2026-11-03T00-52-52-501Z-warm-c2a8249f-db71-4051-b618-485c55a4cfbe/`；新控制器保护实验见 `extra-navigation-control-2026-11-03T01-14-11-732Z-warm-b9fceab3-7438-44f2-848e-28128fa155f5/`。早期诊断的页面相对时间写在 `at`，只表示页内时间；正式 helper 改用 `elapsedMs`，保留主机 ISO 时间。原文件不回写。

### 应用清空边界核对

实际 `RegistrationForm.reset()` 由确认离开的 `guard.allow`（含成功注册）和真实 `pagehide`/持久页面恢复 `pageshow.persisted` 调用。beforeunload 仅阻止离开；“继续填写”只关闭对话框；Effect cleanup 只移除监听；blur/visibility 不清空。主题和语言没有重建注册表单的 key。验证码清理与请求过期处理不改，不建立 localStorage/sessionStorage/IndexedDB 草稿。本轮取消刷新观测到同一表单及有效输入，没有因果证据支持修改业务 reset。跨文档 BFCache 恢复未实际补测，仅检查原规则；真实 SPA 后退/前进已由原注册回归执行。

### 实际回归与保留的开放项

| 检查 | 实际结果与范围 |
| --- | --- |
| Chromium 定向 | 开发 Mock 8 项：原生取消并继续编辑、再次取消仍提示、站内继续、确认离开后重入无草稿、确认刷新新文档/空 React 状态且无网站持久化、真实虚构邮箱标签切换及日夜/中英文不丢值、取消后单次成功注册返回登录且未自动登录、正常验证码过期且不自动重发；生产 7 项，其中真实注册未接入只能验证禁用边界。逐次目录和结果见本轮摘要 |
| 原注册功能回归 | Mock、生产功能分支各通过；包含实际历史后退/前进、地区、人机、验证码、权限和购买参数恢复。使用已有 `ONE_G_SKIP_SCREENSHOTS=1`，明确不含 16 组合截图验收 |
| Firefox 158 | 开发、生产各一次真实原生取消通过，同文档、同表单、输入保留。使用现有 WebDriver/BiDi，显式 beforeUnload ignore 与 accept=false。仅在明确 `accepted=false` 且协议错误恰为 `Beforeunload prompt was rejected` 时按预期取消处理，没有无条件忽略错误 |
| Node | `node --test tests/*.test.mjs tests/*.test.cjs`：**13/13 测试文件通过，0 失败、0 跳过**；浏览器文件为独立运行，不混入该计数 |
| lint / 类型 / build | lint 0 错误；原历史 `residual-20261102/session-cases.mjs:4:528` 的 unused `events` 警告 1 条保留。`tsc --noEmit --incremental false`、生产静态 build 通过，命令输出分别归档 |
| 截图与限制 | 原 16 截图回归本轮出现 caret-color 临时内联样式的 hydration 警告，失败原件保留；没有过滤错误、改断言或改产品来伪造通过。新的离页提示/取消后截图已遮蔽值并自查；遮罩会覆盖局部底层区域，不宣称独立视觉验收或像素一致 |

诊断过程中还保留工具失败：最初端口 5556 未启动、Firefox 默认接受/孤立会话/预期导航中止的错误处理，以及定向测试初版将开发工具 IndexedDB 存在误判为草稿、将含隐藏宽度占位文字的按钮计数为零。分别改为正确目标、显式原生取消与精确错误分类、只读检查虚构资料是否实际存储、按正确按钮节点计数；未改应用或减少业务断言。中断的 Firefox 目录仍保留 `running` 原元数据，在汇总中单列 interrupted，不计作通过。

结论分别为：**测试等待与对话框控制已修正并验证；最初资料丢失根因仍未知**。没有“修复注册数据丢失”的产品结论。旧退出超时继续为根因未知，先前 cold/warm/restored 各 10/10、原日志已覆盖的状态不变；本轮不增加 sleep/timeout、不更改退出实现。正式认证、支付、客服及实名边界不变。完整索引为 `.oil-ui/refresh-cancel-20261103/verification-summary.json`，上一轮摘要只追加后续指针。

## 2026-11-02 小范围视觉修复与证据保存

本轮仅修复独立评审提出的三项视觉问题及失败证据覆盖，不扩大全站重构。根目录仍为 `/home/lsh/ONE`，原暂存区为空；开始状态、原 diff 保存在 `.oil-ui/visual-fixes-20261102/status-before.txt` 和 `worktree-before.patch`。实际读取本机 Oil UI Pro/VibeHub、上轮审计与验收摘要；参考仓库未写入。保留上一轮规范、哈希修正及用户未提交内容，未提交或推送。

### 问题、最小修改及前后证据

证据根为 `.oil-ui/visual-fixes-20261102/`。原问题来自 `.oil-ui/residual-20261102/visual/independent-review.md`，不是根据问题名称猜测全站改法。

| 问题 / 页面 / 状态 | 原表现与影响 | 修改文件与最小修复 | 同条件前后证据 |
| --- | --- | --- | --- |
| RoboDock 商品卡的信息主次；商品中心常态，390 英文夜间及 1440 中文日间 | 概念标识和图片说明先于商品名，窄屏需先读解释才能识别对象。属于信息层级，不是表面阴影或 z-index 遮挡 | `ProductCard.tsx` 将名称/副标题置于状态与说明前；保留全部概念、非实物、未开售/待确认文案及按钮。未改网格、顺序、字体、阴影、圆角、图片比例或动画 | `before/products-390-en-dark.png` → `after/products-390-en-dark.png`；另有同名 1440 中文及其他手机语言/主题对照 |
| G1 Pro 等未配置图片；商品中心/详情与图片菜单 | 商品中心大 ONE-G 字标与菜单“图片待补”表达不同；品牌字标容易被误读为商品图 | `ProductVisual.tsx`、`globals.css` 复用“图片待补 / Image pending”及现有背景/次要文字角色；原容器保留。配置图片请求失败另显示“图片加载失败 / Image unavailable”，不设置替代 URL、不形成回退请求循环。`HeaderImageMenu.tsx/.module.css` 同样区分未配置与请求失败，`dictionary.ts` 增加失败提示翻译 | 前后商品图；`menu-{zh-CN-light,en-dark}-run1.png`、`detail-missing-*-run1.png`、`request-failed-run1.png`。素材型号尚未确认的既有说明保留，未冒用其他型号或新增素材 |
| 客服字段错误/焦点；与登录错误比较，390 中文日间及英文夜间 | 客服虚线、黑色提示与登录红实线/红字不一致，文本域错误易被当作普通边框 | 仅改 `ContactPreview.module.css`：错误使用现有 `--color-error`、实线/outline；键盘焦点使用 `--focus-color` 并保留独立外环。未改 `ContactProvider`、校验函数、地区/验证码/认证或提示映射；字段关联、首错聚焦与草稿保留继续由既有实现负责 | `before/contact-error-390-zh-CN-light.png` → `after/contact-error-390-zh-CN-light.png`，对照同组 `login-error-*`，另覆盖英文/夜间与桌面 |

5 组匹配对照为 1440 中文日间、390 英文夜间、390 中文日间、390 英文日间、390 中文夜间。`before/metrics.json`、`after/metrics.json` 与 `geometry-diff.json` 确认全部已渲染商品卡的宽高和图片区域尺寸无差异。商品 before 来自修改前静态产物；错误态 before 在隔离副本中仅恢复原客服 CSS，其他表单/认证源码相同，以补采能看清边框的脱敏截图。输入值使用截图样式隐去，不影响产品布局；未把遮蔽输入值的早期整框色块当成视觉证据。

共享影响限制：`ProductCard` 是商品中心卡片；`ProductVisual` 的其他调用为普通商品详情，已核验 G1 Pro 缺图详情；Header 图片菜单同时承载商品和方案，原几何、链接、Flip/悬停与方案数据未改。保留已确认素材、概念图与说明，不新增下载/生成、外部服务或第二套表单状态。

### 失败证据不再复用文件名

原覆盖原因已核对源码：`registration-flow.browser.cjs` 将结果和截图写到固定 `docs/reviews/registration/mock-results.json`、固定模式/地区/视口截图名；旧任务的检查包装脚本还复用 `registration-mock-1.log`。下一次成功会直接覆盖失败日志或结果。这是工具输出路径问题，不是退出超时根因。

本轮新增 `tests/helpers/browser-evidence.mjs`，接入原 `tests/registration-flow.browser.cjs`，不改测试步骤、认证顺序或退出等待条件。每次以 `测试名-UTC时间-运行条件-UUID` 创建独占目录；默认 `docs/reviews/browser-runs/`，可由 `ONE_G_EVIDENCE_ROOT` 指定；`ONE_G_RUN_CONDITION` 标明实际 cold/warm/session-restored/production/unspecified 条件，不自动宣称冷启动。元数据记录执行命令、目标 origin/path（不含查询串）、环境/浏览器、Git 提交和源码指纹。

原始 `output.log`、`timeline.jsonl` 追加写；结束后冻结，保存 `timeline.json` 和 `run.json`。失败时尽力截图，隐藏输入文字、演示凭据、用户预览文本与邮箱；日志脱敏，不保存密码/验证码/Cookie/Token，不采集可能携带网络凭据的完整 trace。`latest.json` 只原子更新指针，明确 `artificial` 标识，不能把人为探针成功混作产品回归成功。历史 `.oil-ui` 目录保留只读结果，不用其固定路径重跑新批次；其他未接入的历史脚本仍须显式指定新目录，未宣称全仓所有工具已迁移。

`tests/evidence-preservation.browser.mjs` 的人为失败/成功探针连续 3 次通过：独立目录、失败截图/日志/时间线/元数据存在，后续成功后原失败目录全文件逐字节相同。探针及元数据明确 `artificial: true`、`logoutReproduced: false`。证据索引见 `retention-final-results.json`，原始逐次核验文件保存在 `evidence/`，不是原退出超时复现。

本轮还实际保留了一次初始 Mock 注册回归失败：原生刷新被取消后，脚本期望保留草稿却读到空值，发生在开发预览同步样式后的初次运行。原始独立目录、时间线、日志、遮蔽截图均在 `evidence/registration-flow-2026-11-02T10-42-56-795Z-warm-69eeaeb7-e08e-4f0a-b5b7-e67541edb329/`。只记录时间相关性，不断定 HMR 是根因；该失败不同于退出跳转超时，未修改离页/认证实现追求通过。稳定预览下后续 Mock 三次通过；`failure-checkpoint.json` 和最终核验确认先前失败全文件哈希未变。另有探针的 CommonJS/ESM 导出环境错误被原始命令日志保留，适配后最终探针通过，不作为产品失败。

### 实际验证、独立复审与未完成项

| 检查 | 结果 |
| --- | --- |
| lint | 通过，0 错误；保留上轮历史过程脚本 `residual-20261102/session-cases.mjs` 的 1 条 unused-vars warning，未越界修改历史文件来消除提示 |
| 类型 / build / diff | 类型检查通过，生产 build 静态导出成功，`git diff --check` 通过 |
| 全量 Node | **13/13 测试文件通过，0 失败、0 跳过**；没有更新任何快照预期 |
| 针对性视觉/交互 | `targeted-results.json`：9 个场景通过，包含中英文/日夜的菜单与详情缺图、错误关联/聚焦/清除重现/返回编辑/不持久化及请求失败不循环，相关场景各复跑三次 |
| 原注册回归 | 稳定预览 Mock 与生产分支各连续 3 次通过，保留地区、人机/验证码、权限、离页保护及购买参数恢复断言；前述初始失败仍保留，不抹去 |
| 原导航回归 | 连续 3 次通过，每次 21 组合、21 次真实链接进入，含文字直达、菜单、语言/主题及动画中断 |
| 证据保留探针 | 最终源码版本连续 3 次通过；人为失败与成功明确分类，已结束目录不能再写入，实际先前失败亦未被覆盖 |
| 独立复审 | 真正独立、未参与制作的评审者查看实际前后截图，不读产品源码、不打分。三项在所看证据范围内均解决，未见直接相邻视觉回归；报告 `review/independent-review.md`。复审为静态看图，交互/请求次数由实际测试证明，不冒称独立动态验证 |

未完成/限制：原退出超时继续沿用**此前冷启动 10/10、热运行 10/10、恢复已有虚构会话 10/10，原始失败日志已被覆盖、根因未知**，本次未将普通回归合并为新的冷启动统计，也未增加 sleep/扩大 timeout 或宣布修复。初始原生刷新草稿丢失的单次失败未另行定位，证据可供后续独立任务调查。不是全站逐页、全部组合、完整动效或真实外部业务验收。正式认证、支付、客服、实名等未接入边界保持。

本轮验收摘要在 `.oil-ui/visual-fixes-20261102/verification-summary.json`；上一轮 residual 摘要仅追加后续索引，历史字段和结论保留。三项视觉修复和证据保存完成后停止，未改部署或接新服务。

## 2026-11-02 遗留问题核验与独立视觉补验

本节追加上一轮结果，不覆盖历史。只处理哈希失败、退出超时调查和针对性视觉验收；不扩大全站重构。开始时根目录仍为 `/home/lsh/ONE`，origin 仍为 `l-s-hao/one-g`，暂存区为空；上一轮 21 个跟踪文件修改及未跟踪工作保留。本轮开始状态与工作树差异保存在 `.oil-ui/residual-20261102/status-before.txt`、`worktree-before.patch`。本机 Oil UI Pro 与 VibeHub 已实际读取；未写入参考仓库，未提交或推送。

### RoboDock 哈希：已解释并最小迁移

实际测试是 `tests/product-v2.test.mjs` 的 `Offering references preserve canonical packages and ordinary product order`。它既校验普通商品顺序、RoboDock 名称、SONIC Link 不在商品列表、四套套餐与原对象的引用关系、价格未定/非 active，又遍历 `tests/product-v2-baseline.json`，对四个源码文件的原始字节计算 SHA-256；不是对图片文件、构建产物或 JSON 序列化结果计算。因此文件中合法文案变化也会触发失败。

本轮先直接运行单项，复现 RoboDock 预期 `97ad4a4c…`、实际 `5bc43841…`；再运行全量，命令报告 12/13 测试文件通过。遍历全部快照后还发现被首次异常遮住的 About 快照不一致。完整值、文件绝对位置所对应的相对路径及提交对照见 `.oil-ui/residual-20261102/hash-provenance.json`，单项/全量原始输出见同目录的 `hash-single-before.log`、`node-all-before.log`。上一轮真实 `logs/tests-before.log` 也保存了相同单文件失败，不仅依据聊天结论判断。

| 快照对象 | 原预期对应内容 | 已确认当前内容 | 处理 |
| --- | --- | --- | --- |
| `src/data/products/robotdock.ts` | `1690338` 与 `aec162a` 的字节均对应原 SHA | `b474310` 提交仅改 3 个数据字段：`detail.statusNote`、两张图的 `caption`；缩短说明但保留概念、未开售、待确认、非实物照片和适配未确认边界 | 基于已提交且与当前文件逐字节相同的 `b474310` 内容生成预期，不直接采纳任意当前值 |
| `src/app/about/page.tsx` | 同上，原 SHA 对应素材整合后的版本 | `b474310` 删除重复眉标、重复说明，保留愿景/定位内容；联系标题改为“联系我们”，客服前端预览说明保留 | 同一已提交文案精简的最小快照迁移 |
| `src/data/products.ts`、`src/data/solutions/sonic-link.ts` | 原 SHA | 当前仍与原预期相同 | 完全不改预期 |

RoboDock 逐字段对象对照仅有上述 3 处文案，商品 ID、category、concept 状态、价格、四套套餐、接口/安全规划、素材路径与来源均未变，见 `robotdock-semantic-diff.json`；Git 差异原文见 `content-since-baseline.patch`。这些文案与当前“保留已完成的精简、RoboDock 为未开售概念商品”的业务要求一致，所以接受已提交内容，而非回退数据。About 变化同属该次已提交精简，未通过移除保护文件或改成语义子集规避完整比较。

本轮仅更新两项预期，保留全部四文件的完整字节哈希比较，并新增 `concept`、未开售、非实物照片语义断言。4 个仅在测试进程内的反向变更（商品状态、稳定 ID、图片真实性说明、About 标题）均导致断言失败；没有改写工作区数据。`hash-mutation-{status,identity,caption,about}.log` 记录错误位置。单项与全量迁移后通过；完整最终数量见本节最终检查表。未发现路径拼接、序列化或生成过程不稳定的证据。

### 退出超时：原始证据的边界

实际等待位于 `tests/registration-flow.browser.cjs` 的普通用户退出步骤：显式注册 → 回登录且无会话 → 密码登录恢复购买参数 → Header 进入 account → 点击“退出登录” → `waitForURL(base + '/')`（默认 load 条件）。该测试不是在等待一个“发送成功”或身份建立结果。

上一轮目录中的 `registration-mock-{1,2,3}.log` 已被后续成功运行覆盖；现存摘要和审计保留了首次超时的记录，但**原始失败日志及时间线未归档**。因此不能从现有成功日志恢复那一次失败的点击/状态/路由先后，也不能据此断定应用竞态或测试错误。源码检查显示退出同时清除演示存储、更新 AuthProvider 并请求路由，RequireRole 亦处理会话消失；仅有这类潜在路径不足以证明根因。本轮不凭猜测修改认证或路由代码。

本轮仪器副本保留原注册脚本的完整操作与默认退出等待条件，只增加脱敏观测和独立输出路径：真实点击、存储是否仍存在、AuthProvider 是否已登录/ready/退出目标、history/URL、页面是否显示账号/登录/加载状态。既不记录账号、密码、验证码、Token，也不清除真实浏览器数据。冷运行每次独立 Next 进程、独立空 distDir、首次编译与新隔离浏览器；服务 stdout Ready 后才开始原始路径，首页第一次编译仍发生在该退出路径中。热运行复用最后一次冷运行的应用进程和已编译路由，但每次仍用新隔离浏览器并显式注册/登录。另单独记录“恢复已有虚构会话”的热运行和生产预览禁用 Mock 状态，不混为同一组。

### 真正独立的只读视觉评审

由未参与实现、未读根因结论的独立子 Agent 读取 Oil UI Pro 评审手册，独立操作浏览器、采集并查看当前截图，再比较可用的上一轮历史图。不打分、不重设计、不修改产品；报告在 `.oil-ui/residual-20261102/visual/independent-review.md`。覆盖导航及展开图片菜单、商品中心、RoboDock 介绍/购买、解决方案、登录/注册、客服错误与前端预览；代表组合含 1440 中文日间、390 英文夜间、390 中文日间 Mock 错误态。人工暂缓 JS 请求时观察到真实“正在加载商品…”占位，释放后正常进入商品页；该受控条件不用于推断退出超时根因。

评审记录三项已有或无法归因的视觉问题：RoboDock 卡概念说明先于名称导致窄屏层级偏移、商品中心与图片菜单缺图表达不同、登录与客服错误态不一致。本轮按用户边界仅记录。手机图片菜单末卡经实际滚动和点击，已确认可进入 LiDAR 详情，撤回“可达性待验证”，只保留滚动发现性观察。未发现代表图中的明显文字重叠或横向溢出，但不宣称全站逐页或全部组合验收。

历史截图不能仅按文件名认定状态：`stagger-1/final-390-en-dark.png` 的真实画面是中文浅色；历史商品空白图框与当前已解码图片也不能做严格像素比较。商品、菜单、注册和客服有部分可用历史对照；介绍/购买/解决方案缺少匹配的可靠历史图，只评价当前。未做逐像素一致断言、200% 专项、完整录屏动效专项或真实外部业务操作。

### 本轮最终检查与状态分类

| 项目 | 真实执行结果 / 分类 |
| --- | --- |
| 哈希单项 | 修改前 0/1，确认合法已提交内容后 1/1；4 个进程内反向变更均被拒绝。**已修复并验证的是过期快照，不是商品实现** |
| 全量 Node | `node --test tests/*.test.mjs tests/*.test.cjs` 修改前报告 12/13，最终 **13/13，通过 13、失败 0、跳过 0**；此命令按测试文件汇总，不冒充内部全部叶子用例数量 |
| 相关回归 | `route-preference`、`registration-auth`、`auth-payment` 三文件通过 |
| lint / 类型 | `npm run lint`、`./node_modules/.bin/tsc --noEmit --incremental false` 最终均通过；本轮工作区新工具使用 ESM，未新增 lint/type 豁免 |
| build / diff | `npm run build` 成功静态导出；`git diff --check` 通过，没有部署 |
| 原退出路径冷运行 | **10/10 通过，0 失败**：每次新应用进程 + 独立空编译目录 + 新浏览器 + 显式注册建立会话；不是清空 OS 缓存的性能测试 |
| 原退出路径热运行 | **10/10 通过，0 失败**：复用第 10 次冷运行应用与已编译路由，每次新隔离浏览器，保留同一显式注册/登录/购买/退出路径和原 URL 等待条件 |
| 恢复已有会话组 | 另 **10/10 通过**：热应用、新浏览器恢复虚构 fixture，会话清除并退出；与上一行不同组，不混计 |
| 生产预览 | 已核对：伪造的本地 Mock 记录不恢复身份，登录按钮禁用；生产不支持建立 Mock 会话，不能虚构“生产 Mock 退出成功” |
| 超时结论 | 全部原路径日志与脱敏时间线见 `cold-{1..10}`、`warm-{1..10}`，均观察到点击、会话清除、认证退出及首页 URL/DOM。**本轮未复现、根因未知**；不能确定旧事件是应用缺陷、状态竞争、开发编译/刷新干扰还是测试等待问题。不扩大 timeout、不新增固定 sleep，不做推测性的产品修复 |
| 视觉现有问题 | 三项已解释但本轮未修：卡片信息层级、缺图语义、跨表单错误态一致性；它们没有被证明是本轮回归，按用户边界只记录 |
| 未执行 / 受限 | 全站逐页 × 全组合、200% 专项、完整录屏动效和真实外部业务均未执行；原首次失败日志已被覆盖，无法还原当次时间线。独立评审不是全站验收或上线认证 |

最终证据索引 `.oil-ui/residual-20261102/verification-summary.json` 保存分组次数、日志与时间范围；`logout-timings.json` 保存每次点击后的存储/认证/URL/DOM时间。上一轮 `.oil-ui/refactor-20261102/verification-summary.json` 仅追加 `residualVerification`，所有旧字段和值保留，原文另存本轮 `previous-verification-summary.json`。`preservation.json` 确认除本报告追加外，20 个上一轮已修改文件的 diff 完全未变；所有本轮开始时的未跟踪项仍保留，暂存区未改。

本轮停止于上述范围。下一阶段仍需处理三项视觉一致性问题，并继续保留退出超时“待定位”状态；正式认证、支付、短信/邮件、真实客服等原有未接入边界没有变化，不能依据测试变绿宣称真实业务可上线。未提交、推送、升级或接入外部服务。

## 2026-11-02 项目规范、精简与注释整理

本次直接以工作区源码为准，不依赖外部规范包。Git 根为 `/home/lsh/ONE`，origin 为 `https://github.com/l-s-hao/one-g.git`。开始时暂存与未暂存的跟踪差异均为空，另有 513 个未跟踪文件（含既有审计文档和截图）；完整逐文件状态记录在本地 `.oil-ui/refactor-20261102/status-before.txt`，这些原有工作不移动、不删除、不覆盖。根目录及项目下未发现 `AGENTS.override.md`，适用的现有 `AGENTS.md` 已先读后合并。

### 实施前职责链与验证计划

| 批次 | 文件、调用方与重复职责 | 迁移与验证 |
| --- | --- | --- |
| 1：逻辑路径 | `src/lib/use-app-pathname.ts` 已去尾斜杠并保留根 `/`；`Header`、`Footer`、`SiteShell`、`RequireRole`、`ContactProvider`（含内部预览）重复处理 | 保留 hook 的契约，只删调用方的重复处理。保留安全 URL 解码、权限判断、旧配置重定向；相关 `route-preference`、认证测试及浏览器入口/离页/语言日夜矩阵 |
| 2：邮箱格式 | `src/lib/auth/policy.ts:validAddress` 与 `src/lib/contact-preview.ts:validateContactDraft` 含完全相同正则；前者经 normalizeAddress 规范化，后者只 trim、保留展示文本 | 抽为无状态纯函数 `src/lib/validation.ts:isEmailAddress`，调用方继续负责 trim/大小写、必填和错误提示，不引入认证服务依赖。验证两入口对同一格式的接受/拒绝边界及现有认证测试 |

每批执行 lint、类型检查、相关 Node 测试、build 与 diff 检查；build 和类型检查顺序执行。浏览器证据放本地 `.oil-ui/refactor-20261102/`，不覆盖历史审计。项目规范保存在根 `AGENTS.md`；本节复用既有重构审计，不另建重复规范文件。

### 修改前检查

- `npm run lint`、`./node_modules/.bin/tsc --noEmit --incremental false`：通过。
- `node --test tests/*.test.mjs tests/*.test.cjs`：13 个文件中 12 通过，`product-v2.test.mjs` 失败于 `src/data/products/robotdock.ts` 旧哈希。直接运行该文件复现；不更新基线求通过。
- `npm run build`：沙箱内 TypeScript `--showConfig` 输出解析失败；同命令在允许子进程的环境执行成功并静态导出。未修改构建配置或依赖。
- 初次开发服务浏览器基线在注册页主题按钮初始化占位处超时；改用已成功构建的静态导出进行复核。该超时发生于业务源码修改前，不能归因于本轮精简。

### 保留边界与未纳入精简项

`Elements.tsx` / `button-effects.css`、`ProductCard` / `ProductVisual`、`CardHover` / `StaggerGroup` 已各有共享职责，本次不增加按钮/卡片抽象，也不修改样式。未发现足以安全删除状态写入、动画监听或配置器包装层的完整证据，保留这些实现；保留 `/configure/*`、`/customize*`、旧 SONIC Link 商品 URL、兼容导出与旧 ID。安全路径校验与普通浏览器路径处理不是同一职责，不合并；密码和客服文案保留业务差异。

用户锁定的 RoboDock/SONIC Link 分类、200ms 反色、文字直达与悬停预览、单一语言/日夜状态、注册不自动登录、地区/验证码/管理员/离页保护、客服前端预览及字体/细节/动画全部作为验收约束。现有五项细节优化以真实实现和历史审计为准，不提升原报告中未完成项的状态。

### 已实施的关键中文注释

| 文件 / 函数 | 注释解释的真实约束 |
| --- | --- |
| `lib/route-paths.ts:BASE_PATH/localAppPathname`、`lib/use-app-pathname.ts:useAppPathname` | 部署前缀单一来源、仅一次解码、拒绝残留编码/重复前缀，以及页面壳无需再次去尾斜杠 |
| `components/useAuthVerification.ts:run/send` | 取消后晚到挑战必须销毁；旧 controller 不得清除新请求的 pending |
| `components/AuthProvider.tsx:AuthProvider` | 演示与真实后端授权边界；版本号使过期登录结果失效 |
| `components/ThemeProvider.tsx:ValidThemePreference/ThemeProvider` | next-themes 独占状态与持久化；旧偏好先迁移再首次应用 DOM |
| `i18n/LocaleProvider.tsx:useLocale/LocaleProvider` | Suspense 水合先用中文快照，挂载后恢复偏好，不能先写默认值覆盖英文；不重挂表单 |
| `components/StaggerGroup.tsx:StaggerGroup/effect cleanup` | host 入场与 surface 悬停分属不同层；创建者清理 observer、动画和事件监听 |
| `components/LegacyConfigurationRedirect.tsx` | 静态托管无法替代旧书签页面，需保留客户端迁移入口 |
| `components/ContactProvider.tsx:ContactPreview`、`lib/validation.ts:isEmailAddress` | 格式检查不表示验证邮箱或发送成功；客服草稿仅当前弹窗预览 |
| `lib/auth/policy.ts:validPassword` | 清理“拟议规则”的过期注释，明确当前注册规则与历史账号密码校验分开，密码不裁剪 |

### 最终验证与限制

| 检查 | 执行结果 |
| --- | --- |
| 第一批 | lint、类型检查、3 个相关 Node 测试文件、build、`git diff --check` 均通过；8 组合浏览器矩阵通过 |
| 第二批 | lint、类型检查、3 个相关 Node 测试文件（含新增邮箱输入/错误提示/草稿保留测试）、build、`git diff --check` 均通过 |
| 全量现有 Node 测试文件 | 修改前后均 12/13 通过；唯一失败仍为 RoboDock 旧哈希，不修改测试基线或商品数据 |
| 最终 lint | 通过。本轮临时验收工具的 CommonJS 导入曾被 lint 扫到，已将保存到工作区的工具副本转换为 ESM，无新增检查豁免 |
| 视觉与基础入口 | 修改前、第一批、第二批及最终截图覆盖 1440/390 × 中文/英文 × light/dark；检查商品/注册页、权限登录返回、旧 SONIC Link 路由、注册离页继续/确认、偏好切换保留草稿与横向溢出。最终可见图片等待 decode 与绘制后取证 |
| 现有导航交互脚本 | `navigation-interactions.browser.cjs` 连续 3 次通过，每次 21 组合、21 次真实链接进入；文字直达、悬停预览、快速操作、手机、语言/主题与动画中断；无浏览器错误或残留 Header 动画 |
| 现有卡片入场脚本 | `stagger-entrance.browser.cjs` 连续 3 次通过，每次 24 页面/设备/语言/主题组合，另含 focus、快速导航、清理、减少动画、API 缺失/异常、隐藏页面与无 JS 回退 |
| 现有注册脚本：生产分支 | 连续 3 次通过；保留地区/离页/history/状态检查，确认生产不启用注册、人机或验证码 Mock |
| 现有注册脚本：Mock 分支 | 最终连续 3 次通过；覆盖显式注册回登录且无会话、密码/验证码登录、地区/组织规则、凭据单次使用、修改邮箱清空验证码、普通用户与管理员分离、刷新后内存账号失效。相同脚本在修改前源码的隔离副本上亦连续 3 次通过 |
| 客服预览与角色补充 | 客服 8 语言/主题/设备组合连续 3 次通过：必填/邮箱错误、预览/返回编辑、关闭清草稿、身份变化销毁草稿、无业务 POST/草稿持久化；另普通用户拒绝管理员入口、管理员可进入，连续 3 次通过，不执行管理操作 |

本轮亲自查看了前后矩阵及最终商品、注册、客服预览的实际截图。早期商品截图有图片解码/绘制时机差异，不能作为严格像素一致的依据；最终画面另存 `final-decoded/`，未发现本轮布局/文字样式回归。截图内保留现有概念图说明与未接入提示，这是产品真实性边界；本轮不删产品文案、不改变方向、不做设计打分，未做独立视觉/UX 评审，也未逐页全站验收。

验收环境记录：临时服务最初使用源码符号链接时出现 404/重复 Context，改用完整源码副本与独立构建缓存解决，未更改项目配置。Mock 首次冷启动验收曾在退出登录后等待首页时超时；预热后完整脚本连续 3 次通过，冷启动时序原因尚未定位，不将该瞬时失败隐去或宣称已修复。静态基线中的尾斜杠链接、英文按钮定位，以及原生 email 输入裁剪空白的脚本预期已按真实 DOM/词典修正，未改业务逻辑迁就测试。

证据与命令日志：本地 `.oil-ui/refactor-20261102/` 下的 `before/`、`batch1/`、`after/`、`final-decoded/`、`contact/`、`navigation-{1,2,3}/`、`stagger-{1,2,3}/`、各注册/客服/角色日志及 `logs/`。原有 513 个未跟踪文件在最终状态中全部仍为未跟踪；暂存区仍为空。新增正式源码仅 `src/lib/validation.ts`；本地工作区忽略配置 `.oil-ui/.gitignore` 不参与产品运行。未提交、推送、部署或接入/触发真实业务服务。

## 基线与工作保护

2026-10-26 从当前目录重新查找，确认 Git 根为 `/home/lsh/ONE`，origin 为 `l-s-hao/one-g`。开始时已有 25 个跟踪文件修改及 15 个未跟踪文件；暂存差异为空、`git ls-files -u` 为空，没有需要选择 ours/theirs 的 Git 冲突。已有修改视为用户工作，保留；本轮不切分支、不合并、不提交或推送。

仓库外私有备份：`/tmp/one-integration-20261026-155621`（目录 0700、文件 0600）。保存 status、stat、完整工作树/暂存 diff、最近 12 次提交、未合并项、未跟踪列表及 372 份必要文件。未将备份或原始用户资料加入仓库。

| 修改前检查 | 结果 |
| --- | --- |
| `npm run lint` | 失败：历史 home-stable.cjs 三处 no-require-imports |
| `tsc --noEmit` | 通过；package.json 没有独立 typecheck 脚本 |
| `node --test tests/*.test.mjs tests/*.test.cjs` | 10 文件中 7 通过、3 失败；没有 npm test 脚本 |
| `npm run build` | 通过，静态导出 38 页 |
| Git 冲突/暂存 | 无 |

单元测试历史失败：display-modes 仍要求没有 ThemeProvider（与当前 light/dark 基准相反）；i18n 新拆分的两条字面消息未补完整词典项；product-v2 固定哈希对应早于当前已提交素材/品牌整合的版本。不能恢复旧功能来迁就这些断言。

## 问题与修复记录

| 编号/级别 | 文件与符号、新旧实现及证据 | 保留/迁移决定 | 验证与状态 |
| --- | --- | --- | --- |
| A01 / P2 | `docs/reviews/font-audit/home-stable.cjs`：旧 require 与硬编码临时 Playwright 路径使全仓库 lint 失败，脚本也不可直接复用 | 保留有效标题裁切检查，迁移为原生动态 import 与既有测试环境变量，不关闭 lint 规则 | 已修复；lint/对应测试通过 |
| A02 / P2 | `dictionary.ts`：当前数值组件拆分了文案，静态精确覆盖测试缺两项；运行时有组合翻译回退 | 为现有原文补显式英语项，不改价格/编号 | 已修复；lint/对应测试通过 |
| A03 / P2 | `tests/display-modes.test.mjs`：旧“固定日间、无 Provider”断言冲突于当前 light/dark | 测试迁移到唯一 Provider、两种模式、无旧四模式；不移除主题功能 | 已修复；lint/对应测试通过 |
| A04 / P2 | `tests/product-v2.test.mjs` / baseline：素材与品牌已在 1690338 整合，旧哈希仍要求旧文件 | 核对提交及当前语义契约，再迁移历史基线；不回退商品/素材 | 已修复：三份内容与 1690338 完全一致后更新哈希，保留快照并增加品牌/方案语义断言 |
| B01 / P1 | `ThemeProvider`：next-themes 是否接受旧四模式/非法持久化值，需实测 | 正式来源保持 next-themes；仅迁移对应主题字段，不碰账号/购物车 | 已复现：旧值直接写进根 class；已修复：仅规范当前 key，合法值不覆盖，非法跨页更新由唯一 Provider 纠正 |
| B02 / P1 | `auth-routing.safeReturnTo`：角色判定用逻辑路径，但外来带 basePath 的路径未统一去前缀 | 测试带前缀/编码/登录循环及角色边界，确定最小规范化 | 已复现：带前缀的管理员/登录路径绕过 helper 分类；页面角色守卫仍在，未获得管理员权限；已统一 config/旧路由/returnTo/注册离页路径规范化，编码路径同样分类 |
| C01 / P2 | `globals.css` 的 `.product-card*` 移动规则与 ProductCard CSS Module 重复，部分旧 DOM 选择器已无消费者 | 先对比实际计算样式，再只迁移商品卡片规则到共享组件；不改视觉规格 | 已修复并验证：16 组逐属性完全一致 |
| D01 / P3 | `useLoginForm.ts` 等旧登录实现只有定义/历史文档引用 | 以入口和全部运行引用图为依据删除已替代的私有实现；保留仍供旧路由使用的 AuthCard | 已删除 2 个无调用方私有实现；引用图、lint、11 份单元/集成测试通过 |

未复现项不记为已确认 Bug。后续在同一报告补充修复结果、当前功能基准、五项优化的真实程度及剩余风险。


### A/B 组验证

A 组：全仓库 lint 从 3 错误变为通过；原 10 份单元/集成文件全部通过；历史 home-stable 脚本通过 8 组首屏裁切。三份快照仅在确认与已提交的 1690338 内容一致后更新，不改变数据来迁就测试。

B 组：复现脚本证实旧主题值曾直接进入 class；修复后旧夜间及原深色辅助模式映射 dark，其余非法值映射 light，合法 light/dark 不覆盖。使用 next-themes 作为唯一主题状态/持久化来源；前置脚本只迁移一个当前主题字段，纯函数及脚本一致性、重复执行和存储不可用测试通过，不清理认证/购物车/语言 key。原生圆形过渡的同步 class 更新是 snapshot 桥接，保持受控回调，不是第二套持久化系统。

`route-paths` 统一 basePath 常量、解码一次与逻辑路径；Next 配置仍保留原所有选项。带前缀及编码的管理员路径、登录循环、重复前缀、外链/反斜杠被正确规范或拒绝；查询参数与 hash 保留。B 组 4 份相关测试及 lint/类型检查通过。刷新/跨页、跨标签和认证状态保持将在 E 组实际浏览器补验。


### C/D 组边界

C01 仅整合商品卡片：删除 globals 中 8 条重复或已过时 DOM 规则，仍生效的图片裁切与隐藏副标题迁入 ProductCard Module；已有模块里的字体、padding、圆角和 flex 价格布局保留。不会把其它职责卡片统一成一种组件。

D01 仅删除 `useLoginForm.ts`（已替代的旧账号/密码提交 Hook）和 `InlineAuthError.tsx`（无消费者的旧错误渲染器）；新 VerificationLogin/AuthFields/RegistrationForm 保留。AuthCard 仍被 forgot-password 路由调用，不删，只纠正过时注释。其余无路由引用的 MicroSlats/TechText/MagicBento/Shimmer 源码含历史/授权说明，尚无必要删除，不恢复挂载。

引用图未发现缺失相对/别名 import；176 条静态公开资源引用均存在。public 仅发现一组完全相同的品牌图片，但两个路径都有公开 URL 兼容价值，保留。动态数据路径、既有素材来源、字体许可证、Offering 及历史 ID 不因无 import 而删除。npm ls 与锁文件对应的直接依赖正常，不改依赖或包管理器；GSAP/Motion/Three/OGL 不因并存而移除。源码无 Specular/DriftWall 调用，未发现仍运行的旧专属光效循环。


C/D 组验证已完成：四宽度 × 中英文 × 日夜的 16 组计算样式逐属性完全一致，含网格列/gap、卡片/图片尺寸、标题字体/换行、阴影、价格与隐藏副标题。删除后缺失引用仍为零；全仓库 lint 通过，11 份单元/集成测试通过。没有删除公开媒体或任何依赖。

## 最新功能基准与五项细节的真实状态

| 领域 | 当前源码核对结论 |
| --- | --- |
| 品牌/数据 | RoboDock 为当前名称且保留 robotdock 稳定 ID；统一 products selector 无 SONIC 商品；SONIC 内容来自 solutions，Offering 保留购买套餐引用 |
| 首页 | 当前 page 仅挂载拼贴 Hero 与两个独立 namespace Layout Grid；旧 TechText/MicroSlats 等未挂载，未恢复 |
| 导航 | 主文字为真实 Link；hover 图片菜单、菜单内分类与具体内容链接；注册离页保护只在注册页 dirty 时安装，保留确认；完整浏览器复验在 E 组 |
| 主题/语言 | next-themes 和 LocaleProvider 分别是正式来源；主题仅 light/dark，旧值迁移不触碰其它 Key；未增加全局 hydration 抑制 |
| 按钮 | 当前 Elements/NavigationLink 意图与反色 CSS，200ms；无仍生效的 Specular 专属代码；动画库各自职责保留 |
| 注册/认证 | 显式注册、邮件 challenge 后内存账号创建、成功返回登录；密码/验证码分开、验证码需人机凭据；海外邮箱限制、手机号验证状态与 ADMIN/USER 分离；正式服务未接入 |
| 客服/交易 | 登录后本地填写/校验/预览；无真实发送/收款接口，保留准确提示，无公开占位客服联系方式 |
| STEP 1 | 现有 tabular-nums 局部数值及重发占位保留；未转换验证码/编号或改价格 |
| STEP 2 | **未发现完成专项同心圆角整合的代码/证据，不能认定完整实施**。例如 ProductCard 外圆角/内图/间距并非统一推导机制；当前适用圆角与裁切层保留，本轮不重做设计 |
| STEP 3 | 已有 StaggerGroup 局部一次性入场，独立 host；原有 Hero/Grid/Flip/导航/About 排除，内容默认可见和降级保留 |
| STEP 4 | 已有短标题局部 balance；硬断行、品牌与逐行揭示保留，无全局正文污染 |
| STEP 5 | 已有显式 data-card-depth 变体、共享两层阴影、功能边框/forced-colors 回退；不套所有 Card |

已实现仅指当前前端/演示边界。正式认证授权、短信、人机供应商、支付、实名和邮件均尚未接入，本轮未开发这些服务。重复媒体、旧效果源码与未用配置器实现没有运行冲突证据时保留；不把“无入口”写成已确认运行 Bug。


### E 组已执行（持续更新）

现有 `registration-flow.browser.cjs` 的 Mock 和生产分支均通过；保留全部功能断言，使用仓库外副本仅改结果输出路径并显式跳过截图，不覆盖历史结果，也不保存认证输入。覆盖显式注册、密码/验证码、人机/地区、未保存离页及 history、普通/管理员分离和生产禁用 Mock。`navigation-interactions.browser.cjs` 在真实生产静态导出通过 21 组合/21 次真实 Link 入口，含语言/日夜/桌面/手机/快速操作/历史；无浏览器或 hydration 错误。

E01/P2：旧 Flip 脚本最后的触屏断言读 `.product-card` 内表面的 data-product-id，而当前筛选/ID 位于父 article；不恢复旧 DOM。E02/P2：旧 hover 协调脚本把导航图片卡片也计入“Header/About 无 hover”全局断言，冲突于当前明确可 hover 的图片菜单。按“面板容器与 About 内容不浮起、图片卡片可浮起”迁移断言边界，保留原展开、关闭、中断、触屏和减少动态检查。


E03/P2（测试时序）：数值脚本曾在应用已创建定时器后安装模拟时钟，后续边界秒数不稳定。改为导航前仅固定 Date、保留原生定时器，发送 challenge 前固定基准时间；业务倒计时/有效期不变，稳定性阈值不放宽。字体加载后再测量，支持关闭认证截图。

E04/P2（旧测试入口）：theme-state 脚本仍找已删除的“展开商品中心”按钮且不支持现有外部工具环境；改为真实主文字 Link 的 hover 入口、沿用工具环境，并保证临时截图目录存在。原菜单/展开 Grid/输入保留/过渡抛错检查均保留，已通过。

E05/P1（实际运行冲突）：生产静态 HTML 直接访问编码的管理员路由时复现 React #418，普通路径无此错误。根因是静态 HTML 按解码后的 admin 路由渲染，SiteShell 客户端按原始编码 pathname 选择了带 Header/Footer 的另一套结构；Footer/导航等也存在同类路径判定。引入共享 useAppPathname，所有渲染 shell/面包屑/旧路由及标题路径缓存采用同一规范化，修复结构一致性，不重挂页面、不新增 suppressHydrationWarning。生产重建后，同一隔离复现脚本的编码/普通路径均无 hydration 错误；未增加全局抑制。


## 最终逐项状态与证据

| 编号 | 保留/迁移的实现 | 最终状态与验证证据 |
| --- | --- | --- |
| A01 | 原首屏裁切断言保留；动态 import/外部工具变量替代 require 与旧机器临时路径 | 已修复并验证：全仓库 lint、8 组裁切通过 |
| A02 | 数值 UI 原文与组合翻译保留，补显式词典条目 | 已修复并验证：精确词典覆盖及中英文数字回归通过 |
| A03 | 保留唯一 light/dark Provider；迁移旧固定日间测试 | 已修复并验证：display-modes、生产导航/偏好刷新通过 |
| A04 | 当前已提交商品、About、方案来源内容保留；三份哈希基线迁移 | 已修复并验证：语义契约及原快照检查通过，数据文件未改 |
| B01 | next-themes 唯一状态与圆形过渡保留；旧值规范化前置脚本+Provider 校验 | 已修复并验证：纯函数/脚本幂等、存储异常、6 种初始值、8 组跨标签/刷新/会话保持通过 |
| B02 | BASE_PATH / localAppPathname 共享给配置、角色/returnTo/兼容地址/注册离页 | 已修复并验证：带前缀、编码、双前缀、登录循环、外链与权限单元测试通过；生产伪造状态拒绝 |
| C01 | CSS Module 成为商品移动样式来源，旧全局重复/空匹配规则删除 | 已修复并验证：16 组计算样式逐属性一致；Flip、数值、入场与键盘导航通过 |
| D01 | VerificationLogin/AuthFields 为当前登录实现；移除 2 个无消费者私有文件 | 已修复并验证：引用图零缺失、lint/类型/构建/注册与登录检查通过 |
| E01 | 原 Flip 断言保留，触屏选择器指向实际筛选 article | 已修复并验证：完整原脚本通过（分类/顺序/快切/resize/刷新/历史/触屏/减少动态/链接） |
| E02 | 容器不浮起与图片可 hover 分开，About 断言限定 main | 已修复并验证：完整原脚本通过，额外确认导航图片 hover 宿主存在 |
| E03 | Date-only 固定测试时间，不模拟已创建的 interval/RAF；原业务时间逻辑与几何阈值保留 | 已修复并验证：8 组/64 个倒计时边界样本，数量与金额位数变化通过；认证截图关闭 |
| E04 | 当前 Link hover 入口替代旧展开按钮；沿用工具环境 | 已修复并验证：主题切换不关闭菜单/展开 Grid、不清空输入，过渡抛错降级通过 |
| E05 | useAppPathname 统一 shell/Header/Footer/角色/客服/旧路由/标题缓存的渲染路径 | 已修复并验证：相同编码直达复现由 React #418 变为零错误；最终专项与 21 组生产导航通过 |

### 最终执行的检查

- `npm run lint`：通过；没有关闭全局规则。
- `tsc --noEmit`：通过；没有创建空 typecheck 脚本。
- `node --test tests/*.test.mjs tests/*.test.cjs`：原 10 份加新增路由/偏好测试，共 11 份全部通过。
- `npm run build`：通过，仍为原 Next/React/静态导出方案，38 页；构建后实际使用 out 目录进行生产浏览器验收。
- 当前导航原脚本：21 组合、21 次真实 Link 入口通过；无 hydration/i18n 错误。
- 当前注册原脚本：Mock/生产分支通过；功能断言不删，跳过认证截图，仅结果目录改到仓库外。
- 新整合专项：8 组桌面/手机、中英文、日夜状态保持及跨标签迁移，旧 URL 直达/刷新、9 个唯一商品及 SONIC 历史购物车阻断/移除后有效商品保留，客服验证/预览零 POST，生产伪造状态及编码保护路由拒绝，均通过。
- `product-filter-flip`、`card-hover-coordination`、`theme-state` 原脚本：适配当前职责后通过。
- `navigation-resources`：10 次菜单切换后监听/RAF 回落、离屏 Lanyard/ScrollExpand、主题/语言节点身份稳定，通过。
- 数值：8 组通过；入场：24 页面组合和减少动态/异常/取消/隐藏/无 JS/中途操作/快速导航/清理检查通过。
- 静态/别名依赖引用图：零缺失；176 条静态媒体路径存在；字体/许可证、来源记录保留。
- `git diff --check`、冲突标记扫描、未合并索引：通过/为空。基线没有暂存，本轮也不暂存。

本轮不是所有历史测试的通配全绿声明。`tests/legacy/*` 和仍依赖旧四模式/旧登录入口/退休页面的其它历史专项未作为当前产品验收运行；其断言需要单独核实，未删除来凑通过。Chromium 实际运行；手机用模拟视口/触屏上下文，没有声称真实手机或 Firefox 验收。

### 保留、未决与未实施

- 已修复并验证：上表 13 项。没有以删除功能修复冲突，也没有已修复但未验证的生产代码项。
- 待核实：剩余无路由入口的历史视觉组件及公开媒体的仓库外消费者；没有运行冲突证据，保留，不盲删。动态资源没有穷尽所有外部消费者，不能据静态无 import 删除公开文件。
- 未实施：STEP 2 的专项完整同心圆角整合；正式数据库、认证授权、人机/验证码供应商、支付、实名和邮件服务。前端角色守卫不是可信后端 ACL，生产仅确认演示入口关闭，不把它称为已接入正式认证。
- 本轮没有因环境阻塞而遗漏必需的 Chromium 功能检查；未运行的旧历史专项和真实设备/其它浏览器范围如上所述。
- 保留兼容：robotdock ID/URL、Offering 套餐引用、旧 configure/customize/sonic-link 静态入口、SONIC 历史购物车的显式阻断和移除流程、forgot-password 的 AuthCard 兼容说明。
- 删除：仅 `src/components/useLoginForm.ts` 与 `src/components/InlineAuthError.tsx`，运行源码、动态/别名 import、测试和配置无调用，历史文档清单只是当时文件记录。未删除 public 素材、来源或许可证。
- 依赖：零变更；package.json/package-lock.json 与开始时哈希一致，无升级、卸载或包管理器变更。
- 用户工作：开始前的 40 个已修改/未跟踪文件中，除 README 审计链接、ProductCard Module 的等效样式归并及 numeric-layout 测试加固外，其余逐字节保持；这三份也在原有内容上最小修改，已有标题/阴影/数字/入场未覆盖。其它本轮变更相对仓库外基线可单独复核。

私有完整基线/备份仍在前述目录。可审查本轮相对起点的差异；没有切分支、merge/rebase、stash、reset/clean、提交或推送。临时 Mock/静态服务将在验收后关闭，原默认开发服务恢复。


收口确认：最终注册 Mock/生产分支复验仍通过；本轮独立差异已保存到私有备份目录的 `audit-only.diff`，可区分用户起点与本轮 34 个文件变更。37 个起点文件逐字节保持，3 个起点文件作明示的最小整合；暂存区/未合并项仍为空，HEAD 未变。临时 Mock 服务及 3001 静态预览已关闭，3000 默认开发服务已恢复。
