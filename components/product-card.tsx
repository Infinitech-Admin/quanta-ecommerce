"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { formatPHP } from "@/lib/utils";
import { buildProductHref } from "@/lib/slug";

const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";
const PLACEHOLDER_IMAGE = "/products/placeholder.jpg";

function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return PLACEHOLDER_IMAGE;
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  return `${IMAGE_BASE_URL}${path}`;
}

const TAG_STYLES: Record<string, string> = {
  "Best Seller": "border-transparent bg-green-600 text-white",
  New: "border-transparent bg-yellow-400 text-moss-950",
};

// Tags that should never be shown as a badge.
const HIDDEN_TAGS = ["eco"];

export function ProductCard({ product }: { product: Product }) {
  const { lines, addItem, setQty } = useCart();
  const soldOut = !product.inStock || product.stock <= 0;

  // Quantity actually in the cart right now (0 if not added yet).
  const line = lines.find((l) => l.product.id === product.id);
  const cartQty = line?.qty ?? 0;

  // Locally staged quantity — the stepper only edits THIS. Nothing is
  // written to the cart until "Add to Cart" is pressed.
  const [pendingQty, setPendingQty] = useState(cartQty > 0 ? cartQty : 1);

  // Keep the staged qty in sync if the cart line changes elsewhere
  // (e.g. removed from the cart drawer).
  useEffect(() => {
    setPendingQty(cartQty > 0 ? cartQty : 1);
  }, [cartQty]);

  // Image source with fallback. Starts with the resolved URL and swaps
  // to the placeholder if the image fails to load.
  const [imgSrc, setImgSrc] = useState(resolveImageUrl(product.image));
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset if the product's image changes.
  useEffect(() => {
    setImgSrc(resolveImageUrl(product.image));
  }, [product.image]);

  // Catch images that already failed before React hydrated
  // (onError never fires in that case).
  useEffect(() => {
    const img = imgRef.current;
    if (
      img &&
      img.complete &&
      img.naturalWidth === 0 &&
      imgSrc !== PLACEHOLDER_IMAGE
    ) {
      setImgSrc(PLACEHOLDER_IMAGE);
    }
  }, [imgSrc]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty === 0) {
      addItem(product);
      if (pendingQty > 1) setQty(product.id, pendingQty);
    } else {
      setQty(product.id, pendingQty);
    }
  };

  const cardInner = (
    <>
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden bg-white`}
      >
        <Image
          ref={imgRef}
          src={imgSrc}
          alt={product.name}
          fill
          className="object-contain p-3 transition-all"
          sizes="(max-width: 768px) 50vw, 25vw"
          onError={() => {
            if (imgSrc !== PLACEHOLDER_IMAGE) setImgSrc(PLACEHOLDER_IMAGE);
          }}
        />

        {product.tag &&
          !soldOut &&
          !HIDDEN_TAGS.includes(product.tag.trim().toLowerCase()) && (
            <Badge
              className={`absolute left-2 top-2 z-10 sm:left-3 sm:top-3 ${
                TAG_STYLES[product.tag] ??
                "border-transparent bg-green-600 text-white"
              }`}
            >
              {product.tag}
            </Badge>
          )}
      </div>

      {/* Tighter padding on phones so the 2-column grid has room to breathe */}
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:p-5">
        {/* Price sits right under the image */}
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          {product.price != null && (
            <span className="rounded-md bg-yellow-300 px-1.5 py-0.5 font-display text-sm font-semibold text-moss-950">
              {formatPHP(product.price)}
            </span>
          )}
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPHP(product.originalPrice)}
            </span>
          )}
        </div>

        <span className="mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-green-600">
          {product.brand}
        </span>

        {/* Fixed-height slot: reserves room for 2 lines. */}
        <h3 className="line-clamp-2 min-h-[2.25rem] font-display text-sm font-medium leading-snug text-moss-900">
          {product.name}
        </h3>

        {/* Single-line blurb slot keeps the card compact. */}
        <p className="line-clamp-1 min-h-[1rem] text-xs leading-relaxed text-muted-foreground">
          {product.blurb}
        </p>

        {/* Bottom action row. flex-wrap lets the Add to Cart button drop
            below the stepper (full width) whenever the card is too narrow
            to fit both side by side, so nothing is ever clipped. */}
        <div className="mt-auto pt-2">
          <div
            className="flex flex-wrap items-center gap-1.5"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex shrink-0 items-center rounded-full border border-moss-200 bg-white">
              <button
                type="button"
                aria-label={`Decrease quantity of ${product.name}`}
                className="flex h-9 w-7 items-center justify-center text-moss-700 hover:text-green-700 disabled:cursor-not-allowed disabled:text-moss-300"
                disabled={soldOut || pendingQty <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPendingQty((q) => Math.max(1, q - 1));
                }}
              >
                −
              </button>
              <span className="w-5 text-center font-mono text-sm text-moss-900">
                {pendingQty}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${product.name}`}
                className="flex h-9 w-7 items-center justify-center text-moss-700 hover:text-green-700 disabled:cursor-not-allowed disabled:text-moss-300"
                disabled={soldOut}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPendingQty((q) => q + 1);
                }}
              >
                +
              </button>
            </div>

            <Button
              type="button"
              disabled={soldOut}
              className="h-9 min-w-[7rem] flex-1 whitespace-nowrap rounded-full bg-green-600 px-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-moss-200 disabled:text-moss-500 disabled:opacity-100"
              onClick={handleAddToCart}
            >
              {soldOut
                ? "Sold Out"
                : cartQty > 0 && cartQty === pendingQty
                  ? "In Cart"
                  : cartQty > 0
                    ? "Update"
                    : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Link
      href={buildProductHref(product)}
      className="paper-fold group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-moss-100 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {cardInner}
    </Link>
  );
}

// Loading placeholder that mirrors ProductCard's real layout so the grid
// doesn't shift once real cards load in.
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-moss-100 bg-card shadow-sm">
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-5">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="mt-1 h-3 w-16" />
        <Skeleton className="mt-1 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-1 h-3 w-full" />

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 min-w-[7rem] flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
}
