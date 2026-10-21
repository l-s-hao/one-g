# 素材与内容整合验收（2026-10-21）

目标基线：`0bae3782cb7a0614e071fc5a2022b002256f7f5e`，开始时无未提交修改。未提交或推送。

## 命令与结果

| 检查 | 实际结果 |
| --- | --- |
| `npm run lint` | 通过 |
| `npx tsc --noEmit` | 通过；项目没有独立 typecheck 脚本 |
| `npm run build` | 最终通过；38 个静态页面生成；输出保留 `/one-g/` 部署前缀 |
| `node --test tests/media-integration.test.mjs tests/i18n-dictionary.test.cjs tests/auth-payment.test.mjs tests/mock-login.test.mjs` | 4 个测试文件通过；媒体来源/哈希/分类、词典、认证/支付边界回归通过 |
| `git diff --check` | 通过 |
| 四个参考工作区 | 结束时均 clean，HEAD 与来源清单一致 |
| 受保护实现文件比对 | 首页、Header/HeaderImageMenu、ThemeProvider/ThemeToggle、ProductPurchase、About、auth-client、payments、部署配置和依赖清单与基线逐字节相同 |

中途遇到一次受限环境的 TypeScript `--showConfig` 输出解析失败；直接 `tsc --showConfig` 正常，沙箱外重跑现有 build 成功，没有通过关闭类型检查或修改构建配置绕过。词典测试最初发现两个既有日夜切换标签缺英文，已仅在词典补齐。浏览器测试初稿的绝对页面高度、同页 hash 的响应、包含支付方式的全页 radio 数量以及桌面/隐藏移动菜单重复定位预设已修正；这些不是网站行为变更。最终结果见下列 JSON。

## 浏览器实测

Chromium 153.0.8010.12，无头浏览器，测试对象为 `out/` 的本机静态服务器：`http://127.0.0.1:3001/one-g`。没有运行参考站 JavaScript。

- 4 个页面：解决方案总页、遥操作详情、RoboDock 介绍、RoboDock 技术规格。
- 390 / 1440 px × 中文 / 英文 × light / dark，共 32 组通过。页面图片实际 decode 成功，无横向溢出，无新增中文漏译或页面运行异常；所有组合播放前 MP4 请求为 0。
- 6 段网页视频实际从开始播放到 ended（4 倍速），记录时长、解码宽高、controls、音量和 readyState。属于浏览器完整播放验证，不是人工实时视听审查。9 个源视频的视觉审核方法为全时长解码、0.5 秒间隔画面序列检查，限度见来源报告。
- 视频原生控件启用、音量可调整、不自动播放/循环；启动第二段暂停第一段；关闭展开区卸载播放器。
- 模拟 MP4 404 显示明确文字、来源与重试；解除失败后重试可播放。测试期间没有修改发布资源为失效地址。
- 四张总页卡片初始无视频挂载，详情与展开区按需呈现视频。巡检没有新增视频。
- 实测首页、商品、购买预览、登录、购物车、结算路由；RoboDock 四档套餐与禁用加购保留，未新增 SONIC Link 商品/方案购买入口。
- 实测图片导航菜单、分类、Escape、遥操作详情跳转、商品筛选过渡与恢复、主题切换及刷新保持、咨询登录守卫和安全 returnTo。
- 未测试真实手机硬件、Safari/Firefox、真实登录/支付/设备控制；没有把这些写为通过。静态站保持这些业务边界。

[32 组与完整播放 JSON](./browser-results.json) · [资源哈希/解码/外部与缺失路径检查](./asset-checks.json) · [导航/主题/商品/咨询回归](./regression-results.json)

浏览器测试保存在 `tests/media-integration.browser.cjs`。本次使用独立 `/tmp/one-media-audit/tooling/node_modules` 下的 playwright-core，通过 `NODE_PATH` 引用，并用 `ONE_G_BROWSER` 指定已安装的 Chromium；没有新增项目依赖。可通过 `ONE_G_TEST_URL`、`ONE_G_ARTIFACTS` 切换测试地址和输出路径。

## 实际截图

保留 11 张代表性截图，32 组均有 JSON 记录；没有将所有重复截图纳入仓库。

| 页面 | 桌面中文日间 | 手机英文夜间 |
| --- | --- | --- |
| 总页 | [截图](./solutions-1440-zh-CN-light.png) | [截图](./solutions-390-en-dark.png) |
| 遥操作 | [截图](./solutions-teleoperation-1440-zh-CN-light.png) | [截图](./solutions-teleoperation-390-en-dark.png) |
| RoboDock 介绍 | [截图](./products-robotdock-1440-zh-CN-light.png) | [截图](./products-robotdock-390-en-dark.png) |
| RoboDock 规格 | [截图](./products-robotdock-specs-1440-zh-CN-light.png) | [截图](./products-robotdock-specs-390-en-dark.png) |

[智能任务展开（桌面）](./intelligent-expanded-desktop.png) · [手机展开](./intelligent-expanded-mobile.png) · [视频失败回退](./media-failure-mobile.png)

图片比例与概念/安装说明保留；已实际查看桌面遥操作、手机英文夜间 RoboDock、展开区与失败回退截图。其它组合以自动布局、解码、文字及运行检查为依据，不冒充逐张人工视觉验收。
