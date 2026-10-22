export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div className="min-w-0">
        {kicker ? <p className="kicker">{kicker}</p> : null}
        <h1 className="mt-2 text-4xl text-foreground">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function MetricStrip({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-4">
          <dt className="kicker">{item.label}</dt>
          <dd className="mt-1 text-base font-semibold leading-snug">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
