import Image from "@/components/ContentImage";
import { LA, LDiv, LFigure, LH2, LLi, LNav, LP, LSection, LUl, LocalizedLink as Link } from "@/i18n/Elements";
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
            <LP className={styles.boundary}>{solution.boundary}{" "}
              {solution.id === "teleoperation" && "片段为受控场地研究演示，未证实已由 RoboDock 接入。"}
              {solution.id === "handling" && "实拍未证实由 RoboDock 驱动。"}
              {solution.id === "inspection" && "配图为概念硬件参考，不是巡检部署实拍。"}
            </LP>
            {solution.id === "ai" && <LP className={styles.researchNote}>舞蹈与音乐片段用于相关研究展示；音乐片段为仿真，尚未确认与 SONIC Link 或 RoboDock 集成。</LP>}
            {solution.detailHref && <Link href={solution.detailHref} effect="invert" effectVariant="secondary" intent="ordinary" className={styles.detailLink}>了解 SONIC Link <span aria-hidden="true">→</span></Link>}
          </LDiv>
          <LDiv className={styles.media}>
            {demos ? <EvidenceVideos ids={demos} layout="feature" /> : <LFigure className={styles.hardwareReference}>
              <Image src={solution.media.src} alt={solution.media.alt} width={solution.media.width} height={solution.media.height} sizes="(max-width:767px) 80vw, 360px" />
            </LFigure>}
          </LDiv>
        </LSection>;
      })}
    </LDiv>
  </>;
}
