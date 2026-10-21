/* Source descriptions and media hashes: media-sources.json. No product or purchase state. */
export interface SolutionDemo {
  id: string; area: string; title: string; description: string; boundary: string; status: string; credit: string; src: string; poster: string; width: number; height: number; sourceHref: string; sourceLabel: string;
}
export const solutionDemos: readonly SolutionDemo[] = [
  {
    "id": "3pt-demo",
    "area": "teleoperation",
    "title": "三点 VR 遥操作",
    "description": "头显与两个手柄提供头部、双手输入；来源说明通过摇杆控制前后移动，无需脚踝追踪器。",
    "boundary": "来源将此模式链接至 SONIC Link 三点方案；视频未确认采集设备具体型号、软件版本或 RoboDock 驱动关系。",
    "status": "真实设备 · 研究演示",
    "credit": "研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）",
    "src": "/one-g/solutions/teleoperation/3pt-demo.mp4",
    "poster": "/one-g/solutions/teleoperation/3pt-demo-poster.webp",
    "width": 720,
    "height": 960,
    "sourceHref": "https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L186",
    "sourceLabel": "来源与演示说明 ↗"
  },
  {
    "id": "wholebody-balance",
    "area": "teleoperation",
    "title": "全身遥操作：单腿平衡",
    "description": "来源列出头显、双手柄与脚踝追踪器，画面展示操作者与 G1 的抬臂、抬腿和平衡动作。",
    "boundary": "来源链接 SONIC Link 全身方案；这是受控场地研究演示，不证明任意动作复现、通用稳定性或 RoboDock 接入。",
    "status": "真实设备 · 研究演示",
    "credit": "研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）",
    "src": "/one-g/solutions/teleoperation/wholebody-balance.mp4",
    "poster": "/one-g/solutions/teleoperation/wholebody-balance-poster.webp",
    "width": 1280,
    "height": 720,
    "sourceHref": "https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L97",
    "sourceLabel": "来源与演示说明 ↗"
  },
  {
    "id": "camera-teleop",
    "area": "teleoperation",
    "title": "单摄像头、无穿戴遥操作",
    "description": "来源说明使用单目相机捕捉人体动作，画面中操作者未佩戴头显或手柄，G1 配合展示上肢和身体动作。",
    "boundary": "相关演示候选：未找到此模式与当前 SONIC Link 软件或 RoboDock 的明确对应；相机型号与部署条件待确认。",
    "status": "相关研究 · 方案归属待确认",
    "credit": "研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）",
    "src": "/one-g/solutions/teleoperation/camera-teleop.mp4",
    "poster": "/one-g/solutions/teleoperation/camera-teleop-poster.webp",
    "width": 1280,
    "height": 720,
    "sourceHref": "https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L322",
    "sourceLabel": "来源与演示说明 ↗"
  },
  {
    "id": "wholebody-pick",
    "area": "handling",
    "title": "人工遥操作：抓取与取放",
    "description": "画面展示佩戴 VR 设备的操作者引导 G1 俯身抓取并提起玩偶。来源将其归为全身遥操作的抓取演示。",
    "boundary": "仅说明人工遥操作抓取验证；未证明自主搬运、载荷、节拍或由 RoboDock 驱动。",
    "status": "人工遥操作 · 真实设备",
    "credit": "研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）",
    "src": "/one-g/solutions/handling/wholebody-pick.mp4",
    "poster": "/one-g/solutions/handling/wholebody-pick-poster.webp",
    "width": 1280,
    "height": 720,
    "sourceHref": "https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L132",
    "sourceLabel": "来源与演示说明 ↗"
  },
  {
    "id": "dance-video-motion",
    "area": "intelligent-tasks",
    "title": "舞蹈视频到动作",
    "description": "来源将此片段描述为舞蹈视频动作复现；画面展示 G1 在室内完成连续舞蹈动作。",
    "boundary": "相关研究演示；片段未展示输入视频、处理流程或训练方法，不等于自主规划，也未确认属于 SONIC Link 应用包。",
    "status": "真实设备 · 相关研究",
    "credit": "研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）",
    "src": "/one-g/solutions/intelligent-tasks/dance-video-motion.mp4",
    "poster": "/one-g/solutions/intelligent-tasks/dance-video-motion-poster.webp",
    "width": 720,
    "height": 1280,
    "sourceHref": "https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L369",
    "sourceLabel": "来源与演示说明 ↗"
  },
  {
    "id": "music-motion",
    "area": "intelligent-tasks",
    "title": "音乐驱动动作：仿真",
    "description": "来源描述音乐驱动全身动作；实际画面为虚拟场景中的人形模型舞动，并非真实设备实拍。",
    "boundary": "仅作仿真研究展示；未确认模型权属、算法交付或与 SONIC Link、RoboDock 的集成，不代表通用智能或自主任务能力。",
    "status": "仿真 · 相关研究",
    "credit": "研究演示 · AI-CDR Center（Center for Artificial Intelligence and Cross-Domain Robotics）",
    "src": "/one-g/solutions/intelligent-tasks/music-motion.mp4",
    "poster": "/one-g/solutions/intelligent-tasks/music-motion-poster.webp",
    "width": 1440,
    "height": 952,
    "sourceHref": "https://github.com/xuanqisun/g1-humanoid-teleoperation/blob/0b1671685a9e075af44d60d16f89c75f090bc6aa/index.html#L418",
    "sourceLabel": "来源与演示说明 ↗"
  }
];
