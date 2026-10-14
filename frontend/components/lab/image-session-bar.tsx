import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, type ImageMetadata } from "@/lib/image";

type ImageSessionBarProps = {
  metadata: ImageMetadata;
  onReplace: () => void;
  onClear: () => void;
};

export function ImageSessionBar({ metadata, onReplace, onClear }: ImageSessionBarProps) {
  return (
    <div className="surface-raised flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{metadata.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {metadata.width} × {metadata.height} · {metadata.mediaType} · {formatBytes(metadata.fileSizeBytes)}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={onReplace}>
          <RefreshCw className="size-3.5" aria-hidden />
          Replace image
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
