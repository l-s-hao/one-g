# ONE-G 独立购买页改版

## 范围与入口

仅修改 `/home/lsh/ONE`（l-s-hao/one-g）；保留执行前未提交改动，执行前 tracked diff 记录于 `/tmp/one-g-before-buy.patch`。未操作参考仓库，未接数据库、安装依赖、提交或推送。

- RobotDock：`/buy/robotdock/`，部署路径 `/one-g/buy/robotdock/`。
- SONIC Link：`/buy/sonic-link/`，部署路径 `/one-g/buy/sonic-link/`。
- 首页仍为 RobotDock、SONIC Link 两个普通文档流区块及 Footer，无轮播。
- Header 共用导航数据移除「配置」及其下拉；桌面和手机均保留解决方案、商品中心、了解公司。
- 首页、介绍首屏、介绍末尾、规格页和产品局部导航的选购入口统一「购买」，按产品直达上述路径；介绍和规格正文不变。
- Footer 仅调整旧泛化套餐入口为首页「产品选购」，增加真实购买页路径标题；没有修改分组和样式。
- 其它泛化旧购买链接仅改目标到首页；没有改解决方案、深度定制或普通商品事实数据。

## 参考页实际查看

用 Chromium 在 1440px、390px 实际打开 [Apple 参考购买页](https://www.apple.com.cn/shop/buy-iphone/iphone-18-pro)，均返回 HTTP 200。截图位于 `/tmp/apple-buy-1440.png`、`/tmp/apple-buy-390.png`。

观察到桌面大产品图与右侧纵向选项、手机纵向重排、边框选项、下方产品比较区域。只借鉴图片与选项的组织方式。初始状态中部分后续选项禁用；没有完成 Apple 的全部选购步骤或进入结算，因此没有验证其最终支付方式选择、结算或个性化推荐，不把这些视为已确认参考行为。没有使用 Apple 素材、文案或商业服务。

## 组件和数据

- `src/app/buy/[id]/page.tsx`：用现有 offering 数据生成两条静态购买路由和 metadata。
- `src/components/ProductPurchase.tsx` 与 `.module.css`：一套共享购买页，原比例图片、套餐原生单选、支付配置空状态、当前选择及禁用购物车操作、推荐空状态。桌面图片 sticky 仅限购买区域，手机正常纵向流。
- 套餐直接来自 `getOfferingPackages()` → `Product.detail.bundles`，没有复制文案或建立配置引擎。
- RobotDock 数据：`src/data/products/robotdock.ts`，四个套餐 base / hand / gripper / gripper-camera。
- SONIC Link 数据：`src/data/products/sonic-link.ts`，三个套餐 three / full / dual。
- 图片、图片说明、概念/预览状态、包含内容仍取原产品数据。当前没有套餐专属图片，选套餐后继续显示对应产品原图。
- 套餐数据没有价格字段，两产品也没有确认价格：全部显示「价格待确认」，无 0 元或推算金额。
- 项目没有支付方式配置：显示「支付方式待配置」，没有编造支付选项或接入网关。
- `src/data/recommendations.ts` 是旧配置器的演示场景/模块推荐，不是这两产品的商品推荐关系，不用于新购买页。显示「暂无已确认的推荐商品」。

## 状态、旧链接与登录

- 套餐选择只保存 `?package=<已知 ID>`，产品由当前路径确定；刷新及前进后退恢复。不保存价格、密码或支付信息。
- `canonicalConfigurationHref` 对 `/configure`、旧产品配置路径和 `/customize` 做静态导出兼容；支持产品路径、product / productId 或产品 hash，以及 package / packageId / bundle / bundleId。只保留属于该产品的合法套餐 ID，丢弃旧价格和未知参数。
- `/configure#robotdock` → `/buy/robotdock/`；`/configure?bundle=full#sonic-link` → `/buy/sonic-link/?package=full`；明确产品旧路径同理。
- 无法识别产品的 `/configure`、`/configure/robot`、`/customize` 等返回首页。所有旧页面仍导出，使用客户端 replace，无循环。
- 旧首页产品介绍 hash 仍进入对应介绍页，不改成购买页。
- 购买页公开，选套餐不触发登录。产品均处于预览且价格、支付未配置，加入购物车保持禁用，没有新订单或扣款。
- 用现有演示账号实际登录并带安全的购买页 returnTo，返回后套餐恢复，购物车没有被写入。普通商品原有「点击加购才登录，回来再次点击」流程回归通过。
- 限制：当前没有可售套餐或支付选项，不能验证实际套餐加购及支付 ID 恢复，也没有宣称这些交易能力已接通。未来开放交易仍需要确认套餐价格、支付配置及套餐购物车数据适配；本次没有提前建设这些业务。

## 验证

- `npm run lint`：通过，0 error；保留已有 `ScrollExpand.tsx:244` 原生 img 提示 1 项。
- 无 typecheck script；执行 `npx tsc --noEmit`：通过。
- `npm run build`：通过，36 个静态页面，包括两条新购买页。首次受限沙箱构建无法解析 TypeScript 子进程输出，获准在沙箱外重试后通过。
- `node --test tests/configuration.test.mjs`：通过，包含更新后的旧路由、合法套餐参数和安全 returnTo 检查。
- `tests/buy-pages.browser.cjs`：40 项记录通过。静态导出服务器实际检查两产品 × 375 / 390 / 768 / 1440 / 1920px × 三种主题，套餐单选/键盘/刷新、页面无横向溢出、预览交易禁用、旧 URL、历史导航、登录返回恢复及购买链接。
- `tests/home-showcase.browser.cjs`：通过，三种主题 × 四种宽度；上下两区块、原比例图片、按钮可聚焦、手机原生滚动、Footer 顺序均正确。
- `tests/product-pages.browser.cjs`：通过，介绍/规格/浮条、五种宽度、三种主题、普通商品加购登录规则回归，无浏览器错误。

截图与机器记录：

- [RobotDock 桌面](/tmp/one-g-buy-check/robotdock-caribbean-calcite-1440.png)
- [SONIC Link 手机](/tmp/one-g-buy-check/sonic-link-night-390.png)
- [色觉友好模式](/tmp/one-g-buy-check/robotdock-color-vision-safe-1440.png)
- [购买页全部检查记录](/tmp/one-g-buy-check/results.json)
- 首页截图及记录：`/tmp/one-g-home-showcase/`。
- 介绍和规格回归：`/tmp/one-g-product-review/`。
- `tests/home-navigation.browser.cjs`：通过；六种宽度、三个主题、Header 悬停/键盘/手机菜单、Footer 分类与解决方案目标、公开页面与权限回归。Header、Footer、首页 CTA 对比度检查通过。记录：`/tmp/one-g-navigation-review/results.json`。
- 本地 `npm run dev` 已恢复：`http://localhost:3000/one-g/`，购买页 HTTP 200。启动 dev 与补充类型检查同时运行时，曾遇到 `.next/dev/types` 重生成的短暂文件缺失；等待服务就绪后重新运行类型检查通过。
