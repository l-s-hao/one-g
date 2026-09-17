# STEP 7 — RobotDock 配置预览

## 产品与数据来源

唯一产品事实来源为 STEP 6 的 `src/data/products/robotdock.ts`：concept，四档套装，未开放销售，价格/型号/交付条件未定。参考仓库 commit 保持 `218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`，本阶段不复制参考代码或资源。

## Schema 与选择边界

`src/data/configuration/schemas/robotdock.ts` 导出 `robotDockSchema`，id=robotdock，productId 指向同名 Product，registry 仅含 robot 与 robotdock。

| group | 标题 | selectionMode | required | min/max | 布局 |
| --- | --- | --- | --- | --- | --- |
| bundle | PACKAGE / 套装 | single | true | 1 / 1 | full |

默认 base。可选组为零：源数据没有独立可选附件。接口 CAN/RS-485/Ethernet/USB 及兼容目标继续留在产品规格中，不变成可选模块或必选机器人。

四个选项通过 Product.detail.bundles.map 创建，不重复维护清单：

- base：小背包。
- hand：小背包 + 灵巧手（送连接件）。
- gripper：小背包 + 夹爪（送连接件）。
- gripper-camera：小背包 + 夹爪 + 双腕相机（送连接件）。

选项名称、描述、稳定 ID 与 `metadata.includes` 直接来自 STEP 6。双腕相机数量 2 台，设备型号待确认；后三档赠送连接件，所有套装不含机器人本体。Summary 默认展开 INCLUDES，也可折叠。套装内部固定部件无需再选择。

## 共用工作台

/configure/robotdock → ConfiguratorClient(schemaId) → getConfiguratorSchema → ConfigurationWorkbench。没有 RobotDock 专用工作台、模块库或摘要组件，也没有 `schema.id === "robotdock"` 渲染分支。

共用新增能力：

- `productId` 关联商品，`purchaseMode: preview` 明确预览权限。policy 同时检查 Product 状态，非 active 或关联商品缺失时禁止交易行为；将 purchaseMode 改成 cart 也不能绕过 concept 状态。
- 预览模式允许 concept/coming-soon 选项被选择，但不允许 draft；普通 Robot 模式仍只允许 active。
- `metadata.includes` 是可选的通用选项说明，用同一 Summary 渲染。
- `progressMode: required` 只统计必选组及 minSelections>0 的组。Robot 默认 installed 模式维持 STEP 5；RobotDock 选一套装即 1/1、100%，清空为 0%，不可保存。
- 全未知价格总计显示“价格待定”，部分未知显示“部分价格待确认”，全已知正常求和。没有把未知价格变成 0；各选项/价格行仍可显示“获取报价”。
- 组数不超过两个时共用紧凑布局，插槽按真实组数生成，移动端不强制插槽高度。桌面左/右 overflow-y:auto，中栏 hidden，内容不强制拉伸铺满。
- SupportButton 支持 inline，用于右侧与移动操作栏；仍使用 site-contact.ts 的同一电话/邮箱。没有报价后端。

## 保存和购物车

```ts
{
  version: 2,
  schemaId: "robotdock",
  selections: { bundle: ["gripper-camera"] }
}
```

保存在 `one-g-config:robotdock`。通用 StoredConfiguration 的 snapshot 改为可选：预览保存不生成 snapshot，读取预览也不消费任何旧 snapshot。Robot 保存仍有独立快照，旧 `one-g-config` 迁移行为不变。

RobotDock 不显示加入购物车；保存函数拒绝预览的 toCart 行为；Cart 当前仍只消费 Robot 的快照。产品数据 concept 导致普通商品添加与恢复购物车也被拒绝。保存 RobotDock 不写 one-g-config:robot 或 one-g-cart；保存 Robot 也不覆盖 RobotDock。

## 推荐、路由与入口

没有推荐数据或 provider，没有空推荐面板；handling/inspection 等 scene 参数不会生成 Robot 推荐。支持通用 scope=bundle；未知 scope 回退首组，没有额外新增附件 scope。

- /configure：新增产品入口区；整机继续原场景/范围选择，RobotDock 标注“概念产品 · 配置预览”。
- /products/robotdock：通过 Product.configurationHref 增加“配置预览”CTA。
- /configure/robotdock：标题 ROBOTDOCK CONFIGURATION PREVIEW，轻量中文状态说明；metadata 为 RobotDock 配置预览 | ONE-G，保留 noindex 与正式 canonical。
- SiteShell 的工作台识别统一为 /configure/ 子路由，/configure 仍是普通页面。原 RequireRole、USER/ADMIN 模型与主题解析不变。
- registry 提供 getConfiguratorSchema；未知 ID（包括原型属性名）返回 undefined，client 显示不可用，不会误取属性。不存在的 URL 仍走静态 404。

## 验证与后续边界

核心测试覆盖四套装互斥、Includes 与 Product 一致、concept 可选但不可交易、价格未知/部分未知、必选/可选进度、registry 未知 ID、存储隔离与无快照，并保留所有 Robot 测试。

浏览器覆盖登录回跳、四套装与清单、保存刷新、空购物车、入口/产品 CTA、客服、375/390 三 Tab、七种主题、ADMIN 跳转；Robot 三种场景推荐/价格/加入购物车正常。Robot 默认桌面截图与先前基线逐像素相同。

真实价格、型号、兼容矩阵、交付条件和客服正式联系方式仍待确认；当前 site-contact 含原有占位信息。未来销售开放必须同时确认商品状态和配置交易模式。没有 SONIC Link Product/Schema/路由，没有数据库或报价系统。STEP 7 到此停止。

最终验收：`npm run lint` PASS（0 errors，保留 DriftWall/ScrollExpand 两条既有图片 warning）；`npm run build` PASS，28 个静态页，configure/robotdock、configure/robot、products/robotdock 均存在 index.html。12 项核心测试 PASS。最终紧凑布局验证 1280×720、1440×1000、375×844、390×844 无横向溢出及中栏裁切；手机插槽内容高度约 104px，没有人为撑高。

参考仓库最终核验：robotdock-demo、sonic-link-demo 的 status 均为空；HEAD 分别保持 218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f、d6f8b26b1cdc3f56f6b6e4091342a56228527b9c；全部审计文件哈希未变。git diff --check PASS。验证本地 /one-g/ 静态产物，未发布线上。
