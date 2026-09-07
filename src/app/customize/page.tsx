"use client";

import { Check, ChevronLeft, ChevronRight, Rotate3D } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { configuratorPrices, formatPrice, getConfigurationTotal, type ConfiguratorSelection } from "@/data/configurator";

const steps = ["基础型号", "机械臂", "灵巧手", "视觉系统", "功能方案"] as const;
const options = [["ONE-G G1", "ONE-G G1 Pro"], ["标准机械臂", "高负载机械臂", "不安装"], ["五指灵巧手", "工业夹爪", "不安装"], ["RGB-D", "双目视觉", "LiDAR"], ["搬运", "巡检", "遥操作", "AI"]];
const initialSelection: ConfiguratorSelection = { 基础型号: "ONE-G G1", 机械臂: "标准机械臂", 灵巧手: "五指灵巧手", 视觉系统: [], 功能: [] };

export default function CustomizePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selection, setSelection] = useState<ConfiguratorSelection>(initialSelection);
  const [completed, setCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const total = getConfigurationTotal(selection);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("one-g-config");
      if (saved) { // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelection({ ...initialSelection, ...JSON.parse(saved) });
      }
    } catch { /* Ignore malformed local prototype data. */ }
    setHydrated(true);
  }, []);

  const choose = (value: string) => {
    if (currentStep === 0) setSelection((current) => ({ ...current, 基础型号: value }));
    if (currentStep === 1) setSelection((current) => ({ ...current, 机械臂: value }));
    if (currentStep === 2) setSelection((current) => ({ ...current, 灵巧手: value }));
    if (currentStep === 3) setSelection((current) => ({ ...current, 视觉系统: current.视觉系统.includes(value) ? current.视觉系统.filter((item) => item !== value) : [...current.视觉系统, value] }));
    if (currentStep === 4) setSelection((current) => ({ ...current, 功能: current.功能.includes(value) ? current.功能.filter((item) => item !== value) : [...current.功能, value] }));
  };

  const selectedForStep = currentStep === 0 ? [selection.基础型号] : currentStep === 1 ? [selection.机械臂] : currentStep === 2 ? [selection.灵巧手] : currentStep === 3 ? selection.视觉系统 : selection.功能;
  const savePlan = () => window.localStorage.setItem("one-g-config", JSON.stringify(selection));
  const addToCart = () => { savePlan(); router.push("/cart"); };
  const previewItems = [selection.机械臂, selection.灵巧手, ...selection.视觉系统, ...selection.功能].filter(Boolean);

  if (completed) return <CompletedConfiguration selection={selection} total={total} onSave={savePlan} onCart={addToCart} />;

  return <div className="min-h-screen w-full bg-black px-5 pb-32 pt-28 text-white sm:px-10"><div className="mx-auto max-w-7xl"><p className="eyebrow">ONE - G / CONFIGURATOR</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">配置你的 ONE - G</h1><nav className="mt-12 grid grid-cols-5 border-y border-white/10" aria-label="配置步骤">{steps.map((step, index) => <button key={step} type="button" onClick={() => index <= currentStep && setCurrentStep(index)} className={`relative px-1 py-4 text-left transition-colors sm:px-3 ${index === currentStep ? "text-white" : index < currentStep ? "text-white/70" : "text-white/30"}`}><span className="block text-[10px] font-semibold tracking-[0.2em]">0{index + 1}</span><span className="mt-2 block text-xs sm:text-sm">{step}</span>{index < currentStep && <Check className="absolute right-1 top-4 text-white/60 sm:right-3" size={14} />}{index === currentStep && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white" />}</button>)}</nav><div className="mt-8 grid overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] lg:grid-cols-[1.2fr_0.8fr]"><Preview name={selection.基础型号} items={previewItems} /><section className="flex flex-col p-7 sm:p-10" aria-label="配置选项"><div><p className="eyebrow">STEP 0{currentStep + 1}</p><h2 className="mt-3 text-2xl font-bold">{steps[currentStep]}</h2><p className="mt-2 text-sm text-white/45">{currentStep >= 3 ? "可多选配置" : "请选择一个选项"}</p></div><div className="mt-8 space-y-3">{options[currentStep].map((option) => <button key={option} type="button" onClick={() => choose(option)} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${selectedForStep.includes(option) ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/75 hover:border-white/35"}`}><span>{option}</span>{selectedForStep.includes(option) && <Check size={17} />}</button>)}</div><div className="mt-auto flex items-center justify-between gap-3 pt-10"><button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => step - 1)} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-white/55 hover:text-white disabled:invisible"><ChevronLeft size={16} /> 上一步</button><button type="button" onClick={() => currentStep === steps.length - 1 ? setCompleted(true) : setCurrentStep((step) => step + 1)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black">{currentStep === steps.length - 1 ? "完成配置" : "下一步"}<ChevronRight size={16} /></button></div></section></div></div><PriceBar total={total} hydrated={hydrated} /> </div>;
}

function Preview({ name, items }: { name: string; items: string[] }) { return <section className="relative flex min-h-[24rem] flex-col justify-between overflow-hidden border-b border-white/10 bg-[#111] p-7 sm:min-h-[34rem] sm:p-10 lg:border-b-0 lg:border-r" aria-label="配置预览"><div className="absolute inset-0 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)", backgroundSize: "44px 44px" }} /><div className="relative z-10 flex items-center justify-between"><span className="eyebrow">LIVE PREVIEW</span><Rotate3D size={20} className="text-white/40" /></div><div className="relative z-10 flex flex-1 flex-col items-center justify-center"><div className="configurator-orb"><span>ONE - G</span></div><h2 className="mt-7 text-3xl font-bold tracking-tight sm:text-5xl">{name}</h2><div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2">{(items.length ? items : ["等待配置组件"]).map((item) => <span key={item} className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white/65">{item}</span>)}</div></div><p className="relative z-10 text-xs text-white/35">配置预览 · 实时报价已更新</p></section>; }

function PriceBar({ total, hydrated }: { total: number; hydrated: boolean }) { return <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-5 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><p className="text-xs text-white/45">当前方案</p><p className="mt-1 text-xl font-bold">{hydrated ? formatPrice(total) : "¥ —"}</p></div><p className="hidden text-xs text-white/40 sm:block">演示价格，仅用于原型展示</p></div></div>; }

function CompletedConfiguration({ selection, total, onSave, onCart }: { selection: ConfiguratorSelection; total: number; onSave: () => void; onCart: () => void }) { const rows = [["基础型号", selection.基础型号, configuratorPrices.基础型号[selection.基础型号 as keyof typeof configuratorPrices.基础型号] ?? 0], ["机械臂", selection.机械臂, configuratorPrices.机械臂[selection.机械臂 as keyof typeof configuratorPrices.机械臂] ?? 0], ["灵巧手", selection.灵巧手, configuratorPrices.灵巧手[selection.灵巧手 as keyof typeof configuratorPrices.灵巧手] ?? 0], ["视觉系统", selection.视觉系统.join("、") || "未选择", selection.视觉系统.reduce((sum, item) => sum + (configuratorPrices.视觉系统[item as keyof typeof configuratorPrices.视觉系统] ?? 0), 0)], ["功能", selection.功能.join("、") || "未选择", selection.功能.reduce((sum, item) => sum + (configuratorPrices.功能[item as keyof typeof configuratorPrices.功能] ?? 0), 0)]]; return <div className="min-h-screen w-full bg-black px-5 pb-20 pt-32 text-white sm:px-10"><div className="mx-auto max-w-3xl"><p className="eyebrow">ONE - G / CONFIGURATOR</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em] sm:text-6xl">您的 ONE - G 配置已完成</h1><div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d]">{rows.map(([label, value, price]) => <div key={label} className="flex flex-col gap-2 border-b border-white/10 px-6 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-white/40">{label}</p><p className="mt-1 text-base">{value}</p></div><span className="text-sm text-white/65">{formatPrice(Number(price))}</span></div>)}<div className="flex items-center justify-between border-t border-white/20 px-6 py-6"><span className="font-semibold">总价</span><span className="text-2xl font-bold">{formatPrice(total)}</span></div></div><p className="mt-5 text-sm text-white/40">演示价格，仅用于原型展示</p><div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={onSave} className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold hover:bg-white/10">保存方案</button><button type="button" onClick={onCart} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black">加入购物车</button></div></div></div>; }
