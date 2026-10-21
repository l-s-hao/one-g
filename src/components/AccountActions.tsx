"use client";

import { LButton, LDiv } from "@/i18n/Elements";


import { useRouter } from "next/navigation";
import { useAuth, type SessionExitTarget } from "./AuthProvider";
import styles from "./AccountActions.module.css";

export default function AccountActions() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const leave = (target: SessionExitTarget) => {
    // The guard consumes the same target, so session clearing cannot override a switch.
    logout(target);
    router.replace(target);
  };
  return <LDiv className={styles.actions}>
    <LButton effect="invert" effectVariant="secondary" intent="ordinary" type="button" onClick={() => leave("/login?mode=switch")}>{currentUser?.role === "ADMIN" ? "切换账号" : "切换用户"}</LButton>
    <LButton effect="invert" effectVariant="secondary" intent="ordinary" type="button" onClick={() => leave(currentUser?.role === "ADMIN" ? "/admin/login" : "/")}>退出登录</LButton>
  </LDiv>;
}
