# ONE-G 品牌 Loader 交付

## 已完成

共享实现位于 `src/components/BrandLoader.tsx` 与 `BrandLoader.module.css`，按实际等待接入，不增加开场动画、全局遮罩或导航拦截。完整调用方表、条件、尺寸、完成/错误/取消行为和保留例外见 [BRAND_LOADER.md](../../BRAND_LOADER.md)。

实际覆盖现有login/register/products的Suspense、角色守卫恢复、认证human/send/submit、加购pending、购物车/结算读取、创建订单pending、订单列表/查询/银行信息读取、ContentVideo请求/缓冲与ProductVisual真实图片加载。产品与方案静态数据、搜索、分类、About切章、hover、客服同步预览不制造等待。动态吊牌保留有用静态品牌回退；没有新建loading.tsx或等待全站图片/视频的屏障。

按钮例外：无法在紧凑位置清楚显示三个mark时，使用静态16px mark与原状态文字，始终预留图形槽，不另做单Logo旋转。共享Loader无计时器、React动画状态、Canvas、WebGL或新依赖；CSS只延迟可见150ms，完成时直接卸载，不等待周期。减少动态时停止运动，hidden/inert下暂停，标记全部为装饰，仅一个状态播报区。

## 原稿、商标与许可

- 参考：https://uiverse.io/mobinkakei/grumpy-turtle-41 。实际Chromium访问返回Cloudflare 403，reference-site-result.json及截图已留存；不声称在该页成功看到动画。
- 完整源码取自Uiverse官方归档：https://github.com/uiverse-io/galaxy/blob/main/loaders/mobinkakei_grumpy-turtle-41.html 。reference-original.html为下载原文，已在真实浏览器渲染和测量，reference-measurements.json保存结果。
- 原稿3圆点、3投影；200×60轨道、20px圆点；单程0.5s alternate infinite ease，延迟0/.2/.3秒；15%/45%/right15%位置与原投影子元素顺序均保留。适配保留数量、位置、位移、周期、错开与投影运动。
- 品牌差异明确：不采用原稿落地height25%与scaleX1.7的极端挤压，改为外层scale(1.08,.88)保留辨识度；投影沿主题前景色减弱。不修改任何SVG路径。
- 正式Logo：`public/brand/one-g-symbol.svg`，原始1:1图形直接CSS mask，不用组合文字/链接/Header描边组件，不产生内联SVG ID冲突。
- Hairline实际参与为其read.mjs的scan/snapshot/card，已实际浏览器读取外圆及内部G形镂空，约1034×1034墨迹范围。见hairline-source.txt/png。未运行等距重建，不引入演示引擎或交互面板，不替换正式商标。
- MIT版权、作者mobinkakei (Mobeen)和Uiverse.io、完整许可及适配说明已写入 `docs/THIRD_PARTY_NOTICES.md`，没有添加页面署名小字。

## 实测结果

| 检查 | 结果与证据 |
| --- | --- |
| 全量Node测试 | **69/69通过**，node-tests.log；新增2项SSR/状态播报与compact验证 |
| 类型检查 | `tsc --noEmit --incremental false`通过，types.log |
| lint | 0错误；仅保留原有 `.oil-ui/residual-20261102/session-cases.mjs` 未使用变量警告，lint.log |
| 生产构建 | 通过，build.log；静态产物用于最终浏览器验收 |
| diff检查 | 通过，diff-check.log |
| 真实慢加载、完成、暂停/结束、About取消、404重试、并发图片 | 连续3轮通过：run-1793871183220、run-1793871401355、run-1793871421634 各results.json |
| 中英文×日夜×1440/390、减少动态 | 连续3轮各8组合通过：matrix-1793871274452、matrix-1793871450310、matrix-1793871457741 |
| 150ms防闪烁 | 实际组件SSR与CSS的测试夹具，三轮可控请求通过；快完成约3–4ms不显示，持续等待显示，完成即移除。delay-1793874906229/results.json |
| 键盘 | 三轮手机视口空格暂停/继续、Tab进入控件、Enter操作通过，keyboard-1793875275382/results.json；Loader无tabindex、不抢焦点 |
| 原视频播放规则 | 真实Chromium复查一次静音自动播放、暂停仅模糊视频、继续、结束停止、刷新抑制、手动重播及协调，通过；../content-player-20261105/run-1793871451182/results.json |
| Oil截图工具 | oil-shots-final/report.json：正常与200%对照，无控制台错误、溢出、坏图或默认做法提示 |

功能慢响应仅在浏览器路由测试中控制，未给正式服务加入延时。取消测试在真实About章内待播视频上执行，晚到的媒体响应不恢复Loader；并发图片分别成功/失败，各自结束，不共享全局布尔值。生产认证/付款未接入的禁用边界保留；未伪造成功。

加载测试发现并修复窄屏既有命中问题：控件获得焦点后，旧focus-within规则让整个底栏渐变区域截断中央播放/重试的点按。现渐变留白始终穿透，只有按钮/滑块接收输入；没有修改页面布局或媒体素材。旧请求版本、取消与播放控制规则保留。

## 视觉与录屏

方向由用户明确指定：保留原运动、使用正式品牌几何，不另起通用Loader方案。独立视觉评审1轮与新增证据复核1次，不打分，见visual-review.md；未见阻断缺陷。正常和小屏画面已查看；紧凑实际组件的SSR夹具见delay-1793874906229/slow-and-compact-3.png。没有删除必要状态文字，也没有恢复媒体小字。未新建全站DESIGN规则，专项决定写入BRAND_LOADER.md并更新README/ARCHITECTURE入口。

- 原稿/品牌版日夜与规格对照：oil-shots-final/page.png 与page-@2x.png；原始图片reference-original.png；正式商标读取图hairline-source.png。
- 参考对照录屏：page@4397732f7766dd5314c960a24d350ab7.webm（原稿来自官方归档的实际渲染，非参考页403画面）。
- 完整加载—完成录屏：run-1793871421634/page@f0744e88486fcd0ecaee9353cc75e2cf.webm，包含真实视频请求等待、语言/主题切换、完成、暂停/结束。
- 取消录屏：run-1793871421634/page@c9da69158a25340b55e430411701ae21.webm，包含About切章取消及晚响应。
- 实际小屏/中英文/日夜截图：matrix-1793871457741；真实缓冲及失败/取消截图：run-1793871421634。

## 失败记录、范围与限制

初期开发热更新期间出现页面/等待超时，日志及独立run失败目录均保留。手机版旧底栏命中问题的未通过记录亦保留，修复后3轮全部通过。第一次Oil夹具截图因宽度仅在运行时覆盖而横向溢出，记录在oil-shots/report.json；仅修正对照夹具并生成oil-shots-final，未改网站布局。Hairline默认启动路径缺本机浏览器的简化卡也保留，后续通过同读取器导出与明确浏览器路径实际完成测量。

主要浏览器实测为本机Chromium。未取得Safari、iOS/Android真机；手机为390px/触屏相关模拟，不能据此宣称实机通过。未接入的认证、短信邮件、真实订单、付款和银行后端不做外部服务测试；紧凑等待图形的持续加载视觉通过实际组件SSR夹具验证，非真实生产认证请求。确定进度上传下载不存在，未新增。独立评审基于截图，运动时序另由原稿与实际浏览器计算样式核对；没有用静态图冒充动态或实机验收。既有开放问题不自动结案。

Git基线为baseline.patch、baseline-staged.patch、baseline-status.txt；integrity.json记录源哈希、任务范围外差异和暂存区不变，原有309个未跟踪条目仍在。只修改ONE主仓库，参考仓库只读；未提交、推送或部署。未新增正式导航中的演示页面。
