"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatPHP } from "@/lib/utils";
import type { Product } from "@/types/product"; // adjust path to your types file

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

export function BestSellers() {
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const { addItem } = useCart();
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBestSellers() {
      try {
        const res = await fetch("/api/products/best-sellers?limit=8", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!cancelled) {
          setBestSellers(Array.isArray(data.products) ? data.products : []);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    fetchBestSellers();
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollByAmount = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (status === "loading") {
    return (
      <section className="bg-moss-50/40 py-14 sm:py-16">
        <div className="container">
          <div className="mt-8 flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[320px] w-[210px] shrink-0 animate-pulse rounded-3xl bg-moss-100 sm:w-[240px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // status === "error" or an empty result (no qualifying orders yet)
  if (status === "error" || bestSellers.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-moss-50/40 py-14 sm:py-16">
      {/* Background layer */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: "url('/bestseller.png')" }}
        />
        {/* Readability overlay — lower the /NN value to let more image show through */}
        <div className="absolute inset-0 bg-background/30" />
      </div>

      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
              Customer favorites
            </p>
            <h2 className="mt-1 font-display text-3xl font-medium text-moss-900 sm:text-4xl">
              Best sellers
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="#shop"
              className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 sm:flex"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
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

        <div
          ref={scrollerRef}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {bestSellers.map((product) => (
            <div
              key={product.id}
              className="group flex w-[210px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-moss-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-green-300 sm:w-[240px]"
            >
              <div className="relative m-2.5 aspect-square overflow-hidden rounded-2xl bg-moss-50">
                <Image
                  src={`${IMAGE_URL}${product.image}`}
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
          ))}
        </div>

        <Link
          href="#shop"
          className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-moss-700 hover:text-moss-900 sm:hidden"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
