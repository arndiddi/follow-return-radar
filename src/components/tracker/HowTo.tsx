const steps = [
  {
    title: "Open Accounts Center",
    body: "In Instagram, go to your profile → menu (☰) → Accounts Center → Your information and permissions.",
  },
  {
    title: "Export your information",
    body: "Tap Export your information → Create export, then pick your Instagram account.",
  },
  {
    title: "Choose where to export",
    body: "Pick Device (not an external service) so the file lands on your phone.",
  },
  {
    title: "Confirm your export",
    body: "Under Customize information, choose Some of your information and tick Followers and following. Then set Date range to All time and Format to JSON before you confirm.",
  },
];

export function HowTo() {
  return (
    <section aria-labelledby="howto" className="border-t border-rule/70 pt-12">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 id="howto" className="font-display text-4xl font-bold">
          Getting your file
        </h2>
        <span className="tag-label text-muted-foreground">~5 minutes</span>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="glass group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-signal/40 hover:glow-signal"
          >
            <span className="drop-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <span className="gradient-text relative font-display text-5xl font-bold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="relative mt-3 font-semibold text-foreground">{s.title}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm text-muted-foreground">
        Instagram pings you when the export is ready — you only get four days to download it, so
        grab it as soon as the notification lands.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Why a file? Instagram doesn't let outside apps see your follower list, so this is the only
        way that doesn't require handing over your password.
      </p>
    </section>
  );
}
