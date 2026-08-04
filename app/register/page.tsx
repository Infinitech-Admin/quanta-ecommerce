"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type FieldErrors = Record<string, string[]>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      password_confirmation: formData.get("password_confirmation"),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          setFieldErrors(data.errors as FieldErrors);
        } else {
          setFormError(
            data.message ?? "Something went wrong. Please try again.",
          );
        }
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const error = (field: string) => fieldErrors[field]?.[0];

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-20">
      <p className="font-mono text-xs uppercase tracking-widest2 text-forest">
        ₱100 off your first order
      </p>
      <h1 className="mt-2 font-display text-4xl italic text-ink">
        Create your account
      </h1>
      <p className="mt-3 text-sm text-ink-soft">
        Save your address, track orders, and manage subscriptions in one place.
      </p>

      <form
        className="mt-9 flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {formError && (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            First name
            <input
              type="text"
              name="first_name"
              required
              autoComplete="given-name"
              className="border border-paper-line bg-white px-4 py-3 text-sm text-ink focus-ring"
            />
            {error("first_name") && (
              <span className="text-xs text-red-600">
                {error("first_name")}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            Last name
            <input
              type="text"
              name="last_name"
              required
              autoComplete="family-name"
              className="border border-paper-line bg-white px-4 py-3 text-sm text-ink focus-ring"
            />
            {error("last_name") && (
              <span className="text-xs text-red-600">{error("last_name")}</span>
            )}
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Email address
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
          {error("email") && (
            <span className="text-xs text-red-600">{error("email")}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Phone number
          <input
            type="tel"
            name="phone"
            required
            inputMode="numeric"
            autoComplete="tel"
            maxLength={15}
            placeholder="Digits only"
            onInput={(e) => {
              const input = e.currentTarget;
              input.value = input.value.replace(/\D/g, "").slice(0, 15);
            }}
            className="border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
          {error("phone") && (
            <span className="text-xs text-red-600">{error("phone")}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
          {error("password") && (
            <span className="text-xs text-red-600">{error("password")}</span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Confirm password
          <input
            type="password"
            name="password_confirmation"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            className="border border-paper-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus-ring"
          />
        </label>

        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            required
            className="mt-0.5 border-paper-line text-forest focus-ring"
          />
          I agree to the Terms of Service and Privacy Policy.
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 bg-forest py-3.5 text-sm font-medium text-paper transition hover:bg-forest-deep focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-forest hover:underline focus-ring rounded"
        >
          Log in
        </Link>
      </p>
    </section>
  );
}
