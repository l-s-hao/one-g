"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { canAccessRole, loginDestination, requiredRole } from "@/lib/auth-routing";
import { useAuth } from "./AuthProvider";

type Props = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & { href: string };

export const ProtectedLink = forwardRef<HTMLAnchorElement, Props>(function ProtectedLink({ href, ...props }, ref) {
  const { currentUser, authReady } = useAuth();
  const role = requiredRole(href);
  const target = role && (!authReady || !currentUser)
    ? loginDestination(href, role)
    : role === "USER" && currentUser?.role === "ADMIN" && !canAccessRole(currentUser.role, role, href) ? "/admin" : href;
  return <Link {...props} ref={ref} href={target} />;
});

// Data-driven menus can share this selector. Public/About/search anchors remain
// ordinary Next links; only business destinations use ProtectedLink.
export const NavigationLink = forwardRef<HTMLAnchorElement, Props>(function NavigationLink(props, ref) {
  return requiredRole(props.href) ? <ProtectedLink {...props} ref={ref} /> : <Link {...props} ref={ref} />;
});
