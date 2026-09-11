"use client";

// FILE PATH: components/clear-badge-on-mount.tsx

import { useClearBadgeOnOpen } from "@/hooks/use-clear-badge-on-open";

/**
 * Clears the app icon badge whenever the app is opened or regains focus.
 * Renders nothing — this just wires up the effect at the root of the tree.
 */
export function ClearBadgeOnMount() {
  useClearBadgeOnOpen();
  return null;
}
