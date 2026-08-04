import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { CartProvider } from "@/context/cart-context";
import LoadingAnimated from "@/components/LoadingAnimated";
import { Toaster } from "@/components/ui/sonner";
import { NotificationPromptBanner } from "@/components/notification-prompt-banner";
import { CursorTissueTrail } from "@/components/cursor-tissue-trail";
import { getCurrentUserId } from "@/lib/get-current-user";
import "./globals.css";
import { cn } from "@/lib/utils";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Quanta Paper — Everyday hygiene, sourced kindly",
  description:
    "Quanta Paper delivers quality paper, personal care, and household hygiene essentials across the Philippines.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quanta Paper",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b2e1f",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();

  return (
    <html
      lang="en"
      className={cn(
        fraunces.variable,
        manrope.variable,
        GeistSans.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-screen flex-col">
        <CursorTissueTrail />
        <CartProvider userId={userId}>
          <LoadingAnimated className="flex min-h-screen flex-1 flex-col">
            {children}
          </LoadingAnimated>
        </CartProvider>
        <Toaster />
        <NotificationPromptBanner />
      </body>
    </html>
  );
}
