"use client";
import { createElement, type ComponentPropsWithRef, type ReactNode } from "react";
import SpecularEdge from "@/components/specular/SpecularEdge";
import NextLink from "next/link";
import NextImage from "next/image";
import { translate, useLocale } from "./LocaleProvider";

type ActionProps = { intent?: "ordinary" | "purchase"; effect?: "specular" };
function actionPresentation<T extends { children?: ReactNode }>(props: T & ActionProps) {
  const { intent, effect, ...rest } = props;
  return { ...rest, ...(intent ? { "data-button-intent": intent } : {}),
    ...(effect === "specular" ? { "data-specular-host": true, children: <>
      <SpecularEdge /><span className="action-text">{rest.children}</span>
    </> } : {}) };
}

// Localise only presentation. No DOM mutation, value/ID translation or subtree remount.
function usePresentation<T extends { children?: ReactNode }>(props: T): T {
  const { locale } = useLocale();
  if ("data-i18n-skip" in props) return props;
  const next = { ...props } as T & Record<string, unknown>;
  for (const key of ["alt", "title", "placeholder", "aria-label", "aria-description"]) {
    if (typeof next[key] === "string") Object.assign(next, { [key]: translate(next[key] as string, locale) });
  }
  const text = (node: ReactNode): ReactNode => typeof node === "string" ? translate(node, locale) : Array.isArray(node) ? node.map(text) : node;
  next.children = text(props.children);
  return next;
}
export function LocalizedLink(props: ComponentPropsWithRef<typeof NextLink> & ActionProps) { return createElement(NextLink, actionPresentation(usePresentation(props))); }
export function LocalizedImage(props: ComponentPropsWithRef<typeof NextImage>) { return createElement(NextImage, usePresentation(props)); }
export function LA(props: ComponentPropsWithRef<"a"> & ActionProps) { return createElement("a", actionPresentation(usePresentation(props))); }
export function LArticle(props: ComponentPropsWithRef<"article">) { return createElement("article", usePresentation(props)); }
export function LBr(props: ComponentPropsWithRef<"br">) { return createElement("br", usePresentation(props)); }
export function LButton(props: ComponentPropsWithRef<"button"> & ActionProps) { return createElement("button", actionPresentation(usePresentation(props))); }
export function LDd(props: ComponentPropsWithRef<"dd">) { return createElement("dd", usePresentation(props)); }
export function LDialog(props: ComponentPropsWithRef<"dialog">) { return createElement("dialog", usePresentation(props)); }
export function LDiv(props: ComponentPropsWithRef<"div">) { return createElement("div", usePresentation(props)); }
export function LDl(props: ComponentPropsWithRef<"dl">) { return createElement("dl", usePresentation(props)); }
export function LDt(props: ComponentPropsWithRef<"dt">) { return createElement("dt", usePresentation(props)); }
export function LFieldset(props: ComponentPropsWithRef<"fieldset">) { return createElement("fieldset", usePresentation(props)); }
export function LFigcaption(props: ComponentPropsWithRef<"figcaption">) { return createElement("figcaption", usePresentation(props)); }
export function LFigure(props: ComponentPropsWithRef<"figure">) { return createElement("figure", usePresentation(props)); }
export function LFooter(props: ComponentPropsWithRef<"footer">) { return createElement("footer", usePresentation(props)); }
export function LForm(props: ComponentPropsWithRef<"form">) { return createElement("form", usePresentation(props)); }
export function LH1(props: ComponentPropsWithRef<"h1">) { return createElement("h1", usePresentation(props)); }
export function LH2(props: ComponentPropsWithRef<"h2">) { return createElement("h2", usePresentation(props)); }
export function LH3(props: ComponentPropsWithRef<"h3">) { return createElement("h3", usePresentation(props)); }
export function LHeader(props: ComponentPropsWithRef<"header">) { return createElement("header", usePresentation(props)); }
export function LInput(props: ComponentPropsWithRef<"input">) { return createElement("input", usePresentation(props)); }
export function LLabel(props: ComponentPropsWithRef<"label">) { return createElement("label", usePresentation(props)); }
export function LLegend(props: ComponentPropsWithRef<"legend">) { return createElement("legend", usePresentation(props)); }
export function LLi(props: ComponentPropsWithRef<"li">) { return createElement("li", usePresentation(props)); }
export function LMain(props: ComponentPropsWithRef<"main">) { return createElement("main", usePresentation(props)); }
export function LNav(props: ComponentPropsWithRef<"nav">) { return createElement("nav", usePresentation(props)); }
export function LOl(props: ComponentPropsWithRef<"ol">) { return createElement("ol", usePresentation(props)); }
export function LP(props: ComponentPropsWithRef<"p">) { return createElement("p", usePresentation(props)); }
export function LSection(props: ComponentPropsWithRef<"section">) { return createElement("section", usePresentation(props)); }
export function LSmall(props: ComponentPropsWithRef<"small">) { return createElement("small", usePresentation(props)); }
export function LSpan(props: ComponentPropsWithRef<"span">) { return createElement("span", usePresentation(props)); }
export function LStrong(props: ComponentPropsWithRef<"strong">) { return createElement("strong", usePresentation(props)); }
export function LTextarea(props: ComponentPropsWithRef<"textarea">) { return createElement("textarea", usePresentation(props)); }
export function LUl(props: ComponentPropsWithRef<"ul">) { return createElement("ul", usePresentation(props)); }
export function LVideo(props: ComponentPropsWithRef<"video">) { return createElement("video", usePresentation(props)); }
