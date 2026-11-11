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
      onLoaded(data, list.length === 1 ? list[0].name : `${list.length} files`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file couldn't be read.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
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
          "group relative flex w-full flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed border-input bg-card px-6 py-14 text-center transition-all",
          "hover:border-signal hover:bg-signal-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging && "border-signal bg-signal-soft scale-[1.01]",
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full border border-input bg-background transition-transform group-hover:-rotate-6">
          {busy ? (
            <Loader2 className="size-6 animate-spin text-signal" />
          ) : dragging ? (
            <FileArchive className="size-6 text-signal" />
          ) : (
            <Upload className="size-6" />
          )}
        </span>
        <span className="font-display text-3xl">
          {busy ? "Reading your file…" : "Drop your Instagram file here"}
        </span>
        <span className="tag-label text-muted-foreground">
          .zip from Instagram · or followers_1 + following files
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
        <p role="alert" className="rounded-sm border border-signal/40 bg-signal-soft px-4 py-3 text-sm">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Your file never leaves this browser tab.
        </p>
        <Button variant="link" size="sm" className="px-0" onClick={() => onLoaded(sampleData(), "Sample account")}>
          Try it with sample data →
        </Button>
      </div>
    </div>
  );
}
