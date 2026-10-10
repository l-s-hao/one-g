import { LDiv, LH1, LSection } from "@/i18n/Elements";
import MicroSlats from "./MicroSlats/MicroSlats";
import TechText from "./TechText";
import LocalEffectBoundary from "./LocalEffectBoundary";
import styles from "./HomeTechTextHero.module.css";

export default function HomeTechTextHero() {
  return <LSection className={styles.hero} aria-labelledby="home-brand-title">
    <div className={styles.background} aria-hidden="true">
      <LocalEffectBoundary><MicroSlats preset="swell" color="#3A73D9" glintColor="#FFFFFF" backgroundColor="#F7F4EE"
        slatWidth={16} slatHeight={35} gap={3} roundness={0.75} interactive
        cursorStrength={1} cursorSize={40} swirl={0} trail={1.4} lean={0} intro /></LocalEffectBoundary>
    </div>
    <LH1 id="home-brand-title" className="sr-only">ONE-G</LH1>
    <LDiv className={styles.canvas} aria-hidden="true">
      <TechText text="ONE - G" fontWeight={600} fontSize={240} reveal="letter"
        dashLength={4} dashGap={2} specks={15} color="#17191D" accentColor="#3A73D9" />
    </LDiv>
  </LSection>;
}
