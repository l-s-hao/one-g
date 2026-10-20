import { LDiv, LH1, LHeader, LNav, LP } from "@/i18n/Elements";
import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/i18n/Elements";
import SolutionExplorer from "@/components/SolutionExplorer";
import SupportButton from "@/components/SupportButton";
import styles from "./solutions.module.css";
export const metadata: Metadata = { title: "ONE-G 解决方案", description: "围绕 RoboDock 与 ONE-G 遥操作能力，展示面向不同机器人任务的应用方案与待验证边界。", alternates: { canonical: "https://l-s-hao.github.io/one-g/solutions/" } };
export default function SolutionsPage() {
  return <LDiv className={styles.page}><LDiv className={styles.container}>
    <LNav aria-label="面包屑"><Link href="/">首页</Link> / 解决方案</LNav>
    <LHeader><LP className={styles.eyebrow}>SOLUTIONS</LP><LH1>面向真实任务的机器人解决方案</LH1>
      <LDiv className={styles.contact}><SupportButton effect="specular" label="联系我们" entry="solutions" inline/></LDiv>
      <LP>从遥操作、巡检到搬运与智能任务，ONE-G 通过 RoboDock、SONIC Link 及标准机器人硬件能力，构建面向真实任务的系统方案。</LP>
    </LHeader>
    <SolutionExplorer />
  </LDiv></LDiv>;
}
