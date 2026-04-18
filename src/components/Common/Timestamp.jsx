// src/components/Common/Timestamp.jsx
export function Timestamp({ value }) {
  if (!value) return <span className="timestamp">—</span>;
  try {
    return (
      <time className="timestamp" dateTime={value}>
        {new Date(value).toLocaleString("en-IN", {
          day: "2-digit", month: "short",
          hour: "2-digit", minute: "2-digit", hour12: true,
        })}
      </time>
    );
  } catch {
    return <span className="timestamp">{value}</span>;
  }
}
