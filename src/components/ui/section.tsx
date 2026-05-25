import { cn } from "@/lib/utils/cn";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-bg p-6 shadow-sm",
        className
      )}
    >
      <header className="mb-5 space-y-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-mute">{description}</p>}
      </header>
      {children}
    </section>
  );
}
