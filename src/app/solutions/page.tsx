import type { Metadata } from "next";
import Link from "next/link";
import SolutionExplorer from "@/components/SolutionExplorer";
import SupportButton from "@/components/SupportButton";
import styles from "./solutions.module.css";
export const metadata: Metadata = { title: "ONE-G 解决方案", description: "围绕 RobotDock 与 ONE-G 遥操作能力，展示面向不同机器人任务的应用方案与待验证边界。", alternates: { canonical: "https://l-s-hao.github.io/one-g/solutions/" } };
export default function SolutionsPage() {
  return <div className={styles.page}><div className={styles.container}>
    <nav aria-label="面包屑"><Link href="/">首页</Link> / 解决方案</nav>
    <header><p className={styles.eyebrow}>SOLUTIONS</p><h1>面向真实任务的机器人解决方案</h1>
      <div className={styles.contact}><SupportButton label="联系我们" entry="solutions" inline/></div>
      <p>从遥操作、巡检到搬运与智能任务，ONE-G 通过 RobotDock、SONIC Link 及标准机器人硬件能力，构建面向真实任务的系统方案。</p>
    </header>
    <SolutionExplorer />
  </div></div>;
}
