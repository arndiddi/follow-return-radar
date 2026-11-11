import { classifyFile, dedupe, parseList, type Account } from "./instagram";

export type LoadedData = {
  followers: Account[];
  following: Account[];
};

/**
 * Read the files the user dropped in — either the whole export ZIP or the
 * individual followers / following files — entirely in the browser.
 */
export async function loadInstagramFiles(files: File[]): Promise<LoadedData> {
  const followers: Account[] = [];
  const following: Account[] = [];
  let sawFollowers = false;
  let sawFollowing = false;

  const handle = (name: string, text: string) => {
    const kind = classifyFile(name);
    if (!kind) return;
    const list = parseList(name, text);
    if (kind === "followers") {
      sawFollowers = true;
      followers.push(...list);
    } else {
      sawFollowing = true;
      following.push(...list);
    }
  };

  for (const file of files) {
    if (file.name.toLowerCase().endsWith(".zip")) {
      const { default: JSZip } = await import("jszip");
      const zip = await JSZip.loadAsync(file);
      const entries = Object.values(zip.files).filter(
        (f) => !f.dir && classifyFile(f.name) && !f.name.includes("__MACOSX"),
      );
      for (const entry of entries) handle(entry.name, await entry.async("string"));
    } else {
      handle(file.name, await file.text());
    }
  }

  if (!sawFollowers && !sawFollowing) {
    throw new Error(
      "We couldn't find your followers or following lists in that file. Make sure you picked “Followers and following” when requesting your data.",
    );
  }
  if (!sawFollowers) throw new Error("Found who you follow, but not your followers file (followers_1).");
  if (!sawFollowing) throw new Error("Found your followers, but not the file of who you follow (following).");

  return { followers: dedupe(followers), following: dedupe(following) };
}
