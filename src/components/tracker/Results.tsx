import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowUpRight, Download, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { compare, sortAccounts, toCsv, type Account, type SortMode } from "@/lib/instagram";
import type { LoadedData } from "@/lib/instagram-files";

type TabKey = "notFollowingBack" | "fans" | "mutuals";

const tabs: { key: TabKey; label: string; blurb: string }[] = [
  { key: "notFollowingBack", label: "Don't follow you back", blurb: "You follow them. They don't follow you." },
  { key: "fans", label: "You don't follow back", blurb: "They follow you. You don't follow them." },
  { key: "mutuals", label: "Mutuals", blurb: "You follow each other." },
];

const sorts: { key: SortMode; label: string }[] = [
  { key: "oldest", label: "Oldest" },
  { key: "recent", label: "Newest" },
  { key: "az", label: "A–Z" },
];

export function Results({
  data,
  label,
  onReset,
}: {
  data: LoadedData;
  label: string;
  onReset: () => void;
}) {
  const result = useMemo(() => compare(data.followers, data.following), [data]);
  const [tab, setTab] = useState<TabKey>("notFollowingBack");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("oldest");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, "");
    const filtered = q ? result[tab].filter((a) => a.username.includes(q)) : result[tab];
    return sortAccounts(filtered, sort);
  }, [result, tab, query, sort]);

  const active = tabs.find((t) => t.key === tab)!;
  const ratio = data.following.length
    ? Math.round((result.mutuals.length / data.following.length) * 100)
    : 0;

  function downloadCsv() {
    const blob = new Blob([toCsv(list)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab === "notFollowingBack" ? "not-following-back" : tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyList() {
    await navigator.clipboard.writeText(list.map((a) => a.username).join("\n"));
    toast.success(`Copied ${list.length} usernames`);
  }

  return (
    <div className="animate-rise space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="glass tag-label inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-signal" /> Report · {label}
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.92] sm:text-7xl">
            <span className="gradient-text animate-sheen">{result.notFollowingBack.length}</span>{" "}
            {result.notFollowingBack.length === 1 ? "person doesn't" : "people don't"} follow you
            back.
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw /> New file
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Following" value={data.following.length} tone="bg-beam" />
        <Stat label="Followers" value={data.followers.length} tone="bg-violet" />
        <Stat label="Mutuals" value={result.mutuals.length} tone="bg-moss" />
        <Stat label="Follow-back rate" value={`${ratio}%`} tone="gradient-bg" />
      </dl>

      <div>
        <div
          role="tablist"
          className="glass inline-flex flex-wrap gap-1 rounded-full p-1.5"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                tab === t.key
                  ? "gradient-bg glow-signal text-signal-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-xs",
                  tab === t.key
                    ? "bg-signal-foreground/15 text-signal-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {result[t.key].length}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">{active.blurb}</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search username"
                aria-label="Search username"
                className="glass h-9 w-52 rounded-full border-input pl-10"
              />
            </div>
            <div className="glass flex rounded-full p-1">
              {sorts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-xs transition-all duration-200",
                    sort === s.key
                      ? "gradient-bg text-signal-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={copyList} disabled={!list.length}>
              Copy
            </Button>
            <Button variant="signal" size="sm" onClick={downloadCsv} disabled={!list.length}>
              <Download /> CSV
            </Button>
          </div>
        </div>

        <ul className="glass mt-6 overflow-hidden rounded-2xl">
          {list.length === 0 ? (
            <li className="px-6 py-20 text-center">
              <p className="font-display text-4xl font-bold">
                {query ? <span className="gradient-text">No matches.</span> : "Nobody here."}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {query ? "Try a different spelling." : "Nice — this list is empty."}
              </p>
            </li>
          ) : (
            list.map((a, i) => <Row key={a.username} account={a} index={i} />)
          )}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="glass group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-signal/40">
      <span className={cn("absolute inset-x-0 top-0 h-0.5 opacity-80", tone)} />
      <span
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-60",
          tone,
        )}
      />
      <dt className="tag-label text-muted-foreground">{label}</dt>
      <dd className="mt-3 font-display text-5xl font-bold leading-none">{value}</dd>
    </div>
  );
}

function Row({ account, index }: { account: Account; index: number }) {
  return (
    <li className="ledger-row group flex items-center gap-4 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/50 sm:px-6">
      <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground/70">
        {String(index + 1).padStart(3, "0")}
      </span>
      <span className="glass flex size-10 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold uppercase text-muted-foreground transition-all duration-300 group-hover:gradient-bg group-hover:text-signal-foreground">
        {account.username.replace(/[^a-z0-9]/g, "").charAt(0) || "·"}
      </span>
      <a
        href={account.href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate font-medium text-foreground hover:text-signal"
      >
        @{account.username}
      </a>
      {account.timestamp && (
        <span className="hidden font-mono text-xs text-muted-foreground sm:block">
          since {format(new Date(account.timestamp * 1000), "MMM d, yyyy")}
        </span>
      )}
      <a
        href={account.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open @${account.username} on Instagram`}
        className="flex size-8 items-center justify-center rounded-full border border-input text-muted-foreground transition-all duration-200 hover:gradient-bg hover:text-signal-foreground"
      >
        <ArrowUpRight className="size-4" />
      </a>
    </li>
  );
}
