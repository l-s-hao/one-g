import Image from "next/image";
import Link from "next/link";
import HomeFooter from "@/components/HomeFooter";
import ProductAdvertisement from "@/components/ProductAdvertisement";
import HomeVideoHero from "@/components/HomeVideoHero";
import SupportButton from "@/components/SupportButton";

import { getConfigurableOfferings } from "@/lib/configurable-offerings";
import styles from "@/components/SystemPages.module.css";

export default function HomePage() {
  const offerings = getConfigurableOfferings();
  return <div className="w-full"><HomeVideoHero /><ProductAdvertisement slides={offerings}/><div className={`${styles.page} ${styles.introductions}`}><div className={styles.container}>
    {offerings.map(({product,detail,anchor},index)=><section className={styles.section} id={anchor} key={product.id}>
      <p className={styles.eyebrow}>{index === 0 ? "01 / ROBOTDOCK" : "02 / SONIC LINK"}</p><h2>{product.name}</h2><p>{product.description}</p><p className={styles.notice}>{detail.statusNote}</p>
      {index === 0 ? <><div className={styles.hero}><figure><Image src={product.images[1]} alt={detail.imageNotes[1].alt} width={detail.imageNotes[1].width} height={detail.imageNotes[1].height} sizes="(max-width:767px) 100vw, 45vw"/><figcaption>{detail.imageNotes[1].caption}</figcaption></figure><div>{detail.highlights?.map(item=><article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>)}<h3>接口与集成</h3><p>{detail.interfaces?.join(" · ")}</p><p>{detail.interfaceNote}</p><p>{detail.compatibilityNote}</p></div></div></> : <>{detail.sections?.filter(s=>["overview","workflow","showcase"].includes(s.id)).map(section=><div key={section.id}><h3>{section.title}</h3>{section.paragraphs?.map(text=><p key={text}>{text}</p>)}<div className={styles.grid}>{section.cards?.map(card=><article className={styles.card} key={card.title}><h3>{card.title}</h3><p>{card.description}</p></article>)}</div>{section.id === "showcase" && <div className={styles.grid}>{section.media?.map(media=><figure key={media.src}><Image src={media.src} alt={media.alt} width={media.width} height={media.height} sizes="(max-width:767px) 100vw, 50vw"/><figcaption>{media.caption}</figcaption></figure>)}</div>}</div>)}</>}
      <details className={styles.card}><summary>技术规格与支持边界</summary><dl className={styles.specs}>{product.specifications?.map(spec=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}{spec.note&&<small>{spec.note}</small>}</dd></div>)}</dl></details>
      <div className={styles.actions}><Link href="/configure">查看配置</Link><Link href="/solutions">查看解决方案</Link></div>
    </section>)}
  </div></div><HomeFooter/><SupportButton/></div>;
}
