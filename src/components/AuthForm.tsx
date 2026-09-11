"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthActionState } from "@/app/auth/actions";

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
}

interface AuthFormProps {
  title: string;
  subtitle: string;
  fields: Field[];
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
  footer: { text: string; linkLabel: string; href: string };
  secondaryLink?: { label: string; href: string };
  notice?: string | null;
}

const initialState: AuthActionState = { error: null };

export function AuthForm({
  title,
  subtitle,
  fields,
  action,
  submitLabel,
  footer,
  secondaryLink,
  notice,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-1 text-lg font-semibold tracking-tight">
            ECOsmart
          </div>
          <h1 className="text-base font-medium">{title}</h1>
          <p className="mt-1 font-mono text-xs text-[var(--eco-text-muted)]">
            {subtitle}
          </p>
        </div>

        {notice && (
          <p className="mb-4 rounded border border-[var(--eco-border)] bg-[var(--eco-surface)] px-3 py-2 font-mono text-xs text-[var(--eco-on)]">
            {notice}
          </p>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="font-mono text-[11px] text-[var(--eco-text-muted)]"
              >
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                required
                className="rounded border border-[var(--eco-border)] bg-[var(--eco-surface)] px-3 py-2 text-sm text-[var(--eco-text)] outline-none focus:border-[var(--eco-on)]"
              />
            </div>
          ))}

          {state.error && (
            <p className="font-mono text-xs text-[var(--eco-warn)]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded border border-[var(--eco-on)] bg-[var(--eco-on-dim)] py-2 text-sm font-medium text-[var(--eco-on)] transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Procesando..." : submitLabel}
          </button>
        </form>

        {secondaryLink && (
          <p className="mt-4 text-center font-mono text-xs">
            <Link href={secondaryLink.href} className="text-[var(--eco-on)] underline">
              {secondaryLink.label}
            </Link>
          </p>
        )}

        <p className="mt-6 text-center font-mono text-xs text-[var(--eco-text-muted)]">
          {footer.text}{" "}
          <Link href={footer.href} className="text-[var(--eco-on)] underline">
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
