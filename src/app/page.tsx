import HomeFooter from "@/components/HomeFooter";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import AboutCTASection from "@/components/AboutCTASection";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import HardwareEcosystemSection from "@/components/HardwareEcosystemSection";
import CoreProductSection from "@/components/CoreProductSection";
import HeroLogoText from "@/components/HeroLogoText";
import { NavigationLink } from "@/components/ProtectedLink";
import ResponsiveDriftWall from "@/components/ResponsiveDriftWall";
import SupportButton from "@/components/SupportButton";
import { getCoreProduct } from "@/lib/products";
import { getProjectImages } from "@/lib/get-project-images";

const heroLinks = [
  { href: "/customize/start", label: "在线定制", primary: true },
  { href: "/products", label: "商品中心", primary: false },
  { href: "/about", label: "了解公司", primary: false },
];

export default function HomePage() {
  const coreProduct = getCoreProduct();
  const wallImages = getProjectImages();
  return (
    <div className="home-page w-full overflow-hidden bg-black text-white">
      <section className="hero-section relative isolate h-screen min-h-[100svh] w-full overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 h-full w-full"><ResponsiveDriftWall items={wallImages} /></div>
        <div className="hero-overlay" /><div className="hero-vignette" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 sm:px-10">
          <h1 id="hero-title" className="hero-logo select-none text-center text-[clamp(5rem,13vw,13rem)] font-extrabold leading-none tracking-[-0.06em] text-white"><HeroLogoText /></h1>
          <div className="hero-actions mt-10 flex w-full items-center justify-center gap-4 sm:mt-12" aria-label="核心入口">
            {heroLinks.map((link) => link.primary ? <ShimmerButton key={link.href} href={link.href} className="hero-action">{link.label}</ShimmerButton> : <NavigationLink key={link.href} href={link.href} className="hero-action hero-action--secondary">{link.label}</NavigationLink>)}
          </div>
        </div>
      </section>

      <main>
        {coreProduct && <CoreProductSection product={coreProduct} />}

        <HardwareEcosystemSection />

        <CapabilitiesSection />

        <AboutCTASection />
      </main>

      <HomeFooter />
      <SupportButton />
    </div>
  );
}
