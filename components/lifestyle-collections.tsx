"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionPaperBackground } from "@/components/section-wave-background";
import { Skeleton } from "@/components/ui/skeleton";

const COLLECTIONS = [
  {
    name: "Health essentials",
    href: "/shop?category=Health%20Care",
    image: "/shop_by_need-02.jpg",
  },
  {
    name: "Household must haves",
    href: "/shop?category=Household",
    image: "/shop_by_need-01.jpg",
  },
  {
    name: "Kitchen companion",
    href: "/shop?category=Kitchen",
    image: "/shop_by_need-03.jpg",
  },
  {
    name: "Mother & baby needs",
    href: "/shop?category=Baby%20Care",
    image: "/shop_by_need-04.jpg",
  },
] as const;

function CollectionCard({
  collection,
  className = "",
}: {
  collection: (typeof COLLECTIONS)[number];
  className?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Link
      href={collection.href}
      className={`group relative block overflow-hidden rounded-2xl bg-green-700 shadow-sm transition-shadow hover:shadow-xl ${className}`}
    >
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <Image
        src={collection.image}
        alt={collection.name}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={`object-cover object-center transition-all duration-500 ease-out group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadingComplete={() => setLoaded(true)}
      />
    </Link>
  );
}

export function LifestyleCollections() {
  return (
    <section className="relative w-full overflow-hidden">
      <SectionPaperBackground />

      <div className="container py-14 sm:py-16">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
            Shop by category
          </span>
          <h2 className="mt-2 font-display text-3xl font-medium text-moss-900 sm:text-4xl">
            Find what your home needs
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:h-[520px] lg:grid-cols-3">
          <CollectionCard
            collection={COLLECTIONS[0]}
            className="h-80 sm:h-[420px] lg:col-span-1 lg:row-span-2 lg:h-full"
          />
          <CollectionCard
            collection={COLLECTIONS[1]}
            className="h-52 lg:col-span-2 lg:h-full"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-2 lg:h-full">
            <CollectionCard
              collection={COLLECTIONS[2]}
              className="h-52 lg:h-full"
            />
            <CollectionCard
              collection={COLLECTIONS[3]}
              className="h-52 lg:h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
