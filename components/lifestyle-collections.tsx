"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionPaperBackground } from "@/components/section-wave-background";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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

// Slideshow settings.
const MAX_SLIDES = 10;
const BASE_INTERVAL_MS = 3000;
// Each tile gets a slightly longer interval than the one before it, so the
// tiles drift out of sync instead of all changing at the same moment.
const INTERVAL_STAGGER_MS = 300;

// Shape returned by GET /api/categories. Images can be listed as
//   images: ["https://…/a.jpg", …]  or  images: [{ image_url: "…" }, …]
// A tile with only `image_url` still works as a single-image tile.
type TileImage = string | { image_url?: string; url?: string };

type CategoryTile = {
  id: number;
  image_url?: string;
  images?: TileImage[];
  sort_order: number;
};

function getTileImages(tile: CategoryTile | undefined): string[] {
  if (!tile) return [];

  const fromList = (tile.images ?? [])
    .map((img) =>
      typeof img === "string" ? img : (img?.image_url ?? img?.url ?? ""),
    )
    .filter((src): src is string => Boolean(src));

  const urls =
    fromList.length > 0 ? fromList : tile.image_url ? [tile.image_url] : [];

  return urls.slice(0, MAX_SLIDES);
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

// One slide: the image fills the whole tile (object-cover, same as the
// original single-image tiles), cross-faded by the wrapper's opacity.
function Slide({
  src,
  alt,
  sizes,
  active,
  priority,
  onLoad,
}: {
  src: string;
  alt: string;
  sizes: string;
  active: boolean;
  priority?: boolean;
  onLoad?: () => void;
}) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        "absolute inset-0 transition-opacity duration-700 ease-in-out",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover object-center"
        onLoad={onLoad}
      />
    </div>
  );
}

function CollectionCard({
  collection,
  images,
  tileIndex,
  sizes = "100vw",
  className = "",
}: {
  collection: (typeof COLLECTIONS)[number];
  // undefined = still loading -> skeleton
  images: string[] | undefined;
  tileIndex: number;
  sizes?: string;
  className?: string;
}) {
  const count = images?.length ?? 0;
  const multiple = count > 1;

  const [active, setActive] = React.useState(0);
  // The slide we just left stays mounted so it can fade out smoothly, even
  // when a dot jumps several slides at once.
  const [last, setLast] = React.useState<number | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [firstLoaded, setFirstLoaded] = React.useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const goTo = React.useCallback(
    (next: number) => {
      if (count === 0) return;
      const target = ((next % count) + count) % count;
      setActive((current) => {
        if (target !== current) setLast(current);
        return target;
      });
    },
    [count],
  );

  // Keep the active index valid if the number of images changes.
  React.useEffect(() => {
    if (active >= count && count > 0) {
      setActive(0);
      setLast(null);
    }
  }, [active, count]);

  // Reset the "first image loaded" flag if the first image itself changes.
  const firstSrc = images?.[0];
  React.useEffect(() => {
    setFirstLoaded(false);
  }, [firstSrc]);

  // Autoplay. Restarts whenever the active slide changes, so clicking an
  // arrow or dot gives the customer a full interval on the slide they chose.
  React.useEffect(() => {
    if (!multiple || paused || reducedMotion || !firstLoaded) return;
    const id = window.setTimeout(
      () => goTo(active + 1),
      BASE_INTERVAL_MS + tileIndex * INTERVAL_STAGGER_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, multiple, paused, reducedMotion, firstLoaded, goTo, tileIndex]);

  // Only mount the slides that can be on screen soon: the current one, the
  // one fading out, and its two neighbours (so the next image is preloaded).
  const mounted = new Set<number>();
  if (count > 0) {
    mounted.add(active);
    if (last !== null) mounted.add(last);
    mounted.add((active + 1) % count);
    mounted.add((active - 1 + count) % count);
  }

  const stop = (e: React.MouseEvent) => {
    // The whole card is a <Link>, so don't navigate on arrow / dot clicks.
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={collection.href}
      className={`group relative block overflow-hidden rounded-2xl bg-green-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {(!images || !firstLoaded) && (
        <Skeleton className="absolute inset-0 rounded-none" />
      )}

      {images?.map((src, i) =>
        mounted.has(i) ? (
          <Slide
            key={`${i}-${src}`}
            src={src}
            alt={
              multiple
                ? `${collection.name}, image ${i + 1} of ${count}`
                : collection.name
            }
            sizes={sizes}
            active={i === active}
            priority={tileIndex < 2 && i === 0}
            onLoad={i === 0 ? () => setFirstLoaded(true) : undefined}
          />
        ) : null,
      )}

      {multiple && (
        <>
          <button
            type="button"
            aria-label={`Previous image, ${collection.name}`}
            onClick={(e) => {
              stop(e);
              goTo(active - 1);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-moss-900 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-90 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={`Next image, ${collection.name}`}
            onClick={(e) => {
              stop(e);
              goTo(active + 1);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-moss-900 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-90 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2 py-1.5 backdrop-blur-sm"
            role="tablist"
            aria-label={`Slides for ${collection.name}`}
          >
            {images?.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Show image ${i + 1} of ${count}`}
                onClick={(e) => {
                  stop(e);
                  goTo(i);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/60 hover:bg-white/90",
                )}
              />
            ))}
          </div>
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
              .filter((t) => t && getTileImages(t).length > 0)
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

  // Images for slot i: the i-th tile from the admin (one or many), else the
  // static fallback. While loading (tiles === null) it's undefined so a
  // skeleton shows instead of flashing the old images.
  const imagesFor = (index: number): string[] | undefined => {
    if (tiles === null) return undefined;
    const fromApi = getTileImages(tiles[index]);
    return fromApi.length > 0 ? fromApi : [COLLECTIONS[index].image];
  };

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
            Below lg: each tile uses its own aspect ratio. */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:aspect-[1240/520] lg:grid-cols-3 lg:grid-rows-2">
          {/* Tile 1 – tall (800 x 1040 = 10:13) */}
          <CollectionCard
            collection={COLLECTIONS[0]}
            images={imagesFor(0)}
            tileIndex={0}
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="aspect-[10/13] lg:col-span-1 lg:row-span-2 lg:aspect-auto lg:h-full"
          />

          {/* Tile 2 – wide (1640 x 500 = 82:25) */}
          <CollectionCard
            collection={COLLECTIONS[1]}
            images={imagesFor(1)}
            tileIndex={1}
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="aspect-[82/25] lg:col-span-2 lg:aspect-auto lg:h-full"
          />

          {/* Tiles 3 & 4 – small (800 x 500 = 8:5) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:col-span-2 lg:h-full lg:grid-rows-1">
            <CollectionCard
              collection={COLLECTIONS[2]}
              images={imagesFor(2)}
              tileIndex={2}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[8/5] lg:aspect-auto lg:h-full"
            />
            <CollectionCard
              collection={COLLECTIONS[3]}
              images={imagesFor(3)}
              tileIndex={3}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="aspect-[8/5] lg:aspect-auto lg:h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
