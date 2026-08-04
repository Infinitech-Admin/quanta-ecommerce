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

  return (
    <Link
      href={buildProductHref(product)}
      className="paper-fold group flex flex-col rounded-2xl border border-moss-100 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br ${product.color}`}
      >
        <Image
          src={resolveImageUrl(product.image)}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {product.tag && (
          <Badge
            className={`absolute left-3 top-3 z-10 ${
              TAG_STYLES[product.tag] ??
              "border-transparent bg-green-600 text-white"
            }`}
          >
            {product.tag}
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-t-2xl bg-moss-950/40">
            <Badge
              variant="outline"
              className="border-white/60 bg-white/90 text-moss-900"
            >
              Sold out
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
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
            <span className="rounded-md bg-yellow-300 px-1.5 py-0.5 font-display text-base font-semibold text-moss-950">
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
            variant={product.inStock ? "default" : "outline"}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
            className={
              product.inStock ? "bg-green-600 hover:bg-green-700" : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
