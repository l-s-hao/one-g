# STEP 10 配置系统整合审计

## 范围与基线

仅 ONE-G；参考仓库只读。审计 src 全文与配置测试，检查 schema.id/schemaId 比较、三产品名、三个 Schema、Customize/定制、旧路由、any、配置数据/存储/Cart、组件与 CSS 引用。

## A 合理 Schema 数据差异

Robot 五组、场景/范围/推荐、安装组加权进度；RobotDock 单个必选套餐组；SONIC 必选套餐+可选夹爪、query 预选。single/multiple、required/min/max、slotLayout、includes、未知价格、推荐与兼容规则已由通用类型表达，无需新增产品模式或微观 CSS 开关。

## B 合理产品状态差异

Robot 选项 active（Mock）；RobotDock concept；SONIC coming-soon。预览可选择/保存但不可购物。RobotDock 明确 purchaseMode=preview 是额外业务限制，不能绕过 Product.status。价格未知和可购买性是独立维度，不能将未知价格置零。

## C 不应存在的 Workbench 产品特例

审计前 ConfigurationWorkbench/RecommendedBuild 中具体产品 ID 分支 **0**，产品名分支 **0**，isRobotDock/isSonicLink Props **0**。无需虚构“清除了产品特例”的成果。存在的是可统一的策略与 UX：Product 页面手写配置 URL，中心手写 Robot 卡，状态与保存按钮散落判断，Ready 与安装完成度混用。

## D 重复实现与清理点

没有第二套 ModuleLibrary/CurrentBuild/Summary/Progress/Mobile 配置器。Product.configurationHref 与 Registry 重复维护关系；普通详情页对所有配件也硬编码整机配置 CTA。lib/configurator 的旧 rows/total/initial/selectedIds/steps 导出没有调用，保留会与通用 engine 双轨。统一关系 resolver、购买资格与动作策略，删除无引用导出。

## E Legacy 命名与代码

CustomizeWorkbench 仅首页薄包装（仍有引用，不是第二套 UI）；data/customize-entry 与两个 customize 路径 CSS 实际服务正式配置页面，可安全重命名/移动并更新全部引用。不存在 CustomizeClient/useCustomize、旧产品专用工作台或 barrel index 导出。新增配置代码无显式 any；全文 any 的命中为注释或 favicon sizes="any"，不做无关改动。

## F 必须保留的兼容层

- app/customize 与 app/customize/start：旧 URL 静态跳转，保留 query/hash；函数名保留 Customize 以明确兼容入口。
- configuration-routing：旧 URL 和 returnTo 规范化，仅此处保留 /customize 字面量。
- RobotConfiguration/RobotConfigurationOption、adapters、lib/configurator 的名称解析/选项查询：原 one-g-config 迁移与 assembly 仍使用；只读旧 key，不主动写旧 key。
- storage 中 schema.id !== "robot"（只为 Robot 迁移）、schema.id === "robot"（删除旧 key 防复活）两处分支合理，不能给另两产品虚构历史数据。
- Cart 目前只消费一份 Robot 配置快照：与既有业务一致，预览商品不能加入。多配置购物车聚合留未来销售阶段，不能借清理扩功能。

## 决策

保持三个静态路由、既有布局/主题/首页视觉。配置中心和 Product CTA 由 Registry + Product 派生；状态 Badge 复用现有 CatalogStatus（没有 preview enum，不新增）。保留 Robot 安装完成度历史定义，同时所有 Ready 使用 required/optional/兼容校验。无效选择保留并提示修复，不静默移除。快照继续保留历史 price（即价格快照），补充可选 productId，兼容旧 version=2，无价格重算。

## 完成状态

A/B/F 保留合理数据、状态与兼容差异；C 原为 0、清除 0、仍为 0；D 重复关系/旧计价导出与桌面移动动作已收敛；E 四文件改名/移动、旧 Customize 业务符号重命名。保留项与理由、回归证据见 [step10-integration-cleanup.md](./step10-integration-cleanup.md)。没有为达到删除数量指标移除有效组件或样式。
