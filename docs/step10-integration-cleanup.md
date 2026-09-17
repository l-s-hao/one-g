# STEP 10 — 三产品整合与清理

## 审计结论

[分类审计](./configurator-integration-audit.md) 已先于实现建立。Workbench 中原有具体产品名/ID 条件 0，删除 0，剩余 0；没有第二套 ModuleLibrary/CurrentBuild/Summary/Progress/Mobile 配置器。保留两个 storage Robot 判断仅用于旧数据迁移和清除旧 key，不属于 UI 产品特例。

## 删除与重命名

本阶段没有整文件删除业务能力；四个旧路径改名/移动：

| 旧路径 | 新路径 | 理由 |
| --- | --- | --- |
| src/components/CustomizeWorkbench.tsx | src/components/RobotConfigurationPreview.tsx | 首页薄包装仍有引用；改名表明真实作用，完整 UI 仍只有一份 |
| src/data/customize-entry.ts | src/data/configuration/robot-entry.ts | 当前 Robot 场景与范围数据，不是旧 URL 组件 |
| src/app/customize/workbench.module.css | src/components/ConfigurationWorkbench.module.css | 正式三产品共享样式归组件所有 |
| src/app/customize/start/start.module.css | src/components/ConfigureEntry.module.css | 正式配置入口样式归组件所有 |

同步重命名 CustomizeChoice/Scene/Scope、customizeScenes/Scopes、getCustomizeEntry/Query 为 ConfigurationEntryChoice、RobotEntryScene/Scope、robotScenes/Scopes、getRobotEntry/Query。lib/configurator 删除无调用的 getConfigurationSteps/getInitialConfiguration/getSelectedIds/getConfigurationRows/getConfigurationTotal 五个导出及对应引用，移除旧计价路径；保留 getOption/getConfigurationOptions/parseConfiguration 供 assembly 和迁移。删除无数据/调用的 ConfigurationOption.recommendedFor；推荐继续用 groupId → optionId[]。

未凭文件名删组件；三个相关 CSS Module 的类名逐一与组件 styles 引用比对，没有未引用类，不删除仍有效的断点/主题规则。未发现配置组件 barrel 过期导出或显式 any。

保留 CustomizePage/CustomizeStartPage 以及 app/customize 路由目录、configuration-routing 的旧 URL 字面量；这些是旧 URL 的真实兼容层。RobotConfiguration/ConfigurationStep/RobotConfigurationOption 和 adapter/legacy 解析继续保留，现有 assembly/迁移有调用。

## 单一配置关系与入口

删除 Product.configurationHref；Registry 是可配置关系唯一来源。

- Schema.productId 直接关联独立产品。
- 未直接绑定的整机 Schema 从同类的 productId 选项识别可配置产品；不会把普通机械臂、手或视觉商品自动当成整机配置。
- configuration/catalog 提供 getProductConfigurator/getConfigurePath/getProductActions/getConfigurationEntries，返回业务数据不返回 JSX。
- /configure 遍历 Registry 得到三张同结构卡：产品名、定位、状态、配置说明、CTA。产品信息取直接关联商品或 Schema 默认选中的 Product-backed 平台。Robot 卡显示真实默认商品 ONE-G G1；原场景/范围选择仍保留在入口下方。
- 普通配件详情不再错误显示整机“开始配置”；整机、RobotDock、SONIC CTA 由同一 resolver 生成。三个静态路由继续保留，无动态路由重写。
- 三工作台共用配置中心 / Schema breadcrumb 与查看产品链接；整机产品链接随当前选中平台变化。

## 状态与操作

ProductStatusBadge 与 product-policy 统一文字映射：active 可配置、concept 概念产品 · 配置预览、coming-soon 即将开放、draft 草稿。当前没有 preview enum，未为消除 if 新增状态。Badge 用于 ProductCard、详情、配置中心、工作台；颜色不承担唯一状态信息。

普通商品购买资格由 getProductPolicy 统一；配置操作由 getConfigurationActions 结合 Product、Schema.purchaseMode 与 configurationValid 统一。canAddToCart 要求可购买商品、非强制预览且配置有效。预览可保存、咨询，不可购物。保存按钮由一个 renderer 同时用于桌面和 Mobile Bottom Bar；保存配置 / 保存配置预览文案统一，报价仍使用 site-contact，不增加后台。

Workbench header 三产品同一结构：eyebrow、Schema title、商品状态、简短 Schema 说明、导航。Summary 顺序为商品名、组选项、READY 状态、价格和操作。Module Library 与 Slot 都标记必选/可选；未选择、已选择、推荐、不可用使用统一渲染器。空选项组不显示 Accordion/Slot，必选空组仍阻止 Ready，不能用隐藏来跳过校验。

价格只有 engine 的总价逻辑：全已知显示总价；部分未知显示部分价格待确认；全部未知价格待定。空可选项内部按零增量计价，UI 显示未选择；不存在把未知价格作为 ¥0 的路径。没有重复 priceSnapshot 字段：现有 snapshot.price 就是冻结价格，继续兼容。

Ready 统一采用所有 required/min/max/兼容约束通过；optional 未选不阻止 Ready。Progress 保留 STEP 5/7 定义：Robot 按五组安装权重统计（只选 base 是 20% 但可 Ready）；RobotDock/SONIC 按 required 组统计。未把两个语义混为一谈。无效选择保留并提示修复，不静默删除；推荐不存在时完全省略。

## 存储与 Cart

三 key 保持 one-g-config:robot / robotdock / sonic-link，version=2、schemaId、selections；预览不生成 snapshot，无新迁移。旧 one-g-config 只读迁移到新键，绝不继续写旧键；显式删除 Robot 记录会一起删除旧键，防止复活。

新快照补充可选 productId（关联商品或已选平台），保留 schemaId/selections/summary/price；旧 version=2 无 productId 可读。原来没有 createdAt，本次不伪造历史时间。保存无效 active 配置不生成 Cart snapshot。Cart 读取冻结名称、组选项与价格，不按最新 Product 重算；仅用当前商品状态核验销售资格，旧快照从已保存选择推断商品身份，停售或缺失时拒绝购买。

Cart 仍只展示一份既有 Robot 配置快照；未趁清理扩展多配置购物车。两个预览 Schema 不进入 Cart。未来开放销售需明确多 Schema 聚合与服务器报价校验。

## 视觉与权限边界

三产品共享左栏滚动、中栏固定、右栏滚动及 Mobile 三 Tab；少组自然高度保留。未修改首页结构、DriftWall、ShinyText、ParticleText、ScrollExpand、Lanyard、Logo、主题色和 Brand Lock 规则；首页预览仅更新包装引用和 CSS 位置，预览文字保留原行为。

所有 configure 路由仍需 USER 登录，ADMIN 与 USER 隔离；/customize 两旧路径继续静态回跳并保留 query/hash。三配置页 metadata 经同一 helper 生成，无 Customize/定制术语。

## 剩余技术债与数据库准备度

三产品前端配置边界已收敛，可进入数据库需求/数据模型设计评审；不能据此直接宣称可上线交易。仍需确认：正式 SKU/价格与兼容矩阵、Robot Mock 数据映射、软件许可与交付、真实用户鉴权、报价版本/有效期、订单不可变快照、多配置 Cart 语义及 schema/option 版本迁移策略。不要先接数据库再让数据库固化这些未确认业务假设。本阶段未接 PostgreSQL/Prisma/Supabase 或 Admin CRUD。

## 响应式细节复核

截图复核额外发现并修复：1280×720 Robot 插槽的移除行越界（短桌面将名称/移除横向排列，保留选择文字与勾号），手机客服内联面板挤高底栏（面板悬浮在底栏上方，不挤价格列）。两项均使用通用响应式 CSS，无产品 ID 分支，首页 preview 不受桌面压缩规则影响。Mobile Accordion 隐藏时，模块分类按钮和可见 Slot label 仍显示必选/可选。

## 最终验收

- 18 项 configuration.test.mjs PASS：三产品规则/价格/存储/快照，Registry 自动入口，普通附件无配置 CTA，Ready 与安装进度分离，空必选组阻止完成，旧 v2 快照兼容、冻结价格与停售拦截。
- integration.browser.cjs PASS：三产品 × 七主题；1280×720/1440×1000 左右独立滚、中栏固定、按钮在插槽内；375/390 三 Tab 与统一动作、报价浮层不撑高底栏；四正式入口匿名 returnTo；两旧路径保留 query/hash；产品双向导航；普通附件 CTA 清理；Robot base-only Ready/20%/Cart；首页和 about 品牌锁及首页无旧链接。截图复核通过。
- sonic-configuration.browser.cjs PASS：SONIC 六组合/预选/保存与隔离、报价、RobotDock 四套装/保存、Robot 三场景推荐/scope/价格/100%/Cart、ADMIN 隔离。
- sonic-link.browser.cjs PASS：商品中心与分类、十个详情、Auth、metadata、产品资源、七主题、移动布局、两个既有工作台。
- lint PASS（0 errors，DriftWall/ScrollExpand 两条既有 no-img-element warning）。build PASS（30 个静态页面）；最初沙箱内 TypeScript 输出解析受限，沙箱外正式构建通过。
- 八条静态路径存在：configure、三个 configure 子页、RobotDock/SONIC 产品页、两个 customize 兼容页；/one-g/ basePath、canonical 正常。
- rg 残留：源码只有两个 Customize 路由组件名、configuration-routing 中两个旧路径；无用户可见“定制”、无主动旧链接、无产品专用工作台或具体产品条件。唯一 schemaId===schemaId 是存储身份校验，非产品特例。
- 配置/推荐/入口三 CSS Module 无未引用类；git diff --check PASS。受保护首页/动效/Logo/主题文件 SHA-256 与 STEP 10 初始基线一致。
- robotdock-demo porcelain 空；HEAD `218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`。
- sonic-link-demo porcelain 空；HEAD `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`。
- 两参考仓库全部审计文件哈希不变；reference-robotdock.md/reference-sonic-link.md 未修改。

STEP 10 完成后停止。没有新产品、数据库、Admin CRUD、commit、push 或线上部署。
