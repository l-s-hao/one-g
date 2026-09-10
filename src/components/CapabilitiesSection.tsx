import Image from "next/image";
import { getCapabilities, getBrandAdvantages } from "@/lib/capabilities";
import styles from "./CapabilitiesSection.module.css";

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className={styles.section} aria-labelledby="capabilities-title">
      <div className={`home-content-shell ${styles.container}`}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>04 / CAPABILITIES</p>
          <h2 id="capabilities-title" className={styles.title}>WHAT ONE-G<br />CAN DO</h2>
        </div>

        <div className={styles.scenes}>
          {getCapabilities().map(scene => (
            <article key={scene.id} className={styles.scene} aria-labelledby={`capability-${scene.id}`}>
              <Image src={scene.image} alt={scene.imageAlt} fill sizes="(max-width: 767px) 100vw, 50vw" className={styles.image} />
              <div className={styles.shade} aria-hidden="true" />
              <div className={styles.sceneCopy}>
                <h3 id={`capability-${scene.id}`} className={styles.sceneName}>{scene.name}</h3>
                <p className={styles.englishName}>{scene.englishName}</p>
                <p className={styles.description}>{scene.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.advantages}>
          <h3 className={styles.whyTitle}>WHY ONE-G</h3>
          <ol className={styles.advantageList}>
            {getBrandAdvantages().map((advantage, index) => (
              <li key={advantage.id} className={styles.advantage}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <h4 className={styles.advantageEnglish}>{advantage.englishName}</h4>
                <p className={styles.advantageName}>{advantage.name}</p>
                <p className={styles.advantageDescription}>{advantage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
