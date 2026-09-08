# ONE-G 后端接入规划（Phase 1）

当前是前端原型 + Mock 数据阶段。没有正式账号、订单、库存或支付服务；不连接数据库。
所有产品、价格与配置均为临时数据，不代表最终报价或承诺。

## 当前数据边界

- `src/types/product.ts`：Product、Category、状态及可选数值价格。
- `src/types/configuration.ts`：使用稳定 ID 的配置与配置选项。
- `src/data/products.ts`、`src/data/configurator.ts`：唯一 Mock 内容来源。
- `src/lib/products.ts`：商品查询；公开列表排除 draft，coming-soon 可展示。
- `src/lib/configurator.ts`：选项查询、步骤、配置解析与模拟计价。
- `src/lib/pricing.ts`：空价格显示“获取报价”；合计中任何未定价项使整单需要报价，零元与未定价不同。
- `src/lib/cart.ts`：浏览器 localStorage 适配器，仅保存商品 ID、数量和配置 ID；显示名称、价格重新从数据层解析。

基础机器人配置直接映射 Product，避免定制器与商品中心重复维护型号或不同价格。
原来以中文名称存储的配置与包含商品价格快照的购物车仍可读取；旧数据价格不再参与计算。
格式错误、未知 ID 和非法数量会被过滤。配置保存仍沿用原型行为：保存的方案在购物车中展示。
兼容规则仅预留 `compatibleWith`，目前没有确认的兼容矩阵，不虚构规则。

## 未来接口草案（未实现）

| 接口 | 用途 |
| --- | --- |
| GET /api/products | 商品列表，category/status/filter/pagination |
| GET /api/products/:slug | 商品详情，稳定 slug；不存在返回 404 |
| GET /api/categories | 分类与展示顺序 |
| GET /api/configurator/options | 配置步骤、选项、兼容关系 |
| POST /api/configurations | 保存配置；后端校验选项和兼容关系，重新计价 |
| GET /api/cart | 登录用户购物车；匿名合并策略待确定 |
| POST /api/orders | 根据服务端报价和流程创建订单，预留幂等键 |

返回 DTO 沿用 types，价格以 CNY 数字表示；API null 由适配器转为 undefined。
正式存储时采用最小货币单位整数或精确 decimal，不以格式化字符串计算金额。
配置/下单请求只传 ID、数量等意图，不信任浏览器传入金额。错误契约建议包含 code/message/fieldErrors。
鉴权、授权、限流、幂等及库存规则在 Phase 2 明确。

## 迁移路径

React / Next.js → 数据访问层（当前 Mock）→ 未来 Backend API → PostgreSQL。

当前仓库查询为同步内存函数。接 API 时将 I/O 接口转为 Promise，并在页面加载边界增加
loading/error 状态：服务端页面 await，客户端列表通过数据 hook 加载后把 Product[] 传给展示组件。
配置价格计算等纯函数继续保留；localStorage 适配器替换为 API 购物车适配器。
展示组件继续使用同一 Product/RobotConfiguration，不重做页面布局。

当前 `output: export` 与 GitHub Pages 不运行 Next.js 服务端 API。Phase 2 必须选用独立后端，
或迁移到支持服务端 Next.js 的部署平台；静态商品详情新增 slug 目前需要重新构建。

## Phase 2 开始条件

1. 产品分类基本确定。
2. 定制步骤基本确定。
3. 产品与部件兼容关系基本确定。
4. 是否显示价格基本确定。
5. 直接购买还是询价基本确定。
6. 用户账号需求基本确定。
7. 购物车需求基本确定。
8. 订单流程基本确定。

在此之前不安装 PostgreSQL、Prisma、Supabase、MySQL，不实现正式订单、支付或库存。
