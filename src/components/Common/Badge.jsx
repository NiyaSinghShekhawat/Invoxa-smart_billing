// src/components/Common/Badge.jsx
export function Badge({ variant = "minor", children }) {
  return (
    <span className={"badge badge--" + variant}>
      {children}
    </span>
  );
}
