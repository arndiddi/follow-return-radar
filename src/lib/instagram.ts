/**
 * Pure helpers for reading Instagram's "Download your information" export
 * (Followers and following) and comparing the two lists.
 * Supports both the JSON and HTML export formats.
 */

export type Account = {
  username: string;
  href: string;
  /** Unix seconds when the follow happened, when Instagram includes it. */
  timestamp?: number;
};

export type ListKind = "followers" | "following";

export type Comparison = {
  notFollowingBack: Account[];
  fans: Account[];
  mutuals: Account[];
};

const FOLLOWERS_RE = /^followers(_\d+)?\.(json|html)$/i;
const FOLLOWING_RE = /^following(_\d+)?\.(json|html)$/i;

/** Decide which list a file in the export holds, based on its file name. */
export function classifyFile(path: string): ListKind | null {
  const base = path.split(/[\\/]/).pop() ?? "";
  if (FOLLOWERS_RE.test(base)) return "followers";
  if (FOLLOWING_RE.test(base)) return "following";
  return null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

export function usernameFromHref(href: string | undefined): string {
  if (!href) return "";
  try {
    const url = new URL(href);
    const parts = url.pathname.split("/").filter((p) => p && p !== "_u");
    return parts[0] ?? "";
  } catch {
    return "";
  }
}

function toAccount(username: string, timestamp?: number): Account | null {
  const u = normalizeUsername(username);
  if (!u || !/^[a-z0-9._]+$/.test(u)) return null;
  return {
    username: u,
    href: `https://www.instagram.com/${u}/`,
    timestamp: typeof timestamp === "number" && timestamp > 0 ? timestamp : undefined,
  };
}

type RawEntry = {
  title?: string;
  string_list_data?: { href?: string; value?: string; timestamp?: number }[];
};

function entriesFromJson(data: unknown): RawEntry[] {
  if (Array.isArray(data)) return data as RawEntry[];
  if (data && typeof data === "object") {
    for (const value of Object.values(data as Record<string, unknown>)) {
      if (Array.isArray(value)) return value as RawEntry[];
    }
  }
  return [];
}

export function parseJsonList(text: string): Account[] {
  const data = JSON.parse(text);
  const out: Account[] = [];
  for (const entry of entriesFromJson(data)) {
    const sld = entry?.string_list_data?.[0];
    const name = sld?.value || entry?.title || usernameFromHref(sld?.href);
    const acc = toAccount(name ?? "", sld?.timestamp);
    if (acc) out.push(acc);
  }
  return out;
}

export function parseHtmlList(text: string): Account[] {
  const out: Account[] = [];
  const re = /href="(https?:\/\/(?:www\.)?instagram\.com\/[^"]+)"[^>]*>([^<]*)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const acc = toAccount(m[2] || usernameFromHref(m[1]));
    if (acc) out.push(acc);
  }
  return out;
}

export function parseList(fileName: string, text: string): Account[] {
  return fileName.toLowerCase().endsWith(".html") ? parseHtmlList(text) : parseJsonList(text);
}

export function dedupe(accounts: Account[]): Account[] {
  const map = new Map<string, Account>();
  for (const a of accounts) {
    const existing = map.get(a.username);
    if (!existing || (!existing.timestamp && a.timestamp)) map.set(a.username, a);
  }
  return [...map.values()];
}

export function compare(followers: Account[], following: Account[]): Comparison {
  const fol = dedupe(followers);
  const ing = dedupe(following);
  const followerSet = new Set(fol.map((a) => a.username));
  const followingSet = new Set(ing.map((a) => a.username));
  return {
    notFollowingBack: ing.filter((a) => !followerSet.has(a.username)),
    fans: fol.filter((a) => !followingSet.has(a.username)),
    mutuals: ing.filter((a) => followerSet.has(a.username)),
  };
}

export type SortMode = "recent" | "oldest" | "az";

export function sortAccounts(list: Account[], mode: SortMode): Account[] {
  const copy = [...list];
  if (mode === "az") return copy.sort((a, b) => a.username.localeCompare(b.username));
  const dir = mode === "recent" ? -1 : 1;
  return copy.sort((a, b) => {
    if (a.timestamp == null && b.timestamp == null) return a.username.localeCompare(b.username);
    if (a.timestamp == null) return 1;
    if (b.timestamp == null) return -1;
    return (a.timestamp - b.timestamp) * dir;
  });
}

export function toCsv(list: Account[]): string {
  const rows = [["username", "profile_url", "followed_on"]];
  for (const a of list) {
    rows.push([
      a.username,
      a.href,
      a.timestamp ? new Date(a.timestamp * 1000).toISOString().slice(0, 10) : "",
    ]);
  }
  return rows.map((r) => r.join(",")).join("\n");
}
