"use client";

// 📁 FILE PATH: app/institutional/page.tsx
// (use whatever route your public Eco-Hygiene Institutional page already has)

import * as React from "react";
import {
  Leaf,
  Hotel,
  UtensilsCrossed,
  Hospital,
  GraduationCap,
  Building2,
  ShoppingBag,
  Factory,
  Plane,
  Dumbbell,
  Scissors,
  PartyPopper,
  Home,
  type LucideIcon,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

// ===========================================================================
// EDIT THIS SECTION
// Text content only. Pictures are NOT listed here: they are uploaded in the
// admin page and loaded from the API.
//
// Picture order matters:
//   - hero:     all pictures become the slideshow
//   - story:    picture 1 -> first row, 2 -> second row, 3 -> third row
//   - products: picture 1 -> first tile, 2 -> second tile, and so on
// If a position has no picture, a green placeholder is shown.
// ===========================================================================
const HERO_INTERVAL_MS = 5000;
const PRODUCT_COUNT = 6; // number of tiles in the product grid

const HERO_TITLE = "Hygiene essentials for the places that never stop";
const HERO_TEXT =
  "Eco-Hygiene Institutional supplies tissue, towels, and washroom products to businesses and institutions.";

// Who we serve (icon grid)
const SECTORS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Hotel,
    title: "Hotels",
    text: "Guest rooms, lobbies, and event spaces.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurants",
    text: "Dining areas, kitchens, and back-of-house.",
  },
  {
    icon: Hospital,
    title: "Hospitals",
    text: "Clinics, wards, and diagnostic centers.",
  },
  {
    icon: GraduationCap,
    title: "Schools",
    text: "Campuses, canteens, and dormitories.",
  },
  {
    icon: Building2,
    title: "Offices",
    text: "Pantries, restrooms, and shared floors.",
  },
  { icon: ShoppingBag, title: "Malls", text: "High-traffic public washrooms." },
  {
    icon: Factory,
    title: "Factories",
    text: "Plants, warehouses, and staff facilities.",
  },
  {
    icon: Plane,
    title: "Terminals",
    text: "Airports, ports, and transport hubs.",
  },
  {
    icon: Home,
    title: "Condominiums",
    text: "Common areas and building amenities.",
  },
  { icon: Dumbbell, title: "Gyms", text: "Locker rooms and wellness centers." },
  {
    icon: Scissors,
    title: "Salons and Spas",
    text: "Treatment rooms and reception areas.",
  },
  {
    icon: PartyPopper,
    title: "Events",
    text: "Catering, venues, and large gatherings.",
  },
];

// Alternating text / image rows
const STORY: { title: string; text: string }[] = [
  {
    title: "Hygiene supply you can count on",
    text: "Eco-Hygiene Institutional supplies tissue, towels, and washroom essentials to businesses that cannot run out. Consistent quality, dependable stock, and a team that understands facility needs.",
  },
  {
    title: "Designed for heavy daily use",
    text: "Our products are built for high-traffic environments. Jumbo rolls, interfolded towels, and matching dispensers reduce refills, reduce waste, and keep washrooms ready.",
  },
  {
    title: "Better for the planet and your budget",
    text: "Eco-conscious materials and efficient dispensing help facilities use less without compromising on comfort or cleanliness.",
  },
];

// ===========================================================================

const DARK = "bg-[#0E2A1C]";

type SectionKey = "hero" | "story" | "products";

type ImagesBySection = Record<SectionKey, string[]>;

const EMPTY_IMAGES: ImagesBySection = { hero: [], story: [], products: [] };

// Loads the saved picture URLs once, already grouped and ordered by the API.
// If the request fails, every section falls back to placeholders.
function useInstitutionalImages(): ImagesBySection {
  const [images, setImages] = React.useState<ImagesBySection>(EMPTY_IMAGES);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/institutional/public");
        if (!res.ok) return;
        const data = await res.json();

        const pick = (v: unknown): string[] =>
          Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

        if (!cancelled) {
          setImages({
            hero: pick(data?.hero),
            story: pick(data?.story),
            products: pick(data?.products),
          });
        }
      } catch {
        // Keep placeholders if the API is unreachable.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}

function Placeholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#006B3F] to-[#00A552] ${className}`}
    >
      <Leaf className="h-12 w-12 text-white/30" aria-hidden />
    </div>
  );
}

function Photo({ src, className = "" }: { src?: string; className?: string }) {
  if (!src) return <Placeholder className={className} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`object-cover ${className}`} />;
}

// Full banner picture(s) at their natural shape, with no text on top.
// The pictures are stacked in one grid cell, so the banner is as tall as the
// picture needs to be and nothing is cropped. Slideshow if more than one.
function HeroBanner({ images }: { images: string[] }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
    if (images.length <= 1) return;
    // Respect the user's "reduce motion" setting.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % images.length),
      HERO_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [images]);

  return (
    <div className="relative grid w-full overflow-hidden bg-[#0E2A1C]">
      {images.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`col-start-1 row-start-1 h-auto w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show hero image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full shadow transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ViewProductsButton() {
  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      className="border-white bg-white text-[#0E2A1C] hover:bg-white/90"
    >
      <a href="#products">View products</a>
    </Button>
  );
}

function Hero({ images }: { images: string[] }) {
  // With pictures: banner on top, text on a solid dark panel below.
  // The pictures usually carry their own text and products, so we never
  // write over them.
  if (images.length > 0) {
    return (
      <section>
        <HeroBanner images={images} />
        <div className={DARK}>
          <div className="container flex flex-col items-center py-10 text-center sm:py-14">
            <h1 className="max-w-3xl font-display text-3xl font-medium leading-tight text-white sm:text-5xl">
              {HERO_TITLE}
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              {HERO_TEXT}
            </p>
            <div className="mt-8">
              <ViewProductsButton />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No pictures yet: green placeholder with the text on top.
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#006B3F] to-[#00A552]">
      <div className="container flex min-h-[420px] flex-col justify-center py-16 sm:min-h-[520px]">
        <h1 className="max-w-2xl font-display text-4xl font-medium leading-tight text-white sm:text-6xl">
          {HERO_TITLE}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          {HERO_TEXT}
        </p>
        <div className="mt-8">
          <ViewProductsButton />
        </div>
      </div>
    </section>
  );
}

export default function EcoHygieneInstitutionalPage() {
  const images = useInstitutionalImages();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* 1. Hero */}
        <Hero images={images.hero} />

        {/* 2. Dark icon grid: who we serve */}
        <section className={`${DARK} border-t border-white/10`}>
          <div className="container py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-medium text-white sm:text-4xl">
                Supplies for every kind of facility
              </h2>
              <p className="mt-3 text-sm text-white/70 sm:text-base">
                From a single office to a multi-site operation, we match
                products to how your space is used.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {SECTORS.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00A552]/60 text-[#00A552]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-white">
                    {title}
                  </h3>
                  <p className="mt-1 max-w-[200px] text-xs text-white/60">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Alternating text / image rows */}
        <section className={`${DARK} border-t border-white/10`}>
          <div className="container py-14 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-center font-display text-2xl font-medium text-white sm:text-4xl">
              A cleaner standard for institutions
            </h2>

            <div className="mt-12 space-y-10">
              {STORY.map((row, i) => (
                <div
                  key={row.title}
                  className="grid items-center gap-6 md:grid-cols-2 md:gap-10"
                >
                  <div className={i % 2 === 1 ? "md:order-2" : ""}>
                    <Photo
                      src={images.story[i]}
                      className="aspect-[4/3] w-full rounded-xl"
                    />
                  </div>
                  <div className={i % 2 === 1 ? "md:order-1" : ""}>
                    <h3 className="font-display text-xl font-medium text-white sm:text-2xl">
                      {row.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                      {row.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Product grid: pictures only, no labels */}
        <section
          id="products"
          className={`${DARK} scroll-mt-24 border-t border-white/10`}
        >
          <div className="container py-14 sm:py-20">
            <h2 className="mx-auto max-w-2xl text-center font-display text-2xl font-medium text-white sm:text-4xl">
              Our institutional range
            </h2>

            <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: PRODUCT_COUNT }).map((_, i) => (
                <div
                  key={i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl"
                >
                  <Photo
                    src={images.products[i]}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
