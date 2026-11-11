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
          <p className="tag-label text-muted-foreground">Report · {label}</p>
          <h1 className="mt-2 font-display text-5xl leading-none sm:text-7xl">
            <span className="text-signal">{result.notFollowingBack.length}</span>{" "}
            {result.notFollowingBack.length === 1 ? "person doesn't" : "people don't"} follow you back.
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw /> New file
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-rule bg-rule md:grid-cols-4">
        <Stat label="Following" value={data.following.length} />
        <Stat label="Followers" value={data.followers.length} />
        <Stat label="Mutuals" value={result.mutuals.length} />
        <Stat label="Follow-back rate" value={`${ratio}%`} />
      </dl>

      <div>
        <div role="tablist" className="flex flex-wrap gap-2 border-b border-rule">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 pr-4 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-signal text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-xs",
                  tab === t.key ? "bg-signal text-signal-foreground" : "bg-muted",
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
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search username"
                aria-label="Search username"
                className="w-52 bg-card pl-9"
              />
            </div>
            <div className="flex rounded-md border border-input bg-card p-0.5">
              {sorts.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={cn(
                    "rounded px-2.5 py-1 font-mono text-xs transition-colors",
                    sort === s.key ? "bg-ink text-paper" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={copyList} disabled={!list.length}>
              Copy
            </Button>
            <Button variant="ink" size="sm" onClick={downloadCsv} disabled={!list.length}>
              <Download /> CSV
            </Button>
          </div>
        </div>

        <ul className="mt-6 rounded-sm border border-rule bg-card">
          {list.length === 0 ? (
            <li className="px-6 py-16 text-center">
              <p className="font-display text-3xl">{query ? "No matches." : "Nobody here."}</p>
              <p className="mt-2 text-sm text-muted-foreground">
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-card p-5">
      <dt className="tag-label text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-5xl leading-none">{value}</dd>
    </div>
  );
}

function Row({ account, index }: { account: Account; index: number }) {
  return (
    <li className="ledger-row flex items-center gap-4 px-4 py-3 last:border-b-0 sm:px-6">
      <span className="w-8 shrink-0 font-mono text-xs text-muted-foreground">
        {String(index + 1).padStart(3, "0")}
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-lg uppercase">
        {account.username.replace(/[^a-z0-9]/g, "").charAt(0) || "·"}
      </span>
      <a
        href={account.href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate font-medium hover:text-signal hover:underline"
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
        className="flex size-8 items-center justify-center rounded-full border border-input text-muted-foreground transition-colors hover:border-signal hover:bg-signal hover:text-signal-foreground"
      >
        <ArrowUpRight className="size-4" />
      </a>
    </li>
  );
}
