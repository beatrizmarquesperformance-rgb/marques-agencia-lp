import type { CSSProperties } from "react";
import type { ProjectTheme } from "@/lib/types";

/** Maps a project's theme tokens to scoped CSS custom properties. */
export function themeVars(theme: ProjectTheme): CSSProperties {
  return {
    "--bg": theme.bg,
    "--bg-split": theme.bgSplit ?? theme.bg,
    "--primary": theme.primary,
    "--secondary": theme.secondary,
    "--text": theme.text,
    "--accent": theme.accent,
  } as CSSProperties;
}

/** Deterministic subtle tint for placeholder tiles when no image exists yet. */
export function placeholderStyle(theme: ProjectTheme, index = 0): CSSProperties {
  const shades = [theme.primary, theme.accent, theme.secondary, theme.text];
  const c = shades[index % shades.length];
  return {
    backgroundColor: theme.bg,
    backgroundImage: `repeating-linear-gradient(135deg, ${c}22 0 12px, transparent 12px 24px)`,
  };
}
