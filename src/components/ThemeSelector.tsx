"use client";
import { useId } from "react";
import { themes } from "@/data/themes";
import { useAuth } from "./AuthProvider";
import { useTheme } from "./ThemeProvider";
import styles from "./ThemeSelector.module.css";
export default function ThemeSelector() {
  const { currentUser } = useAuth();
  const { preferredTheme, setPreferredTheme } = useTheme();
  const id = useId();
  if (!currentUser) return null;
  return <fieldset className={styles.options} aria-label="外观"><legend className="sr-only">外观</legend>{themes.map(theme => <label key={theme.id}><input type="radio" name={id} checked={preferredTheme === theme.id} onChange={() => setPreferredTheme(theme.id)} /><span>{theme.name}<small>{theme.english}</small></span></label>)}</fieldset>;
}
