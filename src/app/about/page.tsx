import Image from "next/image";
import { siteContent } from "@/data/site-content";

export default function AboutPage() {
  const content = siteContent.homeClosing;
  return <>
    <h1 className="desktop-about-title text-3xl font-semibold">了解公司</h1>
    <article className="mobile-only mobile-page about-page">
      <h1>{content.companyName}</h1>
      <p>{content.companyDescription}</p>
      <div className="about-image relative"><Image src={content.image} alt={content.imageAlt} fill sizes="100vw" className="object-cover" /></div>
      <section><h2>品牌与公司</h2><p>{content.finalDescription}</p></section>
      <section><h2>联系我们</h2><p>{siteContent.contactPlaceholder}</p></section>
    </article>
  </>;
}
