"use client";

import { MessageCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useContact } from "./ContactProvider";
import type { ContactEntry } from "@/lib/contact-preview";
import styles from "./ContactPreview.module.css";

export default function SupportButton({ inline = false, label = "咨询客服", entry = "general", className, textOnly = false }: { inline?: boolean; label?: string; entry?: ContactEntry; className?: string; textOnly?: boolean }) {
  const { authReady } = useAuth();
  const open = useContact();
  return <button {...{ autoComplete: "off" }} type="button" data-contact-entry={entry} disabled={!authReady} aria-haspopup="dialog" onClick={event => open(entry, event.currentTarget)} className={textOnly ? className : `${className ?? styles.trigger} ${inline ? "" : styles.floating}`}>
    {!textOnly && <MessageCircle size={17} aria-hidden="true"/>}{label}
  </button>;
}
