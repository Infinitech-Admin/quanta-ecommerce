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
  CheckCircle2,
  X,
  type LucideIcon,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// ============================================================
// CONTENT CONFIGURATION
// ============================================================

const HERO_INTERVAL_MS = 5000;

type ManagedBanner = {
  id: number;
  image_url: string;
  sort_order: number;
};

// Product category tiles (4th tile "Washroom Essentials" removed)
const CATEGORIES: {
  title: string;
  description: string;
  imageIndex: number;
}[] = [
  {
    title: "Paper",
    description: "Reliable tissue and towel solutions for every washroom.",
    imageIndex: 0,
  },
  {
    title: "Disinfectants",
    description: "Hand soaps and sanitizers for cleaner, safer facilities.",
    imageIndex: 1,
  },
  {
    title: "Dispensers",
    description: "Keep your facilities clean, stocked, and ready.",
    imageIndex: 2,
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
    eyebrow: "ECO-READY",
    title: "Designed for everyday demands.",
    text: "Eco-Hygiene Institutional supplies tissue, towels, and washroom essentials to businesses that cannot afford to run out. We focus on consistent quality, dependable stock, and solutions that support your everyday operations.",
    points: [
      "Consistent product availability",
      "Solutions for different facility sizes",
      "Reliable institutional supply",
    ],
  },
  {
    eyebrow: "ECO-SAVE",
    title: "Practically made to fit for everyday needs.",
    text: "Busy facilities need products that work as hard as their people. Our institutional range supports high-traffic environments with practical hygiene essentials designed for efficient daily use.",
    points: [
      "Suitable for high-volume environments",
      "Practical everyday hygiene solutions",
      "Products for different facility needs",
    ],
  },
  {
    eyebrow: "ECO-SMART",
    title: "Smarter choice for a greener community.",
    text: "Make smarter choices for your facility with practical hygiene solutions that support responsible consumption. Efficient product formats and dispensing practices can help reduce unnecessary usage and waste.",
    points: [
      "Mindful product selection",
      "Efficient dispensing solutions",
      "Reduced unnecessary consumption",
    ],
  },
];

// ------------------------------------------------------------
// Product showcase. Order must match the order of images
// returned by the API (`products`). Fill in each `specs` list
// with the real specification details for that product.
// ------------------------------------------------------------
type Product = {
  name: string;
  tagline: string;
  specs: { label: string; value: string }[];
};

const PRODUCTS: Product[] = [
  {
    name: "Institutional Hygiene Solutions",
    tagline: "Reliable hygiene essentials for every workplace and facility.",
    specs: [
      { label: "Brand", value: "Eco-Hygiene" },
      { label: "Category", value: "Institutional hygiene supplies" },
    ],
  },
  {
    name: "Liquid Hand Soap – Powder Scent",
    tagline: "Gentle everyday handwashing for a cleaner environment.",
    specs: [
      { label: "Brand", value: "Eco-Hygiene" },
      { label: "Product type", value: "Liquid hand soap" },
      { label: "Scent", value: "Powder" },
    ],
  },
  {
    name: "Liquid Hand Soap – Apple Scent",
    tagline: "Freshness and cleanliness for everyday hand care.",
    specs: [
      { label: "Brand", value: "Eco-Hygiene" },
      { label: "Product type", value: "Liquid hand soap" },
      { label: "Scent", value: "Apple" },
    ],
  },
  {
    name: "Hand Sanitizer Gel – Apple Scent",
    tagline: "Convenient hygiene solutions for every workplace.",
    specs: [
      { label: "Brand", value: "Eco-Hygiene" },
      { label: "Product type", value: "Hand sanitizer gel" },
      { label: "Scent", value: "Apple" },
    ],
  },
  {
    name: "Liquid Hand Soap – Strawberry Scent",
    tagline: "Refreshing hand care for everyday cleanliness.",
    specs: [
      { label: "Brand", value: "Eco-Hygiene" },
      { label: "Product type", value: "Liquid hand soap" },
      { label: "Scent", value: "Strawberry" },
    ],
  },
  {
    name: "Institutional Hygiene Solutions",
    tagline: "Quality products. Practical solutions. Everyday value.",
    specs: [
      { label: "Brand", value: "Eco-Hygiene" },
      { label: "Category", value: "Institutional hygiene supplies" },
    ],
  },
];

const CONTACT_NUMBER = "(02) 8533 9250";

// ------------------------------------------------------------
// Customers. Place logo files in /public/customers/.
// If a file is missing, the customer name is shown instead.
// ------------------------------------------------------------
const CUSTOMERS: { name: string; src: string }[] = [
  { name: "ABS-CBN", src: "/customers/abs-cbn.png" },
  { name: "Accenture", src: "/customers/accenture.png" },
  { name: "Araneta Center", src: "/customers/araneta-center.png" },
  { name: "Ayala", src: "/customers/ayala.png" },
  { name: "City of Dreams Manila", src: "/customers/city-of-dreams.png" },
  { name: "Concentrix", src: "/customers/concentrix.png" },
  { name: "DoubleDragon Properties Corp", src: "/customers/doubledragon.png" },
  { name: "Globe", src: "/customers/globe.png" },
  {
    name: "Manila International Airport Authority",
    src: "/customers/miaa.png",
  },
  { name: "Megaworld", src: "/customers/megaworld.png" },
  { name: "PAGCOR", src: "/customers/pagcor.png" },
  { name: "Resorts World Manila", src: "/customers/resorts-world.png" },
  { name: "Seda", src: "/customers/seda.png" },
  { name: "Shakey's", src: "/customers/shakeys.png" },
  { name: "Shangri-La Hotels and Resorts", src: "/customers/shangri-la.png" },
  { name: "St. Luke's Medical Center", src: "/customers/st-lukes.png" },
  { name: "Teleperformance", src: "/customers/teleperformance.png" },
  { name: "TELUS", src: "/customers/telus.png" },
  { name: "The Ascott Limited", src: "/customers/ascott.png" },
  { name: "The Peninsula Manila", src: "/customers/peninsula.png" },
  { name: "Vikings", src: "/customers/vikings.png" },
];

// ============================================================
// DESIGN SYSTEM
// ============================================================

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
  const [images, setImages] = React.useState<ImagesBySection>(EMPTY_IMAGES);

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
                  typeof item === "string" && item.length > 0,
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
        console.error("Unable to load institutional images:", error);
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

function Placeholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#0B5938] to-[#13A45C] ${className}`}
    >
      <Leaf className="h-12 w-12 text-white/30" />
    </div>
  );
}

function Photo({ src, className = "" }: { src?: string; className?: string }) {
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

function HeroSlideshow({ images }: { images: string[] }) {
  const [index, setIndex] = React.useState(0);

  const count = images.length;

  React.useEffect(() => {
    setIndex(0);

    if (count <= 1) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, HERO_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [count]);

  const go = (direction: number) => {
    setIndex((current) => (current + direction + count) % count);
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
                  i === index ? "w-8 bg-white" : "w-2 bg-white/60"
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
// SECTION LABEL (dot removed on all labels)
// ============================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-xs font-bold uppercase tracking-[0.18em] text-[#087443]">
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

function ProductCategories({ images }: { images: string[] }) {
  return (
    <section className="bg-white py-16">
      <div className="container">
        <div>
          <h2 className="max-w-4xl font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
            Explore Our Products for Hotels, Institutions, and Restaurants
          </h2>

          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[#35503F] sm:text-lg sm:leading-8">
            Discover hygiene essentials and institutional products designed to
            support your daily facility requirements.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
// INDUSTRIES WE SERVE
// ============================================================

function Industries() {
  return (
    <section className="bg-[#F3F8F5] py-16 sm:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>INDUSTRY SOLUTIONS</SectionLabel>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
            Solutions for every kind of facility.
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64756B]">
            Every industry has different hygiene requirements. We help
            businesses find the right essentials for their everyday operations.
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

function StorySection({ images }: { images: string[] }) {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="container">
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight text-[#103B2A] sm:text-5xl">
            The Eco-Hygiene Difference
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64756B] lg:whitespace-nowrap">
            Discover how the right products and practical hygiene solutions can
            make a difference in your facility.
          </p>
        </div>

        <div className="mt-14 space-y-20 sm:mt-20 sm:space-y-28">
          {STORY.map((item, i) => {
            const flip = i % 2 === 1;

            return (
              <div
                key={item.eyebrow}
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
                  <SectionLabel>{item.eyebrow}</SectionLabel>

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
// PRODUCT SPECIFICATION MODAL
// ============================================================

function ProductModal({
  product,
  image,
  onClose,
}: {
  product: Product;
  image?: string;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E2A1C]/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} specifications`}
        onClick={(event) => event.stopPropagation()}
        className="relative grid max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl md:grid-cols-2"
      >
        <button
          type="button"
          aria-label="Close specifications"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#103B2A] shadow-md transition hover:bg-[#F3F8F5]"
        >
          <X size={18} />
        </button>

        <div className="bg-[#EAF5EE]">
          <Photo
            src={image}
            className="aspect-[4/3] h-full w-full md:aspect-auto"
          />
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="pr-8 font-display text-2xl font-semibold leading-tight text-[#103B2A] sm:text-3xl">
            {product.name}
          </h3>

          <p className="mt-3 text-base leading-7 text-[#35503F]">
            {product.tagline}
          </p>

          <h4 className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[#087443]">
            Specifications
          </h4>

          <dl className="mt-3 divide-y divide-[#E4ECE7] border-y border-[#E4ECE7]">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[9rem_1fr] gap-4 py-3 text-sm"
              >
                <dt className="font-semibold text-[#103B2A]">{spec.label}</dt>
                <dd className="text-[#35503F]">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm leading-6 text-[#35503F]">
            For full product details and quotations, contact{" "}
            <a
              href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, "")}`}
              className="font-semibold text-[#087443] underline-offset-2 hover:underline"
            >
              {CONTACT_NUMBER}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INSTITUTIONAL PRODUCT SHOWCASE
// ============================================================

function ProductShowcase({ images }: { images: string[] }) {
  const [selected, setSelected] = React.useState<number | null>(null);

  const closeModal = React.useCallback(() => setSelected(null), []);

  return (
    <section id="products" className="scroll-mt-24 bg-[#F3F8F5] py-16 sm:py-24">
      <div className="container">
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#103B2A] sm:text-4xl">
            Our Product Collection
          </h2>

          <p className="mt-4 text-base leading-7 text-[#64756B] lg:whitespace-nowrap">
            Explore our selection of hygiene products and essential supplies for
            professional environments.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product, i) => (
            <button
              type="button"
              key={`${product.name}-${i}`}
              onClick={() => setSelected(i)}
              aria-haspopup="dialog"
              aria-label={`View ${product.name} specifications`}
              className="group overflow-hidden rounded-xl border border-[#E4ECE7] bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#103B2A]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087443]"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#EAF5EE]">
                <Photo
                  src={images[i]}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm font-medium leading-7 text-[#103B2A] sm:text-base sm:leading-8">
          Product availability are subject for confirmation.
          <br />
          Contact{" "}
          <a
            href={`tel:${CONTACT_NUMBER.replace(/[^\d+]/g, "")}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {CONTACT_NUMBER}
          </a>{" "}
          for product details and quotations.
        </p>
      </div>

      {selected !== null && (
        <ProductModal
          product={PRODUCTS[selected]}
          image={images[selected]}
          onClose={closeModal}
        />
      )}
    </section>
  );
}

// ============================================================
// OUR CUSTOMERS
// ============================================================

function CustomerLogo({ name, src }: { name: string; src: string }) {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className="flex h-20 items-center justify-center rounded-xl bg-[#E4F0E0] p-3">
      {failed ? (
        <span className="text-center text-xs font-semibold leading-4 text-[#103B2A]">
          {name}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-12 w-auto max-w-full object-contain"
        />
      )}
    </div>
  );
}

function Customers() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#64756B]">
            Trusted by
          </p>

          <h2 className="mt-2 font-display text-3xl font-semibold text-[#103B2A]">
            Our Customers
          </h2>

          <div className="mx-auto mt-4 h-px w-14 bg-[#C9D8CE]" />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {CUSTOMERS.map((customer) => (
            <CustomerLogo
              key={customer.name}
              name={customer.name}
              src={customer.src}
            />
          ))}
        </div>
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

        <Industries />

        <StorySection images={images.story} />

        <ProductShowcase images={images.products} />

        <Customers />
      </main>

      <Footer />
    </>
  );
}
