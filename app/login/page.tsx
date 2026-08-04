"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || "Invalid email or password.");
        return;
      }

      const role = data?.user?.role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-20">
      <p className="font-mono text-xs uppercase tracking-widest2 text-ink-faint">
        Account
      </p>
      <h1 className="mt-2 font-display text-4xl italic text-ink">
        Welcome back
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Log in to track orders, manage subscriptions, and check out faster.
      </p>

      {error && (
        <p className="mt-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Email address
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
        </label>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-soft">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="border-paper-line text-forest focus-ring"
            />
            Remember me
          </label>
          <a
            href="#"
            className="font-medium text-forest hover:text-forest-deep focus-ring rounded"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 bg-forest py-3.5 text-sm font-medium text-paper transition hover:bg-forest-deep focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        New to Quanta Paper?{" "}
        <Link
          href="/register"
          className="font-medium text-forest hover:underline focus-ring rounded"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
