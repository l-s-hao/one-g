import { solutions } from "@/data/solutions";
import { LocalizedLink as Link, LH2, LH3, LP, LSpan } from "@/i18n/Elements";
import { LayoutGrid, type LayoutGridCard } from "./ui/layout-grid";
import styles from "./HomePreviews.module.css";

const solutionIds = ["teleoperation", "inspection", "handling", "ai"] as const;

export default function HomeSolutionsPreview() {
  const cards: LayoutGridCard[] = solutionIds.map(id => {
    const solution = solutions.find(item => item.id === id)!;
    return {
      id: solution.id,
      title: solution.content ? `${solution.name} · ${solution.content.name}` : solution.name,
      thumbnail: solution.media.src,
      imageAlt: solution.media.alt,
      width: solution.media.width,
      height: solution.media.height,
      fit: id === "teleoperation" || id === "handling" ? "cover" : "contain",
      wide: id === "teleoperation" || id === "ai",
      content: <>
        <LH3 id={`home-solutions-${id}-title`}>{solution.name}{solution.content && ` · ${solution.content.name}`}</LH3>
        <LP className={styles.positioning}>{solution.description}</LP>
        <LP className={styles.note}>{solution.boundary}</LP>
        <LP className={styles.caption}>{solution.media.caption}</LP>
        <Link intent="ordinary" className={styles.action} href={solution.detailHref ?? `/solutions#${solution.id}`}>了解方案</Link>
      </>,
    };
  });
  return <section id="home-solutions" className={styles.section} aria-labelledby="home-solutions-title">
    <div className={styles.heading}><LH2 id="home-solutions-title">解决方案</LH2><Link intent="ordinary" href="/solutions">查看全部方案 <LSpan aria-hidden="true">→</LSpan></Link></div>
    <LayoutGrid namespace="home-solutions" cards={cards}/>
  </section>;
}
