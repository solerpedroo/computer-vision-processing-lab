import { groupOperationsByModule } from "../lib/operations-ui";
import type { Operation } from "../lib/api";

type OperationPickerProps = {
  id: string;
  label: string;
  operations: readonly Operation[];
  value: string;
  onChange: (operationId: string) => void;
};

export function OperationPicker({ id, label, operations, value, onChange }: OperationPickerProps) {
  const groups = groupOperationsByModule(operations);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="select" value={value} onChange={(event) => onChange(event.target.value)}>
        {groups.map((group) => (
          <optgroup key={group.module} label={group.label}>
            {group.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
