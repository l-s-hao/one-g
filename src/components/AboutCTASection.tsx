import Image from "next/image";
import Link from "next/link";
import { ProtectedLink } from "./ProtectedLink";
import { ArrowRight } from "lucide-react";
import { siteContent } from "@/data/site-content";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import styles from "./AboutCTASection.module.css";
import FinalCTAParticleTitle from "./FinalCTAParticleTitle";

export default function AboutCTASection() {
  const content = siteContent.homeClosing;
  return (
    <section id="about-one-g" className={styles.section} aria-labelledby="about-one-g-title">
      <div className={`home-content-shell ${styles.container}`}>
        <div className={styles.company}>
          <div className={styles.companyCopy}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h2 id="about-one-g-title" className={styles.companyName}>{content.companyName}</h2>
            <p className={styles.description}>{content.companyDescription}</p>
            <Link href={content.aboutLink.href} className={styles.aboutLink}>{content.aboutLink.label} <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <Link href={content.aboutLink.href} className={styles.visual} aria-label={content.aboutLink.label}>
            <Image src={content.image} alt={content.imageAlt} fill sizes="(max-width: 767px) 100vw, 60vw" className={styles.image} />
          </Link>
        </div>

        <div className={styles.closing} aria-labelledby="closing-title">
          <h3 id="closing-title" className="sr-only">BUILD YOUR ONE-G</h3>
          <div className={styles.particleTitle} aria-hidden="true">
            <FinalCTAParticleTitle />
          </div>
          <p className={styles.closingDescription}>{content.finalDescription}</p>
          <div className={styles.actions}>
            <ShimmerButton href={content.primaryAction.href} className="min-h-14 min-w-44 px-8">{content.primaryAction.label}</ShimmerButton>
            <ProtectedLink href={content.secondaryAction.href} className={styles.secondary}>{content.secondaryAction.label}</ProtectedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
