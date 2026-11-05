# 播放器统一：基线与设计

用户已指定方向。北极星：机器人画面是主角，播放器提供清楚、克制且可靠的观看控制。

只改 ONE 主仓库。baseline.patch、baseline-staged.patch、baseline-status.txt 保存开始时的已有工作；原有文件及未跟踪工作不删除、不提交、不推送。未修改参考仓库。

## 实际入口与素材

六段独立视频来自 src/data/solution-demos.ts，唯一 ID 为 3pt-demo、wholebody-balance、camera-teleop、wholebody-pick、dance-video-motion、music-motion。对应不同源文件；已有 media-integration 测试校验资产哈希并排除公共视频重复。

- 首页 HomeLanding：wholebody-balance（以 home-content 的实际选择为准）；重复展示，与方案/About 共用同一媒体会话标记。
- 方案索引 SolutionSections：sectionDemos 实际配置的六段。
- 遥操作详情：3pt-demo、wholebody-balance、camera-teleop。
- About capabilities 章：wholebody-balance。
- ProductDetailContent 当前 media 只有 Image，无实际产品视频；不新增视频。
- 无运行中的媒体 dialog、第三方 iframe 或字幕 track。media-sources.json 中的 dialog 是历史来源文本，不是实际 DOM。
- ScrollExpand 无实际调用方，但残存视频分支的 autoPlay/loop 已迁为共享播放器；按已知 src 复用 ID，其余源以稳定 asset:src 标识。

## 职责与迁移

ContentVideo 负责媒体事件与控件；content-playback 管理注册实例、优先播放及最少会话状态。EvidenceVideos 保留网格、标题和素材归属，全部实际调用方透传复用。About 仅将章内暂停改为注册范围暂停，并让播放器输入不触发切章。

视觉采用媒体、装饰遮罩、中央按钮、控制栏分层。仅 video 有约6px滤镜；默认180ms过渡，控制栏180ms淡出；减少动态时取消过渡及模糊。细蓝色4px轨道、19px图标、44px按钮、等宽数字。删除旧错误 CTA 样式，不引入库，不添加设置菜单，不恢复媒体下方说明。

未开始/请求/播放/暂停/缓冲/结束/阻止/错误由媒体事件与请求版本区分；seeking 独立标记。灰度结构为完整画面→中部小型播放入口→底部渐变、单条进度、紧凑控件。控件保留焦点时不隐藏。

## 会话及回退

sessionStorage 键 one-g-content-playback-v1，按稳定媒体 ID 保存 started/stopped/ended 三个布尔量，拒绝存储时降级模块内 Map。服务器 render 不访问存储；只有真实 playing 写 started，ended 单独写 ended。刷新不再次自动启动，手动继续不受限；位置不持久化，刷新显示初始帧，站内同一实例暂停保留当前时间。

模块注册表只协调本站播放器，手动优先；自动候选按可见面积比例选一个，播放持有者不会被小幅比例变化抢走。屏外/后台/切章暂停不自动恢复。全屏壳优先、webkit 原生可用时回退，不克隆 video。原生全屏或开启原生字幕时禁用暂停滤镜，优先可用性。减少动态和 saveData 不自动播放；saveData 用轻暗遮罩取代模糊。

JS 未初始化时原生 controls 保留，监听器安装完成才移除。无字幕素材不展示字幕按钮，未来有 track 时保留真实原生字幕和入口。
