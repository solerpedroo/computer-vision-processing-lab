type SpinnerProps = {
  label?: string;
  size?: "sm" | "md";
};

export function Spinner({ label = "Loading", size = "md" }: SpinnerProps) {
  return (
    <span className={`spinner spinner-${size}`} role="status" aria-live="polite">
      <span className="spinner-ring" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
