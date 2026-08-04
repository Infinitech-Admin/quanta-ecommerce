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
  Star,
  PackageX,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
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
      {/* Background layer */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/products-bg2.png')" }}
        />
      </div>

      <Navbar />
      <main className="container flex-1 py-8 sm:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-moss-600 hover:text-moss-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-moss-200 border-t-forest" />
            <p className="text-sm text-muted-foreground">Loading product...</p>
          </div>
        ) : error || !product ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
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
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-moss-100 bg-moss-50">
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
            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wide text-moss-500">
                {product.brand}
              </p>
              <h1 className="mt-1 font-display text-2xl font-medium text-moss-900 sm:text-3xl">
                {product.name}
              </h1>

              {(product.rating || product.reviews) && (
                <div className="mt-2 flex items-center gap-1.5 text-sm text-moss-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">
                    ({product.reviews} reviews)
                  </span>
                </div>
              )}

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
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {product.blurb}
                </p>
              )}

              <p className="mt-4 text-sm">
                {product.inStock ? (
                  <span className="text-green-700">
                    In stock
                    {typeof product.stock === "number"
                      ? ` (${product.stock} available)`
                      : ""}
                  </span>
                ) : (
                  <span className="text-destructive">Out of stock</span>
                )}
              </p>

              {/* Quantity + add to cart */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center rounded-full border border-moss-200">
                  <button
                    type="button"
                    disabled={!canAddToCart || quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-moss-600 disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-moss-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={!canAddToCart || quantity >= maxQuantity}
                    onClick={() =>
                      setQuantity((q) => Math.min(maxQuantity, q + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center text-moss-600 disabled:opacity-40"
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
                      ? "flex-1 bg-green-600 hover:bg-green-700"
                      : "flex-1"
                  }
                  variant={canAddToCart ? "default" : "outline"}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  {justAdded
                    ? "Added to cart!"
                    : canAddToCart
                      ? "Add to cart"
                      : "Out of stock"}
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
        )}
      </main>
      <Footer />
    </>
  );
}
