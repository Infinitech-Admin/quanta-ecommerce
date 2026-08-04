"use client";

import Image from "next/image";
import { Product, useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-moss-pale">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 border-b border-paper-line pb-4 pt-3">
        <h3 className="font-display text-lg italic leading-snug text-ink">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between font-mono text-xs text-ink-faint">
          <span>₱{product.price.toFixed(2)} / {product.unit}</span>
        </div>
        <button
          onClick={() => addItem(product)}
          className="mt-2 self-start text-xs font-medium uppercase tracking-widest2 text-forest underline decoration-transparent underline-offset-4 transition group-hover:decoration-forest focus-ring"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
