"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/cart-context";
import { formatPHP } from "@/lib/utils";
import type { Category, Product } from "@/types/product";
import { buildPromoHref } from "@/lib/slug";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

// How many promo cards to tease on the homepage strip.
const MAX_HIGHLIGHTS = 8;

// Shared width for BOTH promo cards and best-seller cards, so switching
// tabs doesn't visually jump between two different card sizes.
const CARD_WIDTH = 210;
const CARD_WIDTH_SM = 240;

type PromoProduct = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number | null;
  rating: number;
  reviews: number;
  tag?: string | null;
  inStock: boolean;
  stock: number;
  blurb: string;
  image: string;
  isPromo: boolean;
  promoStart: string | null;
  promoEnd: string | null;
};

type Tab = "promos" | "bestsellers";
type FetchStatus = "loading" | "ready" | "error";

function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return "/products/placeholder.jpg";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  return `${IMAGE_BASE_URL}${path}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// A promo is "upcoming" if it has a start date that's still in the future.
function isUpcoming(product: PromoProduct): boolean {
  if (!product.promoStart) return false;
  const start = new Date(product.promoStart);
  start.setHours(0, 0, 0, 0);
  return start > startOfToday();
}

function PromoCard({ product }: { product: PromoProduct }) {
  const upcoming = isUpcoming(product);
  const { addItem } = useCart();
  const [isSm, setIsSm] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsSm(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSm(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const width = isSm ? CARD_WIDTH_SM : CARD_WIDTH;

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  return (
    <Link
      href={buildPromoHref(product)}
      className="group flex flex-shrink-0 flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-moss-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-green-300"
      style={{ width, maxWidth: width, minWidth: width }}
    >
      <div className="relative m-2.5 aspect-square overflow-hidden rounded-2xl bg-moss-50">
        <Image
          src={resolveImageUrl(product.image)}
          alt={product.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {discountPct !== null && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-yellow-300 px-2.5 py-1 text-[10px] font-bold text-moss-950 shadow-sm">
            -{discountPct}%
          </span>
        )}
        <span
          className={`absolute right-2.5 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm ${
            upcoming ? "bg-amber-500" : "bg-green-600"
          }`}
          title={upcoming ? "Coming soon" : "On promo"}
        >
          {upcoming ? (
            <CalendarClock className="h-3.5 w-3.5" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-1">
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-moss-500">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-medium leading-snug text-moss-900">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-1.5 pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-semibold text-moss-900">
              {formatPHP(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-muted-foreground line-through">
                {formatPHP(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="default"
            className="h-9 w-9 shrink-0 rounded-full shadow-sm transition-transform hover:scale-105"
            aria-label={`Add ${product.name} to cart`}
            disabled={!product.inStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // PromoProduct and Product share the fields addItem relies on
              // (id, name, price, image, etc.) but aren't the same type.
              addItem(product as unknown as Product);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}

function BestSellerCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-moss-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-green-300 sm:w-[240px]">
      <div className="relative m-2.5 aspect-square overflow-hidden rounded-2xl bg-moss-50">
        <Image
          src={`${IMAGE_BASE_URL}${product.image}`}
          alt={product.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-moss-700 shadow-sm backdrop-blur">
          {product.totalOrders ?? 0}+ sold
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-1">
        <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-medium leading-snug text-moss-900">
          {product.name}
        </h3>

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-display text-lg font-semibold text-moss-900">
            {formatPHP(product.price)}
          </span>
          <Button
            size="icon"
            variant="default"
            className="h-9 w-9 rounded-full shadow-sm transition-transform hover:scale-105"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => addItem(product)}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CardsSkeleton({ width }: { width: number }) {
  return (
    <div className="flex gap-3 overflow-hidden sm:gap-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0" style={{ width }}>
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="mt-2 h-2.5 w-2/3" />
          <Skeleton className="mt-1.5 h-2.5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function FeaturedProducts() {
  const [tab, setTab] = React.useState<Tab>("promos");

  const [promos, setPromos] = React.useState<PromoProduct[]>([]);
  const [promosStatus, setPromosStatus] =
    React.useState<FetchStatus>("loading");

  const [bestSellers, setBestSellers] = React.useState<Product[]>([]);
  const [bestSellersStatus, setBestSellersStatus] =
    React.useState<FetchStatus>("loading");

  const scrollerRef = React.useRef<HTMLDivElement>(null);

  // Fetch both lists once on mount (not just the active tab) so switching
  // tabs is instant with no re-fetch/loading flash.
  React.useEffect(() => {
    let cancelled = false;

    async function fetchPromos() {
      try {
        const res = await fetch("/api/products?promo=active", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load promo products");
        const data = await res.json();
        const list: PromoProduct[] = Array.isArray(data.products)
          ? data.products
          : [];
        if (!cancelled) {
          setPromos(list);
          setPromosStatus("ready");
        }
      } catch {
        if (!cancelled) setPromosStatus("error");
      }
    }

    async function fetchBestSellers() {
      try {
        const res = await fetch("/api/products/best-sellers?limit=8", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) {
          setBestSellers(Array.isArray(data.products) ? data.products : []);
          setBestSellersStatus("ready");
        }
      } catch {
        if (!cancelled) setBestSellersStatus("error");
      }
    }

    fetchPromos();
    fetchBestSellers();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live promos first, then upcoming ones.
  const highlights = React.useMemo(() => {
    return [...promos]
      .sort((a, b) => {
        const aUpcoming = isUpcoming(a);
        const bUpcoming = isUpcoming(b);
        if (aUpcoming !== bUpcoming) return aUpcoming ? 1 : -1;
        return 0;
      })
      .slice(0, MAX_HIGHLIGHTS);
  }, [promos]);

  const promosEmpty =
    promosStatus === "error" ||
    (promosStatus === "ready" && highlights.length === 0);
  const bestSellersEmpty =
    bestSellersStatus === "error" ||
    (bestSellersStatus === "ready" && bestSellers.length === 0);
  const bothSettled =
    promosStatus !== "loading" && bestSellersStatus !== "loading";

  // If the current (or default) tab turns out to be empty but the other one
  // has content, flip to whichever tab actually has something to show.
  React.useEffect(() => {
    if (!bothSettled) return;
    if (tab === "promos" && promosEmpty && !bestSellersEmpty)
      setTab("bestsellers");
    if (tab === "bestsellers" && bestSellersEmpty && !promosEmpty)
      setTab("promos");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothSettled, promosEmpty, bestSellersEmpty]);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  // Fail silently on the homepage if BOTH lists are empty/failed — no
  // promos and no best sellers, no section.
  if (bothSettled && promosEmpty && bestSellersEmpty) return null;

  const isPromos = tab === "promos";
  const status = isPromos ? promosStatus : bestSellersStatus;
  const seeAllHref = isPromos ? "/promos" : "#shop";

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/featured.png')" }}
        />
        {/* Readability overlay — lower the /NN value to let more image show through */}
        <div className="absolute inset-0 bg-background/30" />
      </div>

      <div className="container py-6 sm:py-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-4">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full border border-moss-200 bg-white/70 p-0.5 backdrop-blur">
              <button
                type="button"
                onClick={() => setTab("promos")}
                aria-pressed={isPromos}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  isPromos
                    ? "bg-yellow-300 text-moss-950"
                    : "text-moss-600 hover:text-moss-900"
                }`}
              >
                <Sparkles className="h-3 w-3" />
                Limited time
              </button>
              <button
                type="button"
                onClick={() => setTab("bestsellers")}
                aria-pressed={!isPromos}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors ${
                  !isPromos
                    ? "bg-green-600 text-white"
                    : "text-moss-600 hover:text-moss-900"
                }`}
              >
                Customer favorites
              </button>
            </div>
            <h2 className="mt-1.5 font-display text-xl font-medium text-moss-900 sm:text-2xl">
              {isPromos ? "Special Promos" : "Best sellers"}
            </h2>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href={seeAllHref}
              className="group flex items-center gap-1 text-sm font-medium text-forest hover:text-moss-900"
            >
              {isPromos ? "See all" : "View all"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => scrollByAmount(-1)}
                aria-label="Scroll left"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-green-500 text-green-600 transition-colors hover:bg-green-500 hover:text-white focus-ring"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount(1)}
                aria-label="Scroll right"
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-green-500 text-green-600 transition-colors hover:bg-green-500 hover:text-white focus-ring"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {status === "loading" ? (
          <CardsSkeleton width={isPromos ? CARD_WIDTH : 210} />
        ) : (
          <div
            ref={scrollerRef}
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 ..."
          >
            {isPromos
              ? highlights.map((product) => (
                  <div key={product.id} className="snap-start">
                    <PromoCard product={product} />
                  </div>
                ))
              : bestSellers.map((product) => (
                  <BestSellerCard key={product.id} product={product} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
