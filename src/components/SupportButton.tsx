"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { siteContact } from "@/data/site-contact";

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="support-widget fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[calc(100vw-32px)] max-w-80 rounded-2xl border border-white/15 bg-[#111]/95 p-5 text-white shadow-2xl backdrop-blur-xl">
          <p className="mb-4 text-sm font-semibold">咨询客服</p>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-white/45">电话</dt>
              <dd>
                <a href={`tel:${siteContact.phone.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center break-all rounded text-base font-medium text-white/90 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {siteContact.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-white/45">邮箱</dt>
              <dd>
                <a href={`mailto:${siteContact.email}`} className="inline-flex min-h-11 items-center break-all rounded text-base font-medium text-white/90 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  {siteContact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "关闭客服" : "咨询客服"} className="flex items-center gap-2 rounded-full border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-black shadow-xl transition-transform hover:scale-[1.03]">
        {open ? <X size={17} /> : <MessageCircle size={17} />}
        <span>咨询客服</span>
      </button>
    </div>
  );
}
