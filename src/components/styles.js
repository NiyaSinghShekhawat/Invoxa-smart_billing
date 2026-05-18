export const s = {
  container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  card: { background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "24px 28px", marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 18 },
  pageTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1a1a1a", margin: 0 },
  label: { fontSize: 11, color: "#666", marginBottom: 5, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" },
  input: {
    width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#fafafa", color: "#1a1a1a", boxSizing: "border-box",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", padding: "8px 12px", borderBottom: "2px solid #eee", whiteSpace: "nowrap" },
  td: { padding: "10px 12px", fontSize: 13, color: "#333", borderBottom: "1px solid #f2f2f2", verticalAlign: "middle" },
  btnPrimary: { padding: "10px 22px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 },
  btnSecondary: { padding: "10px 22px", background: "#f5f5f5", color: "#333", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 },
  btnDanger: { padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500 },
  btnGhost: { padding: "8px 16px", background: "transparent", color: "#555", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13 },
};

export function badge(color) {
  const map = {
    green: { bg: "#dcfce7", color: "#15803d" },
    red: { bg: "#fee2e2", color: "#dc2626" },
    blue: { bg: "#dbeafe", color: "#1d4ed8" },
    amber: { bg: "#fef3c7", color: "#b45309" },
    gray: { bg: "#f3f4f6", color: "#6b7280" },
    purple: { bg: "#ede9fe", color: "#7c3aed" },
  };
  const c = map[color] || map.gray;
  return { padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, display: "inline-block" };
}