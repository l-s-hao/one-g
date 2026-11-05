# 品牌 Loader：确定方向与入口盘点

用户已指定运动与品牌几何；不探索另一种Loader。北极星：保持原稿三个圆点错落弹跳的节奏，等待期间仍能认出ONE-G圆形mark，完成即消失。

## 原稿

Uiverse参考页curl返回403；已在真实Chromium打开页面并记录reference-site-result.json与截图。官方uiverse-io/galaxy/loaders/mobinkakei_grumpy-turtle-41.html已下载并在实际浏览器渲染、测量。原稿是200×60轨道、三个20px圆点：left15%、left45%、right15%；单程0.5秒alternate infinite ease，完整往返1秒，错开0、0.2、0.3秒。0%落地top60px、height5px、scaleX1.7；40%恢复20px/scaleX1，100%到top0。另有3个20×4px模糊投影，top62；shadow046同周期，横向缩放1.5→1→0.2，透明度1→0.7→0.4。原源码第4/5/6子元素投影顺序为中/右/左，原样保留其时序和位置组合。

原稿压缩至高度25%、拉伸至宽170%会使Logo镂空难辨。品牌适配保留位移、方向、周期、延迟、投影，落地只采用scaleX1.08/scaleY0.88；不改SVG路径，不叠加Header描边。

## Hairline读取

实际调用hairline-create/read.mjs的scan/snapshot/card导出；viewBox189 191 1040 1040，墨迹约1034×1034。读取到外圆轮廓与内部闭合G形镂空，比例1:1、镂空偏右上，保留全部正式几何。无装饰需新增。动作已由参考确定，读取仅用于结构检查；按用户约束不运行重建/等距引擎，不替换商标。原始资源public/brand/one-g-symbol.svg以CSSmask使用，避免多实例ID冲突，色彩沿用现有Token。

## 入口

- 无已有共享Loader/Spinner，无loading.tsx。已有login/register/products三个Suspense fallback适合page/section；deep-customization返回链接fallback是可用导航，不替换。
- RequireRole认证恢复是真等待；authReady之后的无用户导航是跳转提示，不持续显示Loader。
- 认证useAuthVerification已有human/send/submit pending及AbortController版本；仅呈现，不改服务。紧凑按钮采用静态16px mark+已有文字，不强塞三mark图案；预留同宽图形槽防按钮位移。
- AddToCart真实pending复用现有16px图标位置；checkout创建订单pending只替换状态图形；不改订单/付款服务。
- Cart与Checkout已有异步读取，完成/错误均需结束等待；AccountOrders真实列表读取与空列表区分；order-success订单查询与错误/无订单区分。OrderSummary银行信息有真实读取，只有bank-transfer且非demo时显示局部等待。
- ContentVideo只对requesting/buffering显示section；paused、ended、blocked、error均不显示。媒体滤镜不涉及Loader层。
- ProductVisual现有成功/失败/缺图分支可增加真实onLoad等待；缺图pending数据标记代表待补素材，不是下载等待，不显示Loader。
- HeaderSearch本地同步过滤、商品分类GSAP/Flip、About切章、hover与主题切换均不加载，不接入。客服仅同步校验/预览，不接入。Lanyard动态组件已有静态品牌回退，不用Loader替换有用图像。没有上传/下载确定进度控件。

不新增开场遮罩、全局布尔状态、计时业务或导航拦截。共享呈现采用CSS可见性延迟150ms，没有异步计时器；完成/失败/取消/卸载直接移除；不等待动画周期。多实例各自归属于已有pending，不分享全局请求状态。
