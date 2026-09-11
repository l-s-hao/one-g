"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { safeReturnTo } from "@/lib/auth-routing";
import type { UserRole } from "@/types/auth";

export function useLoginForm(role: UserRole) {
  const { login } = useAuth();
  const router = useRouter();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState({ account: "", password: "" });
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const clearErrors = () => { setMessage(""); setFields({ account: "", password: "" }); setInvalidCredentials(false); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const account = String(data.get("email") ?? data.get("account") ?? "");
    const password = String(data.get("password") ?? "");
    clearErrors();
    const errors = { account: account.trim() ? "" : "请输入账号或邮箱", password: password ? "" : "请输入密码" };
    setFields(errors);
    if (errors.account || errors.password) {
      form.querySelector<HTMLInputElement>(errors.account ? 'input[autocomplete="email"], input[autocomplete="username"]' : 'input[name="password"]')?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    let navigating = false;
    try {
      const result = await login(account, password, role);
      if (result.ok) {
        navigating = true;
        router.replace(safeReturnTo(new URLSearchParams(window.location.search).get("returnTo"), role));
      } else {
        setInvalidCredentials(result.error === "INVALID_CREDENTIALS");
        setMessage(result.error === "INVALID_CREDENTIALS"
          ? role === "ADMIN" ? "管理员账号或密码错误。" : "账号或密码错误，请重新输入。"
          : result.error === "WRONG_ROLE"
            ? role === "ADMIN" ? "该账号没有管理员权限。" : "请使用管理员入口登录。"
            : "登录状态已更新，请重试。");
      }
    } catch { setMessage("登录暂时不可用，请重试。"); }
    finally {
      // Keep the submit locked until successful navigation unmounts this form.
      if (!navigating) { submitting.current = false; setPending(false); }
    }
  };
  return { submit, pending, message, fields, invalidCredentials, clearErrors };
}
