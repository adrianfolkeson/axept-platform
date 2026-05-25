import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right";
}

interface Props<T> {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  empty?: string;
}

export function AdminTable<T>({ rows, rowKey, columns, empty }: Props<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-panel/40 px-6 py-10 text-center text-sm text-mute">
        {empty ?? "Inga rader"}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-bg">
      <table className="w-full text-sm">
        <thead className="bg-panel text-xs uppercase tracking-wide text-mute">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-4 py-3",
                  c.align === "right" ? "text-right" : "text-left",
                  c.className
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={rowKey(r)}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-4 py-3 align-top",
                    c.align === "right" ? "text-right" : "text-left",
                    c.className
                  )}
                >
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
