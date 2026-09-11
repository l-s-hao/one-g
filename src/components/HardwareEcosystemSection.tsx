import { ArrowRight } from "lucide-react";
import CustomizeWorkbench from "@/components/CustomizeWorkbench";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import styles from "./HardwareEcosystemSection.module.css";

export default function HardwareEcosystemSection() {
  return (
    <section id="hardware-ecosystem" className={styles.section} aria-labelledby="ecosystem-title">
      <div className={`home-content-shell ${styles.container}`}>
        <header className={styles.heading}>
          <p className={styles.eyebrow}>03 / HARDWARE ECOSYSTEM</p>
          <h2 id="ecosystem-title" className={styles.title}>BUILD YOUR <span>ONE-G</span></h2>
          <p className={styles.intro}>像搭积木一样组合你的机器人</p>
        </header>
        <CustomizeWorkbench mode="preview" />
        <div className={styles.cta}><ShimmerButton href="/customize/start" className="min-h-14 px-8">开始完整在线定制 <ArrowRight size={17} aria-hidden="true" /></ShimmerButton></div>
      </div>
    </section>
  );
}
