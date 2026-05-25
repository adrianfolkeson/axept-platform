"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DisplayProps {
  value: number;
  size?: number;
  className?: string;
}

export function StarsDisplay({ value, size = 14, className }: DisplayProps) {
  const rounded = Math.round(value * 2) / 2; // half-star steps
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`Betyg ${value}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = rounded >= n;
        const half = !filled && rounded >= n - 0.5;
        return (
          <Star
            key={n}
            width={size}
            height={size}
            className={cn(
              "shrink-0",
              filled || half ? "text-amber-500" : "text-border"
            )}
            fill={filled ? "currentColor" : half ? "url(#half)" : "transparent"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

interface InputProps {
  name: string;
  defaultValue?: number;
  size?: number;
}

export function StarsInput({ name, defaultValue = 0, size = 22 }: InputProps) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Betyg">
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = active >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => setValue(n)}
            className="rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Star
              width={size}
              height={size}
              className={cn(filled ? "text-amber-500" : "text-border")}
              fill={filled ? "currentColor" : "transparent"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-mute">{value || "—"}/5</span>
    </div>
  );
}
