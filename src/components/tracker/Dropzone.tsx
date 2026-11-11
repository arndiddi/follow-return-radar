import { useRef, useState } from "react";
import { FileArchive, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadInstagramFiles, type LoadedData } from "@/lib/instagram-files";
import { sampleData } from "./sample-data";

export function Dropzone({ onLoaded }: { onLoaded: (data: LoadedData, label: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const list = Array.from(files);
      const data = await loadInstagramFiles(list);
      onLoaded(data, list.length === 1 && list[0] ? list[0].name : `${list.length} files`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file couldn't be read.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files);
        }}
        className={cn(
          "group gradient-border relative flex w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl px-8 py-14 text-center transition-all duration-300",
          "hover:-translate-y-1 hover:glow-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging && "-translate-y-1 glow-signal",
        )}
      >
        <span className="drop-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span
          className={cn(
            "gradient-bg glow-signal relative flex size-16 items-center justify-center rounded-2xl text-signal-foreground transition-transform duration-300",
            "group-hover:-rotate-6 group-hover:scale-105",
            dragging && "scale-110",
          )}
        >
          {busy ? (
            <Loader2 className="size-7 animate-spin" />
          ) : dragging ? (
            <FileArchive className="size-7" />
          ) : (
            <Upload className="size-7" />
          )}
        </span>
        <span className="relative space-y-2">
          <span className="block font-display text-3xl font-bold text-foreground">
            {busy ? "Reading your file…" : "Drop your Instagram file here"}
          </span>
          <span className="tag-label block text-muted-foreground">
            .zip from Instagram · or followers_1 + following files
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".zip,.json,.html,application/zip,application/json,text/html"
        className="sr-only"
        aria-label="Upload Instagram data"
        onChange={(e) => handle(e.target.files)}
      />
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-signal/40 bg-signal-soft px-4 py-3 text-sm text-foreground"
        >
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Your file never leaves this browser tab.</p>
        <Button
          variant="outline"
          size="sm"
          className="text-signal"
          onClick={() => onLoaded(sampleData(), "Sample account")}
        >
          Try sample data →
        </Button>
      </div>
    </div>
  );
}
