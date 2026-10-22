"use client";
import { useEffect, useRef, useState } from "react";
import { humanVerification, type HumanProof } from "@/lib/auth/human";
import { verificationService, type Challenge } from "@/lib/auth/verification";
import { AuthFlowError, normalizeAddress, validAddress, type VerificationContext } from "@/lib/auth/policy";

export function useAuthVerification(context: VerificationContext) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [proof, setProof] = useState<HumanProof | null>(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<"human" | "send" | "submit" | null>(null);
  const [now, setNow] = useState(0);
  const request = useRef<AbortController | null>(null);
  const challengeId = useRef<string | null>(null);
  const proofToken = useRef<string | null>(null);
  const [cooldowns, setCooldowns] = useState(new Map<string, number>());
  const key = `${context.channel}:${normalizeAddress(context.channel, context.recipient)}`;
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => {
      clearInterval(timer); request.current?.abort();
      if (challengeId.current) verificationService.discard(challengeId.current);
      if (proofToken.current) humanVerification.discard(proofToken.current);
    };
  }, []);
  const clear = () => {
    request.current?.abort(); request.current = null;
    if (challengeId.current) verificationService.discard(challengeId.current);
    if (proofToken.current) humanVerification.discard(proofToken.current);
    challengeId.current = null; proofToken.current = null;
    setChallenge(null); setProof(null); setCode(""); setMessage(""); setNotice(""); setPending(null); setNow(Date.now());
  };
  const error = (message: string) => {
    setMessage(message);
    requestAnimationFrame(() => document.getElementById("auth-feedback")?.focus());
  };
  const run = async (kind: "human" | "send" | "submit", task: (signal: AbortSignal) => Promise<void>) => {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller;
    setPending(kind); setMessage(""); setNotice("");
    try { await task(controller.signal); }
    catch (reason) {
      if (!controller.signal.aborted) {
        error(reason instanceof AuthFlowError ? reason.message : "暂时无法完成请求，请稍后重试。");
        if (reason instanceof AuthFlowError && reason.retryAt) { setCooldowns(previous => new Map(previous).set(key, reason.retryAt!)); setNow(Date.now()); }
      }
    } finally { if (request.current === controller) { request.current = null; setPending(null); } }
  };
  const checkRecipient = () => {
    if (validAddress(context.channel, normalizeAddress(context.channel, context.recipient))) return true;
    error(context.channel === "email" ? "请输入有效的邮箱地址。" : "请输入有效的 11 位手机号。"); return false;
  };
  const requestHuman = async () => {
    if (!checkRecipient()) return;
    await run("human", async signal => {
      if (proofToken.current) humanVerification.discard(proofToken.current);
      const next = await humanVerification.issue(context, signal);
      if (signal.aborted) { humanVerification.discard(next.token); return; }
      proofToken.current = next.token; setProof(next); setNow(Date.now());
    });
  };
  const send = async () => {
    if (!checkRecipient()) return;
    if (!proof || proof.expiresAt <= Date.now()) { error("请重新完成人机验证后获取验证码。"); return; }
    if ((cooldowns.get(key) ?? 0) > Date.now()) return;
    await run("send", async signal => {
      const humanToken = proof.token;
      proofToken.current = null; setProof(null); setCode(""); setChallenge(null);
      if (challengeId.current) verificationService.discard(challengeId.current);
      challengeId.current = null;
      const result = await verificationService.send({ ...context, humanToken }, signal);
      if (signal.aborted) { verificationService.discard(result.id); return; }
      challengeId.current = result.id; setChallenge(result);
      setCooldowns(previous => new Map(previous).set(key, result.resendAt)); setNow(Date.now());
      setNotice("演示验证请求已就绪，未发送真实短信/邮件。");
    });
  };
  const checkCode = () => {
    if (!challenge || challenge.expiresAt <= Date.now() || !/^\d{6}$/.test(code)) { error("验证码错误或已失效，请重新获取。"); return false; }
    return true;
  };
  return {
    challenge, proof, code, setCode, message, notice, pending, clear, error, run, requestHuman, send, checkCode,
    humanReady: !!proof && proof.expiresAt > now,
    seconds: Math.max(0, Math.ceil(((cooldowns.get(key) ?? 0) - now) / 1000)),
  };
}
