# ONE-G 数据库规划草案

当前产品和业务规则尚未最终确定，数据库结构暂不冻结。
本文仅规划 Phase 2 的 PostgreSQL 数据模型；Phase 1 未安装数据库、ORM，也没有创建表或迁移文件。

## 通用实体

| 实体 | 候选表名 | 职责 / 关系 |
| --- | --- | --- |
| Product | products | 稳定 ID、唯一 slug、名称、状态、可空价格；属于分类 |
| Category | categories | 分类标识、名称、顺序 |
| ProductImage | product_images | 关联产品，保存图片地址、替代文字、顺序 |
| Configuration | configurations | 关联可选用户与基础产品、配置状态和报价状态 |
| ConfigurationItem | configuration_items | 关联配置与选项，记录类别、数量；选项实体结构待定 |
| User | users | 账号主体；认证方式与角色待定 |
| Cart | carts | 关联用户或匿名会话，匿名合并规则待定 |
| CartItem | cart_items | 关联购物车与产品或配置、数量 |
| Order | orders | 关联用户、状态、货币和经服务端确认的合计 |
| OrderItem | order_items | 关联订单，保留购买时名称、价格和配置快照 |

产品选项、功能能力和兼容规则可在规则确认后引入通用选项及关系表。
不要以当前 Mock 的中文字段或数组顺序作为数据库主键。
price 允许 NULL，NULL 表示未定价，0 表示明确零元。正式金额采用精确 decimal 或最小货币单位整数。
配置、购物车与订单的价格生命周期不同：前两者重新报价，订单保存已确认快照。
用户敏感信息、地址、保留期限、权限、删除规则及索引在业务确定后设计。

## 不按具体型号建表

错误方式：`G1Table`、`G1ProTable`、`ArmA1Table`、`HandD1Table`。

正确方向：`products`、`categories`、`configurations`、`configuration_items`、`orders`、`order_items`。
G1、G1 Pro、机械臂、灵巧手都是通用表里的记录，不是独立数据表。
新增产品应添加记录，不应要求改数据库表结构或重写 UI。

数据库实施前须满足 [后端规划](./backend-plan.md) 中的八项 Phase 2 条件。
