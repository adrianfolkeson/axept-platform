const SEK = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0
});

const DATE = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "short",
  day: "numeric"
});

export function formatSek(n: number | null | undefined): string {
  if (n == null) return "—";
  return SEK.format(n);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return DATE.format(d);
}

const CATEGORY_LABEL: Record<string, string> = {
  excavator: "Grävmaskin",
  loader: "Hjullastare",
  crane: "Kran",
  scaffolding: "Ställning",
  generator: "Generator",
  truck: "Lastbil",
  tool: "Verktyg",
  other: "Övrigt"
};

export function categoryLabel(c: string | null | undefined): string {
  if (!c) return "—";
  return CATEGORY_LABEL[c] ?? c;
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Administratör",
  company: "Byggföretag",
  worker: "Arbetare",
  equipment_owner: "Maskinägare"
};

export function roleLabel(r: string | null | undefined): string {
  if (!r) return "—";
  return ROLE_LABEL[r] ?? r;
}
