
"use client";

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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  Recycle,
  BadgeCheck,
  Droplets,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

// ============================================================
// CONTENT CONFIGURATION
// ============================================================

const HERO_INTERVAL_MS = 5000;

const HERO_TITLE = "A cleaner space starts with the right essentials.";

const HERO_TEXT =
  "Reliable hygiene and washroom solutions designed for businesses, institutions, and facilities of every size.";

const PRODUCT_COUNT = 6;

const PRODUCT_CAPTIONS: string[] = [
  "Bathroom Tissue",
  "Paper Towels",
  "Facial Tissue",
  "Washroom Essentials",
  "Hand Hygiene",
  "Institutional Supplies",
];

const PRODUCT_DESCRIPTIONS: string[] = [
  "Dependable tissue solutions for everyday washroom needs.",
  "Absorbent paper towels designed for busy facilities.",
  "Soft and convenient facial tissue for guests and employees.",
  "Essential products that help maintain cleaner spaces.",
  "Hand hygiene essentials for everyday cleanliness.",
  "Practical hygiene supplies for professional environments.",
];

type ManagedBanner = {
  id: number;
  image_url: string;
  sort_order: number;
};

const CATEGORIES: {
  title: string;
  description: string;
  imageIndex: number;
}[] = [
  {
    title: "Bathroom Tissue",
    description: "Reliable tissue solutions for every washroom.",
    imageIndex: 0,
  },
  {
    title: "Paper Towels",
    description: "Efficient drying solutions for high-traffic spaces.",
    imageIndex: 1,
  },
  {
    title: "Facial Tissue",
    description: "Everyday comfort for guests and employees.",
    imageIndex: 2,
  },
  {
    title: "Washroom Essentials",
    description: "Keep your facilities clean, stocked, and ready.",
    imageIndex: 3,
  },
];

const SECTORS: {
  icon: LucideIcon;
  title: string;
  text: string;
}[] = [
  {
    icon: Hotel,
    title: "Hotels",
    text: "Guest rooms, lobbies, and hospitality facilities.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurants",
    text: "Dining spaces, kitchens, and food service areas.",
  },
  {
    icon: Hospital,
    title: "Healthcare",
    text: "Clinics, hospitals, and patient care facilities.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    text: "Schools, campuses, and learning institutions.",
  },
  {
    icon: Building2,
    title: "Corporate Offices",
    text: "Workplaces, pantries, and shared facilities.",
  },
  {
    icon: ShoppingBag,
    title: "Retail & Malls",
    text: "Commercial spaces and public washrooms.",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    text: "Factories, warehouses, and production facilities.",
  },
  {
    icon: Plane,
    title: "Transportation",
    text: "Airports, terminals, and transport hubs.",
  },
  {
    icon: Home,
    title: "Residential",
    text: "Condominiums and property developments.",
  },
  {
    icon: Dumbbell,
    title: "Fitness Centers",
    text: "Gyms, locker rooms, and wellness facilities.",
  },
  {
    icon: Scissors,
    title: "Salons & Spas",
    text: "Personal care, treatment, and relaxation spaces.",
  },
  {
    icon: PartyPopper,
    title: "Events & Venues",
    text: "Function halls, catering, and event facilities.",
  },
];

const STORY = [
  {
    eyebrow: "DEPENDABLE SUPPLY",
    title: "Hygiene supply you can count on.",
    text: "Eco-Hygiene Institutional supplies tissue, towels, and washroom essentials to businesses that cannot afford to run out. We focus on consistent quality, dependable stock, and solutions that support your everyday operations.",
    points: [
      "Consistent product availability",
      "Solutions for different facility sizes",
      "Reliable institutional supply",
    ],
  },
  {
    eyebrow: "BUILT FOR PERFORMANCE",
    title: "Designed for everyday demands.",
    text: "Busy facilities need products that work as hard as their people. Our institutional range supports high-traffic environments with practical hygiene essentials designed for efficient daily use.",
    points: [
      "Suitable for high-volume environments",
      "Practical everyday hygiene solutions",
      "Products for different facility needs",
    ],
  },
  {
    eyebrow: "A SMARTER APPROACH",
    title: "Better for the planet and your budget.",
    text: "Make smarter choices for your facility with practical hygiene solutions that support responsible consumption. Efficient product formats and dispensing practices can help reduce unnecessary usage and waste.",
    points: [
      "Mindful product selection",
      "Efficient dispensing solutions",
      "Reduced unnecessary consumption",
    ],
  },
];

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Quality You Can Trust",
    text: "Dependable hygiene essentials for everyday business operations.",
  },
  {
    icon: Truck,
    title: "Reliable Supply",
    text: "Institutional supply solutions for your facility's ongoing needs.",
  },
  {
    icon: ShieldCheck,
    title: "Business-Focused",
    text: "Product recommendations aligned with your facility requirements.",
  },
  {
    icon: Recycle,
    title: "Responsible Choices",
    text: "Practical solutions that encourage efficient product usage.",
  },
];

const CTA_TITLE = "Let's find the right hygiene solutions for your facility.";

const CTA_TEXT =
  "Tell us about your business, your facility requirements, and your supply needs. Our team can help you identify the right Eco-Hygiene products for your operations.";

// ============================================================
// DESIGN SYSTEM
// ============================================================

const COLORS = {
  dark: "#103B2A",
  green: "#087443",
  bright: "#10A45A",
  light: "#F3F8F5",
  muted: "#64756B",
  border: "#E4ECE7",
};

type SectionKey = "hero" | "story" | "products";

type ImagesBySection = Record<SectionKey, string[]>;

const EMPTY_IMAGES: ImagesBySection = {
  hero: [],
  story: [],
  products: [],
};

// ============================================================
// IMAGE API
// ============================================================

function useInstitutionalImages(): ImagesBySection {
  const [images, setImages] =
    React.useState<ImagesBySection>(EMPTY_IMAGES);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/institutional/public");

        if (!res.ok) return;

        const data = await res.json();

        const pick = (value: unknown): string[] =>
          Array.isArray(value)
            ? value.filter(
                (item): item is string =>
                  typeof item === "string" && item.length > 0
              )
            : [];

        if (!cancelled) {
          setImages({
            hero: pick(data?.hero),
            story: pick(data?.story),
            products: pick(data?.products),
          });
        }
      } catch (error) {
        console.error(
          "Unable to load institutional images:",
          error
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return images;
}

// ============================================================
// IMAGE COMPONENTS
// ============================================================

function Placeholder({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#0B5938] to-[#13A45C] ${className}`}
    >
      <Leaf className="h-12 w-12 text-white/30" />
    </div>
  );
}

function Photo({
  src,
  className = "",
}: {
  src?: string;
  className?: string;
}) {
  if (!src) {
    return <Placeholder className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading="lazy"
      className={`object-cover ${className}`}
    />
  );
}

// ============================================================
// HERO SLIDESHOW
// ============================================================

function HeroSlideshow({
  images,
}: {
  images: string[];
}) {
  const [index, setIndex] = React.useState(0);

  const count = images.length;

  React.useEffect(() => {
    setIndex(0);

    if (count <= 1) return;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [count]);

  const go = (direction: number) => {
    setIndex(
      (current) =>
        (current + direction + count) % count
    );
  };

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#103B2A] shadow-2xl shadow-[#103B2A]/15 lg:aspect-[5/4]">
      {count === 0 ? (
        <Placeholder className="absolute inset-0" />
      ) : (
        images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`Eco-Hygiene institutional showcase ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A1C]/30 via-transparent to-transparent" />

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#103B2A] shadow-lg transition hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#103B2A] shadow-lg transition hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-white"
                    : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// SECTION LABEL
// ============================================================

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#087443]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#10A45A]" />
      {children}
    </span>
  );
}

// ============================================================
// HERO BANNER
// ============================================================

function Hero() {
  const [bannerSrc, setBannerSrc] = React.useState(
    "/banner/eco-hygiene-institutional-banner.jpg",
  );

  React.useEffect(() => {
    let cancelled = false;

    fetch("/api/banners", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load hero banner");
        return res.json() as Promise<ManagedBanner[]>;
      })
      .then((banners) => {
        if (cancelled || banners.length === 0) return;

        const banner = [...banners]
          .filter((item) => item.image_url)
          .sort((a, b) => a.sort_order - b.sort_order)[0];

        if (banner) setBannerSrc(banner.image_url);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error("Unable to load the institutional hero banner.", error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full overflow-hidden bg-[#F1F8EE]">
      <div className="w-full">
        <a
          href="#products"
          aria-label="Explore Eco-Hygiene institutional products"
          className="block w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerSrc}
            alt="Q-STORE - Everyday essentials. Quality you can trust. Your one-stop-store for hygiene, cleaning and institutional supplies."
            className="block h-auto w-full object-contain"
            fetchPriority="high"
          />
        </a>
      </div>
    </section>
  );
}

// ============================================================
// PRODUCT CATEGORIES
// ============================================================

function ProductCategories({
  images,
}: {
  images: string[];
}) {
  return (
    <section className="bg-white py-16">
      <div className="container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionLabel>
              EXPLORE OUR RANGE
            </SectionLabel>

            <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
              Essential products for cleaner workplaces.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#64756B] sm:text-base">
            Discover hygiene essentials and institutional
            products designed to support your daily facility
            requirements.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <a
              href="#products"
              key={category.title}
              className="group overflow-hidden rounded-xl border border-[#E4ECE7] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#103B2A]/10"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F3F8F5]">
                <Photo
                  src={images[category.imageIndex]}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-[#103B2A]">
                  {category.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#64756B]">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087443]">
                  Explore range
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// WHY ECO-HYGIENE
// ============================================================

function WhyEcoHygiene() {
  return (
    <section className="bg-[#103B2A] py-16 text-white sm:py-20">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div>
            <SectionLabel>
              YOUR INSTITUTIONAL PARTNER
            </SectionLabel>

            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-4xl">
              More than products. A better approach to hygiene.
            </h2>

            <p className="mt-5 text-base leading-8 text-white/70">
              The right hygiene supplies help create cleaner,
              more comfortable, and more efficient spaces.
              Eco-Hygiene supports businesses with practical
              institutional solutions.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/[0.06] p-6 transition hover:bg-white/[0.10]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#10A45A]/20 text-[#65D99A]">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-white/65">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// INDUSTRIES WE SERVE
// ============================================================

function Industries() {
  return (
    <section className="bg-[#F3F8F5] py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>
            INDUSTRY SOLUTIONS
          </SectionLabel>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
            Solutions for every kind of facility.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64756B]">
            Every industry has different hygiene requirements.
            We help businesses find the right essentials for
            their everyday operations.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {SECTORS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-xl border border-[#E4ECE7] bg-white p-4 transition-all duration-300 hover:border-[#10A45A] hover:shadow-lg hover:shadow-[#103B2A]/5 sm:p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#087443] transition-colors group-hover:bg-[#087443] group-hover:text-white">
                <Icon size={21} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#103B2A] sm:text-base">
                {title}
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#64756B] sm:text-sm">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// STORY / FEATURE SECTIONS
// ============================================================

function StorySection({
  images,
}: {
  images: string[];
}) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <SectionLabel>
            THE ECO-HYGIENE DIFFERENCE
          </SectionLabel>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
            A cleaner standard for institutions.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64756B]">
            Discover how the right products and practical
            hygiene solutions can make a difference in your
            facility.
          </p>
        </div>

        <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-28">
          {STORY.map((item, i) => {
            const flip = i % 2 === 1;

            return (
              <div
                key={item.title}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
              >
                <div className={flip ? "lg:order-2" : ""}>
                  <div className="relative">
                    <div
                      className={`absolute -bottom-4 hidden h-full w-full rounded-2xl bg-[#DDEFE3] lg:block ${
                        flip ? "-left-4" : "-right-4"
                      }`}
                    />

                    <Photo
                      src={images[i]}
                      className="relative aspect-[5/4] w-full rounded-xl"
                    />
                  </div>
                </div>

                <div className={flip ? "lg:order-1" : ""}>
                  <SectionLabel>
                    {item.eyebrow}
                  </SectionLabel>

                  <h3 className="mt-5 max-w-lg font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
                    {item.title}
                  </h3>

                  <p className="mt-5 max-w-xl text-base leading-8 text-[#64756B]">
                    {item.text}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-sm font-medium text-[#103B2A]"
                      >
                        <CheckCircle2
                          size={18}
                          className="mt-0.5 shrink-0 text-[#087443]"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// INSTITUTIONAL PRODUCT SHOWCASE
// ============================================================

function ProductShowcase({
  images,
}: {
  images: string[];
}) {
  return (
    <section
      id="products"
      className="scroll-mt-24 bg-[#F3F8F5] py-16 sm:py-24"
    >
      <div className="container">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionLabel>
              OUR PRODUCT COLLECTION
            </SectionLabel>

            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
              Our institutional range.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#64756B]">
              Explore our selection of hygiene products and
              essential supplies for professional environments.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PRODUCT_COUNT }).map((_, i) => {
            const caption = PRODUCT_CAPTIONS[i];
            const description = PRODUCT_DESCRIPTIONS[i];

            return (
              <article
                key={i}
                className="group overflow-hidden rounded-xl border border-[#E4ECE7] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#103B2A]/10"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EAF5EE]">
                  <Photo
                    src={images[i]}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-[#64756B]">
          Product availability and specifications are subject
          to confirmation. Contact our team for product details
          and quotations.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function EcoHygieneInstitutionalPage() {
  const images = useInstitutionalImages();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        <Hero />

        <ProductCategories images={images.products} />

        <WhyEcoHygiene />

        <Industries />

        <StorySection images={images.story} />

        <ProductShowcase images={images.products} />

      </main>

      <Footer />
    </>
  );
}
