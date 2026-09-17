/** Retired configuration URLs converge on the system overview; old query state is ignored. */
export function canonicalConfigurationHref(href: string) {
  const path = href.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return ["/customize", "/customize/start", "/configure/robot", "/configure/robotdock", "/configure/sonic-link"].includes(path) ? "/configure" : href;
}
