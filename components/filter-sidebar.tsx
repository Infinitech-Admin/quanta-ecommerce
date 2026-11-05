"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BRANDS } from "@/types/product";

export type Filters = {
  brands: string[];
  maxPrice: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
};

const MAX_PRICE_CEILING = 10000;

export const DEFAULT_FILTERS: Filters = {
  brands: [],
  maxPrice: MAX_PRICE_CEILING,
  inStockOnly: false,
  onSaleOnly: false,
};

// Separate brand entry for Fresh toothbrush products.
export const FRESH_TOOTHBRUSH = "Fresh Toothbrush";

// Brand list shown in the sidebar: "Fresh Toothbrush" goes right after "Fresh".
const SIDEBAR_BRANDS: string[] = (() => {
  const list: string[] = [...BRANDS];
  if (list.includes(FRESH_TOOTHBRUSH)) return list;
  const i = list.findIndex((b) => b.trim().toLowerCase() === "fresh");
  if (i === -1) list.push(FRESH_TOOTHBRUSH);
  else list.splice(i + 1, 0, FRESH_TOOTHBRUSH);
  return list;
})();

export function FilterSidebar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
}) {
  const toggleBrand = (brand: string) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-moss-900">
        <SlidersHorizontal className="h-4 w-4" />
        <h3 className="font-display text-lg font-semibold">Filter results</h3>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-moss-800">Max price</p>
        <Slider
          value={[filters.maxPrice]}
          max={MAX_PRICE_CEILING}
          step={100}
          onValueChange={([v]) => onChange({ ...filters, maxPrice: v })}
        />
        <p className="text-xs text-muted-foreground">
          Up to ₱{filters.maxPrice}
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-moss-800">Brand</p>
        <div className="space-y-2.5">
          {SIDEBAR_BRANDS.map((brand) => (
            <div key={brand} className="flex items-center gap-2.5">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="text-sm font-normal text-moss-800"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="in-stock"
            checked={filters.inStockOnly}
            onCheckedChange={(v) => onChange({ ...filters, inStockOnly: !!v })}
          />
          <Label
            htmlFor="in-stock"
            className="text-sm font-normal text-moss-800"
          >
            In stock only
          </Label>
        </div>
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="on-sale"
            checked={filters.onSaleOnly}
            onCheckedChange={(v) => onChange({ ...filters, onSaleOnly: !!v })}
          />
          <Label
            htmlFor="on-sale"
            className="text-sm font-normal text-moss-800"
          >
            On sale
          </Label>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => onChange(DEFAULT_FILTERS)}
      >
        Clear filters
      </Button>
    </div>
  );
}
