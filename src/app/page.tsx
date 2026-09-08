import { ShimmerButton } from "@/components/ui/shimmer-button";
import G1Section from "@/components/G1Section";
import HeroLogoText from "@/components/HeroLogoText";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Radio, ScanLine, Truck } from "lucide-react";
import ResponsiveDriftWall from "@/components/ResponsiveDriftWall";
import SupportButton from "@/components/SupportButton";
import { getProjectImages } from "@/lib/get-project-images";

const heroLinks = [
  { href: "/customize", label: "在线定制", primary: true },
  { href: "/products", label: "商品中心", primary: false },
  { href: "/about", label: "了解公司", primary: false },
];

const scenes = [
  { title: "搬运", text: "在重复与高强度任务中保持稳定节奏。", Icon: Truck },
  { title: "巡检", text: "持续观察现场，及时发现异常变化。", Icon: ScanLine },
  { title: "遥操作", text: "让专家经验远程抵达每一个现场。", Icon: Radio },
  { title: "AI", text: "用智能能力把感知转化为行动。", Icon: BrainCircuit },
];

export default function HomePage() {
  const wallImages = getProjectImages();
  return (
    <div className="home-page w-full overflow-hidden bg-black text-white">
      <section className="hero-section relative isolate h-screen min-h-[100svh] w-full overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 h-full w-full"><ResponsiveDriftWall items={wallImages} /></div>
        <div className="hero-overlay" /><div className="hero-vignette" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 sm:px-10">
          <h1 id="hero-title" className="hero-logo select-none text-center text-[clamp(5rem,13vw,13rem)] font-extrabold leading-none tracking-[-0.06em] text-white"><HeroLogoText /></h1>
          <div className="hero-actions mt-10 flex w-full items-center justify-center gap-4 sm:mt-12" aria-label="核心入口">
            {heroLinks.map((link) => link.primary ? <ShimmerButton key={link.href} href={link.href} className="hero-action">{link.label}</ShimmerButton> : <Link key={link.href} href={link.href} className="hero-action hero-action--secondary">{link.label}</Link>)}
          </div>
        </div>
      </section>

      <main>
        <G1Section />

        <section className="border-y border-white/10 bg-[#080808] px-6 py-24 sm:px-10 lg:py-32" aria-labelledby="entry-title">
          <div className="mx-auto max-w-7xl"><p className="eyebrow">START HERE</p><h2 id="entry-title" className="section-title mt-4">选择你的入口。</h2><div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[{ title: "在线定制", text: "自由组合机器人，选择硬件与功能，获得实时报价。", button: "开始定制", href: "/customize" }, { title: "商品中心", text: "机器人本体、机械臂、灵巧手与视觉系统。", button: "查看产品", href: "/products" }, { title: "了解 ONE - G", text: "技术、公司、团队与品牌理念。", button: "了解更多", href: "/about" }].map((entry) => <div key={entry.title} className="rounded-3xl border border-white/10 bg-[#111] p-7 sm:p-9"><h3 className="text-2xl font-bold">{entry.title}</h3><p className="mt-5 min-h-14 text-sm leading-6 text-white/55">{entry.text}</p>{entry.href === "/customize" ? <ShimmerButton href={entry.href} className="mt-8 px-5">{entry.button}<ArrowRight size={15} /></ShimmerButton> : <Link href={entry.href} className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-black">{entry.button}<ArrowRight size={15} /></Link>}</div>)}
          </div></div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-28 sm:px-10 lg:py-36" aria-labelledby="customize-title"><div className="max-w-3xl"><p className="eyebrow">CONFIGURE YOURS</p><h2 id="customize-title" className="section-title mt-4">打造属于你的 ONE - G</h2><p className="mt-6 text-lg text-white/55">从基础型号开始，逐步组合出适合你的机器人能力。</p></div><div className="mt-14 grid gap-3 md:grid-cols-5">{["基础型号", "机械臂", "灵巧手", "视觉系统", "功能方案"].map((step, index) => <div key={step} className="relative border-t border-white/20 pt-5"><span className="text-xs text-white/40">0{index + 1}</span><p className="mt-3 font-semibold">{step}</p>{index < 4 && <ArrowRight className="absolute right-3 top-5 hidden text-white/30 md:block" size={16} />}</div>)}</div><ShimmerButton href="/customize" className="mt-12">开始配置 ONE - G <ArrowRight size={16} /></ShimmerButton></section>

        <section className="border-y border-white/10 bg-[#080808] px-6 py-24 sm:px-10 lg:py-32" aria-labelledby="scene-title"><div className="mx-auto max-w-7xl"><p className="eyebrow">BUILT FOR THE FIELD</p><h2 id="scene-title" className="section-title mt-4">能力，进入每个场景。</h2><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{scenes.map(({ title, text, Icon }) => <div key={title} className="rounded-3xl border border-white/10 bg-[#111] p-7"><Icon size={25} strokeWidth={1.4} className="text-white/70" /><h3 className="mt-12 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/50">{text}</p></div>)}</div></div></section>

        <section className="mx-auto max-w-7xl px-6 py-28 sm:px-10 lg:flex lg:items-end lg:justify-between lg:gap-16 lg:py-36" aria-labelledby="company-title"><div><p className="eyebrow">ONE - G / 万机智能</p><h2 id="company-title" className="section-title mt-4">让机器人，<br />进入真实世界。</h2></div><div className="mt-8 max-w-xl lg:mt-0"><p className="text-lg leading-8 text-white/60">围绕具身智能机器人，提供机器人本体、执行器、视觉系统、控制与智能能力的一体化组合方案。</p><Link href="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">了解公司 <ArrowRight size={16} /></Link></div></section>
      </main>

      <footer className="border-t border-white/10 bg-[#080808] px-6 py-12 sm:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:justify-between"><div><div className="text-xl font-extrabold tracking-tight">ONE - G</div><p className="mt-3 text-sm text-white/40">具身智能，始于每一次行动。</p></div><nav className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-white/55"><Link href="/products" className="hover:text-white">产品</Link><Link href="/customize" className="hover:text-white">在线定制</Link><Link href="/about" className="hover:text-white">公司</Link><Link href="/about" className="hover:text-white">开发者</Link><Link href="/about" className="hover:text-white">联系我们</Link></nav></div><p className="mx-auto mt-12 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/30">© 2025 ONE - G / 万机智能</p></footer>
      <SupportButton />
    </div>
  );
}
