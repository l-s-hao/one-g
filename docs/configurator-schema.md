# ConfiguratorSchema 与共享工作台（STEP 5）

本阶段只实现整机 `robot`，未创建 RobotDock / SONIC Link 页面、数据、资源或 Schema。路由、Auth、Theme 继续遵守 STEP 4。

```text
/configure/robot
        ↓ schemaId="robot"
ConfiguratorClient → Configurator Registry
        ↓
robotSchema
        ↓
ConfigurationWorkbench
        ├─ Module Library
        ├─ Current Build
        ├─ Summary
        ├─ Progress
        ├─ Recommendation / RecommendedBuild
        └─ Price
```

## 文件与职责

- `src/types/configuration.ts`：共享数据合同；保留旧 Robot DTO。
- `src/data/configuration/schemas/robot.ts`：当前五组、标签、布局意图、默认选择、场景/范围映射、兼容规则转换。
- `src/data/configuration/registry.ts`：目前只注册 `robot`。
- `src/lib/configuration/engine.ts`：产品引用解析、选择、规则、摘要、价格、进度、推荐、方向解析；无 React、Router、localStorage 依赖。
- `src/lib/configuration/adapters.ts`：`robotConfigurationToGeneric()` / `genericToRobotConfiguration()`。
- `src/lib/configuration/storage.ts`：版本化存储、迁移、购物车快照。
- `src/components/ConfigurationWorkbench.tsx`：唯一完整工作台；共享桌面/移动端与首页 preview。
- `src/components/ConfiguratorClient.tsx`：Suspense + query + registry，传 Schema 给工作台。路由只指定 ID、metadata；Auth 仍由现有 SiteShell/RequireRole 负责。

## 数据合同

`ConfiguratorSchema`：`id`、`productType`、`title`、可选 `description`、`entryHref`、`cartLabel`、`groups`、`defaults`；可选 `scenes`、`scopes`、`recommendations`、`compatibilityRules`。不包含 React 组件、Tailwind 字符串或像素布局。

`ConfigurationGroup`：`id`、`label`、`heading`、可选 `shortLabel/slotLabel/navigationLabel/description/installedLabel/icon`；`selectionMode`（single/multiple）、`required`、`minSelections/maxSelections`、`order`、`slotLayout`（full/half）、`rowWeight`、`progressWeight`、`options`。组 ID 在 Schema 内唯一，选项 ID 在各组内唯一，option.groupId 必须对应所属组。边界必须合理：非负最小值、不小于最小值的最大值，single 最大为 1。权重为非负有限数；布局比例为正数。

`ConfigurationOption` 复用原类型并解除 Robot category union：`id`、`groupId`、`name`、`status`，可选 `productId`、`price`、`description`、`recommendedFor`、`metadata`、`omitted`。`omitted` 表示显式不安装，仍保留选择与零价格，但不计安装进度。`recommendedFor` 为可选扩展信息，实际推荐由 Schema 的 recommendation map 决定。`legacyNames` 保留旧中文数据解析能力。

商品选项用 `productId` 引用现有 Product；引擎按 Product 解析名称、状态和价格，不复制完整 Product 对象。Robot 基础平台来自 robot 分类商品。其余当前 Mock 配置模块仍引用原 `data/configurator.ts` 数据；不能因名称近似便强行绑定普通商品。比如配置 rgbd 为 ¥6,000，而商品 rgbd 为 ¥2,980，关系未经确认，本次保留既有价格，不猜测它们是同一 SKU。

```ts
type ConfigurationState = Record<string, string[]>;
// Robot 示例，不是另一套固定字段类型：
const selections = {
  base: ["g1"], arm: ["standard-arm"], hand: ["five-finger"],
  vision: [], capability: [],
};
```

单选最多一个 ID；多选去重并限制 maxSelections。编辑时允许移除必选项，但未满足 required/minSelections 时不能保存。加载会按当前 Schema 过滤无效组/选项并规范数量。拖拽、已选状态、推荐标识均使用 groupId + optionId，支持不同组重复 option ID。

## Robot Schema

| ID | 显示标题 | 模式 | required | 插槽 |
| --- | --- | --- | --- | --- |
| base | BASE PLATFORM | single | 是 | full，第一行 |
| arm | ARM | single | 否 | half，第二行 |
| hand | END EFFECTOR | single | 否 | half，第二行 |
| vision | PERCEPTION | multiple | 否 | half，第三行 |
| capability | CAPABILITY | multiple | 否 | half，第三行 |

保留默认 G1 + 标准机械臂 + 五指灵巧手、¥97,800、3/5 进度。`no-arm/no-hand` 的业务含义仅在 robotSchema 转为 omitted，通用 UI 不识别这些 ID。桌面行比例来自语义布局元数据，CSS 变量由 UI 计算；原基础平台跨整行、另外四槽双列以及三栏独立滚动保持。

## 推荐与场景/范围

`RecommendationRule` 使用 `{scene, recommended: { [groupId]: optionIds }}`。引擎只读取实际 Schema 组与 active 选项，去重并按单/多选边界处理；应用仅替换推荐指定的组，保留其他选择；最终候选统一验证兼容性和最大选择数。逐项添加、空槽采用推荐、非默认配置覆盖确认、完整推荐展示均保留。

Robot 继续支持 handling / inspection / teleoperation / ai。Schema 提供场景的 preferredGroup 与范围 alias：whole→base、arm→arm、end-effector→hand、perception→vision、capability→capability。原生 group ID 也可用；未知 scope 回退到按 order 排序的首组。工作台只操作字符串组 ID，点击槽位展开对应组，不包含 arm/vision 分支。query 中其他参数、重复参数和 hash 仍通过现有修改方向链接保留。

## 兼容性

`CompatibilityRule` 的源为 `{groupId, optionId}`：

- `requires`：必须选择目标 option。
- `incompatibleWith`：不能同时选择目标 option。
- `requiresGroup`：目标组必须有选择。
- `allowedOptions`：目标组至少选择允许集合中的一个，用于承接 Robot 旧 compatibleWith 基础平台列表。

规则面向完成后的候选状态检查，不保证选择顺序构成自动求解器；不会静默删除冲突选项。当前 Robot 数据没有正式兼容矩阵，仍显示“兼容关系待确认”，不增加兼容性承诺。通用引擎不认识 baseRobotId。

## 进度、Ready 与价格

进度采用已安装组语义，以保留 Robot 行为：每组至少选中 `max(1, minSelections 或 required 默认值)` 个非 omitted 且可用的选项才完成。百分比 = 完成组权重之和 / 总权重，默认每组权重 1；空 Schema/零总权重返回 0，不除零。移动分母、进度段数、标签从实际组生成，不固定为五组。

Ready 与进度分开：required 默认 min=1，optional 默认 min=0；显式 minSelections 优先；所有组满足最小/最大数量且已选选项可用才可保存。Robot 只选基础平台仍能保存，进度不必 100%。

摘要和计价遍历所有组/所选选项；空可选组计 0，空必选组或任意未知/非有限价格传播为 undefined。`formatPrice` 显示“获取报价”，不生成虚构数字或 NaN。保留所有 Mock 价格。旧 `lib/configurator.ts` 的 Robot 计价 API 已委托通用引擎。

## 存储与购物车

键为 `one-g-config:<schemaId>`，当前 `one-g-config:robot`：

```ts
{
  version: 2,
  schemaId: "robot",
  selections: { base: ["g1"], arm: ["standard-arm"], hand: ["five-finger"], vision: [], capability: [] },
  snapshot: {
    schemaId: "robot",
    selections: { /* 独立复制的 IDs */ },
    name: "ONE-G G1 配置方案",
    category: "机器人配置",
    price: 97800,
    summary: [ /* {groupId, label, options: [{id, name, price?}]} */ ]
  }
}
```

首次读取没有新键时，读取旧 `one-g-config`，经原解析器支持 RobotConfiguration ID 字段或中文字段，再由 adapter 转通用状态，写入新键。原键保留；迁移写失败仍返回恢复数据。新键存在但损坏/未来版本不自动覆盖；显式保存才写当前格式。删除配置同时删除 Robot 新旧键，避免旧数据复活。不同 Schema 不共享 key，只有 robot 尝试旧键迁移。

配置保存与购物车关系保持原 Demo 行为：保存方案也会进入购物车，加入购物车额外导航到 /cart。同一个版本化记录原子保存状态与快照。Cart/Checkout 读同一快照价格，不随目录变动重新报价；目录项删除后，工作台过滤无效选择，但旧购物车名称、摘要、价格仍保留。普通商品购物车逻辑未改。快照是浏览器端演示数据，真实交易未来仍需服务端报价验证。

## 保留的兼容层

- `RobotConfiguration`、`ConfigurationCategory`、`ConfigurationStep`、`RobotConfigurationOption`：仅旧数据、解析、assembly API 与 Robot 数据定义使用，不进入通用 UI。
- `CustomizeWorkbench.tsx`：首页 preview 的薄适配器，只传 robotSchema，没有第二套 UI。
- `customize-entry.ts` 与原 `customize/*.module.css`：保留入口业务数据、CSS 文件位置；不影响新正式路由。
- 旧 `lib/workbench.ts`、`lib/recommendations.ts` 的 Robot 专用引擎已删除；`RobotConfigurationWorkbench.tsx` 路由包装由通用 ConfiguratorClient 替代。

## 未来接入新产品（仅流程）

1. 添加确认过的 Product Data，处理授权与产品状态。
2. 创建 ConfiguratorSchema，引用商品、配置组选项、真实兼容/推荐规则，明确 unknown price 和选择边界。
3. 注册 Schema；运行通用引擎测试并验证默认值、唯一 ID 和组约束。
4. 添加 /configure/[product] 对应 route，沿用 metadata/Auth/basePath 约定，传 schemaId。
5. 使用同一个 ConfigurationWorkbench；验证布局、移动端与 storage。若开放多种配置同时加入购物车，再扩展现有只读 robot 的 Cart 入口，不能覆盖其他 Schema 快照。

不在本阶段注册空的 robotdock/sonic-link Schema，也不创建它们的路由。

## 验证

- `node tests/configuration.test.mjs`：8 个核心测试覆盖 Robot 基线、三组通用 Schema、上下限/身份/权重、兼容规则、推荐、scope、旧数据迁移、快照目录变化、损坏数据与存储失败。
- 浏览器：无 query、handling/arm、inspection/perception、teleoperation/capability；推荐展示、槽位导航、三栏滚动；旧 URL 与 returnTo、query/hash；普通/特殊主题、Mobile tabs、Cart。另测一键/逐项推荐、覆盖确认、拖拽、旧存储加载、结算。
- 与 STEP 4 已构建版本比较：1440×1000 默认页及 handling/arm、390×844 teleoperation/capability，三个截图逐像素相同，插槽几何与文字相同。
- `npm run lint`：PASS，0 errors；保留 DriftWall、ScrollExpand 两处既有 no-img-element warning。
- `npm run build`：PASS，26 个静态页面；configure、configure/robot 与两个旧 compatibility 页面均生成 index.html。沙箱内首次构建无法读取 TypeScript 子进程输出，沙箱外正式构建通过。
- robotdock-demo：git status --porcelain 为空；HEAD 为 218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f。
- sonic-link-demo：git status --porcelain 为空；HEAD 为 d6f8b26b1cdc3f56f6b6e4091342a56228527b9c。
- 两个参考仓库 HEAD、所有审计记录文件 SHA-256 均与 STEP 1–2 基线一致。没有从参考仓库复制源码或资源。

后续边界：当前价格、兼容关系仍为 Mock；普通商品与配置模块 SKU/价格映射需产品确认。新增产品需要真实规则与资产授权，购物车目前按现有行为显示一份 Robot 配置，多 Schema 同时加入购物车需再扩展聚合入口。本阶段到此停止。

## Actual Example 2: RobotDock（STEP 7）

前文为 STEP 5 基线。现在 registry 包含 robot 与 robotdock，两路由共用 ConfiguratorClient + ConfigurationWorkbench。RobotDock 使用 STEP 6 Product 的四档 bundles，只有一个 required/single 的 bundle 组；固定接口和兼容信息不进入配置项。

Schema 新增可选 productId、purchaseMode、progressMode、statusNote；Option.metadata 可承载 includes。Robot 保持原默认行为，RobotDock 通过 purchaseMode=preview、progressMode=required 表达差异，不在工作台内判断产品 ID。Product 状态优先于交易模式；concept 预览可选、不可购物。

通用价格标签区分已知/全未知/部分未知。预览 StoredConfiguration 不包含 snapshot；Robot 原格式带快照且继续兼容旧键。详情见 [robotdock-configuration.md](./robotdock-configuration.md)。

## Actual Example 3: SONIC Link（STEP 9）

Registry 现在注册 robot、robotdock、sonic-link；三个页面都通过 ConfiguratorClient 加载同一个 ConfigurationWorkbench。

| Schema | 组结构 | 完成条件 | 价格 / 交易 |
| --- | --- | --- | --- |
| Robot | base/arm/hand/vision/capability；single 与 multiple 混合 | base 必选，保留按安装组统计的进度 | Mock 已知价格、原 Cart 快照 |
| RobotDock | bundle；single，四选一 | 唯一必选组 | concept、未知价格、仅预览 |
| SONIC Link | bundle；single 三选一；add-on；multiple 0..1 | bundle 必选，可选夹爪为空仍 Ready | coming-soon、未知价格、仅预览 |

SONIC 的包内头显/手柄/脚环/对应软件/小背包固定随套餐提供，不增加独立设备组。套餐及夹爪来源为 Product.detail.bundles / addOns，不复制 Product 对象，不把 Mock ONE-G G1 误认成宇树 G1 SKU。Option.status 和 Schema.productId 来源于 Product，通用 policy 对非 active 禁止购物；没有新的 CompatibilityRule 或 RecommendationRule 数据可建立。

本阶段通用增量：

- Schema.querySelections 声明 query parameter → groupId；getEntrySelections 校验选项与规则，返回初始化状态或 undefined。显式参数从 defaults 初始化，非法值保留默认；参数不存在时照旧恢复该 Schema 保存记录。ConfiguratorClient 用 memo 与初始化状态 key 交给工作台，没有 SONIC ID 分支，Robot/Dock 无绑定因而不受 bundle query 影响。
- Workbench.initialSelections 优先于已存记录，只在进入/初始化时生效；用户仍能切换，显式保存才写 localStorage。
- Schema.contactLabel 与 SupportButton.label 支持“获取报价”，仍使用统一 site-contact 电话/邮箱。默认标签保留“咨询客服”。
- 关联商品的状态说明直接取 Product；预览清单行增加文字状态。空可选组价格明细显示未选择，内部合计仍按零增量处理；已选未知价格绝不显示 ¥0。
- multiple 达到 maxSelections 时不再显示“可继续添加”。required 进度模式的配置完整标识使用实际 validation，避免可选项失效时误报 Ready。
- 两个 full 插槽沿用少组布局，桌面取消固定最小高度以避免短视口中栏裁切；左/右仍 auto 滚动，中栏固定无滚动。Mobile 沿用三 Tab，没有第二套 UI。

SONIC 预览保存 version=2/schemaId/selections 到 one-g-config:sonic-link，不含 snapshot，无迁移；原 Robot/RobotDock Schema 与 storage 实现未改。细节见 [sonic-link-configuration.md](./sonic-link-configuration.md)。

## STEP 10 — 三产品共同契约与清理

三产品已通过同一 Workbench 的配置、状态、保存、价格、推荐、兼容和移动/桌面路径验证。正式样式移动到 components/ConfigurationWorkbench.module.css 与 ConfigureEntry.module.css，Robot 场景数据改为 data/configuration/robot-entry.ts；旧 URL 目录继续保留。前文旧路径为阶段历史，当前位置以本节为准。

Registry + Product 现在统一驱动配置中心和详情 CTA，Product.configurationHref 已删除。configuration/catalog 解析产品与 Schema 的直接或 Product-backed 平台关系；普通附件无 Schema 关系则不显示配置 CTA。三个固定页面用统一 metadata helper，仍静态导出。

product-policy/ProductStatusBadge 统一商品状态与购买资格；configuration/actions 结合 Schema 预览权限、required/max/兼容校验决定 Ready/保存/购物，返回纯业务状态。Workbench 内没有任何产品名判断。Desktop/Mobile 使用同一个动作 renderer，Summary 和 Header 信息顺序一致。

Progress 与 Ready 明确区分：Robot 保留安装权重统计，另两者保留 required 统计；所有 Schema 的 Ready 都来自 validation，optional 未选不阻止 Ready。空组不展示，但空 required 组不能变为有效配置；没有推荐数据则不渲染推荐区。无效选择由用户修复，不自动删。

快照新写入可选 productId，旧 version=2 保持可读；price 继续表示冻结报价，不再增加同义字段。预览和不完整 active 配置不生成 Cart snapshot；Cart 读取旧快照内容与价格，仅核验当前销售资格，不重新报价。旧 RobotConfiguration adapter 与 one-g-config 只读迁移仍保留，Cart 单 Robot 快照聚合限制仍是既有边界。

无业务必要新增的 Schema UI 开关；删除未使用 recommendedFor 选项字段和旧 Robot 计价导出。完整审计、移动清单与技术债见 [step10-integration-cleanup.md](./step10-integration-cleanup.md)。
