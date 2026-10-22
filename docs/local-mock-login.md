# 本地注册与登录测试说明

当前流程以 [注册登录报告](registration-auth-review.md) 和 [接口契约](registration-auth-contract.md) 为准。它替代此前普通用户只填白名单账号即可登录的界面；底层 `auth/mock-login.ts` 仍供既有开发测试工具使用，不能当作正式认证或注册系统。当前普通表单只走密码或经人机验证后的验证码验证，不调用快捷适配器。

```sh
NEXT_PUBLIC_ONE_G_MOCK_AUTH=1 npm run dev
```

需要 development/test 且显式 Mock 开关；生产即使有开关也不会开启。开发快捷适配器另外只允许 development，且只认原精确白名单 USER。

| 原普通测试身份 | 已验证手机号 | 邮箱别名 | 固定 ID |
| --- | --- | --- | --- |
| A | 19900000001 | demo-a@example.test | user-demo |
| B | 19900000002 | demo-b@example.test | user-demo-b |

原测试密码和稳定 ID 保留。旧夹具明文已替换为带盐 PBKDF2 派生校验值；不在公开页面展示管理员测试凭据。

验证码测试先点击“模拟人机验证（仅开发）”，再发送；固定虚构测试码 `004271`，5 分钟有效，60 秒重发。人机凭据单次使用，每次重发重新取得。只有原已验证手机号可以使用手机渠道。新注册时填写的电话没有短信验证，不能登录或找回密码。

注册仅填虚构 `.test` 邮箱、测试密码和测试资料；创建后回登录页，不自动登录。同一页面运行期间可通过 Next 站内链接测试密码与验证码登录；刷新、完整文档导航、关页会丢失内存账号，原夹具不受影响。请不要用真实资料或密码。海外表单没有手机号或微信登录入口，语言切换不改变地区。

管理员仍使用既有密码验证和数据源，旧 `/admin/login` 进入统一卡片管理员模式。普通用户不能因选择该入口而提权。微信和实名均未开通，不生成二维码、证件字段或成功身份。

当前回归：`tests/registration-auth.test.mjs`、更新后的 `tests/auth-payment.test.mjs`、`tests/mock-login.test.mjs`、`tests/configuration.test.mjs`、`tests/i18n-dictionary.test.cjs`、`tests/registration-flow.browser.cjs`。旧登录卡片和更早浏览器脚本为历史界面验收，本轮不沿用其“通过”结论。
