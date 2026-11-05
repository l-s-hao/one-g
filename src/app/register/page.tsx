import { Suspense } from "react";
import BrandLoader from "@/components/BrandLoader";
import RegistrationForm from "@/components/RegistrationForm";
export default function RegisterPage() {
  return <Suspense fallback={<BrandLoader size="page" label="正在加载注册表单…"/>}><RegistrationForm /></Suspense>;
}
