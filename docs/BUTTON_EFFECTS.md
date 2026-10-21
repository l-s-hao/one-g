# 页面 CTA 反色效果

2026-10-21。只修改 ONE-G 主仓库，不提交或推送，不写参考仓库。改前状态、二进制 diff 与文件哈希保存在 /tmp/one-invert-audit/before.status、before.patch、files-before.json。开始时已有素材整合修改和未跟踪文件，本次完整保留。

## 实际环境

| 项目 | 实际证据 | 结论 |
| --- | --- | --- |
| shadcn/ui | components.json：new-york、rsc/tsx、CSS variables、ui/utils aliases、Magic UI / React Bits registries；ui 目录有 animated-theme-toggler、layout-grid、shimmer-button | CLI 的项目级配置与兼容目录组织已存在；没有标准 shadcn Button/ButtonLink，也没有 shadcn 包或本地 CLI 可执行文件。未运行 CLI，不能称为安装了整套 shadcn/ui |
| Tailwind | package.json 声明 tailwindcss、@tailwindcss/postcss 为 ^4；package-lock.json 和实际安装均为 4.3.3 | 已用 v4；没有 tailwind.config.js 不构成缺失 |
| CSS / 构建 | globals.css 以 @import "tailwindcss" 开始；postcss.config.mjs 使用 @tailwindcss/postcss；Next 16.3.4、Webpack、静态导出、/one-g 前缀；无 Vite 配置 | 沿用 CSS Modules 和全局共享 CSS，不改 Reset、配置或构建系统 |
| TypeScript | 声明 ^5，锁文件/安装均为 5.9.3；tsconfig strict、noEmit、bundler、Next 插件和 @/* aliases | 已启用；无独立 typecheck 脚本，使用 npx tsc --noEmit；沿用已有 lint/build |

本次在现有 LButton、LocalizedLink、LA 上增加明确的 effect="invert" 外观，使用普通 CSS 等价实现。没有技术栈迁移、CLI 安装、依赖安装或配置重建。

## registry 实际读取与提取

来源：[Aceternity registry](https://ui.aceternity.com/registry/tailwindcss-buttons-demo.json)。浏览工具首次打开失败，随后 curl -fL 下载成功，JSON 实际解析成功。

- name 为 tailwindcss-buttons-demo，类型 registry:component；实际文件为 components/tailwindcss-buttons-demo.tsx。
- 导出 default TailwindcssButtons 与 buttons 数组。完整 Demo 导入 React、react-element-to-jsx-string、sonner 的 toast/Toaster，以及 ButtonsCard；JSON 没有 dependencies/registryDependencies 声明。
- 实际找到 name="Invert"、文字“Invert it”的条目，class 与用户提供的完整示例一致。
- 只学习默认填充、hover 表面/文字/强调边框、200ms 过渡；不复制 padding、圆角、字重或 teal 色。不复制展示墙、代码复制、其它例子或 Shimmer，不安装 Demo 依赖。
- 原响应 12,079 B，SHA-256：13dc7002547caf46dfe549f24e8d78a1efca702e2f443a1285cab0024d690206。原件在 /tmp/one-invert-audit/registry.json；[结构与出处记录](./reviews/invert-buttons/source.json)。没有安装 registry 组件。

## 按钮范围

| 分类 | 调用位置 / 操作 | 决定 |
| --- | --- | --- |
| 必须替换 | HomeCollageHero 两个入口；ProductDetailContent 购买；ProductPurchase 禁用加购；AddToCartButton；购物车结算与不可结算分支；checkout 主操作；VerificationLogin 主提交；About、解决方案、深度定制、账户的显式客服；ContactProvider 预览需求 | 14 处原 Specular 声明全部替换；运行实例数随页面/分支变化。保留原 props 和业务 |
| 适合新增 | HomeProductsPreview“了解产品”、HomeSolutionsPreview“了解方案” | 2 处模板显式启用，原本为普通尺寸 CTA，使用 card 表面；不改 Layout Grid 核心 |
| 保持原样 | 首页标题旁“查看全部商品/方案” | 12/14px 紧凑文字入口，不扩成填充 CTA |
| 保持原样 | Header、共享滑动高亮、图片菜单、产品局部导航；语言、主题、搜索、用户、购物车图标 | 导航/工具和紧凑操作，保留此前反馈 |
| 保持原样 | Chip、Tab、单选/复选/开关、数量、箭头、关闭、验证码发送/重发、视频重试、账户切换/退出 | 选择、状态或辅助操作，不机械匹配名称 |
| 保持原样 | 删除/移除、返回购买/编辑等返回、正文/来源链接、商品卡片紧凑操作 | 保留特殊或次级语义，不统一品牌蓝 |
| 保持原样 | 卡片整体、Layout Grid、GSAP Flip、About Lanyard、其它 Canvas | 不属于本次按钮范围。About 只替换原 Specular 客服 CTA，不动内容和布局 |

未显式启用的 SupportButton 保留原填充。没有全局将所有 button/a 改为反色。

## 实现与状态

- 继续使用原生 button、Next Link 和 a；不增加嵌套交互元素或 div 模拟链接。保留 ref/type/href/form/name/value/aria/事件及测试标识。
- effect="invert" 输出 data-button-effect="invert"。保留 action-text 文字/图标排列层，移除旧绘制装饰。没有按钮 Store、页面 key、主题初始化或颜色业务事件。
- 默认读 --button-primary-bg / --button-primary-text；hover 文字读 --text、边框读 --accent。页面使用 --bg，卡片和弹窗使用 --surface，手机结算栏使用 --surface-2。
- 只过渡 background-color、color、border-color，200ms。固定的向内覆盖 2px 伪元素默认透明、hover 主色，不改变宿主 border-width/padding、外部尺寸或文字位置。
- 不增加 transform、缩放/位移、滤镜、发光、流动边框或图片反色。已清理选中宿主的旧颜色及 bg-white/text-black 冲突。
- 仅 hover:hover、pointer:fine 且非 disabled/aria-disabled/aria-busy 才反色；触屏一次点击正常操作，无粘滞 hover。
- native disabled 保留；aria-disabled 的 button/Next Link/a 阻止点击和 Enter/Space，保留 href/ref，不以 pointer-events:none 代替键盘保护。
- 保留独立 focus-visible；减少动画时取消过渡但即时显示正确状态。文字无下划线，loading 文案/图标/尺寸和原禁用逻辑保留。

## 旧资源清理

四类代表验证通过后，检查普通/动态 import、barrel、样式和测试引用，删除以下 7 个专属文件：

- src/components/specular/SpecularEdge.tsx
- src/components/specular/scheduler.ts
- src/components/specular/shader.ts
- src/components/specular/source.json
- src/components/specular/upstream/SpecularButton.tsx.txt
- src/components/specular/upstream/SpecularButton.css.txt
- src/components/specular/upstream/LICENSE.md

button-effects.css 已替换旧遮罩/Canvas 样式；--specular-line 退出。运行源码没有旧组件 import、effect="specular"、边缘节点、鼠标跟踪、接近感应、专属 RAF/监听、WebGL 输出或调度入口。旧效果浏览器测试已更新；其它测试中对旧节点数量为 0 的检查不是模块引用。

未恢复分段描边、购买缺口或 Shimmer。已有未使用的 shimmer-button 源文件、登录容器自己的 ShineBorder 和其它动画保持原状，不新增挂载。

没有新增或卸载依赖。package.json、package-lock.json 未改；ogl/three/motion/gsap 保留，避免误伤其它页面。

## 实测结果

[浏览器 JSON](./reviews/invert-buttons/browser-results.json) · [改前尺寸](./reviews/invert-buttons/baseline.json) · [Mock 业务 JSON](./reviews/invert-buttons/business-results.json)

- 先验证普通 CTA、购买主操作、真实链接、disabled 代表，再增加两个模板并清理旧资源。
- 390/1440 两宽度 × 9 页面，共 18 组；20 个原按钮实例的宽高、padding、圆角、字体及文字偏移与改前一致，阈值 0.1px。
- 16 组代表状态覆盖桌面中文/手机英文、日夜、CTA/购买链接/禁用加购/禁用登录。检查尺寸、200ms 颜色变化、无下划线/transform/filter、焦点、减少动画；另验证卡片表面 CTA、真实点击/Enter 跳转及加购登录守卫。
- 所选按钮没有 Canvas/旧 edge DOM；导航、Tab、图片菜单未被选中；无交互元素嵌套和页面运行/新增词典错误。不声称整个站点没有 RAF/Canvas，其它动画仍保留。
- Mock 使用独立 /tmp/one-invert-audit/mock-site 快照、localhost:3002，仅快照启用已有 Mock 环境变量，主项目配置不变。实际“验证中…”禁用、宽 360px/高 48px、hover 边框透明；客服校验/预览/编辑/关闭、显式加购、结算 Link、支付方式预选通过。未执行创建订单、发邮件或设备控制，非 GET/HEAD 请求为 0。
- 静态测试针对 out/ 的 /one-g/ 路径；手机为 Chromium 触屏模拟，未测真实手机、Safari/Firefox。

| 状态 | 日间 | 夜间 |
| --- | --- | --- |
| 桌面 CTA hover | [截图](./reviews/invert-buttons/cta-1440-light.png) | [截图](./reviews/invert-buttons/cta-1440-dark.png) |
| 桌面 CTA 细节 | [截图](./reviews/invert-buttons/cta-detail-1440-light.png) | [截图](./reviews/invert-buttons/cta-detail-1440-dark.png) |
| 手机英文默认 | [截图](./reviews/invert-buttons/cta-390-light.png) | [截图](./reviews/invert-buttons/cta-390-dark.png) |
| 卡片 CTA hover | [截图](./reviews/invert-buttons/editorial-1440-light.png) | [截图](./reviews/invert-buttons/editorial-1440-dark.png) |
| 手机卡片默认 | [截图](./reviews/invert-buttons/editorial-390-light.png) | [截图](./reviews/invert-buttons/editorial-390-dark.png) |

[真实 Mock loading](./reviews/invert-buttons/loading-login.png) · [需求预览 hover](./reviews/invert-buttons/contact-preview-hover.png)。已查看桌面日夜、卡片夜间、手机夜间及 loading 代表截图。

lint、npx tsc --noEmit、build（38 个静态页面）通过。invert-actions、i18n-dictionary、auth-payment、mock-login、media-integration 五个测试文件通过。git diff --check 通过。88 个受保护源码/媒体文件及构建、依赖配置与任务开始前一致，详见 [范围检查](./reviews/invert-buttons/scope-check.json)。

受限环境曾阻止 Next 的 TypeScript 子进程解析 showConfig；沙箱外原命令构建成功，未关闭类型检查或改构建配置。Mock 初次使用 127.0.0.1 被开发来源策略阻止，改用 localhost 后通过，没有放宽安全配置。中途类型和测试定位问题已修正，以最终 JSON 为准。

最终[导航/主题/商品回归](./reviews/invert-buttons/regression-results.json)通过。临时 Mock 服务已关闭，原 localhost:3000 开发预览返回 200。

## 后续跨页适配（2026-10-21）

继续沿用 invert，实现显式 secondary 低强调变体；新增 16 处正常尺寸操作，保留 77 处导航/紧凑/特殊语义声明。登录和结算补 card 表面 Token。完整逐页决策、尺寸对照、状态矩阵、实际交互及截图见 [跨页清单](./button-invert-coverage.md)。本轮未新增依赖、页面、提交或推送，既有主按钮和业务状态保留。
