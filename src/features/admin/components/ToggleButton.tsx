import { cn } from "@/lib/utils/cn";

interface Props {
  id: string;
  current: boolean;
  action: (formData: FormData) => Promise<void>;
  onLabel: string;
  offLabel: string;
  hiddenName?: string;
  extraFields?: Record<string, string>;
}

/**
 * Single-form toggle: posts `id` + `next` (inverse of current) to a server action.
 * Renders as a pill that visibly reflects the *current* state.
 */
export function ToggleButton({
  id,
  current,
  action,
  onLabel,
  offLabel,
  hiddenName,
  extraFields
}: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="next" value={current ? "false" : "true"} />
      {hiddenName && extraFields?.[hiddenName] && (
        <input type="hidden" name={hiddenName} value={extraFields[hiddenName]} />
      )}
      <button
        type="submit"
        className={cn(
          "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium transition",
          current
            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-panel text-mute hover:bg-border"
        )}
      >
        {current ? `✓ ${onLabel}` : offLabel}
      </button>
    </form>
  );
}
