"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { footerGroups } from "@/data/footer-navigation";
import { navigation } from "@/data/site-navigation";
import { siteContent } from "@/data/site-content";
import { siteContact } from "@/data/site-contact";
import { isConfigurableOffering } from "@/data/configurable-offerings";
import { getOfferingNavigation } from "@/lib/offering-navigation";
import { getProductBySlug } from "@/lib/products";
import { NavigationLink } from "./ProtectedLink";
import BrandLogo from "./BrandLogo";
import ThemeSelector from "./ThemeSelector";
import styles from "./Footer.module.css";

const routeNames: Record<string, string> = {
  ...Object.fromEntries(navigation.map(item => [item.href, item.label])),
  "/deep-customization": "深度定制", "/account": "用户中心", "/cart": "购物车",
  "/checkout": "结算", "/order-success": "订单完成",
};

export default function Footer() {
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const [expanded, setExpanded] = useState<number | null>(null);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const product = (pathname.startsWith("/products/") || pathname.startsWith("/buy/")) ? getProductBySlug(pathname.split("/")[2]) : undefined;
  const offering = product && isConfigurableOffering(product.id);
  const specs = offering && pathname.endsWith("/specs");
  const title = pathname.startsWith("/buy/") && product ? `购买 ${product.name}` : specs ? "技术规格" : product?.name ?? routeNames[pathname];
  return <footer className={styles.footer} id="site-footer">
    <div className={styles.container}>
      <nav aria-label="页脚路径" className={styles.breadcrumb}>
        <Link href="/" aria-label="ONE-G 万机智能 首页"><BrandLogo variant="mark" size="sm" /></Link>
        {product && <><ChevronRight size={14} aria-hidden="true"/><Link href={offering ? "/" : "/products"}>{offering ? "产品与配置" : "商品中心"}</Link></>}
        {specs && product && <><ChevronRight size={14} aria-hidden="true"/><Link href={getOfferingNavigation(product).overviewHref}>{product.name}</Link></>}
        {title && <><ChevronRight size={14} aria-hidden="true"/><span aria-current="page">{title}</span></>}
      </nav>
      <nav className={styles.directory} aria-label="页脚目录">
        {footerGroups.map((group,index) => <section className={styles.group} key={group.title} data-open={expanded === index}>
          <h2 className={styles.desktopTitle}>{group.title}</h2>
          <h2 className={styles.mobileTitle}><button type="button" aria-expanded={expanded === index} aria-controls={`footer-group-${index}`} onClick={() => setExpanded(value => value === index ? null : index)}>{group.title}<ChevronDown size={15}/></button></h2>
          <ul id={`footer-group-${index}`}>{group.items.map(item => <li key={item.label}>
            {item.action === "accessibility" ? <><button type="button" aria-expanded={accessibilityOpen} aria-controls="footer-accessibility" onClick={() => setAccessibilityOpen(value => !value)}>显示辅助</button>
              {accessibilityOpen && <div className={styles.accessibility} id="footer-accessibility" onKeyDown={event => { if (event.key === "Escape") { setAccessibilityOpen(false); event.currentTarget.parentElement?.querySelector("button")?.focus(); } }}><ThemeSelector/><button type="button" aria-label="关闭页脚显示辅助" onClick={event => { event.currentTarget.closest("li")?.querySelector("button")?.focus(); setAccessibilityOpen(false); }}><X size={14}/> 关闭</button></div>}</>
              : <NavigationLink href={item.href}>{item.label}</NavigationLink>}
          </li>)}</ul>
        </section>)}
      </nav>
      <div id="one-g-contact" className={styles.contact} tabIndex={-1}>
        <p>联系 ONE-G</p>
        <p>电话：{siteContact.phone} · 未确认</p><p>邮箱：{siteContact.email} · 未确认</p>
        <p className={styles.contactNote}>当前联系方式为演示占位，正式联系渠道待确认。</p>
      </div>
      <p className={styles.copyright}>{siteContent.footer.copyright}</p>
    </div>
  </footer>;
}
