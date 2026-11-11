const steps = [
  {
    title: "Open Accounts Center",
    body: "In Instagram, go to your profile → menu (☰) → Accounts Center → Your information and permissions.",
  },
  {
    title: "Download your information",
    body: "Tap Download your information → Download or transfer information → pick your Instagram account.",
  },
  {
    title: "Choose only followers",
    body: "Select Some of your information, tick Followers and following, then Download to device.",
  },
  {
    title: "Pick JSON, all time",
    body: "Set Date range to All time and Format to JSON. Instagram emails you a link — usually within minutes.",
  },
];

export function HowTo() {
  return (
    <section aria-labelledby="howto" className="border-t border-rule pt-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 id="howto" className="font-display text-4xl">
          Getting your file
        </h2>
        <span className="tag-label text-muted-foreground">~5 minutes</span>
      </div>
      <ol className="grid gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="bg-card p-6">
            <span className="font-display text-5xl text-signal">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 font-medium">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">
        Why a file? Instagram doesn't let outside apps see your follower list, so this is the only way
        that doesn't require handing over your password.
      </p>
    </section>
  );
}
