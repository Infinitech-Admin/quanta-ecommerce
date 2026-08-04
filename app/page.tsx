import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { FeaturedProducts } from "@/components/featured-products";
import { LifestyleCollections } from "@/components/lifestyle-collections";
import { CategoryStrip } from "@/components/category-strip";
import { ShopSection } from "@/components/shop-section";
import { BrandStrip } from "@/components/brand-strip";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={null}>
          <CategoryStrip />
        </Suspense>

        <Hero />
        <LifestyleCollections />

        <Suspense fallback={null}>
          <FeaturedProducts />
        </Suspense>

        <Suspense fallback={null}>
          <ShopSection />
        </Suspense>
        <BrandStrip />
      </main>
      <Footer />
    </>
  );
}
