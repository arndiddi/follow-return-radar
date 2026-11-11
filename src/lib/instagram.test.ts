import { describe, expect, it } from "vitest";
import { classifyFile, compare, parseHtmlList, parseJsonList } from "./instagram";

const followersJson = JSON.stringify([
  { title: "", string_list_data: [{ href: "https://www.instagram.com/alice", value: "alice", timestamp: 1700000000 }] },
  { title: "", string_list_data: [{ href: "https://www.instagram.com/bob", value: "Bob", timestamp: 1700000100 }] },
]);

// Newer exports put the username in `title` and omit `value`.
const followingJson = JSON.stringify({
  relationships_following: [
    { title: "bob", string_list_data: [{ href: "https://www.instagram.com/_u/bob", timestamp: 1690000000 }] },
    { title: "carol", string_list_data: [{ href: "https://www.instagram.com/_u/carol", timestamp: 1690000100 }] },
  ],
});

describe("Instagram export parsing", () => {
  it("reads usernames from followers and following JSON in both export styles", () => {
    expect(parseJsonList(followersJson).map((a) => a.username)).toEqual(["alice", "bob"]);
    expect(parseJsonList(followingJson).map((a) => a.username)).toEqual(["bob", "carol"]);
  });

  it("reads usernames from the HTML export", () => {
    const html = `<div><a target="_blank" href="https://www.instagram.com/dave">dave</a></div>`;
    expect(parseHtmlList(html).map((a) => a.username)).toEqual(["dave"]);
  });

  it("recognises followers and following files but ignores other lists", () => {
    expect(classifyFile("connections/followers_and_following/followers_1.json")).toBe("followers");
    expect(classifyFile("followers_and_following/following.html")).toBe("following");
    expect(classifyFile("followers_and_following/recently_unfollowed_profiles.json")).toBeNull();
    expect(classifyFile("followers_and_following/pending_follow_requests.json")).toBeNull();
  });
});

describe("Follow-back comparison", () => {
  const result = compare(parseJsonList(followersJson), parseJsonList(followingJson));

  it("lists people you follow who don't follow you back", () => {
    expect(result.notFollowingBack.map((a) => a.username)).toEqual(["carol"]);
  });

  it("lists people who follow you that you don't follow back", () => {
    expect(result.fans.map((a) => a.username)).toEqual(["alice"]);
  });

  it("lists mutuals", () => {
    expect(result.mutuals.map((a) => a.username)).toEqual(["bob"]);
  });
});
