import { robotDockProduct } from "./products/robotdock";
import { sonicLinkProduct } from "./products/sonic-link";
import type { Solution } from "@/types/solution";

const demoMedia = sonicLinkProduct.detail!.sections!.find(section => section.id === "showcase")!.media!;
const dockMedia = (index: number) => ({ src: robotDockProduct.images[index], ...robotDockProduct.detail!.imageNotes[index] });
export const solutionCategories = [
  { id: "all", name: "全部" }, { id: "execution", name: "作业执行" },
  { id: "remote", name: "远程操作" }, { id: "perception", name: "感知与巡检" },
  { id: "intelligence", name: "智能能力" },
] as const;

// Editorial successors to the four former robotScenes. No selection/recommendation state.
// Capability evidence: existing RobotDock and SONIC Link product records.
export const solutions: readonly Solution[] = [
  { id: "handling", category: "execution", problem: "需要验证重复抓取、物料操作或人工遥操作任务。", media: demoMedia[0], name: "搬运", subtitle: "从抓取实验理解物料操作。", description: "以 RobotDock 的末端接入规划为基础，结合 SONIC Link 的人工遥操作能力开展任务验证。", capabilities: ["RobotDock 规划夹爪连接、专用线束与对应驱动。", "SONIC Link 已有抓取使用实拍，可用于了解人工遥操作过程。"], productIds: ["robotdock", "sonic-link"], boundary: "当前不是已交付的自动搬运方案；载荷、节拍与具体物料适配需验证。" },
  { id: "inspection", category: "perception", problem: "需要在机器人端接入视觉设备，观察现场变化。", media: dockMedia(0), name: "巡检", subtitle: "持续观察，发现现场变化。", description: "以视觉采集和机器人端设备接入为起点，讨论现场观察任务。", capabilities: ["RobotDock 规划双腕相机套装，用于腕部视觉采集。", "通信与驱动需要针对具体设备适配。"], productIds: ["robotdock"], boundary: "当前资料未确认自主巡检、导航或异常识别交付能力；需要结合现场需求评估。" },
  { id: "teleoperation", category: "remote", problem: "需要将人的动作与判断传递到机器人端。", media: demoMedia[1], name: "遥操作", subtitle: "让人的动作连接机器人。", description: "通过 PICO 动作采集、SONIC Link 软件与机器人端接入理解遥操作工作流。", capabilities: ["三点与全身遥操均为团队已有技术。", "连接检查、人体校准和人工确认后启动。"], productIds: ["robotdock", "sonic-link"], boundary: "面向宇树 G1，具体版本、权限与运行条件待确认；使用实拍不等于性能或场地适应性保证。" },
  { id: "ai", category: "intelligence", problem: "需要为智能任务研究采集动作与视觉数据。", media: dockMedia(1), name: "智能任务", subtitle: "为科研与数据采集建立硬件接入基础。", description: "围绕灵巧操作、腕部视觉与遥操作，探索面向智能任务的数据采集。", capabilities: ["RobotDock 规划灵巧手与腕部相机接入。", "ROS 2、DDS 与 Python SDK 属于规划中的软件接口。"], productIds: ["robotdock"], boundary: "尚无已确认的 AI 模型、训练平台或自主任务交付清单，不将规划描述为现成功能。" },
];
