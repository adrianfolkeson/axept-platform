"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export interface FilterFieldOption {
  value: string;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  type: "select" | "text";
  options?: FilterFieldOption[];
  placeholder?: string;
}

interface FilterBarProps {
  fields: FilterField[];
}

export function FilterBar({ fields }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [pending, startTransition] = useTransition();

  function applyFilter(form: FormData) {
    const params = new URLSearchParams();
    for (const f of fields) {
      const v = form.get(f.name);
      if (typeof v === "string" && v.trim() !== "") params.set(f.name, v.trim());
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function reset() {
    startTransition(() => router.push(pathname));
  }

  return (
    <form
      action={applyFilter}
      className="flex flex-col gap-3 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      {fields.map((f) => (
        <div key={f.name} className="w-full sm:min-w-[160px] sm:flex-1">
          <label htmlFor={f.name} className="mb-1 block text-xs font-medium text-mute">
            {f.label}
          </label>
          {f.type === "select" ? (
            <select
              id={f.name}
              name={f.name}
              defaultValue={search.get(f.name) ?? ""}
              className="h-11 w-full rounded-md border border-border bg-bg px-2 text-base sm:h-10 sm:text-sm"
            >
              <option value="">Alla</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={f.name}
              name={f.name}
              type="text"
              placeholder={f.placeholder}
              defaultValue={search.get(f.name) ?? ""}
              className="h-11 w-full rounded-md border border-border bg-bg px-3 text-base sm:h-10 sm:text-sm"
            />
          )}
        </div>
      ))}
      <div className="flex w-full gap-2 sm:w-auto">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-ink px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 sm:h-10 sm:flex-none"
        >
          {pending ? "Filtrerar…" : "Filtrera"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border bg-bg px-4 text-sm hover:bg-panel sm:h-10 sm:flex-none"
        >
          Rensa
        </button>
      </div>
    </form>
  );
}
