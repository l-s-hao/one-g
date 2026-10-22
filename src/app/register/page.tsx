import { Suspense } from "react";
import { LP } from "@/i18n/Elements";
import RegistrationForm from "@/components/RegistrationForm";
export default function RegisterPage() {
  return <Suspense fallback={<LP role="status" className="p-8">正在加载注册表单…</LP>}><RegistrationForm /></Suspense>;
}
