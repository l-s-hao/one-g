# ONE-G 内容视频播放器交付

## 结果

已复用 EvidenceVideos 的全部真实调用方，收敛到 `src/components/ContentVideo.tsx`、`ContentVideo.module.css` 和 `src/lib/content-playback.ts`。方向由用户指定：视频为主角，轻量底部控件；未重新设计页面。媒体、页面布局、业务功能和媒体下方的小字状态保持。控件为细品牌蓝进度、播放/暂停、时间、静音/音量、全屏；没有字幕轨就没有空字幕按钮。

迁移首页 HomeLanding、解决方案索引 SolutionSections、遥操作详情、About capabilities 章；未使用的 ScrollExpand 视频分支也迁移，图片分支保持。当前产品详情只有图片，未新增视频；没有运行中的视频弹窗或第三方 iframe。六段独立素材及重复展示映射见 plan-and-inventory.md。

会话规则：sessionStorage `one-g-content-playback-v1`，按稳定媒体 ID 保存 started/stopped/ended 三个布尔值，不保存身份或观看位置。仅真实 playing 记录开始，真实 ended 记录结束；存储拒绝则内存回退。同媒体跨页/刷新不再次自动启动；同实例保留暂停位置，刷新不承诺恢复时间。结束不循环，仅手动重播归零。

只协调已注册内容播放器，手动优先。自动候选合并一轮可见性通知后按主要可见比例选择，已有播放持有者不因微小比例变化被抢播。离屏、后台、切章暂停；返回提供继续。请求版本、播放意图和媒体当前 paused 值防止旧 Promise/旧 pause 事件覆盖新操作。

媒体与遮罩/控件分层，暂停及结束仅柔化视频画面，控件清晰；180ms非必要过渡在减少动态时取消。全屏优先外壳，WebKit原生全屏和原生字幕显示时关闭滤镜。未初始化时原生 controls 保留，无JS回退已实际验证。saveData与减少动态不强制自动播放；低效果模式保留暗遮罩。

## 验证

- 类型检查 `tsc --noEmit --incremental false`：通过，types-final.log。
- lint：0错误，1条原有 `.oil-ui/residual-20261102/session-cases.mjs` 未使用变量警告，lint-final.log。
- 项目原有隔离方式的全量 Node 测试：**67/67通过**，node-tests-unsandboxed.log。包含2条新增会话/协调子测试。
- 生产构建：通过，build-escalated.log。沙箱内TypeScript子进程输出限制导致的第一次失败日志保留在build.log。
- `git diff --check`：通过。
- Chromium真实核心播放：静音可见自动播放、暂停仅模糊媒体、原位置继续、结束停止、手动重播、刷新抑制、双视频手动优先、暂停拖动。最终 run-1793868507320/results.json；前几轮通过与失败均独立保存。
- 快速键盘及按钮暂停/继续：**连续3轮通过**，rapid-1793868448362/results.json。先前真实竞态已修复：旧pause事件在新play请求后到达时，按媒体当前paused排除，不覆盖新意图。
- 扩展：自然完整播放到结束（不拖进度）、滚走返回不重播、外壳全屏进出、区域键盘、真实HTTP404与手动重试、触屏模拟、无JS原生控件均通过，extended-1793868449565/results.json。
- 生命周期：About正常章切换暂停、返回不重播、原生滑块按键不切章、主题语言保留暂停、同媒体跨页抑制、真实play返回后人为延迟Promise再暂停、sessionStorage抛错回退均已通过。lifecycle-1793868146011/results.json；这些是实际媒体播放，不伪造成功。自动播放拒绝的分支另用NotAllowedError注入覆盖，明确不是浏览器策略实测。
- 中英文×日夜×1440/390宽度共8组截图及减少动态检查。触屏仅Chromium模拟；音频API状态已查，未进行人工听感评测。
- Firefox真实静音自动播放、暂停模糊、继续、真实ended停止通过，firefox-1793868554850/results.json。

## 证据与评审

- 控件/暂停：run-1793868507320/paused-desktop.png；结束：同目录ended-desktop.png。该目录含八组视觉截图。
- 最终自然播放至结束录屏：extended-1793868449565/page@94f8e02cb3c5a46fc3158f8695424636.webm，含随后全屏和键盘操作；自然播放区间未跳进度。
- 首页单视频自然播放录屏：natural-1793867245405/page@6c4a4aa972ad11407870de01f846d4a1.webm，实际15.133秒结束；另有结果、结束截图和抽样画面。已查看正常播放与结束画面；未以逐帧检查替代实机测试。
- 独立视觉评审1轮，不打分：visual-review.md；无截图确认的偏离。独立UX开放走查1轮：ux-review/report.md，桌面/手机模拟完成观看、全屏、退出并保留时间。评审提出暂停模糊不利于查看姿态，与本轮用户明确取舍冲突，故保留模糊；未将此建议当作未修缺陷。
- Oil UI Pro截图工具：oil-shots/report.json，桌面/手机及200%局部均生成；控制台、横向溢出和坏图检查通过，未报告需保留的默认做法提示。
- 未恢复或新增媒体下方说明。未删除必要状态文字；没有新建全站设计规范，专项规则写在 docs/CONTENT_PLAYER.md，并更新 README/ARCHITECTURE 入口。

## 限制与失败证据

无Safari、iOS/Android真机；原生视频全屏、原生字幕轨、系统后台/恢复与saveData真实设备表现仍需设备复核。当前素材没有字幕轨，字幕入口与滤镜回退的真实字幕操作没有实测。尚未对每段视频完整人工看完或听音；已有资产哈希与映射回归通过。

开发热更新中偶发JSON解析500，相关脚本失败目录保留。早期录屏工具版本不匹配导致未生成视频，后续仅在本任务验收目录下载匹配工具，已生成最终录屏；未改依赖。取消测试隔离的额外诊断运行出现过购物车环境互扰，node-tests-expanded.log保留；原有隔离方式最终67/67通过，不修改购物车。历史 media-display.browser.mjs / media-integration.browser.cjs 含旧原生控件/点击播放假设，本轮使用新增共享播放器验收脚本验证新规则，未以未运行的旧脚本声称全站已验收。

Git基线为baseline.patch、baseline-staged.patch、baseline-status.txt。任务范围外已有已跟踪差异和暂存区完整保留，preservation.json可核对；原有298个未跟踪条目仍存在。只修改ONE主仓库，没有提交、推送或部署。参考仓库未写入。旧未知问题未结案。
