# 搜索反馈与流程验收

2026-11-06。主仓库限定变更，未提交、未推送，HEAD/暂存区与开始时一致。既有未跟踪文件未删除；此前页面、媒体、Loader、About与业务修改哈希未变。[保留检查](preservation.json)。只读外部参考，不写参考仓库。

## Apple 观察与适配

来源：[Apple 中国官网](https://www.apple.com.cn/)，实际 Chromium 1440桌面与390触屏模拟，不是浏览器地址栏、支持站或App Store。观察原始截图/记录按 apple、apple-followup、apple-actions、apple-result 独立运行保留，未把第三方资料加入生产索引。

| 状态 | 实际观察 | 本站处理 |
| --- | --- | --- |
| 打开/空输入 | 导航下展开，大输入与快速链接 | 四个现有真实入口，保持本品牌和日夜 |
| 部分/完整产品名 | 逐字输入后出现链接建议和搜索结果建议 | 显式destination/query，最多6条建议 |
| 拼写错误/无关词即时建议 | 后续列表曾保留前词，稳定行为未核实 | 本站本地规则生成当前词建议，不推断Apple算法 |
| 清除 | 实际按钮清空并保持焦点；稳定列表恢复时点未核实 | 本站明确回到快捷入口且清除旧选择 |
| Enter | 进入 `/cn/search/iPhone?src=globalnav` | 本站无独立结果页，面板进入完整结果状态 |
| 查询建议 | 链接目标为官网search URL；点击后实测重定向到配件分类 | 本站按明确动作提交查询，不复制其服务或路由 |
| 快捷/具体内容 | 快捷链接到AirPods；具体搜索结果到iPhone介绍 | 本站真实Link到正式内容，不加购 |
| 无关词提交 | 无匹配提示与重新搜索建议 | 无相关内容就清空/浏览全部，不生成固定假推荐 |
| 关闭/返回 | Escape返回入口焦点；实际结果后退回原结果URL | 保留本站关闭焦点与路由状态，结果导航不拉旧焦点 |
| 手机 | 窄屏展开、输入、建议、清空、Enter可操作 | 触屏模拟通过；真实软键盘/系统IME未验证 |

未宣称Apple内部算法、接口或动画参数。ONE-G保留原300ms展开/280ms商品展开；显式修正、本地近似匹配、提交快照与准确数量是本站实现。无复制Apple商品、CSS或搜索服务。

## 实现与边界

修改共享 `SearchBox.tsx` / CSS、`lib/site-search.ts`、词典；Header仅接真实active状态及轻暗底页的装饰层。原商品入口自动复用共享能力；无重新排序、无新Provider/服务/依赖/结果路由，不改商品页分类/Flip源码。

draft由两个调用方分别持有。提交快照包含原始committedQuery、全部matches和results/empty/error；选中保存候选ID及查询，随真实焦点和编辑清除。关闭由既有open状态管理，清空返回快捷入口并保焦点。原始查询与标准化值分开，不静默改字。

destination使用真实Link；query明确查询；correction须主动确认，更新输入并提交但不跳详情。顶部未主动选择时Enter只查询；商品唯一明确正式名称/型号/别名才可直达。G1/Pro、分类、前缀和近似不猜第一条。6条建议预算与完整结果分开，计数仅统计内容命中，不把操作按钮算结果。相关命中标注“相关结果”。

索引仍为现有9商品、4方案、3公开主页面，从正式数据/helper适配。RobotDock旧名保留，RoboDock仍是商品、SONIC Link仍是方案；商品入口仅商品。NFKC、大小写/空格/连字符归一化，短型号限制近似。16个正式地址 [均HTTP200](candidate-links.json)；真实操作另确认RoboDock、G1及遥操作详情。

当前同步本地索引无真实waiting、异步响应倒序、请求取消或网络重试；这些场景不适用，未造请求/Loader。受控本地normalize异常验证error与empty分离、同词重试；关闭/卸载无旧请求复活。输入建议不逐字live播报，提交/重试只有一个有意义状态区；原生输出关闭重复live。组合输入回车防提交，失焦清理标记。

普通链接/按钮列表与实际焦点一致，没有半套combobox或嵌套链接按钮。清空/关闭分离，原生Link保留basePath、新标签及注册离页保护。轻暗底页仅视觉、pointer-events:none，无全屏blur、焦点约束或滚动锁。浮层互斥与计时器沿用原Header。

## 可观看证据

四段独立录屏有适度阅读停顿，停顿只在测试脚本，不加入正式业务：

- [成功：打开→输入建议→Enter完整结果→真实详情](success.webm)
- [近似：保留原词→明确修正→结果→详情](correction.webm)
- [无结果：提交→清空恢复→重新查询→关闭](no-result-recovery.webm)
- [手机模拟：商品搜索向右展开→原生Enter→商品详情](mobile-product.webm)

[录屏场景目标](video-manifest.json)。自动回归原始视频、每轮结果、Apple观察和失败原稿独立保存，没有覆盖历史证据。正常速度回放及关键画面抽查仅证明录制内容可播放，不代表真实手机。

截图：[完整数量](1440-complete-results.png)、[明确修正](1440-correction.png)、[无结果恢复](1440-no-result.png)、[手机修正](390-correction.png)、[受控本地异常](local-index-error.png)。标准工具1×/2×截图在 oil-evidence，issues/lint为空。

## 真实检查

| 检查 | 结果与证据 |
| --- | --- |
| 全量Node | **80/80**，原78+动作/提交快照2项，[日志](node.log) |
| lint | 0错误，1条既有residual脚本unused events警告，[日志](lint-delivery.log) |
| 类型 | `tsc --noEmit --incremental false`通过，[日志](types-final.log) |
| 生产构建 | 通过，[日志](build-reviewed.log) |
| 完整浏览器流程 | 最终连续3轮、每轮13组检查，通过，[日志](browser-reviewed.log)、[当前结果](results.json) |
| 尺寸/语言/主题 | 390/768/1440/1920 × 中文/英文 × 日夜16组合通过，含互斥、焦点与受控visualViewport收缩，[结果](matrix-results.json) |
| Firefox | 最终3轮原生输入/Enter与真实商品/方案链接通过，[日志](firefox-reviewed.log)、[结果](firefox-results.json) |
| 原搜索回归 | 独立query、真实分类Flip、最新输入提交、注册离页保护通过，[日志](regression.log) |
| diff | `git diff --check`通过，无快照更新 |

真实按键不是全部直接调用submit：使用浏览器逐字键入、Enter、方向键和真实按钮/Link。原回归另外覆盖同一轮立即输入与请求表单最新值；composition注入只验证事件守卫，不冒充系统IME。浏览器前进/后退保留商品分类URL并关闭Header；关闭/重开和真实语言切换保留适用草稿/提交结果。

独立视觉1轮不打分，发现底页易混入结果与数量口径两点，已修正并复核通过：[记录](visual-review.md)。独立UX1轮从商品中心自主搜索G1并进入正确详情：[记录](ux-review/report.md)。其采购判断受限于既有未确认参数/交付资料的意见维持开放，未以改资料、价格或购买逻辑消除。

## 限制与失败记录

- Safari、真实iOS/Android、真实系统中文输入法、手机软键盘和GPU未验证。触屏/viewport/composition模拟与桌面Firefox不能代替这些设备。未对未变更全站页面宣称完整验收。
- 无独立搜索结果URL，直接访问结果URL场景不适用；没有为模仿Apple新造路由。
- 首次sandbox构建无法解析TypeScript子进程showConfig输出，[原日志](build.log)保留；获准正常构建后通过，没有改配置掩盖。
- 首轮脚本在合成composition之后按Escape，浏览器实际未开启系统IME，原生search控件清空导致后续断言失败：[原记录](first-browser-failure/failure.txt)。移除该不成立的系统IME假设，保留真实Enter和独立组合守卫测试，未据此改业务或声称真机IME通过。
- 初次录屏回放脚本漏接已到达的loadedmetadata事件；仅改检测为真实readyState后回放，产品代码不涉及。
- Oil截图工具缺系统ffmpeg，其两个录制步骤失败；Playwright已有匹配运行时录制的webm可用。运行时ffmpeg仅有录制所需编解码，不冒充完整系统ffmpeg。工具“商品页缺少滚动叙事”提示不属于本轮搜索范围，未添加背景或整页动画。
- 原历史缓存、JSON或其它未定位问题不随本轮自动结案；保留此前日志。未提交、推送、部署或触发外部业务。
