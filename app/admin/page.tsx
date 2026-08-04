"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, PackageX, Tags, Star, ArrowUpRight } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type Product } from "@/types/product";
import { formatPHP } from "@/lib/utils";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
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

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => !p.inStock).length;
  const inStock = totalProducts - outOfStock;
  const avgRating =
    totalProducts > 0
      ? products.reduce((sum, p) => sum + p.rating, 0) / totalProducts
      : 0;

  const categoryCounts = CATEGORIES.map((cat) => ({
    category: cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  const lowStockOrOut = products.filter((p) => !p.inStock).slice(0, 5);

  const stats = [
    {
      label: "Total Products",
      value: totalProducts,
      icon: Package,
      accent: "bg-green-600",
    },
    {
      label: "In Stock",
      value: inStock,
      icon: Tags,
      accent: "bg-lime-500",
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: PackageX,
      accent: "bg-red-500",
    },
    {
      label: "Avg. Rating",
      value: totalProducts > 0 ? avgRating.toFixed(1) : "—",
      icon: Star,
      accent: "bg-amber-400",
    },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col bg-moss-50/40 md:flex-row">
        <AdminSidebar />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-moss-100 sm:h-28"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col bg-moss-50/40 md:flex-row">
        <AdminSidebar />
        <main className="flex flex-1 items-center justify-center px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
          <p className="text-center text-sm text-muted-foreground">
            Couldn&apos;t load dashboard data. Please refresh.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-moss-50/40 md:flex-row">
      <AdminSidebar />

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <div className="mb-5 flex flex-col gap-1 sm:mb-6">
          <h1 className="font-display text-xl font-semibold text-moss-900 sm:text-2xl">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of your catalog at a glance.
          </p>
        </div>

        {/* Stat cards — 2-up on phones, 2-up on tablets, 4-up on desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-moss-100 bg-card p-3.5 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-medium uppercase leading-tight tracking-wide text-muted-foreground sm:text-xs">
                  {stat.label}
                </span>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white sm:h-8 sm:w-8 ${stat.accent}`}
                >
                  <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              </div>
              <p className="mt-2 font-display text-2xl font-semibold text-moss-900 sm:mt-3 sm:text-3xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 lg:grid-cols-5">
          {/* Category breakdown */}
          <div className="rounded-2xl border border-moss-100 bg-card p-4 shadow-sm sm:p-5 lg:col-span-2">
            <h2 className="font-display text-base font-semibold text-moss-900">
              Products by Category
            </h2>
            <div className="mt-4 space-y-3">
              {categoryCounts.map(({ category, count }) => {
                const pct =
                  totalProducts > 0
                    ? Math.round((count / totalProducts) * 100)
                    : 0;
                return (
                  <div key={category}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-moss-800">
                        {category}
                      </span>
                      <span className="text-muted-foreground">
                        {count} items
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-moss-100">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Needs attention */}
          <div className="rounded-2xl border border-moss-100 bg-card p-4 shadow-sm sm:p-5 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-moss-900">
                Needs Attention
              </h2>
              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:underline"
              >
                Manage products <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {lowStockOrOut.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Everything is currently in stock. Nice work.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {lowStockOrOut.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl border border-moss-100 p-2.5"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-moss-100">
                      <Image
                        src={`${IMAGE_URL}${product.image}`}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-moss-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.brand} &middot; {formatPHP(product.price)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-red-200 bg-red-50 text-red-600"
                    >
                      Out of stock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
