import { Suspense } from "react";
import BrandLoader from "@/components/BrandLoader";
import LoginEntry from "@/components/LoginEntry";

export default function LoginPage() {
  return <Suspense fallback={<BrandLoader size="page" label="正在加载登录表单…"/>}><LoginEntry /></Suspense>;
}
