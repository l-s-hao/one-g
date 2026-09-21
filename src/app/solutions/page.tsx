import type { Metadata } from "next";
import Link from "next/link";
import SolutionExplorer from "@/components/SolutionExplorer";
import styles from "./solutions.module.css";
export const metadata: Metadata = { title: "ONE-G 解决方案", description: "围绕 RobotDock 与 ONE-G 遥操作能力，展示面向不同机器人任务的应用方案与待验证边界。", alternates: { canonical: "https://l-s-hao.github.io/one-g/solutions/" } };
export default function SolutionsPage() {
  return <div className={styles.page}><div className={styles.container}>
    <nav aria-label="面包屑"><Link href="/">首页</Link> / 解决方案</nav>
    <header><p className={styles.eyebrow}>SOLUTIONS</p><h1>面向真实任务的机器人解决方案</h1><p>从遥操作、巡检到搬运与智能任务，ONE-G 通过 RobotDock、SONIC Link 及标准机器人硬件能力，构建面向真实任务的系统方案。</p></header>
    <SolutionExplorer />
    <section className={styles.cta}><p className={styles.eyebrow}>SYSTEM CAPABILITIES</p><h2>把任务、控制与硬件接入联系起来。</h2><div className={styles.capabilities}><p><strong>RobotDock</strong><br/>硬件集成</p><p><strong>SONIC Link</strong><br/>遥操作</p><p><strong>标准机器人硬件</strong><br/>执行与感知</p></div><ol className={styles.flow}>{["Operator / Task", "SONIC Link", "RobotDock", "Robot / Sensor / End Effector"].map((text,i)=><li key={text}><span>{String(i+1).padStart(2,"0")} →</span>{text}</li>)}</ol><p className={styles.related}>以上是角色关系示意。具体任务按能力组合；RobotDock 接口与设备适配、整套交付范围仍需确认，不代表已完成所有场景验证。</p></section>
    <section className={styles.cta}><h2>标准方案无法满足需求？</h2><div className={styles.actions}><Link href="/deep-customization">深度定制</Link><Link href="/">查看标准配置</Link></div></section>
  </div></div>;
}
