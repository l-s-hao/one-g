"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-52 rounded-2xl border border-white/15 bg-[#111]/95 p-3 shadow-2xl backdrop-blur-xl">
          <p className="px-3 pb-2 text-xs text-white/45">咨询客服</p>
          {["产品咨询", "定制咨询", "售后咨询"].map((label) => (
            <button key={label} type="button" className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              {label}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "关闭客服" : "咨询客服"} className="flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-black shadow-xl transition-transform hover:scale-[1.03]">
        {open ? <X size={17} /> : <MessageCircle size={17} />}
        <span>咨询客服</span>
      </button>
    </div>
  );
}
