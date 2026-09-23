export const contactEntries = {
  about: "About 咨询",
  solutions: "解决方案咨询",
  deep: "深度定制需求",
  general: "普通客服咨询",
  account: "普通客服咨询",
  "footer-help": "普通客服咨询",
  "footer-contact": "普通客服咨询",
} as const;
export type ContactEntry = keyof typeof contactEntries;
export function isContactEntry(value: string | null): value is ContactEntry {
  return value !== null && Object.hasOwn(contactEntries, value);
}
export type ContactDraft = { name: string; email: string; company: string; description: string };
export function validateContactDraft(draft: ContactDraft) {
  const errors: Partial<Record<keyof ContactDraft, string>> = {};
  if (!draft.name.trim()) errors.name = "请填写称呼。";
  if (!draft.email.trim()) errors.email = "请填写回复邮箱。";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = "请填写有效的回复邮箱。";
  if (!draft.description.trim()) errors.description = "请填写需求描述。";
  return errors;
}
