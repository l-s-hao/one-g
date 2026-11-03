import { LA, LDiv, LFigcaption, LFigure, LH2, LLi, LNav, LP, LSection, LUl, LocalizedImage as Image, LocalizedLink as Link } from "@/i18n/Elements";
import { sectionDemos, solutionSections } from "@/lib/solution-sections";
import EvidenceVideos from "./EvidenceVideos";
import styles from "@/app/solutions/solutions.module.css";

/** 正文随页面输出；目录只定位，不以筛选、展开状态决定内容或播放器是否存在。 */
export default function SolutionSections() {
  return <>
    <LNav className={styles.directory} aria-label="场景目录">
      {solutionSections.map(solution => <LA key={solution.id} href={`#${solution.id}`}>{solution.name}</LA>)}
    </LNav>
    <LDiv className={styles.sections}>
      {solutionSections.map(solution => {
        const demos = sectionDemos[solution.id];
        return <LSection key={solution.id} id={solution.id} data-solution-section={solution.id} className={styles.section} aria-labelledby={`solution-${solution.id}`}>
          <LDiv className={styles.copy}>
            {/* 旧展开正文的 ID 保留为标题锚点；原 #handling 等入口仍直接落在所属分区。 */}
            <LH2 id={`solution-${solution.id}`}>{solution.name}{solution.content && ` · ${solution.content.name}`}</LH2>
            <LP className={styles.summary}>{solution.description}</LP>
            <LUl className={styles.capabilities}>{solution.capabilities.map(text => <LLi key={text}>{text}</LLi>)}</LUl>
            <LP className={styles.boundary}>{solution.boundary}</LP>
            {solution.id === "ai" && <LP className={styles.researchNote}>以下为相关研究演示，不是已交付的自主任务或通用智能功能。</LP>}
            {solution.detailHref && <Link href={solution.detailHref} effect="invert" effectVariant="secondary" intent="ordinary" className={styles.detailLink}>了解 SONIC Link <span aria-hidden="true">→</span></Link>}
          </LDiv>
          <LDiv className={styles.media}>
            {demos ? <EvidenceVideos ids={demos} layout="feature" /> : <LFigure className={styles.hardwareReference}>
              <Image src={solution.media.src} alt={solution.media.alt} width={solution.media.width} height={solution.media.height} sizes="(max-width:767px) 80vw, 360px" />
              <LFigcaption><LP>硬件规划参考，非巡检部署实拍。</LP><LP>{solution.media.caption}</LP></LFigcaption>
            </LFigure>}
          </LDiv>
        </LSection>;
      })}
    </LDiv>
  </>;
}
