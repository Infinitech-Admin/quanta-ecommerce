"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { SectionPaperBackground } from "@/components/section-wave-background";

// Category shape as returned by the Laravel API — the model only stores
// `image` and `sort_order`; the API appends `image_url` as the
// ready-to-use absolute URL. See app/admin/categories/page.tsx for the
// admin CRUD that manages these.
type Category = {
  id: number;
  image_url: string;
  sort_order: number;
};

// Where every tile links to. There's no per-category href anymore since
// the model only stores an image, so all tiles point at the shop section.
const SHOP_HREF = "#shop";

function Tile({
  category,
  className = "",
  imgClassName = "",
}: {
  category: Category;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <Link
      href={SHOP_HREF}
      className={`group relative block overflow-hidden rounded-3xl bg-moss-100 shadow-sm transition-shadow hover:shadow-xl ${className}`}
    >
      <Image
        src={category.image_url}
        alt="Shop category"
        fill
        sizes="(min-width: 1024px) 40vw, 100vw"
        className={`object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${imgClassName}`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
        <Leaf className="h-4 w-4" />
      </span>
    </Link>
  );
}

function TileSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-3xl bg-moss-100 ${className}`}
      aria-hidden
    />
  );
}

export function LifestyleCollections() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();

        // API might return a raw array, or a wrapped shape like
        // { categories: [...] } / { data: [...] } — normalize either way.
        const list: Category[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : Array.isArray(data?.data)
              ? data.data
              : [];

        if (isMounted) {
          setCategories([...list].sort((a, b) => a.sort_order - b.sort_order));
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err instanceof Error ? err.message : "Failed to load categories",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Hide the section entirely once we know for sure there's nothing to
  // show — an empty "Shop by category" row would look broken.
  if (!isLoading && !loadError && categories.length === 0) {
    return null;
  }

  const [primary, ...rest] = categories;
  const secondary = rest.slice(0, 2);

  return (
    <section className="relative w-full overflow-hidden">
      <SectionPaperBackground />

      <div className="container py-14 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Shop by category
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium text-moss-900 sm:text-4xl">
              Find what your home needs
            </h2>
          </div>
        </div>

        {loadError && (
          <div className="rounded-2xl border border-moss-200 bg-white py-10 text-center text-sm text-red-600 shadow-sm">
            {loadError}
          </div>
        )}

        {!loadError && (
          <div className="flex flex-col gap-4 sm:gap-5 lg:h-[520px] lg:flex-row">
            {isLoading ? (
              <>
                <TileSkeleton className="h-80 sm:h-[420px] lg:h-full lg:w-2/3" />
                <div className="flex gap-4 sm:gap-5 lg:h-full lg:w-1/3 lg:flex-col">
                  <TileSkeleton className="h-52 flex-1 lg:h-1/2" />
                  <TileSkeleton className="h-52 flex-1 lg:h-1/2" />
                </div>
              </>
            ) : (
              <>
                {primary && (
                  <Tile
                    category={primary}
                    className="h-80 sm:h-[420px] lg:h-full lg:w-2/3"
                    imgClassName="object-top"
                  />
                )}

                {secondary.length > 0 && (
                  <div className="flex gap-4 sm:gap-5 lg:h-full lg:w-1/3 lg:flex-col">
                    {secondary.map((category) => (
                      <Tile
                        key={category.id}
                        category={category}
                        className="h-52 flex-1 lg:h-1/2"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
