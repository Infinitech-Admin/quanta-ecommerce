"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { useCart } from "@/context/cart-context";
import { formatPHP } from "@/lib/utils";
import { buildProductHref } from "@/lib/slug";

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

const TAG_STYLES: Record<string, string> = {
  "Best Seller": "border-transparent bg-green-600 text-white",
  Eco: "border-transparent bg-lime-500 text-moss-950",
  New: "border-transparent bg-yellow-400 text-moss-950",
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const soldOut = !product.inStock || product.stock <= 0;

  const cardInner = (
    <>
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${product.color}`}
      >
        <Image
          src={resolveImageUrl(product.image)}
          alt={product.name}
          fill
          className={`object-cover transition-all ${
            soldOut ? "grayscale" : ""
          }`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {product.tag && !soldOut && (
          <Badge
            className={`absolute left-3 top-3 z-10 ${
              TAG_STYLES[product.tag] ??
              "border-transparent bg-green-600 text-white"
            }`}
          >
            {product.tag}
          </Badge>
        )}

        {soldOut && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-moss-950/35">
            <span className="-rotate-[12deg] rounded-sm border-2 border-white/90 bg-moss-950/70 px-4 py-1 text-sm font-bold uppercase tracking-widest text-white shadow-sm">
              Sold out
            </span>
          </div>
        )}
      </div>

      {/* Diagonal strike-through across the whole card */}
      {soldOut && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom right, transparent calc(50% - 1px), rgba(28,38,28,0.55) calc(50% - 1px), rgba(28,38,28,0.55) calc(50% + 1px), transparent calc(50% + 1px))",
          }}
        />
      )}

      <div
        className={`flex flex-1 flex-col gap-1 p-3.5 ${
          soldOut ? "opacity-60" : ""
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
          {product.brand}
        </span>
        <h3 className="line-clamp-2 font-display text-sm font-medium leading-snug text-moss-900">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.blurb}
        </p>

        {/* <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium text-moss-800">{product.rating}</span>
          <span>({product.reviews})</span>
        </div> */}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`rounded-md px-1.5 py-0.5 font-display text-base font-semibold ${
                soldOut
                  ? "bg-moss-200 text-moss-500"
                  : "bg-yellow-300 text-moss-950"
              }`}
            >
              {formatPHP(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPHP(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant={soldOut ? "outline" : "default"}
            disabled={soldOut}
            aria-label={`Add ${product.name} to cart`}
            className={!soldOut ? "bg-green-600 hover:bg-green-700" : undefined}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (soldOut) return;
              addItem(product);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  // Sold-out products aren't clickable at all — render as a plain div
  // instead of a Link so there's no navigation, no href, no cursor
  // pointer, and no way to tab into it as a link.
  if (soldOut) {
    return (
      <div
        aria-disabled="true"
        className="paper-fold relative flex cursor-not-allowed flex-col overflow-hidden rounded-2xl border border-moss-100 bg-card shadow-sm"
      >
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={buildProductHref(product)}
      className="paper-fold group relative flex flex-col overflow-hidden rounded-2xl border border-moss-100 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {cardInner}
    </Link>
  );
}
