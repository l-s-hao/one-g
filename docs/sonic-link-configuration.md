# STEP 9 — SONIC Link 配置预览

## 实现前 Schema 设计草案

事实源：STEP 8 的 `src/data/products/sonic-link.ts`、产品详情，以及 `docs/reference-sonic-link.md`。参考 commit 为 `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`。产品状态仍为 coming-soon，价格未定、未开放下单，三点与全身技术已有。

| Group 候选 / 最终 ID | 内容 | selectionMode | required | 数量 |
| --- | --- | --- | --- | --- |
| TELEOP PACKAGE / bundle | 三点、全身、双模式套餐；软件与硬件固定配套 | single | true | 1 |
| OPTIONAL ADD-ON / add-on | 智元夹爪，可取消 | multiple | false | 0..1 |

默认 three，夹爪不选；切换套餐保留夹爪。套餐从 Product.detail.bundles 映射，固定头显/手柄/脚环/软件/小背包只进入 Includes，不拆成可独立购买的硬件组。夹爪采用 Product 通用 addOns 内容结构，提取 STEP 8 已确认的文字供页面与 Schema 共用，不新增产品事实或虚构 SKU。

展示而非配置：两张动作/抓取实拍、历史软件截图、连接检查/校准/启动能力、升级路径、适配目标和运行要求。GEM 不属于产品。没有目标机器人选择流程；宇树 G1 是适配目标，不把主站 Mock ONE-G G1 绑定为同款机器人。无独立控制设备自由选择流程，不新增 TARGET PLATFORM / DEVICE KIT / CAPABILITY 组。

价格：所有已选选项 undefined；总价显示价格待定，部分未知沿用通用部分价格待确认规则；未选可选项显示未选择，避免把空组的内部零成本误认成夹爪免费。

Recommendation：没有真实推荐数据，不开启，不添加 handling/inspection 场景。Compatibility：源码允许全部三套餐搭配或不搭配夹爪，无额外互斥矩阵；套餐内部已固定匹配，不编造规则。设备型号、G1 EDU 权限、G1+ 等仍待确认。

Cart：非 active，配置预览可保存、可通过 site-contact 获取报价，不生成快照或 Cart Item。使用 version=2、schemaId=sonic-link、selections，key=one-g-config:sonic-link，无旧数据迁移。

Progress：required 模式，只计算 bundle；选一个套餐即 1/1、100%、Ready，夹爪为空仍 Ready；清空套餐不可保存。两个 full 插槽，复用少组紧凑布局与统一移动三 Tab。

入口：产品 CTA 配置预览，/configure 显示即将开放 · 配置预览；状态取 Product。统一工作台标题 SONIC LINK CONFIGURATION PREVIEW。

必要通用扩展：Schema 声明 querySelections（参数到组的映射）以支持 bundle 预选，无产品 ID 判断。显式 bundle 参数优先于保存记录，非法/空值回退 Schema 默认，且不会从旧保存记录自动加夹爪；无 bundle 参数恢复保存记录，无记录用默认。URL 只初始化，之后可修改，不锁定。scope 使用现有 group.id。客服按钮支持 label 以复用获取报价文案。

草案先于业务代码落盘；下文将在实现与验收后补充结果。

## 实现结果

- Schema 路径：`src/data/configuration/schemas/sonic-link.ts`，id=sonic-link，Registry 与 robot/robotdock 共用。页面仅提供 metadata 和 ConfiguratorClient(schemaId)。Auth 由现有 SiteShell/RequireRole 承担，普通五主题和两种辅助主题使用原 ThemeProvider。
- 两组与草案相同；清单由 Product.detail.bundles/addOns 派生，包括数量/模式范围。不单独绑定主站 G1/RobotDock 商品作为套餐部件 SKU，避免把未确认交付关系变成商品兼容承诺。
- Product.status 保持 coming-soon；通用 policy 据关联 Product 禁止 Cart，页面状态与摘要状态直接读取 Product。未知价格显示价格待定，单项获取报价，空夹爪组未选择；现有部分未知规则继续有效。
- Recipe/Recommendation/Scene 均未添加。三档 × 夹爪开关共六种合法预览组合，不存在经证实的额外 CompatibilityRule。兼容性未确认提示保留，未知不等于正式适配承诺。
- Progress 仅 bundle，1/1、100% 即完成；清空 bundle 后 0%，保存禁用；add-on 不影响 required 分母。Configuration Ready 是选择完整，不代表可购买。
- 产品页新增配置预览 CTA；配置中心三个入口存在，SONIC 显示即将开放 · 配置预览。标题 SONIC LINK CONFIGURATION PREVIEW，中文 SONIC Link 配置预览；metadata 来源产品状态。
- 右栏与移动操作区使用获取报价（电话/邮箱），复用 SupportButton/site-contact；没有提交数据或报价后台。

### URL 与本地存储

`?bundle=three|full|dual` 从 Schema 默认建立新预览并预选套餐；空值/非法值回退 three。显式 bundle 链接不会带入保存记录中的夹爪，也不识别 `gripper=true` 为选配授权。进入之后切换套餐/夹爪自由，切换套餐保留当前夹爪。

没有 bundle 参数时恢复 `one-g-config:sonic-link`；没有记录时默认 three、无夹爪。显式选择入口不自动写存储，按保存后才覆盖 SONIC 自己的记录。`?scope=add-on` 或 `?scope=bundle` 使用通用组定位，未知 scope 回首组；无 handling/inspection 推荐逻辑。没有旧 SONIC 格式迁移。

```json
{"version":2,"schemaId":"sonic-link","selections":{"bundle":["dual"],"add-on":["gripper"]}}
```

不包含 snapshot；保存不改 one-g-config:robot、one-g-config:robotdock、one-g-cart。

### 通用工作台调整

querySelections / initialSelections、contactLabel、关联 Product 状态、空可选项价格标签、multiple 上限提示、required 模式 Ready 校验、少组桌面自然高度。没有 SONIC Workbench/Configurator/ModuleLibrary/Summary；源码无 schema.id === "sonic-link" 判断。中央两个 full 插槽，只放当前选择，没有产品图或 Showcase。

### 当前三产品架构边界

目前三个真实产品已共用同一工作台。Robot 的 SKU/价格/兼容矩阵仍有 Mock 数据；RobotDock/SONIC 尚无正式报价和交付确认。Cart 仍按已有行为消费一份 Robot 配置快照，预览产品不进 Cart；若未来开放多个 active Schema 同时购物，需要先扩展快照聚合入口并明确服务端报价校验。SONIC 当前的状态是交易拦截依据，将来改为 active 前必须一起审核价格、选项状态、软件授权、交期和 Cart 接入；不能只改 status 开售。认证与存储仍是既有浏览器 Mock，不涉及数据库或真实交易。

## 最终验收（2026-09-17）

- 15 项 `node tests/configuration.test.mjs` PASS：包含三套餐 × 夹爪开关、清单来源一致、必选/可选/进度、未知与部分未知价格、预选合法/非法/原型属性值、Schema 通用映射、三产品存储隔离与无预览快照。
- `tests/sonic-configuration.browser.cjs` PASS：登录回跳、六组合切换、保存刷新、显式 query 优先及空/非法回退、scope 定位、无推荐、报价电话邮箱、七种主题、1280×720/1440×1000 中栏无裁切、375/390 三 Tab、三个入口、两个产品 CTA、ADMIN 角色隔离、零页面/资源错误。
- Robot 回归 PASS：默认 ¥97,800 / 60%；handling/arm、inspection/perception、teleoperation/capability 推荐分别 ¥113,800 / ¥110,800 / ¥126,800，100% 进度，加入购物车成功，SONIC 保存不覆盖 Robot Cart 快照。
- RobotDock 回归 PASS：四档单选、Includes、概念状态、未知价格、保存刷新和无 snapshot；Robot/Dock Schema 与存储文件哈希与阶段初始一致。
- `tests/sonic-link.browser.cjs` PASS：商品中心分类、全部十个产品详情、产品页 Auth/metadata、七种主题与图片、Mobile、两个已有工作台；更新了 STEP 8 的“无配置 CTA”断言以符合 STEP 9。
- lint PASS，0 errors，保留 DriftWall/ScrollExpand 两个既有 no-img-element warnings。
- build PASS，30 个静态页面，包含 out/configure/sonic-link/index.html；canonical 和 /one-g/ basePath 正确。沙箱内 TypeScript 子进程输出解析失败，沙箱外正式构建通过。
- `git diff --check` PASS。两个参考仓库 porcelain 为空，HEAD 与全部审计哈希未改：SONIC `d6f8b26b1cdc3f56f6b6e4091342a56228527b9c`；RobotDock `218a8b7e4ad82c21a5a19dc19a1a2bce1daf366f`。

仅完成 STEP 9，无数据库、无参考仓库修改、无 commit/push/部署。
