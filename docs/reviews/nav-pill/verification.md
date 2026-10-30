# 导航胶囊高亮验收

> 附件范围：本记录引用的截图、JSON采样和临时测试脚本保留在本地，未纳入本次GitHub提交。

日期：2026-10-30。基线：本地 main，HEAD 8fc2cf82e86b11d912bd99a68580877258779acc，保留既有已修改及未跟踪文件。使用 Oil UI Pro 检查实际截图与视觉层级，VibeHub 整理真实路由状态和悬停预览的区别。

## 修改范围

- `src/components/HeaderBrand.module.css`：胶囊圆角9999px；桌面高42px、左右留白16px；1024～1199px高40px、左右留白10px；沿用主题accent/surface/text，日间强调色18%、夜间28%。只扩大绝对定位背景，不扩大链接或导航行。
- `src/components/useNavigationHighlight.ts`：沿用单一共享滑块，测量文字宽度并添加留白；350ms位置/宽度过渡；移出导航文字区后恢复真实选中。保留路由重挂载，通过Document弱引用缓存上一帧几何实现跨挂载过渡，无额外路由状态、RAF或计时器。ResizeObserver不会打断未变化目标的过渡。
- `src/components/Header.tsx`：向既有高亮hook传入真实pathname。
- `docs/NAVIGATION.md`：更新高亮说明；本目录保存脱敏验收证据。

真实选中仍由现有 `useAppPathname` 去除 `/one-g` 后精确匹配 `/products`、`/solutions`、`/about` 或以对应路径加 `/` 开头。首页不选中；类似 `/products-extra` 不误匹配。hover只改变临时展示目标，不能更改aria-current或URL。减少动态效果时直接切换，1023px及以下不显示桌面胶囊。

## 实际验证

- `npm run lint`：通过。
- `./node_modules/.bin/tsc --noEmit --incremental false`：通过。
- `npm run build`：通过，38个静态页面；在 `/tmp/one-nav-pill/build` 隔离副本构建，避免干扰原预览。三个修改后的源码与构建输入字节一致。
- Chromium：1440、1024宽度 × 中文/英文 × 日间/夜间，8组通过。覆盖子路由、刷新、真实链接点击、前进后退、首页无选中、无关路径边界、hover预览与移出恢复。每组确认一个滑块、9999px圆角、完整留白、无横向溢出。
- 768、390触屏模拟：原移动菜单和当前链接状态正常，桌面胶囊隐藏，导航高56px，无横向溢出。
- 与修改前静态预览比较：1440、1024、768、390下Header及主导航项坐标和尺寸完全一致，见 `geometry.json`。
- 三次实际栏目切换采样中间帧：位置和变化的宽度均存在连续中间值，新路由滑块不消失；减少动态效果下无运行中的过渡，见 `motion.json`。测试脚本逐帧采样仅用于验收，产品代码没有RAF。
- 实际主题切换后的文字/胶囊背景对比度：日间约14.01:1、夜间约10.50:1。
- 页面脚本错误记录为空，见 `checks.json`。实际截图：`header-1440-light-zh-CN.png`、`header-1024-dark-en.png` 及其余组合，手机 `mobile-390.png`。

## 范围与限制

源文件哈希比较确认本轮仅修改上述三个组件文件和导航文档；既有Logo、动画、导航尺寸、文字大小、菜单及图片分类数据、主题Provider、其它页面、依赖均未改。MenuToGrid未替换，主链接保持原生跳转。无提交或推送。

这是本地Chromium与触屏模拟结果；未用真实平板/手机或Safari/Firefox验证。截图证据来自现有页面，页面业务功能不在本轮新增验证范围。
