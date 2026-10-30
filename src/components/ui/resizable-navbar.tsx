"use client";

// Adapted composition: https://ui.aceternity.com/components/resizable-navbar
// ONE-G retains its own links, shared highlight and MenuToGrid panels. The
// scroll treatment changes only the surface; it never transforms their hosts.
import { useSyncExternalStore, type ComponentPropsWithRef } from "react";
import { Menu, X } from "lucide-react";
import { LButton, LDiv, LHeader, LNav, LocalizedLink } from "@/i18n/Elements";
import { navbarSurfaceSnapshot, navbarSurfaceServerSnapshot, subscribeNavbarSurface } from "./navbar-surface";

function subscribeScroll(notify: () => void) {
  window.addEventListener("scroll", notify, { passive: true });
  return () => window.removeEventListener("scroll", notify);
}
const scrollSnapshot = () => window.scrollY > 100;
const serverSnapshot = () => false;

export function Navbar(props: ComponentPropsWithRef<typeof LHeader>) {
  const scrolled = useSyncExternalStore(subscribeScroll, scrollSnapshot, serverSnapshot);
  const surface = useSyncExternalStore(subscribeNavbarSurface, navbarSurfaceSnapshot, navbarSurfaceServerSnapshot);
  return <LHeader {...props} data-resizable-navbar data-scrolled={scrolled} data-navbar-surface={surface} />;
}

/** One responsive row keeps the same controls mounted at every breakpoint. */
export function NavBody(props: ComponentPropsWithRef<typeof LDiv>) {
  return <LDiv {...props} data-navbar-body />;
}

/** The existing useNavigationHighlight remains the sole owner of the slider. */
export function NavItems(props: ComponentPropsWithRef<typeof LNav>) {
  return <LNav {...props} />;
}

export function NavbarLogo(props: ComponentPropsWithRef<typeof LocalizedLink>) {
  return <LocalizedLink {...props} />;
}

export function MobileNavToggle({ isOpen, ...props }: ComponentPropsWithRef<typeof LButton> & { isOpen: boolean }) {
  return <LButton {...props} type="button">{isOpen ? <X size={20} /> : <Menu size={20} />}</LButton>;
}
