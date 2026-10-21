import type { Product } from "@/types/product";

// Source notes: robotdock-demo @ 4b0e92f0f40f652241a123417dd1d54a06678074; see media-sources.json.
// Existing package preview is intentionally retained independently of newer source planning.
// Project-owned assets used under STEP 6 instructions; see docs/reference-integration.md.
export const robotDockProduct: Product = {
  id: "robotdock", slug: "robotdock", name: "RoboDock", category: "robot",
  subtitle: "通用机器人小背包",
  description: "规划将供电管理、通信接入和设备驱动集成到机器人背部小背包，配合专用线束与手腕连接件接入夹爪和灵巧手。",
  status: "concept", featured: false,
  images: ["/one-g/products/robotdock/robotdock-concept.png", "/one-g/products/robotdock/installation-sketch.png"],
  specifications: [
    { label: "通信接口", value: "CAN / RS-485 / Ethernet / USB", note: "拟定方案，数量与电气规格待确认。" },
    { label: "供电能力", value: "集中供电与保护（规划）", note: "电压、功率及取电方式待确认。" },
    { label: "软件接口", value: "基础 SDK / 驱动 / 文档（规划）", note: "ROS 2、DDS 与 Python 接口范围待确认。" },
    { label: "主控规划", value: "接入版 Orin Nano 8GB；板载版 Orin NX 16GB", note: "暂定规划，性能与适配仍需验证。" },
    { label: "存储容量", value: "容量与规格待确认" },
    { label: "安装方式", value: "背部安装 + 专用线束 + 手腕转接件" },
    { label: "换装方式", value: "外设独立断电换装（规划）", note: "暂停任务、安全停稳后换装并加载配置，以减少整机重启；G1+ 适配、分路供电控制和热插拔能力仍待验证。" },
    { label: "尺寸 / 重量", value: "待结构设计与样机验证后公布" },
    { label: "价格 / 交付", value: "价格待定，暂未开放销售", note: "型号与交付日期未确认，套装不包含机器人本体。" },
  ],
  detail: {
    statusNote: "首代产品构想 · 仅供方案讨论，暂未开放销售。RoboDock 为暂定展示名称；外观、接口、兼容范围与交付内容待最终确认。",
    sourceNotes: [
    {
        "id": "design-evidence",
        "title": "外观与安装构想",
        "paragraphs": [
            "概念图依据团队草图生成，安装草图用于讨论背部安装、专用线束与手腕连接件；两者均不代表最终结构、接口数量或实物交付。"
        ],
        "sourceHref": "https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/README.md#L55"
    },
    {
        "id": "compute-evidence",
        "title": "计算与外设接入 · 规划说明",
        "paragraphs": [
            "参考方案区分外部计算设备运行程序、背包内开发部署，以及按需适配预设应用三种使用方向。接入版主控暂定 Orin Nano 8GB，板载版暂定 Orin NX 16GB；这些是规划参数，尚非已验证规格。",
            "基础 SDK、驱动与文档属于规划交付说明；ROS 2、DDS 与 Python 接口范围、存储容量、Web 功能及记录范围仍待验证或确认。应用示例限已验证组合，并需安装与标定，不代表所有外设或应用已交付。"
        ],
        "sourceHref": "https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/dist/index.html#L48"
    },
    {
        "id": "safety-evidence",
        "title": "供电与安全换装边界",
        "paragraphs": [
            "集中供电与保护、CAN / RS-485 / Ethernet / USB 均为规划方案。电压、功率、取电方式、接口数量和电气规格没有确认数值；不能从概念图推导。",
            "换装构想要求暂停任务、安全停稳、外设独立断电，换装后加载对应配置。G1+ 适配、分路供电控制与热插拔仍待验证；不将设计目标表述为带电换装能力。"
        ],
        "sourceHref": "https://github.com/xuanqisun/robotdock-demo/blob/4b0e92f0f40f652241a123417dd1d54a06678074/dist/index.html#L78"
    }
],
    imageNotes: [
      { webSrc: "/one-g/products/robotdock/robotdock-concept.webp", alt: "RoboDock 石墨灰小背包 AI 概念效果图，非实物照片", caption: "AI 概念效果图 · 根据团队草图生成，非实物照片。", width: 1254, height: 1254 },
      { webSrc: "/one-g/products/robotdock/installation-sketch.webp", alt: "团队提供的机器人背部安装参考草图，非最终适配图", caption: "团队安装参考草图 · 非最终本体适配图。", width: 946, height: 1208 },
    ],
    highlights: [
      { title: "集中供电", description: "规划在背包内集成供电管理与保护，减少分散电源和重复接线。" },
      { title: "统一通信", description: "规划整合通信接口与驱动软件，为选定外设提供统一的安装、配置和调用入口。" },
      { title: "快速换装", description: "面向已适配设备，配套线束、机械连接件和对应驱动，简化安装调试；不代表任意设备兼容或带电热插拔。" },
    ],
    interfaces: ["CAN", "RS-485", "Ethernet", "USB"],
    interfaceNote: "接口方案拟定，数量与电气规格待确认；协议和驱动需要逐设备适配。",
    compatibility: [
      { name: "宇树 G1", status: "适配目标", description: "首发本体适配目标，具体版本待确认；G1+ 适配仍待验证。" },
      { name: "智元夹爪", status: "已有接入基础", description: "团队已有接入成果，具体产品型号与量产适配待确认。" },
      { name: "灵巧手", status: "规划接入", description: "品牌、型号与控制功能待选定。" },
    ],
    compatibilityNote: "已有接入基础不等于量产验证；兼容范围、安装方式和支持功能以后续测试结果为准。",
    bundles: [
      { id: "base", name: "小背包", description: "面向已有末端设备、计划自行拓展的开发团队。", items: ["背包主机", "基础软件与说明", "本体连接线束"] },
      { id: "hand", name: "小背包 + 灵巧手（送连接件）", description: "面向灵巧操作、科研与数据采集；灵巧手品牌和型号待选定。", items: ["背包主机", "指定灵巧手（待选型）", "设备专用线束", "连接件（赠送）", "对应驱动与安装说明"] },
      { id: "gripper", name: "小背包 + 夹爪（送连接件）", description: "基于团队接入基础规划抓取套装，夹爪型号待确认。", items: ["背包主机", "夹爪（型号待确认）", "设备专用线束", "连接件（赠送）", "对应驱动与安装说明"] },
      { id: "gripper-camera", name: "小背包 + 夹爪 + 双腕相机（送连接件）", description: "面向抓取实验与腕部视觉采集，含两台腕部相机，设备型号待确认。", items: ["背包主机", "夹爪（型号待确认）", "双腕相机（2台，型号待确认）", "设备专用线束", "连接件（赠送）", "对应驱动与安装说明"] },
    ],
    bundleNote: "四种套装均为配置预览，不下单、不付款；机器人本体不包含在套装中。",
  },
};
