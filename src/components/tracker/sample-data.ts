import type { Account } from "@/lib/instagram";
import type { LoadedData } from "@/lib/instagram-files";

const names = [
  "maya.films", "jordan_runs", "theo.cooks", "lena.draws", "sam_outdoors", "priya.reads",
  "kai.studio", "noor.travels", "eli_beats", "zoe.plants", "marco.eats", "ivy.knits",
  "dev.codes", "ana_surfs", "ravi.shoots", "tess.bakes", "omar.lifts", "june.writes",
  "leo.skates", "nina.sings", "felix.frames", "rosa.paints", "hugo.hikes", "luna.dances",
  "nasa", "natgeo", "taylorswift", "nike", "espn", "bonappetitmag", "archdigest", "spotify",
];

function acc(username: string, daysAgo: number): Account {
  return {
    username,
    href: `https://www.instagram.com/${username}/`,
    timestamp: Math.floor(Date.now() / 1000) - daysAgo * 86400,
  };
}

/** A made-up account so people can preview the app before downloading their data. */
export function sampleData(): LoadedData {
  const following = names.map((n, i) => acc(n, 40 + i * 37));
  const followers = [
    ...names.slice(0, 18).map((n, i) => acc(n, 30 + i * 41)),
    acc("grandma.jo", 900),
    acc("coach_rivera", 410),
    acc("pixel.pete", 120),
    acc("hannah.b", 64),
    acc("design.daily", 12),
  ];
  return { followers, following };
}
