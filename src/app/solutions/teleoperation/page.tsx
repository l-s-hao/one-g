import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { solutions } from "@/data/solutions";
import SupportButton from "@/components/SupportButton";
import styles from "@/components/ProductDetailContent.module.css";

const solution = solutions.find(item => item.id === "teleoperation")!;
const content = solution.content!;
export const metadata: Metadata = {
  title: "SONIC Link 机器人遥操作解决方案 — ONE-G",
  description: solution.description,
  alternates: { canonical: "https://l-s-hao.github.io/one-g/solutions/teleoperation/" },
};
export default function TeleoperationPage() {
  const detail = content.detail!;
  return <article className={styles.page}>
    <div className={styles.container}>
      <section className={styles.hero} aria-labelledby="solution-title">
        <Link href="/solutions">返回解决方案</Link>
        <p className={styles.eyebrow}>遥操作解决方案</p>
        <h1 id="solution-title">{content.name}</h1><p className={styles.subtitle}>{content.subtitle}</p>
        <p>{content.description}</p>
        <div className={styles.actions}><a href="#technical">技术说明</a><SupportButton inline textOnly label="联系我们" entry="solutions"/></div>
        <figure className={styles.mainImage}><Image src={content.images[0]} alt={detail.imageNotes[0].alt} width={detail.imageNotes[0].width} height={detail.imageNotes[0].height} sizes="(max-width:767px) 90vw, 800px" loading="eager"/><figcaption>{detail.imageNotes[0].caption}</figcaption></figure>
        <p className={styles.heroNotice}>{solution.boundary}</p>
      </section>
      {detail.sections?.map(section => <section id={section.id} key={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
        <p className={styles.eyebrow}>{section.eyebrow}</p><h2 id={`${section.id}-title`}>{section.title}</h2>
        {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
        {section.cards && <div className={styles.grid}>{section.cards.map(card => <div className={styles.card} key={card.title}><h3>{card.title}</h3><p>{card.description}</p>{card.items && <ul>{card.items.map(item => <li key={item}>{item}</li>)}</ul>}</div>)}</div>}
        {section.media && <div className={styles.media}>{section.media.map(media => <figure key={media.src}><Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width:767px) 100vw, 80vw"/><figcaption>{media.caption}</figcaption></figure>)}</div>}
        {section.link && <div className={styles.actions}><Link href={section.link.href}>{section.link.label}</Link></div>}
      </section>)}
      <section id="technical" className={styles.section}><h2>技术说明与部署边界</h2><dl className={styles.specs}>{content.specifications?.filter(spec => spec.label !== "价格 / 销售").map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}{spec.note && <small>{spec.note}</small>}</dd></div>)}</dl><div className={styles.actions}><SupportButton inline textOnly label="联系我们" entry="solutions"/></div></section>
    </div>
  </article>;
}
