"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import {
  FilterSidebar,
  DEFAULT_FILTERS,
  type Filters,
} from "@/components/filter-sidebar";
import { CATEGORIES, CATEGORY_LABELS, type Product } from "@/types/product";
import { buildProductHref } from "@/lib/slug";

const ALL = "All Items" as const;

export default function ShopPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">(
    "loading",
  );

  const [searchInput, setSearchInput] = React.useState(
    () => searchParams.get("search") ?? "",
  );
  const [active, setActive] = React.useState<string>(
    () =>
      (searchParams.get("category") as (typeof CATEGORIES)[number] | null) ??
      ALL,
  );
  const [filters, setFilters] = React.useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    brands: searchParams.get("brand") ? [searchParams.get("brand")!] : [],
  }));
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  // Keep the search box, active category tab, and brand filter in sync with
  // the URL whenever it changes — covers both initial load and clicking
  // CategoryStrip (navbar) links while already on /shop.
  React.useEffect(() => {
    setSearchInput(searchParams.get("search") ?? "");

    const urlCategory = searchParams.get("category");
    setActive(
      urlCategory &&
        CATEGORIES.includes(urlCategory as (typeof CATEGORIES)[number])
        ? urlCategory
        : ALL,
    );

    const urlBrand = searchParams.get("brand");
    setFilters((prev) => ({
      ...prev,
      brands: urlBrand ? [urlBrand] : [],
    }));
  }, [searchParams]);

  // Fired when the user clicks a category tab. Updates local state right
  // away (so filtering feels instant) and pushes the category onto the URL
  // so the address bar stays accurate and shareable/refreshable.
  const handleCategoryChange = (value: string) => {
    setActive(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const fetchProducts = React.useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();

      // Response is shaped like { products: [...] }, but fall back to a
      // plain array or any wrapper key just in case.
      let list: Product[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.products)) {
        list = data.products;
      } else if (data && typeof data === "object") {
        const arrayValue = Object.values(data).find((v) => Array.isArray(v));
        if (arrayValue) list = arrayValue as Product[];
      }

      setProducts(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = React.useMemo(() => {
    const q = searchInput.trim().toLowerCase();

    const result = products.filter((p) => {
      if (q) {
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (active === "Baby Care") {
        // Baby Care has no products actually tagged with that category yet —
        // it's really just the Sweetbaby brand's products.
        if (p.brand !== "Sweetbaby") return false;
      } else if (active !== ALL && p.category !== active) {
        return false;
      }

      if (filters.brands.length && !filters.brands.includes(p.brand))
        return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      if (filters.onSaleOnly && !p.originalPrice) return false;
      return true;
    });

    // Push out-of-stock products to the end without disturbing the relative
    // order within each group (in-stock items stay in their original order,
    // same for out-of-stock ones).
    return result
      .map((p, i) => ({ p, i }))
      .sort((a, b) => {
        const stockDiff = Number(b.p.inStock) - Number(a.p.inStock);
        return stockDiff !== 0 ? stockDiff : a.i - b.i;
      })
      .map(({ p }) => p);
  }, [products, active, filters, searchInput]);

  return (
    <>
      {/* Background layer */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/shop-design-with-cart.png')" }}
        />
        {/* Readability overlay — lower the /NN value to let more image show through */}
        <div className="absolute inset-0 bg-background/30" />
      </div>

      <Navbar />
      <main className="container flex-1 py-8 sm:py-12">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Shop all essentials
            </span>
            <h1 className="mt-2 font-display text-3xl font-medium text-moss-900 sm:text-4xl">
              Shop All Products
            </h1>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Browse our full catalog of paper, personal care, oral care, and
              baby care essentials.
            </p>
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

        <Tabs value={active} onValueChange={handleCategoryChange}>
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
                {CATEGORY_LABELS[cat]}
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
                    <ProductCardSkeleton key={i} />
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
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={fetchProducts}
                  >
                    Try again
                  </Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-moss-200 py-20 text-center">
                  <p className="font-display text-lg text-moss-900">
                    {searchInput
                      ? `No products found for "${searchInput}"`
                      : "No products match yet"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchInput
                      ? "Try a different keyword or clear the search."
                      : "Try widening your price range or clearing a filter."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                  {filtered.map((product) => (
                    <Link
                      key={product.id}
                      href={buildProductHref(product)}
                      className="block"
                    >
                      <ProductCard product={product} />
                    </Link>
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
      </main>
      <Footer />
    </>
  );
}
