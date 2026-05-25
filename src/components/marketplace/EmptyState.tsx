import Link from "next/link";

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-panel/50 p-10 text-center">
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-mute">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg hover:opacity-90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
