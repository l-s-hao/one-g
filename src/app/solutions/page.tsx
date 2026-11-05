import { LA, LDiv, LFigure, LH1, LHeader, LNav, LP, LocalizedImage as Image, LocalizedLink as Link } from "@/i18n/Elements";
import type { Metadata } from "next";
import { solutionSections } from "@/lib/solution-sections";
import MediaSources from "@/components/MediaSources";
import { sectionDemos } from "@/lib/solution-sections";
import SolutionSections from "@/components/SolutionSections";
import SupportButton from "@/components/SupportButton";
import { aboutNavigation } from "@/lib/about-navigation";
import styles from "./solutions.module.css";
export const metadata: Metadata = { title: "ONE-G 解决方案", description: "围绕 RoboDock 与 ONE-G 遥操作能力，展示面向不同机器人任务的应用方案与待验证边界。", alternates: { canonical: "https://l-s-hao.github.io/one-g/solutions/" } };
export default function SolutionsPage() {
  const scene = solutionSections[0].media;
  return <LDiv className={styles.page}><LDiv className={styles.container}>
    <LNav className={styles.breadcrumb} aria-label="面包屑"><Link href="/">首页</Link> / 解决方案</LNav>
    <LHeader className={styles.hero}>
      <LDiv className={styles.heroCopy}><LH1>面向真实任务的机器人解决方案</LH1>
        <LDiv className={styles.contact}><SupportButton effect="invert" label="联系我们" entry="solutions" inline /><LP className={styles.contactNote}>需求填写需登录，当前仅供前端预览。</LP></LDiv>
      </LDiv>
      <LFigure className={styles.heroMedia}>
        {/* 首屏只有封面链接，同一演示在下方只有一个播放器，不创建隐藏或自动播放的副本。 */}
        <LA href="#teleoperation" aria-label="查看遥操作演示"><Image src={scene.src} alt={scene.alt} width={scene.width} height={scene.height} sizes="(max-width:767px) 92vw, (max-width:1400px) 54vw, 720px" loading="eager" /></LA>
      </LFigure>
    </LHeader>
    <SolutionSections />
    <LP><Link href={aboutNavigation.platformRoute}>了解万机的平台路线</Link></LP>
    <MediaSources demoIds={Object.values(sectionDemos).flatMap(ids => ids ?? [])} />
  </LDiv></LDiv>;
}
