import { cn } from "@/lib/utils/cn";

const fieldClasses =
  "w-full border-0 border-b border-stone-dark bg-transparent py-3 text-[1.0625rem] text-ink placeholder:text-ink-faint/70 transition-colors focus:border-clay focus:outline-none";

export function TextField({
  label,
  id,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.75rem] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </label>
      <input id={id} name={id} className={cn(fieldClasses, "mt-2")} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextAreaField({
  label,
  id,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; id: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.75rem] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </label>
      <textarea id={id} name={id} className={cn(fieldClasses, "mt-2 resize-none")} rows={4} {...props} />
    </div>
  );
}

export function SelectRow<T extends string>({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: { value: T; label: string; description?: string }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[0.75rem] uppercase tracking-[0.1em] text-ink-faint">{legend}</legend>
      <div className="mt-3 border-t border-stone">
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 border-b border-stone py-4 transition-colors",
                checked ? "text-ink" : "text-ink-soft hover:text-ink",
              )}
            >
              <span className="flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    checked ? "border-clay" : "border-stone-dark",
                  )}
                >
                  {checked ? <span className="h-2 w-2 rounded-full bg-clay" /> : null}
                </span>
                <span className="font-serif text-lg">{option.label}</span>
              </span>
              {option.description ? <span className="text-xs text-ink-faint">{option.description}</span> : null}
              <input
                type="radio"
                name={legend}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
