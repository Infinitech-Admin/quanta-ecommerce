"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  PackageX,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPHP } from "@/lib/utils";
import type { Product } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { parseProductId } from "@/lib/slug";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

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

// Shared look for the details column (used by both the skeleton and the real
// content so there's no layout jump when the product loads).
const DETAILS_CARD_CLASS =
  "relative flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-[#f7f8ea]/75 via-[#eef5dc]/75 to-[#e2f0d2]/75 p-6 shadow-lg shadow-green-900/10 sm:p-8";

// Pure-CSS green page background (no image): a green gradient with a soft
// light glow in the top-left and large translucent rings, echoing the mockup.
function GreenBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-[#f6f9dc] via-green-300 to-green-600"
    >
      {/* Light glow, top-left */}
      <div className="absolute -left-1/4 -top-1/3 h-[80vh] w-[80vh] rounded-full bg-[#fffbe0]/70 blur-3xl" />

      {/* Big translucent Q mark, bottom-right */}
      <svg
        viewBox="0 0 400 400"
        className="absolute right-[2vw] top-1/2 h-[105vh] w-[105vh] max-w-none -translate-y-1/2 text-white opacity-45"
        fill="none"
      >
        {/* Tilted oval ring with a thick-thin feel (two offset strokes) */}
        <g transform="rotate(-28 190 190)">
          <ellipse
            cx="190"
            cy="190"
            rx="118"
            ry="160"
            stroke="currentColor"
            strokeWidth="26"
          />
          <ellipse
            cx="198"
            cy="190"
            rx="118"
            ry="160"
            stroke="currentColor"
            strokeWidth="6"
            opacity="0.6"
          />
        </g>
        {/* Tail of the Q */}
        <rect
          x="262"
          y="262"
          width="30"
          height="120"
          rx="15"
          fill="currentColor"
          transform="rotate(-48 277 322)"
        />
      </svg>
    </div>
  );
}

// Decorative layer for the details card: cart watermark, dotted grid, arc.
function DetailsDecor() {
  return (
    <>
      <ShoppingCart
        aria-hidden
        className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 text-green-500/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 top-[42%] h-16 w-28 opacity-40 [background-image:radial-gradient(circle,#84cc16_1.5px,transparent_1.5px)] [background-size:12px_12px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 top-[30%] h-80 w-80 rounded-full border border-green-500/20"
      />
    </>
  );
}

// Loading placeholder mirroring the real two-column layout below: a square
// image block on the left, and brand/title/rating/price/description/
// quantity+cart on the right, so there's no layout jump once the product
// loads in.
function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <Skeleton className="aspect-square w-full rounded-2xl" />

      <div className={DETAILS_CARD_CLASS}>
        <DetailsDecor />
        <div className="relative flex flex-col">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-8 w-3/4" />

          <Skeleton className="mt-3 h-4 w-32" />

          <Skeleton className="mt-4 h-8 w-40" />

          <Skeleton className="mt-3 h-5 w-24 rounded-full" />

          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-11 flex-1 rounded-md" />
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-moss-100 pt-6 sm:flex-row sm:gap-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [justAdded, setJustAdded] = React.useState(false);

  const fetchProduct = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productId = parseProductId(params.id);
      if (!productId) throw new Error("Invalid product id");

      const res = await fetch(`/api/products/${productId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load product");
      const data: Product = await res.json();
      setProduct(data);
    } catch {
      setError("We couldn't load this product. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  React.useEffect(() => {
    setQuantity(1);
  }, [product?.id]);

  const discountPct =
    product?.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : null;

  const canAddToCart = !!product?.inStock;
  const maxQuantity = product?.stock && product.stock > 0 ? product.stock : 1;

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <>
      {/* Background layer (pure CSS, no image) */}
      <GreenBackground />

      <Navbar />
      <main className="container flex-1 py-8 sm:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {loading ? (
          <ProductDetailSkeleton />
        ) : error || !product ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl bg-white/80 px-6 py-16 text-center backdrop-blur">
            <PackageX className="h-10 w-10 text-moss-400" />
            <p className="text-sm text-destructive">
              {error ?? "Product not found."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchProduct}>
                Try again
              </Button>
              <Button asChild variant="gradient">
                <Link href="/shop">Back to shop</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/60 bg-moss-50 shadow-lg shadow-green-900/10">
              <Image
                src={resolveImageUrl(product.image)}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
              {discountPct !== null && (
                <span className="absolute left-3 top-3 rounded-full bg-yellow-300 px-2.5 py-1 text-xs font-bold text-moss-950 shadow-sm">
                  -{discountPct}%
                </span>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <span className="rounded-full bg-moss-900 px-4 py-1.5 text-sm font-medium text-white">
                    Out of stock
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className={DETAILS_CARD_CLASS}>
              <DetailsDecor />

              {/* Content sits above the decorative layer */}
              <div className="relative flex flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-moss-500">
                  {product.brand}
                </p>
                <h1 className="mt-1 font-display text-2xl font-medium text-moss-900 sm:text-3xl">
                  {product.name}
                </h1>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold text-moss-900 sm:text-3xl">
                    {formatPHP(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="font-mono text-base text-muted-foreground line-through">
                      {formatPHP(product.originalPrice)}
                    </span>
                  )}
                </div>

                {product.tag && (
                  <span className="mt-3 inline-flex w-fit items-center rounded-full bg-moss-100 px-2.5 py-1 text-xs font-medium text-moss-700">
                    {product.tag}
                  </span>
                )}

                {product.blurb && (
                  <div className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {product.blurb.includes(",") ? (
                      <>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-moss-500">
                          Specifications
                        </p>
                        <ul className="list-disc space-y-1 pl-5">
                          {product.blurb
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                            .map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                        </ul>
                      </>
                    ) : (
                      <p>{product.blurb}</p>
                    )}
                  </div>
                )}

                {/* Quantity + add to cart */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 shrink-0 items-center rounded-full border border-moss-200 bg-white/40">
                    <button
                      type="button"
                      disabled={!canAddToCart || quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-9 items-center justify-center text-moss-600 disabled:opacity-40 sm:w-10"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-moss-900 sm:w-8">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={!canAddToCart || quantity >= maxQuantity}
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQuantity, q + 1))
                      }
                      className="flex h-10 w-9 items-center justify-center text-moss-600 disabled:opacity-40 sm:w-10"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    disabled={!canAddToCart}
                    onClick={handleAddToCart}
                    className={
                      canAddToCart
                        ? "h-11 min-w-0 flex-1 bg-green-600 hover:bg-green-700"
                        : "h-11 min-w-0 flex-1"
                    }
                    variant={canAddToCart ? "default" : "outline"}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {justAdded
                        ? "Added to cart!"
                        : canAddToCart
                          ? "Add to cart"
                          : "Out of stock"}
                    </span>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex flex-col gap-3 border-t border-moss-100 pt-6 text-sm text-moss-600 sm:flex-row sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-moss-500" />
                    Fast, reliable delivery
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-moss-500" />
                    100% genuine products
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
