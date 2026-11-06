# 导航表面与内容图片加载（2026-11-06）

本轮严格按用户已定方向整理，不重做页面内容。全宽Header尺寸、Logo、三栏目、现有路径/returnTo、商品数据与视频播放规则保留。没有安装依赖、接外部服务、提交或推送。

## 实现与覆盖

| 批次 | 位置 | 行为 |
| --- | --- | --- |
| A | Header、DisplaySettings、ThemeToggle/AnimatedThemeToggler、navbar-surface | 左Logo+搜索，中三栏目，右用户/购物车/设置；手机沿用移动菜单和搜索。复用原panel、query、Provider、持久化与圆形主题扩散。 |
| B | Header、HomeLanding、ProductDetailContent、About、Lanyard、Footer CSS | 移除通栏屏幕装饰线，保留原留白；Footer背景内64px（手机48px）主题渐变，不新建占位。 |
| B | 设置、搜索输入、部分图片容器、普通商品卡片 | 支持时局部corner-shape:squircle；保留原半径与不支持时的普通圆角。圆按钮/高亮胶囊/Header外框不改。 |
| C | ContentImage、content-image-state、ProductVisual | Next Image真实事件、可见性、缓存/错误与150ms视觉防闪烁复用；非逐帧React状态，无请求人为延时。 |

内容图片已接入：首页Hero/商品图，ProductVisual商品卡片与推荐，商品详情与购买介绍图，导航商品/方案图片，方案列表和遥操作详情，About公司图与产品图。保留宽高、比例、alt、lazy、priority与静态导出路径。窄小导航缩略图使用既有compact mark反馈，不强行放大三mark动画。

明确例外：Logo/图标/Loader图形、吊牌前面静态品牌图与WebGL纹理排除；视频poster继续属于共享播放器的媒体/缓冲状态，不额外叠图片Loader；购物车小缩略图继续原原生加载；未挂载的旧拼贴与ScrollExpand图片分支保持原实现。CSS background没有需要迁移的活动内容图片。未替换、下载或重画任何媒体。

## 表面、边界与浮层

不透明主题色是基础。许可时94%主题背景+12px模糊，展开Header面板即纯色。减少透明、强制颜色、强制纯色、saveData与既有低资源组合降级；未经实机验证的窄屏粗指针保守纯色。减少动画只影响运动。内部 `?navbarSurface=solid` 可对照排错。资源提示不是GPU测量。

既有z-index 50与原生dialog顶层保留，没有新增Portal、全屏模糊、全局滚动锁或will-change。设置是244px非模态普通选项面板，Escape及失焦/外部操作依既有规则关闭；hover计时器由同一clearTimers管理，搜索/设置/图片抽屉互斥。原生注册离页dialog已实际检查，输入保留、取消继续正常；已登录咨询模态因生产认证未接入未完成完整路径，不伪造会话。

删除的装饰线：首页分类带及方案开头，Header背景底缘，产品介绍各节，About章内遥操作/联系衔接，吊牌开头与Footer外缘。保留表格行、表单、按钮反色/焦点、About路线内部内容分组和Footer内部目录/折叠语义边界。没有改变About各章尺寸、轮转视觉、内部阅读与末章退出。

连续圆角依据[CSS Borders Level 4草案](https://drafts.csswg.org/css-borders-4/#corner-shaping)局部渐进增强；并非依赖所有浏览器支持。实际Firefox不支持corner-shape时仍使用原border-radius。

## 验证与证据

当前完整结果见本机工作区 `.oil-ui/header-surface-20261106/REPORT.md` 和各独立运行目录。

- lint：0错误，仅原有取证脚本unused events警告。类型检查、干净生产build、git diff --check通过。全量Node **74/74**（原72+图片状态2项）。
- 导航16组合（390/768/1440/1920×中英×日夜）、慢图片成功/失败、降级12组合及请求竞争分别连续3轮通过；真实视频共享控件回归通过。独立视觉与独立UX各1轮，无阻断问题。
- 确认减少动画不关闭正常桌面玻璃，减少透明/forced-colors/能力缺失信号/强制纯色/低资源信号都同步关闭blur并恢复不透明色。能力与硬件信号测试为受控注入，不声称改变了浏览器引擎或验证了低端GPU。
- 真实慢图片请求在路由测试中阻塞/释放，不给正式业务加等待；失败退出，缺图不转；离页后晚响应不复活旧Loader；真实分类快速切换、偏好不重挂图片通过。DOM候选替换测试核对实际load/currentSrc，不把它称为完整React组件源切换矩阵。
- 正常与4倍CPU降速分别对照玻璃/纯色，记录真实视频+滚动的RAF间隔及CDP布局/绘制；只是本机实验，不代表手机GPU。
- 原About页的唯一JSX文件差异为图片import迁移，说明后仅更新product-v2-baseline对应一项hash；首次失败保留，没有更新其它锁定数据或测试预期掩盖行为变化。

未取得Safari/iOS/Android真机，手机/平板为Chromium触屏仿真；真实低性能设备未验证，保守纯色策略保留。原始参考效果图不在上下文，没有复制其纹理、文案、产品或加载图形。

历史开发JSON热更新异常仍维持原开放结论。首次构建遇Webpack缓存哈希错误，完整日志和旧生成缓存保留，一次干净构建通过；未更改Next配置。Oil截图工具静态与2倍图无可读性提示，自动录屏缺系统ffmpeg未完成；完整操作webm由现有Playwright浏览器运行时录制。其“原首页缺滚动叙事”提示不属于本轮锁定范围，未借机重做页面。

强制颜色截图复核发现CSS mask的Logo/语言入口会被系统清除背景；已仅在forced-colors下为正式mask和品牌Loader使用CanvasText/ButtonText，阴影隐藏。未修改SVG路径、Logo尺寸或Loader关键帧。降级测试增加图形前景色与底色不同的断言，最终重新验证。

后续导航/搜索修正覆盖本记录的左侧搜索、94%/12px与浮层打开时导航纯色规则；查出并移除遮挡背景采样的旧根层实色，改为84%/14px。图片 Loader、圆角与分区实现不变。最新规则、真实检查与限制见 [SEARCH_NAVIGATION.md](SEARCH_NAVIGATION.md)。
