import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Dropzone } from "@/components/tracker/Dropzone";
import { HowTo } from "@/components/tracker/HowTo";
import { Results } from "@/components/tracker/Results";
import type { LoadedData } from "@/lib/instagram-files";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unrequited — See who doesn't follow you back on Instagram" },
      {
        name: "description",
        content:
          "Upload your Instagram data download and instantly see who doesn't follow you back. Private: everything runs in your browser.",
      },
      { property: "og:title", content: "Unrequited — Instagram follow-back checker" },
      {
        property: "og:description",
        content: "Find out who doesn't follow you back on Instagram — no password, no login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [loaded, setLoaded] = useState<{ data: LoadedData; label: string } | null>(null);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <button onClick={() => setLoaded(null)} className="font-display text-2xl italic">
          Unrequited<span className="text-signal">.</span>
        </button>
        <span className="tag-label flex items-center gap-2 text-muted-foreground">
          <Lock className="size-3" /> Private · runs on your device
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        {loaded ? (
          <Results data={loaded.data} label={loaded.label} onReset={() => setLoaded(null)} />
        ) : (
          <div className="space-y-20">
            <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
              <div className="animate-rise">
                <p className="tag-label text-signal">Instagram follow-back checker</p>
                <h1 className="mt-4 font-display text-6xl leading-[0.95] sm:text-8xl">
                  You follow them.
                  <br />
                  <em className="text-muted-foreground">Do they follow you?</em>
                </h1>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
                  Drop in the file Instagram gives you and see exactly who doesn't follow you back —
                  no password, no login, nothing uploaded.
                </p>
              </div>
              <div className="animate-rise [animation-delay:120ms]">
                <Dropzone onLoaded={(data, label) => setLoaded({ data, label })} />
              </div>
            </section>
            <HowTo />
          </div>
        )}
      </main>
    </div>
  );
}
