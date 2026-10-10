"use client";

import { LButton, LDiv, LFooter, LH2, LLi, LNav, LP, LSection, LSpan, LUl } from "@/i18n/Elements";


import { LocalizedLink as Link } from "@/i18n/Elements";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { footerGroups } from "@/data/footer-navigation";
import { navigation } from "@/data/site-navigation";
import { siteContent } from "@/data/site-content";
import SupportButton from "./SupportButton";
import { isConfigurableOffering } from "@/data/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import { getProductBySlug } from "@/lib/products";
import { NavigationLink } from "./ProtectedLink";
import BrandLogo from "./BrandLogo";
import styles from "./Footer.module.css";

const routeNames: Record<string, string> = {
  ...Object.fromEntries(navigation.map(item => [item.href, item.label])),
  "/solutions/teleoperation": "遥操作 · SONIC Link",
  "/deep-customization": "深度定制", "/account": "用户中心", "/cart": "购物车",
  "/checkout": "结算", "/order-success": "订单完成",
};

export default function Footer() {
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const [expanded, setExpanded] = useState<number | null>(null);
  const product = (pathname.startsWith("/products/") || pathname.startsWith("/buy/")) ? getProductBySlug(pathname.split("/")[2]) : undefined;
  const offering = product && isConfigurableOffering(product.id);
  const specs = offering && pathname.endsWith("/specs");
  const title = pathname.startsWith("/buy/") && product ? `购买 ${product.name}` : specs ? "技术规格" : product?.name ?? routeNames[pathname];
  return <LFooter className={styles.footer} id="site-footer">
    <LDiv className={styles.container}>
      <LNav aria-label="页脚路径" className={styles.breadcrumb}>
        <Link href="/" aria-label="ONE-G 万机智能 首页"><BrandLogo variant="mark" size="sm" /></Link>
        {product && <><ChevronRight size={14} aria-hidden="true"/><Link href={offering ? "/" : "/products"}>{offering ? "产品与配置" : "商品中心"}</Link></>}
        {specs && product && <><ChevronRight size={14} aria-hidden="true"/><Link href={getOfferingNavigation(product).overviewHref}>{product.name}</Link></>}
        {title && <><ChevronRight size={14} aria-hidden="true"/><LSpan aria-current="page">{title}</LSpan></>}
      </LNav>
      <LNav className={styles.directory} aria-label="页脚目录">
        {footerGroups.map((group,index) => <LSection className={styles.group} key={group.title} data-open={expanded === index}>
          <LH2 className={styles.desktopTitle}>{group.title}</LH2>
          <LH2 className={styles.mobileTitle}><LButton type="button" aria-expanded={expanded === index} aria-controls={`footer-group-${index}`} onClick={() => setExpanded(value => value === index ? null : index)}>{group.title}<ChevronDown size={15}/></LButton></LH2>
          <LUl id={`footer-group-${index}`}>{group.items.map(item => <LLi key={item.label}>
            {item.href === "#one-g-contact" ? <SupportButton inline textOnly label={item.label} entry={item.label === "客服咨询" ? "footer-help" : "footer-contact"}/> : <NavigationLink href={item.href}>{item.label}</NavigationLink>}
          </LLi>)}</LUl>
        </LSection>)}
      </LNav>
      <LP className={styles.copyright}>{siteContent.footer.copyright}</LP>
    </LDiv>
  </LFooter>;
}
