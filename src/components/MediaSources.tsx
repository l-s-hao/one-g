import { LA, LH2, LLi, LP, LSection, LUl } from "@/i18n/Elements";
import { solutionDemos } from "@/data/solution-demos";
import styles from "./MediaSources.module.css";

type Source = { title: string; sourceHref: string };

/** 署名按既有授权记录集中一次；媒体本体不再自动回退生成说明或来源链接。 */
export default function MediaSources({ demoIds = [], sources = [] }: { demoIds?: readonly string[]; sources?: readonly Source[] }) {
  const demos = solutionDemos.filter(demo => demoIds.includes(demo.id));
  const credits = [...new Set(demos.map(demo => demo.credit))];
  // 同一原始资料文件的多个行号合并为一个入口；保留实际原 URL，不拼造公开来源页。
  const research = [...new Map(demos.map(demo => [demo.sourceHref.split("#")[0], demo])).values()];
  if (!credits.length && !sources.length) return null;
  return <LSection className={styles.sources} id="media-sources" aria-labelledby="media-sources-title">
    <LH2 id="media-sources-title">资料来源</LH2>
    {credits.map(credit => <LP key={credit}>{credit}</LP>)}
    <LUl>{research.map(demo => <LLi key={demo.sourceHref}><LA href={demo.sourceHref} target="_blank" rel="noopener noreferrer">研究演示原始资料 ↗</LA></LLi>)}
      {sources.map(source => <LLi key={source.sourceHref}><LA href={source.sourceHref} target="_blank" rel="noopener noreferrer">{source.title}</LA></LLi>)}
    </LUl>
  </LSection>;
}
