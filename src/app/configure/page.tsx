import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SupportButton from "@/components/SupportButton";
import ProductStatusBadge from "@/components/ProductStatusBadge";
import { getOfferingPackages } from "@/lib/configurable-offerings";
import styles from "@/components/SystemPages.module.css";
export const metadata: Metadata = { title: "ONE-G 配置套餐", description: "浏览 RobotDock 套装与 SONIC Link 遥操作系统组合。当前方案价格及交付条件待确认，可联系 ONE-G 咨询。", alternates: { canonical: "https://l-s-hao.github.io/one-g/configure/" } };
export default function ConfigurePage() {
  return <div className={styles.page}><div className={styles.container}>
    <nav aria-label="面包屑"><Link href="/">首页</Link> / 配置</nav><header><p className={styles.eyebrow}>CONFIGURE ONE-G</p><h1>配置套餐与系统组合</h1><p>了解套装包含内容，讨论适合任务的交付方案。当前暂未开放下单。</p></header>
    {getOfferingPackages().map(({product,detail,packages,anchor})=><section key={product.id} id={anchor} className={styles.section}>
      <p className={styles.eyebrow}>{product.name.toUpperCase()} / PACKAGES</p><h2>{product.name} 套餐</h2><ProductStatusBadge status={product.status}/><p className={styles.notice}>{detail.statusNote}</p><p>{detail.bundleNote}</p>
      <div className={styles.grid}>{packages.map(bundle=><article className={styles.card} key={bundle.id} data-package={bundle.id}><Image src={product.images[0]} alt={detail.imageNotes[0].alt} width={detail.imageNotes[0].width} height={detail.imageNotes[0].height} className={styles.packageImage} sizes="(max-width:767px) 100vw, 33vw"/><p className={styles.caption}>{detail.imageNotes[0].caption}</p><h3>{bundle.name}</h3><p>{bundle.description}</p><ul>{bundle.items.map(item=><li key={item}>{item}</li>)}</ul><p><ProductStatusBadge status={product.status}/> · 价格待定</p><SupportButton label="咨询标准套餐" inline/></article>)}</div>
      {detail.addOns?.map(item=><div className={styles.card} key={item.id}><h3>附加设备 · {item.name}</h3><p>{item.description}</p></div>)}
      <div className={styles.actions}><Link href={`/#${anchor}`}>了解{product.name} →</Link></div>
    </section>)}
    <section className={styles.section}><p className={styles.eyebrow}>COMBINED SYSTEM</p><h2>RobotDock + SONIC Link</h2><p>RobotDock 作为硬件集成载体，SONIC Link 提供动作采集与遥操作能力。SONIC Link 现有套装已包含通用小背包，整套方案不应重复计算背包与共用采集设备。</p><p className={styles.notice}>RobotDock 具体版本、末端适配与交付范围需逐项确认，不代表已验证的整套量产方案。所有套装均不包含机器人本体。</p></section>
    <section className={styles.section}><h2>标准套餐咨询与报价</h2><p>请与 ONE-G 确认目标机器人、末端设备、运行环境与交付条件。</p><div className={styles.actions}><SupportButton label="获取报价" inline/><Link href="/solutions">查看解决方案</Link></div></section>
    <section className={styles.section}><h2>没有找到适合的标准组合？</h2><p>超出标准套餐的机械、接口、适配或算法需求，可进入工程评估。</p><div className={styles.actions}><Link href="/deep-customization">深度定制 →</Link></div></section>
  </div></div>;
}
