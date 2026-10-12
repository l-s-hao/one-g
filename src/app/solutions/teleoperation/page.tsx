import CardHover from "@/components/CardHover";
import { LA, LArticle, LDd, LDiv, LDl, LDt, LFigcaption, LFigure, LH1, LH2, LH3, LLi, LP, LSection, LSmall, LUl } from "@/i18n/Elements";
import type { Metadata } from "next";
import { LocalizedImage as Image } from "@/i18n/Elements";
import { LocalizedLink as Link } from "@/i18n/Elements";
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
  return <LArticle className={styles.page}>
    <LDiv className={styles.container}>
      <LSection className={styles.hero} aria-labelledby="solution-title">
        <Link href="/solutions">返回解决方案</Link>
        <LP className={styles.eyebrow}>遥操作解决方案</LP>
        <LH1 id="solution-title">{content.name}</LH1><LP className={styles.subtitle}>{content.subtitle}</LP>
        <LP>{content.description}</LP>
        <LDiv className={styles.actions}><LA href="#technical">技术说明</LA><SupportButton inline textOnly label="联系我们" entry="solutions"/></LDiv>
        <LFigure className={styles.mainImage}><Image src={content.images[0]} alt={detail.imageNotes[0].alt} width={detail.imageNotes[0].width} height={detail.imageNotes[0].height} sizes="(max-width:767px) 90vw, 800px" loading="eager"/><LFigcaption>{detail.imageNotes[0].caption}</LFigcaption></LFigure>
        <LP className={styles.heroNotice}>{solution.boundary}</LP>
      </LSection>
      {detail.sections?.map(section => <LSection id={section.id} key={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
        <LP className={styles.eyebrow}>{section.eyebrow}</LP><LH2 id={`${section.id}-title`}>{section.title}</LH2>
        {section.paragraphs?.map(text => <LP key={text}>{text}</LP>)}
        {section.cards && <LDiv className={styles.grid}>{section.cards.map(card => <CardHover key={card.title}><LDiv data-card-hover-surface className={styles.card}><LH3>{card.title}</LH3><LP>{card.description}</LP>{card.items && <LUl>{card.items.map(item => <LLi key={item}>{item}</LLi>)}</LUl>}</LDiv></CardHover>)}</LDiv>}
        {section.media && <LDiv className={styles.media}>{section.media.map(media => <LFigure key={media.src}><Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width:767px) 100vw, 80vw"/><LFigcaption>{media.caption}</LFigcaption></LFigure>)}</LDiv>}
        {section.link && <LDiv className={styles.actions}><Link href={section.link.href}>{section.link.label}</Link></LDiv>}
      </LSection>)}
      <LSection id="technical" className={styles.section}><LH2>技术说明与部署边界</LH2><LDl className={styles.specs}>{content.specifications?.filter(spec => spec.label !== "价格 / 销售").map(spec => <LDiv key={spec.label}><LDt>{spec.label}</LDt><LDd>{spec.value}{spec.note && <LSmall>{spec.note}</LSmall>}</LDd></LDiv>)}</LDl><LDiv className={styles.actions}><SupportButton inline textOnly label="联系我们" entry="solutions"/></LDiv></LSection>
    </LDiv>
  </LArticle>;
}
