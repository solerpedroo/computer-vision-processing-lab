"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Operation } from "@/lib/api";
import { mergeParamValues } from "@/lib/lab-operations";
import { cn } from "@/lib/utils";

type ParameterControlsProps = {
  operation: Operation;
  values: Record<string, number | string>;
  onChange: (next: Record<string, number | string>) => void;
  className?: string;
};

export function ParameterControls({ operation, values, onChange, className }: ParameterControlsProps) {
  if (operation.params.length === 0) {
    return <p className="text-xs text-muted-foreground">This operation has no tunable parameters.</p>;
  }

  const merged = mergeParamValues(operation, values);

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {operation.params.map((parameter) =>
        parameter.type === "enum" ? (
          <div key={parameter.name} className="flex flex-col gap-1.5 text-sm">
            <label htmlFor={`param-${parameter.name}`} className="font-medium text-foreground">
              {parameter.name}
            </label>
            <Select
              value={String(merged[parameter.name])}
              onValueChange={(next) => onChange({ ...merged, [parameter.name]: next })}
            >
              <SelectTrigger id={`param-${parameter.name}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parameter.enum?.map((choice) => (
                  <SelectItem key={choice} value={choice}>
                    {choice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <label key={parameter.name} className="flex flex-col gap-2 text-sm">
            <span className="flex items-baseline justify-between gap-2 font-medium text-foreground">
              {parameter.name}
              <span className="font-mono text-xs tabular-nums text-brand">{merged[parameter.name]}</span>
            </span>
            <input
              type="range"
              className="accent-brand"
              min={parameter.min}
              max={parameter.max}
              step={parameter.step}
              value={Number(merged[parameter.name])}
              onChange={(event) => onChange({ ...merged, [parameter.name]: Number(event.target.value) })}
            />
          </label>
        ),
      )}
    </div>
  );
}
