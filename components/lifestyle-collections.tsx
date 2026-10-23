"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionPaperBackground } from "@/components/section-wave-background";
import { Skeleton } from "@/components/ui/skeleton";

// Names + links stay fixed per position. Only the IMAGES are dynamic: they
// come from the admin "Category Tiles" page (/api/categories), matched by
// order (lowest sort_order = 1st tile, and so on).
//
// The `image` here is only a fallback, used when the API fails or has fewer
// tiles than slots.
//
// Recommended upload sizes (so nothing gets cropped). These match the
// aspect ratios used by the tiles below and by the admin page:
//   1st tile (tall)  800 x 1040 px  -> 10:13
//   2nd tile (wide)  1640 x 500 px  -> 82:25
//   3rd, 4th (small) 800 x 500 px   -> 8:5
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

// Shape returned by GET /api/categories
type CategoryTile = {
  id: number;
  image_url: string;
  sort_order: number;
};

function CollectionCard({
  collection,
  image,
  sizes = "100vw",
  className = "",
}: {
  collection: (typeof COLLECTIONS)[number];
  image: string | undefined;
  sizes?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Link
      href={collection.href}
      className={`group relative block overflow-hidden rounded-2xl bg-green-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      {(!image || !loaded) && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {image && (
        <>
          {/* Blurred backdrop: only visible if the image's shape differs
              from the tile, so there are never empty bars. */}
          <Image
            key={`bg-${image}`}
            src={image}
            alt=""
            aria-hidden
            fill
            sizes="100px"
            className={`scale-110 object-cover blur-2xl transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Main image: object-contain = the whole image is always shown,
              nothing is cropped. */}
          <Image
            key={image}
            src={image}
            alt={collection.name}
            fill
            sizes={sizes}
            className={`object-contain object-center transition-opacity duration-500 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setLoaded(true)}
          />
        </>
      )}
    </Link>
  );
}

export function LifestyleCollections() {
  // null = still loading, [] = loaded but none / failed
  const [tiles, setTiles] = React.useState<CategoryTile[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();

        // Raw array, or wrapped as { categories: [...] } / { data: [...] }.
        const list: CategoryTile[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : Array.isArray(data?.data)
              ? data.data
              : [];

        if (!cancelled) {
          setTiles(
            list
              .filter((t) => t?.image_url)
              .sort((a, b) => a.sort_order - b.sort_order),
          );
        }
      } catch {
        if (!cancelled) setTiles([]); // fall back to the static images
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Image for slot i: the i-th tile from the admin, else the static fallback.
  // While loading (tiles === null) it's undefined so a skeleton shows instead
  // of flashing the old images.
  const imageFor = (index: number): string | undefined =>
    tiles === null
      ? undefined
      : (tiles[index]?.image_url ?? COLLECTIONS[index].image);

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

        {/* Desktop (lg+): the whole grid keeps the 1240 x 520 shape the admin
            page assumes (two 400px columns + one 820px span, 250px rows,
            20px gaps), so every tile keeps its slot ratio at any width.
            Below lg: each tile uses its own aspect ratio, so nothing is cut. */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:aspect-[1240/520] lg:grid-cols-3 lg:grid-rows-2">
          {/* Tile 1 – tall (800 x 1040 = 10:13) */}
          <CollectionCard
            collection={COLLECTIONS[0]}
            image={imageFor(0)}
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="aspect-[10/13] lg:col-span-1 lg:row-span-2 lg:aspect-auto lg:h-full"
          />

          {/* Tile 2 – wide (1640 x 500 = 82:25) */}
          <CollectionCard
            collection={COLLECTIONS[1]}
            image={imageFor(1)}
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="aspect-[82/25] lg:col-span-2 lg:aspect-auto lg:h-full"
          />

          {/* Tiles 3 & 4 – small (800 x 500 = 8:5) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-2 lg:h-full lg:grid-rows-1">
            <CollectionCard
              collection={COLLECTIONS[2]}
              image={imageFor(2)}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[8/5] lg:aspect-auto lg:h-full"
            />
            <CollectionCard
              collection={COLLECTIONS[3]}
              image={imageFor(3)}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[8/5] lg:aspect-auto lg:h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
