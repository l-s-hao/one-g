"use client"

// Magic UI: https://magicui.design/r/shimmer-button.json
// ONE-G defaults and Slot-based links keep primary actions visually consistent.
import Link from "next/link"
import { Slot, Slottable } from "@radix-ui/react-slot"
import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  href?: string
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      href,
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "9999px",
      background = "rgba(0,0,0,0.9)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Component = href ? Slot : "button"
    return (
      <Component
        type={href ? undefined : "button"}
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]",
          "one-g-shimmer inline-flex gap-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-50",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div aria-hidden="true"
          className={cn(
            "-z-30 blur-[2px]",
            "@container-[size] absolute inset-0 overflow-visible"
          )}
        >
          {/* spark */}
          <div aria-hidden="true" className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
            {/* spark before */}
            <div aria-hidden="true" className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>
        <Slottable>{href ? <Link href={href}>{children}</Link> : children}</Slottable>

        {/* Highlight */}
        <div aria-hidden="true"
          className={cn(
            "absolute inset-0 size-full",

            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",

            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
          )}
        />

        {/* backdrop */}
        <div aria-hidden="true"
          className={cn(
            "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
          )}
        />
      </Component>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
