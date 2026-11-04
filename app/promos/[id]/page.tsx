"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { formatPHP } from "@/lib/utils";
import type { Category, Product } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { parseProductId } from "@/lib/slug";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

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

function isUpcoming(product: PromoProduct): boolean {
  if (!product.promoStart) return false;
  const start = new Date(product.promoStart);
  start.setHours(0, 0, 0, 0);
  return start > startOfToday();
}

function isActiveNow(product: PromoProduct): boolean {
  if (isUpcoming(product)) return false;
  if (product.promoEnd) {
    const end = new Date(product.promoEnd);
    end.setHours(23, 59, 59, 999);
    if (end.getTime() < startOfToday().getTime()) return false;
  }
  return true;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - startOfToday().getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function PromoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = React.useState<PromoProduct | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProduct = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The route param is "id-slug" (e.g. "123-tissue-name") — only the
      // leading numeric id is used to identify the product; the slug is
      // purely cosmetic/SEO.
      const productId = parseProductId(params.id);
      if (!productId) throw new Error("Invalid promo id");

      // No dedicated single-product endpoint was available, so we pull the
      // catalog and find the matching id. Swap this for `/api/products/${id}`
      // if/when a single-item endpoint exists.
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load product");
      const raw = await res.json();
      // The API may return a bare array or a wrapper like { products: [...] }
      // (the homepage promo strip assumes the wrapped shape) — handle both.
      const list: PromoProduct[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.products)
          ? raw.products
          : [];
      const found = list.find((p) => String(p.id) === productId) ?? null;
      setProduct(found);
      if (!found) setError("We couldn't find that promo.");
    } catch {
      setError("We couldn't load this promo. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const upcoming = product ? isUpcoming(product) : false;
  const active = product ? isActiveNow(product) : false;
  const canAddToCart = !!product && active && product.inStock;
  const daysToStart =
    product && upcoming ? daysUntil(product.promoStart) : null;
  const daysToEnd = product ? daysUntil(product.promoEnd) : null;

  const discountPct =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  return (
    <>
      {/* Background layer */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/promos.png')" }}
        />
      </div>

      <Navbar />
      <main className="container flex-1 py-8 sm:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-moss-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to promos
        </button>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-moss-200 border-t-forest" />
            <p className="text-sm text-muted-foreground">Loading promo...</p>
          </div>
        ) : error || !product ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-moss-200 py-16 text-center">
            <h2 className="font-display text-xl font-medium text-moss-900">
              {error ?? "We couldn't find that promo."}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              It may have ended, or the link might be off.
            </p>
            <Button asChild variant="gradient" className="mt-2">
              <Link href="/promos">Browse all promos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-moss-50">
              <Image
                src={resolveImageUrl(product.image)}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-cover ${!active ? "grayscale-[35%]" : ""}`}
                priority
              />
              {discountPct !== null && (
                <span className="absolute left-3 top-3 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold text-moss-950 shadow-sm">
                  -{discountPct}%
                </span>
              )}
              <span
                className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-sm ${
                  upcoming ? "bg-amber-500" : "bg-green-600"
                }`}
              >
                {upcoming ? (
                  <CalendarClock className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {upcoming ? "Coming soon" : "Promo"}
              </span>
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="rounded-full bg-moss-900 px-4 py-1.5 text-sm font-medium text-white">
                    Out of stock
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wide text-moss-500">
                {product.brand}
              </p>
              <h1 className="mt-1 font-display text-2xl font-medium text-moss-900 sm:text-3xl">
                {product.name}
              </h1>

              <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-moss-800">
                  {product.rating}
                </span>
                <span>({product.reviews} reviews)</span>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="rounded-md bg-yellow-300 px-2 py-1 font-display text-xl font-semibold text-moss-950">
                  {formatPHP(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPHP(product.originalPrice)}
                  </span>
                )}
              </div>

              {upcoming ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                  <CalendarClock className="h-4 w-4" />
                  {daysToStart === 0
                    ? "Starts today"
                    : `Starts ${formatDate(product.promoStart)} (in ${daysToStart} ${
                        daysToStart === 1 ? "day" : "days"
                      })`}
                </p>
              ) : (
                daysToEnd !== null && (
                  <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                    <Clock className="h-4 w-4" />
                    {daysToEnd === 0
                      ? "Ends today"
                      : `Ends ${formatDate(product.promoEnd)} (${daysToEnd} ${
                          daysToEnd === 1 ? "day" : "days"
                        } left)`}
                  </p>
                )
              )}

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {product.blurb}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Button
                  size="lg"
                  variant={canAddToCart ? "default" : "outline"}
                  disabled={!canAddToCart}
                  className={
                    canAddToCart
                      ? "flex-1 gap-2 bg-green-600 hover:bg-green-700 sm:flex-none"
                      : "flex-1 gap-2 sm:flex-none"
                  }
                  onClick={() => addItem(product as unknown as Product)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {upcoming
                    ? "Not available yet"
                    : !product.inStock
                      ? "Out of stock"
                      : "Add to cart"}
                </Button>
              </div>

              {upcoming && (
                <p className="mt-2 text-xs text-muted-foreground">
                  This promo hasn&apos;t started yet — check back once it goes
                  live.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
