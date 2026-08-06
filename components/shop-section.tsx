"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/product-card";
import {
  FilterSidebar,
  DEFAULT_FILTERS,
  type Filters,
} from "@/components/filter-sidebar";
import { SectionCleanBackground } from "@/components/section-wave-background";
import { CATEGORIES, type Product } from "@/types/product";

const ALL = "All items" as const;

export function ShopSection() {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("search") ?? "").trim();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [active, setActive] = React.useState<string>(ALL);
  const [filters, setFilters] = React.useState<Filters>(DEFAULT_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();

        if (!cancelled) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // When a search comes in from the navbar, reset the category tab back to
  // "All items" so the search isn't silently narrowed by a leftover filter.
  React.useEffect(() => {
    if (searchQuery) {
      setActive(ALL);
    }
  }, [searchQuery]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.toLowerCase();

    const result = products.filter((p) => {
      if (q) {
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (active !== ALL && p.category !== active) return false;
      if (filters.brands.length && !filters.brands.includes(p.brand))
        return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (filters.onSaleOnly && !p.originalPrice) return false;
      return true;
    });

    // Sold-out items (out of stock, regardless of the inStock flag) go last.
    return result.sort((a, b) => {
      const aSoldOut = !a.inStock || a.stock <= 0;
      const bSoldOut = !b.inStock || b.stock <= 0;
      if (aSoldOut === bSoldOut) return 0;
      return aSoldOut ? 1 : -1;
    });
  }, [products, active, filters, searchQuery]);

  return (
    <section id="shop" className="relative w-full overflow-hidden bg-[#EEF3EA]">
      <SectionCleanBackground />

      <div className="container py-14 sm:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Shop all essentials
            </span>
            {searchQuery ? (
              <>
                <h2 className="mt-2 font-display text-3xl font-medium text-moss-900 sm:text-4xl">
                  Results for &ldquo;{searchQuery}&rdquo;
                </h2>
                <button
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("search");
                    window.history.replaceState({}, "", url.toString());
                    window.location.reload();
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-moss-600 underline underline-offset-2 hover:text-moss-900"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear search
                </button>
              </>
            ) : (
              <h2 className="mt-2 font-display text-3xl font-medium text-moss-900 sm:text-4xl">
                Browse by category
              </h2>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="mb-8 flex-wrap h-auto">
            <TabsTrigger
              value={ALL}
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              {ALL}
            </TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <FilterSidebar filters={filters} onChange={setFilters} />
              </div>
            </aside>

            <TabsContent value={active} className="mt-0">
              {status === "loading" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[280px] animate-pulse rounded-2xl bg-moss-100"
                    />
                  ))}
                </div>
              ) : status === "error" ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-moss-200 py-20 text-center">
                  <p className="font-display text-lg text-moss-900">
                    Couldn&apos;t load products
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Please refresh the page or try again shortly.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-moss-200 py-20 text-center">
                  <p className="font-display text-lg text-moss-900">
                    {searchQuery
                      ? `No products found for "${searchQuery}"`
                      : "No products match yet"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery
                      ? "Try a different keyword or clear the search."
                      : "Try widening your price range or clearing a filter."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Mobile filter sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
