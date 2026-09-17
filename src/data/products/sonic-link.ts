import type { Product } from "@/types/product";

// Source: xuanqisun/sonic-link-demo @ d6f8b26b1cdc3f56f6b6e4091342a56228527b9c.
// README, dist/index.html and dist/app.js. Editorial facts only; no configuration state.
const asset = (name: string) => `/one-g/products/sonic-link/${name}`;
const bundles = [
  { id: "three", name: "三点遥操", description: "独立三点模式，不包含全身模式与脚环。", items: ["PICO 头显 × 1", "手柄 × 2", "SONIC Link 三点模式软件", "通用小背包（机器人拓展坞）"] },
  { id: "full", name: "全身遥操", description: "独立全身模式，不包含三点模式。", items: ["PICO 头显 × 1", "手柄 × 2", "脚环 × 2", "SONIC Link 全身模式软件", "通用小背包（机器人拓展坞）"] },
  { id: "dual", name: "双模式套装", description: "同时包含三点与全身模式，共用一套采集硬件。", items: ["PICO 头显 × 1", "手柄 × 2", "脚环 × 2", "SONIC Link 三点 + 全身模式软件", "通用小背包（机器人拓展坞）"] },
];

const addOns = [{ id: "gripper", name: "智元夹爪", description: "面向主动抓取需求。型号、数量与支持功能待确认；未选配时沿用 G1 自带橡胶手。", items: ["智元夹爪（型号与数量待确认）"] }];

export const sonicLinkProduct: Product = {
  id: "sonic-link", slug: "sonic-link", name: "SONIC Link", category: "accessory",
  subtitle: "面向宇树 G1 的遥操作软硬件方案",
  description: "通过 PICO 设备采集人的动作，配合 SONIC Link 遥操作软件与通用小背包，提供三点或全身遥操作。方案不含机器人本体。",
  status: "coming-soon", featured: false,
  images: [asset("device-pico-kit.jpg"), asset("software-console-early.png"), asset("demo-grasp.jpg"), asset("demo-motion.jpg")],
  specifications: [
    { label: "目标平台", value: "宇树 G1", note: "EDU 版本及二次开发权限需确认；G1+ 适配情况待确认。" },
    { label: "动作采集", value: "PICO 头显与手柄；全身及双模式另含脚环", note: "具体设备型号待确认；各方案数量见遥操方式。" },
    { label: "软件模式", value: "三点 / 全身；双模式套装同时包含两者", note: "三点与全身均为团队已有技术。" },
    { label: "末端设备", value: "智元夹爪可选，型号、数量与支持功能待确认", note: "不加购时沿用 G1 自带橡胶手，不额外交付；固定橡胶手不具备主动开合抓取能力。" },
    { label: "运行环境", value: "电脑、网络条件与现场部署要求待确认", note: "尚无确认的操作系统支持列表、延迟、频率或精度参数。" },
    { label: "交付范围", value: "对应模式软件与采集硬件、通用小背包；不含机器人本体", note: "软件授权、安装调试、培训、售后范围与交期需确认。" },
    { label: "价格 / 销售", value: "价格待定，暂未开放下单" },
  ],
  detail: {
    statusNote: "遥操作方案预览 · 暂未开放下单。三点与全身遥操均为已有技术；价格、设备型号与交付条件待确认。",
    imageNotes: [{ alt: "SONIC Link 方案中的 PICO 头显和两个手柄实拍", caption: "团队设备实拍 · 脚环未入镜；机器人本体不包含在方案中。", width: 4000, height: 3000 }],
    bundles,
    addOns,
    sections: [
      { id: "overview", eyebrow: "01 / WHAT IS SONIC LINK", title: "动作采集、遥操软件与机器人端接入。", paragraphs: ["SONIC Link 将 PICO 采集设备、对应模式软件和通用小背包组成遥操作方案，面向宇树 G1。三点与全身是两种独立功能，也可通过双模式套装同时获得。"] },
      { id: "modes", eyebrow: "02 / TELEOPERATION MODES", title: "两种遥操方式，三档方案。", cards: bundles.map(bundle => ({ title: bundle.name, description: bundle.description, items: bundle.items })), paragraphs: ["以下为产品方案说明，所有套餐均含对应模式软件与通用小背包。双模式共用硬件，不重复配备。"] },
      { id: "system", eyebrow: "03 / HARDWARE & SYSTEM", title: "采集设备与机器人端系统组成。", cards: [
        { title: "PICO 采集设备", description: "三点使用一个头显、两个手柄；全身及双模式增加两个脚环。具体设备型号待确认。" },
        { title: "通用小背包", description: "集中接入机器人端外设，配套所选末端的连接与适配。" },
        { title: `可选${addOns[0].name}`, description: addOns[0].description },
        { title: "三点版后续升级", description: "保留三点能力，解锁全身软件并另获两个 PICO 脚环，沿用原头显、手柄与小背包。升级价格及办理方式待确认，不属于首次方案默认交付。" },
      ], link: { href: "/products/robotdock", label: "了解通用小背包 →" } },
      { id: "workflow", eyebrow: "04 / SOFTWARE WORKFLOW", title: "连接检查、人体校准、人工确认后启动。", cards: [
        { title: "01 检查连接与环境", description: "按引导核查运行环境、PICO 采样与机器人状态。" },
        { title: "02 人体校准", description: "完成校准与接管前检查，确认现场安全。" },
        { title: "03 确认并启动", description: "准备完成后点击启动遥操作，接管前仍需人工确认。" },
      ], media: [{ src: asset("software-console-early.png"), alt: "SONIC Link 早期控制台截图，三点待开发是历史标注", caption: "早期界面示例，交付界面以实际版本为准。图中的三点“待开发”为历史状态；GEM 不在本方案范围内，检查记录不代表实时在线状态。截图内标识仅为历史界面内容。", width: 3374, height: 1418 }] },
      { id: "showcase", eyebrow: "05 / SHOWCASE", title: "遥操作使用实拍。", paragraphs: ["以下为真实使用示例，不属于性能规格，也不代表所有动作和场地均可直接复现。操作需在受控场地进行，预留安全距离并配备急停。"], media: [
        { src: asset("demo-grasp.jpg"), alt: "操作者佩戴 VR 设备，机器人配合进行玩偶抓取的使用示例", caption: "抓取使用示例 · 团队提供实拍。", width: 2400, height: 1080 },
        { src: asset("demo-motion.jpg"), alt: "操作者与机器人展开双臂、抬起一条腿的动作示例", caption: "全身动作示例 · 团队提供实拍。", width: 2400, height: 1080 },
      ] },
    ],
  },
};
