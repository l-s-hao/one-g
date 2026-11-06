# ONE-G 品牌加载指示

共享入口：`src/components/BrandLoader.tsx` 与 `BrandLoader.module.css`。`BrandLoader` 只呈现调用方已有的真实等待，不控制请求、路由、成功或取消。不要把它用在空数据、错误、暂停、结束、hover或同步筛选上。

## 运动与品牌

原稿为 mobinkakei 的 [grumpy-turtle-41](https://uiverse.io/mobinkakei/grumpy-turtle-41)，源码取自 [Uiverse 官方 Galaxy 归档](https://github.com/uiverse-io/galaxy/blob/main/loaders/mobinkakei_grumpy-turtle-41.html)。三个运动元素、三个投影；单程0.5秒、alternate、ease，延迟0/0.2/0.3秒，原位置与方向保持。完整许可证与修改说明见 [第三方来源](THIRD_PARTY_NOTICES.md)。

图形直接使用 `public/brand/one-g-symbol.svg` 的CSS mask，不重画路径，不使用Header组件、链接或描边效果。Hairline只读取并测量正式几何，不引入其引擎。原稿落地高度25%、横向170%的极端形变会降低商标辨识度，现仅外层scale(1.08,.88)，恢复段与位移节奏保留。投影颜色按当前主题前景色减弱，镂空保持透明。

## 使用

- `size="page"`：200px轨道，用于现有页面级等待；不遮住Header。
- `size="section"`：144px轨道，局部数据或视频缓冲。
- `size="compact"`：静态16px正式mark；按钮空间不足以清楚呈现三mark时的明确例外，不另做自转动画。
- `PendingLabel`：始终预留16px图形槽，保留操作名称；仅active时显示紧凑指示。已有状态文字承担操作说明，图形不重复播报。
- 150ms CSS可见性延迟只防瞬时闪烁，SSR即有同样结构，无浏览器存储/计时器/每帧React状态。active结束即卸载，不为播满周期停留。
- 默认单一 `role="status"`，三个mark与投影整体为装饰；无逐圈播报。不要把status放在自己的aria-busy区域里。
- 减少动态时停止mark与投影动画，保留静态品牌和状态文字；hidden/inert祖先下停止运动。主题读取现有前景Token；无全局请求布尔值。

## 实际接入清单

| 页面/组件 | 真实等待条件 | 规格 | 完成/错误/取消 |
| --- | --- | --- | --- |
| login/page | 原有Suspense fallback | page | fallback由框架移除，导航不被拦截 |
| register/page | 原有Suspense fallback | page | 同上 |
| products/page | 原有查询参数Suspense fallback | page | 同上；分类Flip动画不触发Loader |
| RequireRole | `!authReady` | page | 认证恢复后移除；无用户时保留原跳转说明 |
| AuthFields.HumanField | 原有human pending | compact | useAuthVerification的取消/版本与finally继续负责清理 |
| AuthFields.ResendLabel | 原有sending | compact | 保留重发倒计时、disabled和原名称；倒计时不是loading |
| VerificationLogin | 原有submit pending | compact | 成功、失败、清空/切换/卸载后随pending结束 |
| RegistrationForm | 原有submit pending | compact | 保留取消注册、离页保护及原错误提示 |
| AddToCartButton | 原有pending | compact | 替换已有16px图标位置，保留锁、防重复和错误通知 |
| cart/page | 有用户且未ready、无readError | page | 成功展示原内容，失败显示错误并结束指示；旧响应沿用active保护 |
| checkout/page读取 | 有用户且未ready、无错误message | section | 读取完成/失败移除；不清空已有商品 |
| checkout/page创建 | 原有pending | compact | 创建返回即结束视觉pending；原锁仍阻止重复，不将跳转当作继续请求 |
| AccountOrders | 请求尚未settled | section | 成功后才判断空订单，失败保留alert；卸载忽略旧响应 |
| order-success/page | 用户已恢复、原消息仍为正在查询订单 | section | 查询完成/失败替换为原消息或详情 |
| OrderSummary | 非演示的bank-transfer且银行信息未返回 | section | 返回或失败都结束等待，保留原未配置提示 |
| ContentVideo | `requesting`或`buffering` | section | playing、paused、ended、blocked、error及切章都移除；旧请求不能恢复 |
| ProductVisual | 有src、未失败且该src尚未onLoad | section | onLoad移除；onError显示既有失败，不换URL重试；无src仍显示图片待补 |

视频Loader与媒体滤镜分层。底栏渐变只作装饰，只有实际控件接收点击，焦点态亦如此；修正窄屏中央继续/重试被装饰留白拦截的问题。没有改变静音自动播放一次、暂停画面模糊、结束停止及手动重播的规则。

## 保留的特殊情况

没有现成共享Loader/Spinner或`loading.tsx`，不新增强制开场。搜索、商品/方案静态数据、同步分类、About切章、hover、客服预览没有请求等待，不接入。deep-customization的可用返回链接fallback保留。动态Lanyard及其纹理读取已有可用静态品牌图回退，保持该图，不换成不确定动画。直接图片仍沿用原加载方式，不建立全站图片/视频完成屏障。未发现确定进度的上传下载，不新增服务。

生产认证和支付尚未接入，保持禁用边界；不以Loader伪造短信、邮件、订单或支付成功。测试中的慢响应、错误和演示夹具仅在浏览器测试端注入，不加入正式服务。证据、失败记录、未验证设备见 `docs/reviews/brand-loader-20261105/`。


## 2026-11-06 内容图片接入

`ContentImage.tsx`保留LocalizedImage/Next Image及原src、srcset/sizes、优先级和lazy属性，复用原BrandLoader。只替换实际内容图片叶子，未把页面改为Client Component。ProductVisual移除独立加载数字和重复Loader逻辑，统一使用相同状态；没有素材直接保留缺图。

状态为waiting/loading/loaded/failed；可见且真正等待才挂Loader，成功/错误立即移除，既有150ms仅延迟视觉。complete必须结合naturalWidth，缓存成功不强制等待。事件与IntersectionObserver、MutationObserver、ResizeObserver和后台监听都按实例清理；真实src用key隔离生命周期，主题/语言不重挂图片，srcset/sizes候选变化重新核对当前元素，不等待额外decode。没有全局接管所有img、加载屏障或新后端。

覆盖、例外与真实测试见[本轮说明](SURFACE_AND_IMAGE_LOADING.md)。

强制颜色模式中，现有mark使用系统CanvasText并隐藏装饰投影，避免mask背景被UA清除；几何、周期及普通日夜行为保持。
