const DIACRITIC_MAP: Record<string, string> = {
  č: "c", ć: "c", š: "s", ž: "z", đ: "d",
  Č: "c", Ć: "c", Š: "s", Ž: "z", Đ: "d",
  á: "a", à: "a", ä: "a", â: "a", ã: "a",
  é: "e", è: "e", ë: "e", ê: "e",
  í: "i", ì: "i", ï: "i", î: "i",
  ó: "o", ò: "o", ö: "o", ô: "o", õ: "o",
  ú: "u", ù: "u", ü: "u", û: "u",
  ñ: "n",
};

export function nameToSlug(name: string, suffix = "cc2026"): string {
  const normalized = name
    .split("")
    .map((c) => DIACRITIC_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${normalized}-${suffix}`;
}

/** Generates a unique slug given a base name and a checker function. */
export async function uniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
  suffix = "cc2026"
): Promise<string> {
  const base = nameToSlug(name, suffix);
  if (!(await exists(base))) return base;
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }
  // Fallback: append random 4-char hex
  return `${base}-${Math.random().toString(16).slice(2, 6)}`;
}
