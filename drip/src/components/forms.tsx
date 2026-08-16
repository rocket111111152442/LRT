"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Envoi…",
  className = "btn btn-block",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Field({
  label,
  name,
  type = "text",
  error,
  required,
  defaultValue,
  placeholder,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  const id = `field-${name}`;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`field ${error ? "field-error" : ""}`}
      />

      {hint && !error && (
        <p id={`${id}-hint`} className="label-sm mt-2 text-[color:var(--color-smoke)]">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="label-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      className="border border-[color:var(--color-ink)] bg-[rgba(11,11,11,0.04)] px-4 py-3 text-sm"
      role="alert"
    >
      {message}
    </p>
  );
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="border border-[color:var(--color-ink)] px-4 py-3 text-sm" role="status">
      {message}
    </p>
  );
}

export function Checkbox({
  name,
  label,
  error,
  defaultChecked,
}: {
  name: string;
  label: React.ReactNode;
  error?: string;
  defaultChecked?: boolean;
}) {
  const id = `check-${name}`;

  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed">
        <input
          id={id}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="mt-0.5 h-4 w-4 shrink-0 appearance-none border border-[color:var(--color-hairline)] transition-colors checked:border-[color:var(--color-ink)] checked:bg-[color:var(--color-ink)]"
        />
        <span className="text-[color:var(--color-ink-soft)]">{label}</span>
      </label>

      {error && (
        <p className="label-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
