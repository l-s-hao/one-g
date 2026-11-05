# ONE-G 播放器音量、画面点击和平滑进度

本轮用户明确同意同时完成前段音量与整面点击，允许必要依赖。只改主仓库，不提交或推送。

## 原因与实现

旧版仅 timeupdate 驱动 React position，原生 range step=0.1，进度低频跳动；未发现原有长过渡。现在 video-progress.ts 的一个 paint 同时更新原生滑块、填充与 ARIA，单 RAF 采样真实 currentTime。只按秒刷新时间文字，不逐帧更新 React。真实播放才刷新；暂停、ended、waiting、error、后台、离屏、控制栏隐藏和卸载停止。拖动优先，旧事件不盖预览，seeked 回到真实时间。原生 input 事件由同一控制器处理，避免受控值多源覆盖；可定位范围为空或零长度时禁用滑块。

ContentVideo 仅建立一个独立媒体表面点击层，控件与中央按钮为兄弟层。移动超过8px、多指、取消指针不算点击；保留 pan-y / pinch-zoom。原生回退不叠点击层，结束保持明确重播。

音量复用官方 ElasticSlider 受控API，不替换进度。volumechange 读取当前实例真实 volume/muted；主动拖动才允许解除静音，读回失败禁用滑块，保留系统音量。暂停模糊仅媒体层，Loader与控件清楚。减少动态效果取消弹性、回弹和增厚。

## 来源与依赖

官方 registry：https://reactbits.dev/r/ElasticSlider-TS-CSS.json（无版本号）；两个原始文件与 SHA-256 见 registry-install.json 和 *.original.txt。shadcn 4.23.0 遇远端TLS失败，依赖安装成功后从同一官方JSON写入准确源码，再进行局部适配。本次会话安装 @hugeicons/react 1.1.10、@hugeicons/core-free-icons 4.4.0，既有 motion未变，无新增动画库。官方许可证为 MIT + Commons Clause，完整来源与文本见 ../../THIRD_PARTY_NOTICES.md。

## 接入范围

共享 ContentVideo / EvidenceVideos 自动覆盖首页方案、解决方案列表及详情、About 当前章节。产品详情实际只有图片；没有实际媒体弹窗或可控制第三方 iframe，不新增视频。About 已有交互区排除规则复用，未改章节内容与旋转。

## 验收与限制

真实 Chromium 媒体播放、录屏、触屏仿真；Firefox真实进度、表面暂停/继续、键盘音量通过。生命周期真实HTTP慢流停顿，进度停止且恢复同步，长47.806s视频通过。原播放器8种中英文/日夜/桌面手机组合通过；快速播放暂停回归三轮通过。Node全量72/72，lint仅原有1个 unused events 警告，类型检查/build/diff检查通过。

原始失败不删除：无 Range 简易静态服务器返回零长度 seekable 导致快速定位验收失败，现禁用无效滑块并使用支持 Range 的服务器复测。后台真实标签页切换测试受自动化窗口限制未成功，失败保留 background-*，不宣称真实后台切换已验证；控制器 visibility 清理有单元覆盖。

独立只读组件评审：1440px与390px，实际拖音量、画面暂停、清晰控件和连续进度，无阻断缺陷。未取得Safari/iOS/Android实机，移动为Chromium仿真；真实扬声器响度与平台系统音量未验证。历史未知问题结论不变。

独立评审结果：实际手机采样32帧均有不同进度位置，最大采样差约0.000517秒。音量约70%时真实volume约0.70000034，播放保持继续。控件没有重叠或裁切，暂停媒体模糊不影响操作层。

已完成运行与录屏索引：[runs.json](runs.json)。桌面和手机操作录屏见索引对应实际文件；全部历史失败目录保留。

补充验收环境：开发服务器曾出现 `SyntaxError: Unexpected end of JSON input` 与页面初始化/滚动恢复干扰；未修改项目配置掩盖。最终使用 `tests/player-static-server.mjs` 提供仅用于验收的生产产物 HTTP Range 服务（5570），真实视频未模拟 play() 成功。旧简易5566服务失败证据保留。

## 最终构建验收

5570生产产物桌面与手机连续三轮全部通过：桌面 run-1793878881920、run-1793878889785、run-1793878897154；手机 mobile-1793878886851、mobile-1793878894451、mobile-1793878901730。各轮 results.json、截图与webm独立保存；Firefox通过结果见 firefox-*，真实慢流三轮见 lifecycle-*。

- [run-1793878897154 操作录屏](run-1793878897154/page@2362ebb4ac4f4c6672a8816a8521bd9f.webm)
- [mobile-1793878901730 操作录屏](mobile-1793878901730/page@98823b99fdbd5a8ecbc32007eb060cf4.webm)

[最终音量控件截图](run-1793878897154/elastic-volume.png) · [暂停与定位截图](run-1793878897154/paused-seek.png) · [手机截图](mobile-1793878901730/phone-controls.png)。

保留检查见 preservation.json：已有暂存内容与原有修改保留；registry配置未变，原锁定依赖未被升级，只增加两项所需图标依赖。
