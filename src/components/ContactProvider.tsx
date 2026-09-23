"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { loginDestination } from "@/lib/auth-routing";
import { getProductBySlug } from "@/lib/products";
import { solutions } from "@/data/solutions";
import { contactEntries, isContactEntry, validateContactDraft, type ContactDraft, type ContactEntry } from "@/lib/contact-preview";
import styles from "./ContactPreview.module.css";

type OpenContact = (entry: ContactEntry, trigger: HTMLButtonElement) => void;
const ContactContext = createContext<OpenContact | null>(null);
export function useContact() {
  const open = useContext(ContactContext);
  if (!open) throw new Error("useContact requires ContactProvider");
  return open;
}
export default function ContactProvider({ children }: { children: ReactNode }) {
  const { currentUser, authReady } = useAuth();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const router = useRouter();
  const userId = currentUser?.id;
  const [request, setRequest] = useState<{ entry: ContactEntry; userId: string; pathname: string } | null>(null);
  // Only the dialog is invalidated on identity/route changes; never remount login or page state.
  const entry = request?.userId === userId && request?.pathname === pathname ? request.entry : null;
  const trigger = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!authReady) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      setRequest(null);
      if (!userId) return;
      const url = new URL(window.location.href);
      const requested = url.searchParams.get("openContact");
      if (!isContactEntry(requested)) return;
      trigger.current = document.querySelector<HTMLButtonElement>(`button[data-contact-entry="${requested}"]`);
      // Reopen the existing mobile Footer disclosure so focus can return to its trigger.
      if (trigger.current && !trigger.current.getClientRects().length) {
        const disclosure = trigger.current.closest("section")?.querySelector<HTMLButtonElement>("button[aria-controls]");
        if (disclosure?.getAttribute("aria-expanded") === "false") disclosure.click();
      }
      setRequest({ entry: requested, userId, pathname });
      url.searchParams.delete("openContact");
      // Consume only the action marker, preserving product/package/payment/quantity.
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    });
    return () => { active = false; };
  }, [authReady, userId, pathname]);
  const open: OpenContact = (requested, button) => {
    if (!authReady) return;
    if (!currentUser) {
      const params = new URLSearchParams(window.location.search);
      params.set("openContact", requested);
      router.push(loginDestination(`${pathname}?${params}${window.location.hash}`));
      return;
    }
    trigger.current = button;
    setRequest({ entry: requested, userId: currentUser.id, pathname });
  };
  const close = () => { setRequest(null); trigger.current?.focus(); };
  return <ContactContext.Provider value={open}>{children}
    {authReady && currentUser && entry && <ContactPreview key={entry} entry={entry} email={currentUser.email ?? ""} close={close}/>}
  </ContactContext.Provider>;
}
function ContactPreview({ entry, email, close }: { entry: ContactEntry; email: string; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const [draft, setDraft] = useState<ContactDraft>({ name: "", email, company: "", description: "" });
  const [errors, setErrors] = useState<ReturnType<typeof validateContactDraft>>({});
  const [preview, setPreview] = useState(false);
  // This component only mounts after an authenticated click/return, never in SSR.
  const [product] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const productName = getProductBySlug(params.get("product") ?? pathname.split("/")[2] ?? "")?.name;
    const solutionName = pathname.startsWith("/solutions") ? solutions.find(item => item.id === window.location.hash.slice(1))?.name : undefined;
    return [productName, solutionName].filter(Boolean).join(" · ");
  });
  useEffect(() => {
    const node = dialog.current;
    node?.showModal();
    node?.querySelector<HTMLInputElement>("input")?.focus();
    return () => { node?.close(); };
  }, []);
  useEffect(() => {
    if (preview) dialog.current?.querySelector<HTMLElement>("[data-preview-title]")?.focus();
    else dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
  }, [preview]);
  const update = (field: keyof ContactDraft, value: string) => {
    setDraft(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
  };
  const dismiss = () => { dialog.current?.close(); close(); };
  const labels = { name: "称呼", email: "回复邮箱", company: "公司／单位", description: "需求描述" };
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="contact-dialog-title" aria-describedby="contact-demo-note" onCancel={event => { event.preventDefault(); dismiss(); }} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dismiss(); } }}>
    <div className={styles.heading}><h2 id="contact-dialog-title">{preview ? "需求预览" : "填写需求"}</h2><button type="button" onClick={dismiss} aria-label="关闭需求窗口">关闭</button></div>
    <p id="contact-demo-note" className={styles.note}>当前仅为前端演示，信息不会发送给客服。请使用测试信息。</p>
    {preview ? <>
      <p className={styles.previewNotice} data-preview-title tabIndex={-1}>仅供预览，尚未提交。</p>
      <dl className={styles.preview}>{(Object.keys(labels) as (keyof ContactDraft)[]).map(field => <div key={field}><dt>{labels[field]}</dt><dd>{draft[field].trim() || "未填写"}</dd></div>)}<div><dt>来源</dt><dd>{contactEntries[entry]}{product && ` · ${product}`}</dd></div></dl>
      <div className={styles.actions}><button type="button" onClick={() => setPreview(false)}>返回编辑</button><button type="button" onClick={dismiss}>关闭</button></div>
    </> : <form autoComplete="off" noValidate onSubmit={event => {
      event.preventDefault();
      const next = validateContactDraft(draft); setErrors(next);
      const first = Object.keys(next)[0];
      if (first) dialog.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
      else setPreview(true);
    }}>
      {(Object.keys(labels) as (keyof ContactDraft)[]).map(field => <div className={styles.field} key={field}>
        <label htmlFor={`contact-${field}`}>{labels[field]}{field === "company" ? "（选填）" : "（必填）"}</label>
        {field === "description" ? <textarea id={`contact-${field}`} required rows={5} maxLength={5000} value={draft[field]} onChange={event => update(field, event.target.value)} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `contact-${field}-error` : undefined}/> : <input id={`contact-${field}`} type={field === "email" ? "email" : "text"} autoComplete="off" required={field !== "company"} maxLength={field === "email" ? 254 : 120} value={draft[field]} onChange={event => update(field, event.target.value)} aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `contact-${field}-error` : undefined}/>}
        {errors[field] && <p id={`contact-${field}-error`} role="alert" className={styles.error}>{errors[field]}</p>}
      </div>)}
      <p className={styles.note}>来源：{contactEntries[entry]}{product && ` · ${product}`}</p>
      <div className={styles.actions}><button type="submit" className={styles.primary}>预览需求</button><button type="button" onClick={dismiss}>关闭</button></div>
    </form>}
  </dialog>;
}
