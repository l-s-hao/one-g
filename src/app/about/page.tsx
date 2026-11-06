import Image from "@/components/ContentImage";
import { LArticle, LDiv, LFigure, LH2, LH3, LHeader, LLi, LP, LSection, LUl, LocalizedLink as Link } from "@/i18n/Elements";
import AboutVision from "@/components/AboutVision";
import LanyardBrandSection from "@/components/LanyardBrandSection";
import AboutChapters from "@/components/AboutChapters";
import AboutHero from "@/components/AboutHero";
import MediaSources from "@/components/MediaSources";
import EvidenceVideos from "@/components/EvidenceVideos";
import SupportButton from "@/components/SupportButton";
import { aboutNavigation as links } from "@/lib/about-navigation";
import { getProductById } from "@/lib/products";
import styles from "./about.module.css";

export default function AboutPage() {
  const dockImage = getProductById("robotdock")?.detail?.imageNotes[0];
  return <LDiv className={styles.page}>
    <AboutChapters contents={{
      "company-introduction": <AboutHero />,
      "our-vision": <LSection className={`${styles.section} ${styles.statementSection}`} id="our-vision" aria-labelledby="vision-title">
        <LHeader className={styles.sectionLabel}><LH2 id="vision-title">我们的愿景</LH2></LHeader><AboutVision />
      </LSection>,
      "platform-route": <LArticle>
      <LSection className={styles.section} id="platform-route" aria-labelledby="route-title">
        <LH2 id="route-title">换了机器人，为什么还要从头开发？</LH2>
        <LP className={styles.lead}>换一种机器人、换一项任务，设备连接、软件适配与联调往往需要重新投入。</LP>
        <LDiv className={styles.routes}>
          <LDiv><LH3>运控：把动作做好。</LH3><LP>运控让机器人动得更稳、更准。</LP></LDiv>
          <LDiv><LH3>接入与场景：让任务用起来。</LH3><LP>接入与场景让设备和工具接得上，让任务用得起来。</LP></LDiv>
        </LDiv>
        <LP className={styles.note}>这是理解机器人开发的两个切入角度，两者互补，不代表全部技术路线。</LP>
      </LSection>
      {/* 保留旧定位锚点；目录将旧入口映射到同一平台路线章节。 */}
      <LSection className={styles.section} id="our-positioning" aria-labelledby="positioning-title">
        <LDiv id="integration-layer" className={styles.anchor} />
        <LH2 id="positioning-title">从接入层切入，连接运控、本体与场景。</LH2>
        <LDiv className={styles.integration}>
          <LDiv><LP className={styles.lead}>向上连接运控、向下理解本体，把这些工作落到具体场景。</LP>
            <LP className={styles.note}>四层关系用于解释开发分工，不代表已兼容所有机器人。</LP></LDiv>
          <LUl className={styles.layers} aria-label="机器人开发的四层关系">
            <LLi><LH3>大脑</LH3><LP>感知理解与任务决策</LP></LLi>
            <LLi><LH3>小脑 / 运控</LH3><LP>运动控制</LP><Link href={links.teleoperation}>了解遥操作方案</Link></LLi>
            <LLi className={styles.integrationLayer}><LH3>接入层</LH3><LP>计算、供电、通信与外设</LP><Link href={links.dock}>了解 RoboDock</Link></LLi>
            <LLi><LH3>本体</LH3><LP>承载动作的机器人硬件</LP><Link href={links.robots}>浏览现有机器人产品</Link><LP className={styles.note}>现有商品不等同于介绍视频中的项目设备。</LP></LLi>
          </LUl>
        </LDiv>
      </LSection>
      </LArticle>,
      "capabilities": <LArticle>
      <LSection className={styles.section} id="capabilities" aria-labelledby="capabilities-title">
        <LH2 id="capabilities-title">产品与能力</LH2>
        <LDiv className={styles.capability}>
          <LDiv><LH3>RoboDock 背包与开发平台方向</LH3>
            <LP>围绕机器人计算、供电、通信和外设接入，RoboDock 探索背包式接入与开发配套，面向设备接入、环境配置和联调诊断。</LP>
            <LP className={styles.note}>当前为概念产品预览，暂未开售；接口、兼容范围和软件交付以产品页已确认说明为准。</LP>
            <Link effect="invert" effectVariant="secondary" href={links.dock}>了解 RoboDock</Link></LDiv>
          {dockImage && <LFigure className={styles.productMedia}><Image src={dockImage.webSrc ?? getProductById("robotdock")!.images[0]} alt={dockImage.alt} width={dockImage.width} height={dockImage.height} sizes="(max-width:767px) 90vw, 540px" /></LFigure>}
        </LDiv>
        <LDiv className={`${styles.capability} ${styles.teleoperation}`}>
          <LDiv><LH3>人形机器人遥操作与全身控制</LH3>
            <LP>团队围绕人形机器人的遥操作与全身控制开展研究演示。现有 SONIC Link 方案介绍三点与全身遥操作方向；具体支持范围、版本及交付条件以方案页说明为准。</LP>
            <LDiv className={styles.actions}><Link effect="invert" effectVariant="secondary" href={links.teleoperation}>了解遥操作方案</Link><Link href={links.teleoperationSection}>查看方案场景</Link></LDiv></LDiv>
          <EvidenceVideos ids={["wholebody-balance"]} layout="feature" />
        </LDiv>
      </LSection>
      <MediaSources demoIds={["wholebody-balance"]} />
      </LArticle>,
      // 团队实践及本体设计仍未获发布确认，不生成空目录。
      "contact": <LSection className={styles.section} id="platform-direction" aria-labelledby="direction-title">
        <LH2 id="direction-title">把实践经验，沉淀为可复用的平台。</LH2>
        <LP className={styles.lead}>接入、运控、本体与场景中的经验，正在沉淀为可复用的平台。</LP>
        <LDiv className={styles.actions}><Link effect="invert" effectVariant="secondary" href={links.products}>浏览商品中心</Link><Link effect="invert" effectVariant="secondary" href={links.solutions}>查看解决方案</Link></LDiv>
        <LDiv id="contact" className={styles.contact}>
          <LH3 id="contact-title">联系我们</LH3>
          <SupportButton effect="invert" inline entry="about" className={styles.contactButton}/>
          <LP className={styles.contactNote}>登录后填写需求 · 当前仅支持前端预览</LP>
        </LDiv>
      </LSection>
    }} />
    <LanyardBrandSection />
  </LDiv>;
}
