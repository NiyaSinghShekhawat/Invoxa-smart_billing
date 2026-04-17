import "./Common.css";

const VARIANT_CLASS = {
  minor: "badge--minor",
  major: "badge--major",
};

export function Badge({ variant = "neutral", children }) {
  const mod = VARIANT_CLASS[variant] ?? "badge--neutral";
  return <span className={`badge ${mod}`}>{children}</span>;
}
