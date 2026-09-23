# 客服需求前端预览

当前不发送邮件、不提交客服接口、不写数据库。没有客服电话号码、公司收件邮箱、mailto 链接或虚构成功状态。测试请使用虚构资料。

- `SupportButton` 统一入口；About、解决方案、深度定制、账户和 Footer 复用。组件的浮动形态也使用相同行为，未额外新增全局浮动按钮。
- `ContactProvider` 在现有 SiteShell 中提供共享动作与唯一窗口；认证来自原 AuthProvider。等待 authReady，匿名点击调用原 loginDestination，登录成功沿用 safeReturnTo 返回原页面。
- `openContact` 只接受预定义入口名；即使 URL 有标记，也必须核对当前用户才能打开。消费标记时只移除 openContact，保留购买产品、套餐、数量、支付方式等原查询参数。Next 路由负责 /one-g 前缀。
- `ContactPreview` 使用一个原生 dialog；编辑和只读预览在同窗切换，支持键盘焦点、Escape 和关闭后返回入口。联系方式预填不修改账户资料。
- `contact-preview.ts` 仅含来源枚举及前端校验。字段为称呼、回复邮箱、公司／单位、需求描述。
- 草稿只存在当前窗口的 React state 中。关闭、变更身份或离开页面销毁窗口；不重挂载登录页，不写 localStorage、URL、日志或统计事件。
- 未改变主题初始化、护眼开放规则、账户和管理员页面的路由保护。

浏览器验收：`tests/contact-preview.browser.cjs`，使用现有明确开启的本地 Mock 登录；并非正式认证或客服联调。
