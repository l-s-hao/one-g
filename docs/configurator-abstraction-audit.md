# STEP 5：抽象前 Robot 耦合审计

审计对象为 STEP 4 完成后的工作区。先读取页面、入口、完整工作台、推荐组件、配置 fixtures、类型、价格/兼容函数、购物车/结算、存储、拖拽及响应式 CSS，再设计抽象。本阶段只实现 robotSchema，不迁入另外两个产品。

| 位置 | 当前耦合 | 本阶段处理 |
| --- | --- | --- |
| types/configuration.ts | RobotConfiguration 固定五字段；category 固定五种 | 保留旧 DTO；通用状态改 groupId → IDs，配置选项不再绑定 Robot union |
| data/configurator.ts | 五组步骤、默认机器人、选项 category、no-arm/no-hand | 原数据事实保留；组标签、单/多选、默认值、不安装含义集中在 robotSchema/适配器 |
| CustomizeWorkbench 顶部 | fullGroups 全局 Robot 数据；五套标签映射；五个图标；emptyConfiguration 固定字段 | 工作台接收 schema，渲染排序后的 groups；空状态/默认状态来自 schema |
| 工作台 state/refs | ConfigurationCategory union、scope.category、scene.preferredCategory | 通用 group ID；schema 提供 scope alias/场景偏好 |
| canSave | baseRobotId 存在且无 invalid | schema required/min/max + 兼容校验。当前业务仅 base 必选，其他四组可空 |
| Progress | 五组各 20%；移动 /5；no-arm/no-hand 不算安装 | 动态组数与权重；Robot 明确选择 installed 进度语义，保留可保存与 100% 进度不是一回事 |
| CSS progressTrack/progressLabels | repeat(5) | 由实际维度数提供 CSS 变量，保持五组样式；窄屏既有两列覆盖保留 |
| CSS slots/baseSlot | base 固定跨整行；桌面固定三行比例 | group.slotLayout 表达 full/half、行权重；UI 计算行模板，保留 Robot 原比例 |
| Summary / Price | 固定中文标签；价格行 index 绑定组 | 遍历 schema groups；逐项计价、未知价格传递、不出现 NaN |
| slot | category=base 的样式与提示；vision/capability 多选；hand 固定提示 | slotLayout、selectionMode、组选项说明和选择反馈取自 schema |
| 已选、修改、拖拽 | category→Robot field；多选判断两个字段名；仅按 option id 查找 | groupId + optionId 复合身份；通用选择上下限及兼容校验；不允许跨槽拖入 |
| 推荐数据/引擎 | recommended 使用 Robot category union；更新固定字段；只检查整机兼容 | 通用 group→IDs；忽略不存在的组，完整候选统一验证；部分推荐不覆盖未指定组 |
| RecommendedBuild | RobotConfiguration、getInitialConfiguration、固定 categoryLabels | 接收 schema/state/group labels，保留折叠、逐项添加与一键应用 |
| scene/scope | CustomizeScene/Scope 的 Robot union；perception→vision | Schema scene 元数据 + scopeAliases；不存在 scope 回退首组；Robot 旧 URL 别名保留 |
| lib/workbench.ts | compatibleWith 默认指 baseRobotId | 旧机器人兼容描述转换为通用 requires/requiresGroup/incompatibleWith 等规则，不制造兼容事实 |
| lib/configurator.ts | Robot 旧中文字段迁移、固定价格行 | 保留旧解析入口与适配器，新的 UI/引擎不读 Robot 字段 |
| lib/cart.ts / Cart / Checkout | one-g-config 单一 Robot 保存；保存即进入购物车；展示实时查商品 | 版本化 schema 命名空间；旧记录可读且保留；配置购物车保存独立显示/价格/摘要快照，页面与结算读取同一快照 |
| lib/assembly.ts | 旧展示 bindings 和 Robot DTO | 保留旧展示适配接口，不作为通用工作台依赖 |
| RobotConfigurationWorkbench | 路由适配层指定 Robot 组件 | 通用 ConfiguratorClient 按 schemaId 查询 registry；路由只给 robot ID |
| 首页 preview | 硬编码 no-arm/no-hand 过滤、前两项、默认五字段 | 同一 ConfigurationWorkbench 的 preview 模式，schema 选项 omission 标记；不读写持久化 |

原始行为基线：默认 g1 + standard-arm + five-finger = ¥97,800，进度 3/5；仅选择 base 也可保存；显式不安装值仍保存且零元，但不计 installed 进度。兼容矩阵未定，缺少 compatibleWith 并非已验证兼容。普通商品和配置选项存在 Mock 价格差异，不能借抽象改价。

测试重点：非五组临时测试 schema、重复 option ID 不同 group、单/多选上下限、依赖/排斥、部分推荐、未知价格、未知 scope、旧 ID/中文存储迁移、损坏/未来版本记录、删除后不复活、存储失败、快照在目录变化后仍展示；Robot 四条 URL、推荐与拖拽、三栏/移动和 STEP 4 路由兼容。
