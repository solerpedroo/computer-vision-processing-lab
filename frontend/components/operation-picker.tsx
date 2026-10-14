"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Operation } from "@/lib/api";
import { groupOperationsByModule } from "@/lib/operations-ui";
import { cn } from "@/lib/utils";

type OperationPickerProps = {
  id: string;
  label: string;
  operations: readonly Operation[];
  value: string;
  onChange: (operationId: string) => void;
};

export function OperationPicker({ id, label, operations, value, onChange }: OperationPickerProps) {
  const [query, setQuery] = useState("");
  const groups = groupOperationsByModule(operations);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.name.toLowerCase().includes(normalized) ||
            item.id.toLowerCase().includes(normalized) ||
            group.label.toLowerCase().includes(normalized),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span id={`${id}-label`} className="font-medium text-foreground">
        {label}
      </span>
      <Select
        value={value}
        onValueChange={(next) => {
          onChange(next);
          setQuery("");
        }}
      >
        <SelectTrigger id={id} aria-labelledby={`${id}-label`}>
          <SelectValue placeholder="Choose an operation" />
        </SelectTrigger>
        <SelectContent>
          <div className="sticky top-0 z-10 border-b border-border bg-popover p-2">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter operations…"
                aria-label="Filter operations"
                className={cn(
                  "h-9 w-full rounded-md border border-input bg-background py-1 pl-8 pr-2 text-sm",
                  "placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20",
                )}
                onKeyDown={(event) => event.stopPropagation()}
              />
            </div>
          </div>
          {filteredGroups.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">No operations match your filter.</p>
          ) : (
            filteredGroups.map((group, groupIndex) => (
              <SelectGroup key={group.module}>
                {groupIndex > 0 ? <SelectSeparator /> : null}
                <SelectLabel>{group.label}</SelectLabel>
                {group.items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
