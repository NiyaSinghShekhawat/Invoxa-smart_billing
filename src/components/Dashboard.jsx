import { s, badge } from "./styles";
import { fmtINR } from "../utils/taxUtils";

export default function Dashboard({ settings, stock, onNewInvoice }) {
  const totalStockValue = stock.reduce((sum, it) => sum + it.sellingPrice * (it.quantity || 1), 0);
  const avgMargin = stock.length
    ? stock.reduce((sum, it) => sum + (it.costPrice > 0 ? ((it.sellingPrice - it.costPrice) / it.costPrice) * 100 : 0), 0) / stock.length
    : 0;

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{ ...s.pageTitle, fontSize: 28, marginBottom: 4 }}>
            Welcome, {settings.ownerName || settings.businessName || "there"} 👋
          </h2>
          <div style={{ color: "#888", fontSize: 14 }}>
            {settings.businessName}
            {settings.gstin && <span style={{ marginLeft: 10, fontFamily: "monospace", background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>GSTIN: {settings.gstin}</span>}
          </div>
        </div>
        <button style={{ ...s.btnPrimary, padding: "13px 28px", fontSize: 15 }} onClick={onNewInvoice}>
          + Generate Invoice
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "📦", value: stock.length, label: "Total Products", color: "#dbeafe" },
          { icon: "💰", value: fmtINR(totalStockValue), label: "Est. Stock Value", color: "#dcfce7" },
          { icon: "📈", value: `${avgMargin.toFixed(1)}%`, label: "Avg. Margin", color: "#fef3c7" },
        ].map(card => (
          <div key={card.label} style={{ ...s.card, marginBottom: 0, borderTop: `3px solid ${card.color}` }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick stock preview */}
      {stock.length > 0 && (
        <div style={s.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={s.cardTitle}>Recent Stock</div>
          </div>
          <table style={s.table}>
            <thead><tr>
              {["Product", "Company", "HSN", "GST Rate", "Selling Price", "Stock"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {stock.slice(-5).reverse().map((it, i) => (
                <tr key={it.id} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                  <td style={{ ...s.td, fontWeight: 500 }}>{it.name}</td>
                  <td style={s.td}>{it.company || "—"}</td>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>{it.hsnCode || "—"}</td>
                  <td style={s.td}>{it.taxable ? <span style={badge("blue")}>{it.gstPct}%</span> : <span style={badge("gray")}>Nil</span>}</td>
                  <td style={{ ...s.td, fontWeight: 500 }}>₹{it.sellingPrice.toFixed(2)}</td>
                  <td style={s.td}>{it.quantity ?? "∞"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stock.length === 0 && (
        <div style={{ ...s.card, textAlign: "center", padding: 48, color: "#aaa" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, marginBottom: 6, color: "#888" }}>No products in stock yet</div>
          <div style={{ fontSize: 13 }}>Go to Stock Management to add your products with GST rates</div>
        </div>
      )}
    </div>
  );
}