import type { Product } from "@/types/product";

type TypeRule = { label: string; keywords: string[] };

// Key = brand name, lowercase, walang spaces.
// Ang ORDER ng rules ay mahalaga: first match wins.
const TYPE_RULES: Record<string, TypeRule[]> = {
  fresh: [
    { label: "Interfolded Paper Towel", keywords: ["interfold"] },
    {
      label: "Bathroom Tissue",
      keywords: ["bathroom", "bath tissue", "toilet"],
    },
    { label: "Kitchen Towel", keywords: ["kitchen"] },
    { label: "Facial Tissue", keywords: ["facial"] },
  ],
  sweetbaby: [
    { label: "Sweet Baby Wipes", keywords: ["wipes"] },
    {
      label: "Sweet Baby Clothlike Taped",
      keywords: ["clothlike", "cloth-like", "cloth like"],
    },
    { label: "Sweet Baby Plus", keywords: ["plus"] },
    { label: "Sweet Baby Regular Pants", keywords: ["pants"] },
    { label: "Sweet Baby Dry", keywords: ["dry"] },
  ],
};

const brandKey = (brand: string) =>
  brand.trim().toLowerCase().replace(/\s+/g, "");

/** Type options na ipapakita sa sidebar para sa isang brand. */
export const getBrandTypes = (brand: string): string[] =>
  (TYPE_RULES[brandKey(brand)] ?? []).map((r) => r.label);

/** Hinuhulaan ang type ng product base sa pangalan niya. */
export const getProductType = (p: Product): string | null => {
  const rules = TYPE_RULES[brandKey(p.brand ?? "")];
  if (!rules) return null;
  const name = (p.name ?? "").toLowerCase();
  return (
    rules.find((r) => r.keywords.some((k) => name.includes(k)))?.label ?? null
  );
};
