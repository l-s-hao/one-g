"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Search, X, CircleX, ArrowUpRight, CornerDownLeft } from "lucide-react";
import { LButton, LForm, LInput, LLabel, LP, LSpan, LocalizedLink as Link } from "@/i18n/Elements";
import { translate, useLocale } from "@/i18n/LocaleProvider";
import { directProductMatch, searchSuggestions, submitSearch, type SearchAction, type SearchScope, type SearchSubmission } from "@/lib/site-search";
import styles from "./SearchBox.module.css";
import { flushSync } from "react-dom";

type Props = { id: string; scope?: SearchScope; query: string; onQueryChange: (value: string) => void; onNavigate?: () => void; onClose?: () => void; compact?: boolean; active?: boolean };
type View = { submission: SearchSubmission | null; selected: { id: string; query: string } | null };
const types = { product: "商品", solution: "解决方案", page: "页面" };

/** 两个入口分别拥有draft；提交快照与主动选中只属于当前查询，没有远端等待或全局搜索状态。 */
export default function SearchBox({ id, scope = "all", query, onQueryChange, onNavigate, onClose, compact = false, active = true }: Props) {
  const root = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null), composing = useRef(false);
  const [view, setView] = useState<View>({ submission: null, selected: null });
  const { locale } = useLocale();
  const listId = useId();
  const committed = view.submission?.committedQuery === query ? view.submission : null;
  const response = committed ?? submitSearch(query, scope);
  const matches = response.phase === "error" ? [] : response.matches;
  // 输入只是草稿；错误会在明确提交后显示，不能用无匹配冒充索引异常。
  const empty = !query.trim();
  const actions: SearchAction[] = committed?.phase === "results"
    ? [...searchSuggestions(query, scope, matches).filter(action => action.kind === "correction"), ...committed.matches.map(({ item }): SearchAction => ({ id: item.id, kind: "destination", item }))]
    : response.phase === "error" ? [] : searchSuggestions(query, scope, matches);
  const failure = response.phase === "error" ? response : null;
  const phase = !active ? "closed" : empty ? "empty-input" : failure ? "error" : committed?.phase ?? "suggestions";
  const exact = matches.some(match => match.match === "exact" || match.match === "alias");
  const controls = () => Array.from(root.current?.querySelectorAll<HTMLElement>("[data-search-action]") ?? []);
  const edit = (value: string) => { onQueryChange(value); setView({ submission: null, selected: null }); };
  const clear = () => { edit(""); input.current?.focus({ preventScroll: true }); };
  const commit = (latest: string, allowDirect = true) => {
    if (composing.current) return;
    if (!latest.trim()) { clear(); return; }
    const submission = submitSearch(latest, scope);
    const direct = allowDirect && scope === "products" && submission.phase !== "error" ? directProductMatch(latest, submission.matches) : undefined;
    const update = () => { onQueryChange(latest); setView({ submission, selected: null }); };
    if (direct) {
      // 仍经真实Link处理basePath、修饰键和注册离页保护，不直接router.push绕过保护。
      flushSync(update);
      root.current?.querySelector<HTMLAnchorElement>(`a[data-search-result="${direct.id}"]`)?.click();
    } else update();
  };
  const run = (action: SearchAction) => {
    if (action.kind === "destination") root.current?.querySelector<HTMLAnchorElement>(`a[data-search-result="${action.item.id}"]`)?.click();
    else { commit(action.query, false); input.current?.focus({ preventScroll: true }); }
  };
  const choose = (event: KeyboardEvent, index: number) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (composing.current || event.nativeEvent.isComposing) return;
    event.preventDefault(); event.stopPropagation();
    const options = controls(), next = index + (event.key === "ArrowDown" ? 1 : -1);
    if (next < 0 || !options.length) input.current?.focus();
    else options[Math.min(options.length - 1, next)]?.focus();
  };
  const announcement = committed ? committed.phase === "error" ? translate("暂时无法搜索，请重试", locale)
    : !exact && committed.matches.length > 0 ? translate("找到 {count} 项相关结果", locale).replace("{count}", String(committed.matches.length))
    : committed.matches.length === 1 ? translate("找到一项结果", locale) : translate("找到 {count} 项结果", locale).replace("{count}", String(committed.matches.length)) : "";
  const selectedId = view.selected?.query === query ? view.selected.id : undefined;
  return <div ref={root} className={`${styles.box} ${compact ? styles.compact : ""}`} hidden={!active} data-search-scope={scope} data-search-state={phase}
    onKeyDown={event => { if (event.key === "Escape" && (composing.current || event.nativeEvent.isComposing)) event.stopPropagation(); }}>
    <LForm id={`${id}-form`} role="search" aria-label={scope === "all" ? "搜索 ONE-G" : "搜索商品"} onSubmit={event => {
      event.preventDefault();
      if (composing.current) return;
      // FormData读取当前DOM输入，快速输入后立即Enter也不提交过期的React值。
      const latest = String(new FormData(event.currentTarget).get("q") ?? "");
      const selected = view.selected?.query === latest && actions.find(action => action.id === view.selected?.id);
      if (selected && document.activeElement instanceof HTMLElement && document.activeElement.dataset.searchAction === selected.id) run(selected);
      else commit(latest);
    }}>
      <LLabel className={styles.srOnly} htmlFor={id}>{scope === "all" ? "搜索 ONE-G" : "搜索商品"}</LLabel>
      <div className={styles.inputLine}>
        {!compact && <LButton type="submit" aria-label="执行搜索"><Search size={22} aria-hidden="true"/></LButton>}
        <LInput ref={input} id={id} name="q" type="search" autoComplete="off" maxLength={128} placeholder={scope === "all" ? "搜索产品、方案或栏目" : "搜索商品名称、型号"} value={query}
          onChange={event => edit(event.target.value)} onFocus={() => setView(current => current.selected ? { ...current, selected: null } : current)} onBlur={() => { composing.current = false; }}
          onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
          onKeyDown={event => {
            if (event.key === "Enter" && (composing.current || event.nativeEvent.isComposing || event.keyCode === 229)) { event.preventDefault(); event.stopPropagation(); return; }
            if (event.key === "ArrowDown") choose(event, -1);
            if (event.key === "ArrowUp" && !composing.current && !event.nativeEvent.isComposing && controls().length) { event.preventDefault(); event.stopPropagation(); controls().at(-1)?.focus(); }
          }} aria-describedby={empty ? undefined : `${listId}-summary`}/>
        {query && <LButton type="button" aria-label="清空搜索" onClick={clear}><CircleX size={18} aria-hidden="true"/></LButton>}
        {onClose && <LButton type="button" aria-label="关闭搜索" onClick={onClose}><X size={20} aria-hidden="true"/></LButton>}
      </div>
    </LForm>
    <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{active ? announcement : ""}</span>
    {(!empty || scope === "all") && <div className={styles.results} data-search-results>
      {empty ? <LP className={styles.heading}>快捷入口</LP> : <div id={`${listId}-summary`}>
        <div className={styles.resultHeading}><LP className={styles.heading}>{committed ? "搜索结果" : "候选结果"}</LP>
          {committed && committed.phase !== "error" && <output aria-live="off" aria-label={translate("搜索结果数量", locale)}>{committed.matches.length} {locale === "en" && committed.matches.length === 1 ? exact ? "result" : "related result" : <LSpan>{!exact && committed.matches.length > 0 ? "项相关结果" : "项结果"}</LSpan>}</output>}</div>
        {committed && <p className={styles.query} data-i18n-skip>“{committed.committedQuery}”</p>}
        {!exact && matches.length > 0 && <><LP className={styles.secondary}>未找到完全匹配的结果</LP><LP className={styles.heading}>你可能想找</LP></>}
      </div>}
      {failure ? <div className={styles.recovery}><LP>暂时无法搜索，请重试</LP><LButton type="button" onClick={() => commit(failure.committedQuery, false)}>重试搜索</LButton></div> : <>
        <ul className={styles.list}>{actions.map((action, index) => <li key={action.id}>
          {action.kind === "destination" ? <Link href={action.item.href} data-search-result={action.item.id} data-search-action={action.id} data-action-kind="destination" data-selected={selectedId === action.id}
            onFocus={() => setView(current => ({ ...current, selected: { id: action.id, query } }))}
            onBlur={() => setView(current => current.selected?.id === action.id ? { ...current, selected: null } : current)}
            onClick={event => { if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) onNavigate?.(); }} onKeyDown={event => choose(event, index)}>
            <span className={styles.resultName}><LSpan>{action.item.name}</LSpan><LSpan className={styles.type}>{types[action.item.kind]}</LSpan></span><ArrowUpRight size={16} aria-hidden="true"/>
          </Link> : <LButton type="button" data-search-action={action.id} data-action-kind={action.kind} data-selected={selectedId === action.id}
            onFocus={() => setView(current => ({ ...current, selected: { id: action.id, query } }))}
            onBlur={() => setView(current => current.selected?.id === action.id ? { ...current, selected: null } : current)}
            onKeyDown={event => choose(event, index)} onClick={() => run(action)}>
            <span className={styles.resultName}><LSpan>{action.kind === "correction" ? "改为搜索" : "搜索"}</LSpan><span data-i18n-skip>“{action.query}”</span></span><CornerDownLeft size={16} aria-hidden="true"/>
          </LButton>}
        </li>)}</ul>
        {!empty && !matches.length && <div className={styles.recovery}><LP>没有匹配的结果</LP><div><LButton type="button" onClick={clear}>清空搜索</LButton><Link className={styles.browse} href="/products" onClick={onNavigate}>查看全部商品</Link></div></div>}
      </>}
    </div>}
  </div>;
}
