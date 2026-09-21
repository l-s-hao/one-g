import type { Metadata } from "next";
import Link from "next/link";
import SupportButton from "@/components/SupportButton";
import styles from "./deep-customization.module.css";
export const metadata: Metadata = { title: "深度定制 | ONE-G", description: "当标准配置无法覆盖需求时，了解 ONE-G 机械、电气、软件与机器人集成的工程评估流程。", alternates: { canonical: "https://l-s-hao.github.io/one-g/deep-customization/" } };
const areas = [
  ["机械结构", "非标准结构、特殊尺寸与重新开模需求。"],
  ["硬件与接口", "特殊电气接口、通信协议与专用感知系统。"],
  ["机器人适配", "特定本体、末端设备与客户现场的集成适配。"],
  ["软件与算法", "专用算法、软件集成、联合研发与客户专属方案。"],
];
const process = [["提交需求", "说明任务、目标设备与约束条件。"], ["工程评估", "评估可行性、范围和需要验证的事项。"], ["方案确认", "协商交付范围、验收方式、周期与报价。"], ["开发 / 集成", "按确认的方案推进开发、集成与验证。"]];
export default function DeepCustomizationPage() {
  return <div className={styles.page}><div className={styles.container}><nav aria-label="面包屑"><Link href="/">首页</Link> / 深度定制</nav>
    <header><p className={styles.eyebrow}>DEEP CUSTOMIZATION</p><h1>超出标准配置，<br/>进入工程级定制。</h1><p>ONE-G 优先通过标准产品与标准配置满足需求。对于特殊机械、电气、软件和机器人集成需求，可进入深度定制评估。</p><Link href="/">先了解标准配置 →</Link></header>
    <section><p className={styles.eyebrow}>WHAT CAN BE CUSTOMIZED</p><h2>从需求出发，明确工程范围。</h2><div className={styles.grid}>{areas.map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section><p className={styles.eyebrow}>PROCESS</p><h2>先评估，再确认实施方案。</h2><ol className={styles.process}>{process.map(([title,text],i)=><li key={title}><span>{String(i+1).padStart(2,"0")}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
    <section><h2>提交深度定制需求</h2><p>通过电话或邮箱说明需求，联系 ONE-G 开始沟通。</p><SupportButton label="提交深度定制需求" panelTitle="联系 ONE-G · 深度定制需求" inline/></section>
  </div></div>;
}
