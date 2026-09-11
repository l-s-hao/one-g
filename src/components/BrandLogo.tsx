import styles from "./BrandLogo.module.css";

type BrandLogoProps = {
  variant?: "mark" | "horizontal" | "stacked";
  size?: "sm" | "md" | "lg";
  context?: "brand" | "header";
  className?: string;
};

// SVG masks inherit currentColor; external <img> SVGs cannot inherit page color.
// Expose the same accessible name as an image's alt text.
export default function BrandLogo({ variant = "horizontal", size = "md", context = "brand", className = "" }: BrandLogoProps) {
  return <span role="img" aria-label="ONE-G 万机智能" data-brand-logo={variant}
    className={`${styles.logo} ${styles[variant]} ${styles[size]} ${context === "header" ? styles.header : ""} ${className}`} />;
}
