import StaggerGroup from "@/components/StaggerGroup";
import CardHover from "@/components/CardHover";
import { LArticle, LBr, LDiv, LH1, LH2, LH3, LHeader, LNav, LP, LSection, LSpan } from "@/i18n/Elements";
import type { Metadata } from "next";
import { LocalizedLink as Link } from "@/i18n/Elements";
import { Suspense } from "react";
import { getOfferingPackages } from "@/lib/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import SupportButton from "@/components/SupportButton";
import PurchaseReturnLink from "./PurchaseReturnLink";
import styles from "./deep-customization.module.css";
export const metadata: Metadata = { title: "深度定制 | ONE-G", description: "当标准配置无法覆盖需求时，了解 ONE-G 机械、电气、软件与机器人集成的工程评估流程。", alternates: { canonical: "https://l-s-hao.github.io/one-g/deep-customization/" } };
const areas = [
  ["机械结构", "非标准结构、特殊尺寸与重新开模需求。"],
  ["硬件与接口", "特殊电气接口、通信协议与专用感知系统。"],
  ["机器人适配", "特定本体、末端设备与客户现场的集成适配。"],
  ["软件与算法", "专用算法、软件集成、联合研发与客户专属方案。"],
];
const process = [["提交需求", "说明任务、目标设备与约束条件。"], ["工程评估", "评估可行性、范围和需要验证的事项。"], ["方案确认", "协商交付范围、验收方式、周期与报价。"], ["开发 / 集成", "按确认的方案推进开发、集成与验证。"]];
export default function DeepCustomizationPage() {
  const destinations = getOfferingPackages().map(({ product, packages }) => ({
    product: product.slug,
    href: getOfferingNavigation(product).purchaseHref,
    packages: packages.map(bundle => bundle.id),
  }));
  return <LDiv className={styles.page}><LDiv className={styles.container}><LNav aria-label="面包屑"><Link href="/">首页</Link> / 深度定制</LNav>
    <LHeader><LH1>超出标准配置，<LBr/>进入工程级定制。</LH1><Suspense fallback={<Link intent="ordinary" href="/products">← 返回购买</Link>}><PurchaseReturnLink destinations={destinations}/></Suspense></LHeader>
    <LSection><LH2>定制范围</LH2><StaggerGroup className={styles.grid}>{areas.map(([title,text])=><CardHover key={title}><LArticle data-card-hover-surface><LH3>{title}</LH3><LP>{text}</LP></LArticle></CardHover>)}</StaggerGroup></LSection>
    <LSection><LH2>定制流程</LH2><StaggerGroup as="ol" className={styles.process}>{process.map(([title,text],i)=><CardHover as="li" key={title}><LDiv data-card-hover-surface><LSpan>{String(i+1).padStart(2,"0")}</LSpan><LH3>{title}</LH3><LP>{text}</LP></LDiv></CardHover>)}</StaggerGroup></LSection>
    <LSection><LH2>提交深度定制需求</LH2><LP>登录后填写深度定制需求，当前仅支持前端预览。</LP><SupportButton effect="invert" label="提交深度定制需求" entry="deep" inline/></LSection>
  </LDiv></LDiv>;
}
