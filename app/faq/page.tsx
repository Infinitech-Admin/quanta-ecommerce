"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  Facebook,
  Search,
  Info,
  ShoppingCart,
  CreditCard,
  Undo2,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";

type FaqItem = {
  id: string;
  question: string;
  keywords: string; // extra plain-text terms to match on search, beyond the question
  answer: React.ReactNode;
};

type FaqCategory = {
  id: string;
  label: string;
  icon: React.ElementType;
  items: FaqItem[];
};

const CATEGORIES: FaqCategory[] = [
  {
    id: "about",
    label: "About Q-Store",
    icon: Info,
    items: [
      {
        id: "what-is-qstore",
        question: "What is Q-Store?",
        keywords: "quanta paper mission home essentials",
        answer: (
          <>
            <p>
              Q-Store is an online e-commerce platform that allows you to easily
              order your favorite Quanta Paper products with a few taps.
            </p>
            <p>
              We are responsible for creating high-quality, affordable,
              hygienic, environment-friendly products with concern and love —
              people can rely on everyday. Q-Store: your one-stop{" "}
              <span className="italic">Q</span>uality Home Essentials.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "ordering",
    label: "Ordering & Delivery",
    icon: ShoppingCart,
    items: [
      {
        id: "minimum-order",
        question: "Is there a minimum order?",
        keywords: "minimum order requirement",
        answer: (
          <p>
            No minimum order requirement, and multiple payment methods are
            available for you to choose from.
          </p>
        ),
      },
      {
        id: "how-ordering-works",
        question: "How does ordering work?",
        keywords: "checkout delivery same day metro manila rizal",
        answer: (
          <p>
            Ordering at Q-Store is very easy. Just look for the item you want to
            buy, check out, and we&apos;ll do the rest. We will do our best to
            deliver your products on the same day, or within 1–3 days, within
            Metro Manila and the Rizal area.
          </p>
        ),
      },
      {
        id: "operating-hours",
        question: "What are your operating hours?",
        keywords: "open 24/7 processing time",
        answer: (
          <p>
            Q-Store is always open to take your order, 24/7. Orders placed after
            3:00 PM will be processed on the next working day.
          </p>
        ),
      },
      {
        id: "cancel-order",
        question: "How can I cancel my order?",
        keywords: "cancellation support",
        answer: (
          <p>
            Once an order has been processed and you want to cancel it, kindly
            contact our Quanta Customer Support via email at{" "}
            <a
              href="mailto:qstore@quantapaper.com"
              className="text-forest underline underline-offset-2 hover:text-moss-900"
            >
              qstore@quantapaper.com
            </a>
            . Cancellation takes up to 2–3 days, depending on the reason, upon
            investigation.
          </p>
        ),
      },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    icon: CreditCard,
    items: [
      {
        id: "payment-methods",
        question: "What are your modes of payment?",
        keywords:
          "paypal visa mastercard gcash paymaya bank transfer bdo chinabank metrobank credit card invoice",
        answer: (
          <>
            <p>
              Here are the payment methods available for you to choose from. We
              strongly recommend cashless transactions when buying with us, to
              ensure your safety and the safety of our team.
            </p>
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>PayPal</li>
              <li>Visa</li>
              <li>Mastercard</li>
              <li>Mobile wallets (PayMaya, GCash)</li>
              <li>Bank transfer (BDO, Chinabank, Metrobank)</li>
            </ol>
            <p>
              All credit card transactions on Q-Store are processed using an
              independent payment gateway. Q-Store will not have access to your
              credit card information.
            </p>
            <p>A sales invoice is available upon request from Q-Store.</p>
          </>
        ),
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Refunds",
    icon: Undo2,
    items: [
      {
        id: "return-refund",
        question: "How do I request a return or refund of an item?",
        keywords:
          "missing item wrong item defective damaged replacement store credit",
        answer: (
          <>
            <p>
              If you&apos;d like to request a refund, replacement, or return on
              your items, please see the eligibility criteria below.
            </p>
            <p className="font-medium text-moss-900">
              Who is eligible for a return, replacement, refund, or store
              credits:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Q-Store online customers with missing items</li>
              <li>Q-Store online customers who received the wrong item</li>
              <li>
                Q-Store online customers who received a defective/damaged item
                upon delivery
              </li>
            </ul>
            <p>
              If you&apos;re eligible, send us a request via email at{" "}
              <a
                href="mailto:qstore@quantapaper.com"
                className="text-forest underline underline-offset-2 hover:text-moss-900"
              >
                qstore@quantapaper.com
              </a>{" "}
              or message us on our{" "}
              <a
                href="https://www.facebook.com/quantapaper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline underline-offset-2 hover:text-moss-900"
              >
                Quanta Paper Facebook page
              </a>
              .
            </p>
          </>
        ),
      },
    ],
  },
];

const ALL_ITEMS_COUNT = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

function FaqAccordionItem({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-moss-100 bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
      >
        <span className="font-display text-base font-medium text-moss-900 sm:text-lg">
          {item.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-moss-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-moss-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-moss-700 sm:px-5 sm:pb-5 sm:text-[15px]">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [query, setQuery] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>("what-is-qstore");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredCategories = React.useMemo(() => {
    if (!normalizedQuery) return CATEGORIES;
    return CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        `${item.question} ${item.keywords}`
          .toLowerCase()
          .includes(normalizedQuery),
      ),
    })).filter((category) => category.items.length > 0);
  }, [normalizedQuery]);

  const resultsCount = filteredCategories.reduce(
    (n, c) => n + c.items.length,
    0,
  );

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Header + search */}
        <div className="border-b border-moss-100 bg-moss-pale/30">
          <div className="container py-10 sm:py-14">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-moss-500">
              Support
            </p>
            <h1 className="mt-1 font-display text-3xl font-medium italic text-moss-900 sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Everything you need to know about ordering, payment, delivery, and
              returns at Q-Store.
            </p>

            <div className="relative mt-6 max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-moss-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search questions... e.g. refund, GCash, delivery"
                className="bg-background pl-10"
              />
            </div>

            {/* Category quick-jump */}
            {!normalizedQuery && (
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <a
                      key={category.id}
                      href={`#${category.id}`}
                      className="flex items-center gap-2 rounded-full border border-moss-200 bg-background px-3.5 py-2 text-xs font-medium text-moss-700 transition-colors hover:border-moss-400 hover:text-moss-900 sm:text-sm"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-moss-500" />
                      {category.label}
                      <span className="text-moss-400">
                        {category.items.length}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="container max-w-2xl py-10 sm:py-14">
          {normalizedQuery && (
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-moss-400">
              {resultsCount} of {ALL_ITEMS_COUNT} questions match &quot;
              {query.trim()}&quot;
            </p>
          )}

          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-moss-200 py-16 text-center">
              <p className="font-display text-lg font-medium text-moss-900">
                No matching questions
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Try a different search term, or reach out to us directly below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <section
                    key={category.id}
                    id={category.id}
                    className="scroll-mt-24"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss-100 text-moss-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <h2 className="font-display text-lg font-semibold text-moss-900 sm:text-xl">
                        {category.label}
                      </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                      {category.items.map((item) => (
                        <FaqAccordionItem
                          key={item.id}
                          item={item}
                          open={openId === item.id}
                          onToggle={() =>
                            setOpenId((prev) =>
                              prev === item.id ? null : item.id,
                            )
                          }
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Still need help */}
          <div className="mt-10 rounded-2xl border border-dashed border-moss-200 p-5 text-center sm:p-6">
            <h2 className="font-display text-lg font-medium text-moss-900">
              Still need help?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Our support team is happy to help with anything not covered above.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <a
                href="mailto:qstore@quantapaper.com"
                className="inline-flex items-center gap-1.5 rounded-full border border-moss-200 px-4 py-2 text-sm font-medium text-moss-700 transition-colors hover:border-moss-400 hover:text-moss-900"
              >
                <Mail className="h-4 w-4" />
                qstore@quantapaper.com
              </a>
              <a
                href="https://www.facebook.com/quantapaper"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-moss-200 px-4 py-2 text-sm font-medium text-moss-700 transition-colors hover:border-moss-400 hover:text-moss-900"
              >
                <Facebook className="h-4 w-4" />
                Message us on Facebook
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Looking for our{" "}
              <Link
                href="/terms"
                className="text-forest underline underline-offset-2 hover:text-moss-900"
              >
                Terms of Use
              </Link>{" "}
              or{" "}
              <Link
                href="/privacy"
                className="text-forest underline underline-offset-2 hover:text-moss-900"
              >
                Privacy Policy
              </Link>
              ?
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
