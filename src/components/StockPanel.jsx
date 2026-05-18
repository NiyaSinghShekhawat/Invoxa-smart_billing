import { useState } from "react";
import { GST_SLABS } from "../utils/taxUtils";
import { EMPTY_STOCK_ITEM, todayStr } from "../utils/constants";
import { s, badge } from "./styles";

export default function StockPanel({ stock, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_STOCK_ITEM, dateOfPurchase: todayStr() });
  const [search, setSearch] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim()) return alert("Product name is required");
    if (!form.sellingPrice) return alert("Selling price is required");
    onAdd({
      ...form,
      id: Date.now(),
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      gstPct: parseFloat(form.gstPct) || 0,
      quantity: form.quantity ? parseInt(form.quantity) : null,
    });
    setForm({ ...EMPTY_STOCK_ITEM, dateOfPurchase: todayStr() });
    setShowForm(false);
  };

  const filtered = stock.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    (it.company || "").toLowerCase().includes(search.toLowerCase()) ||
    (it.hsnCode || "").includes(search)
  );

  return (
    <div style={s.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={s.pageTitle}>Stock Management</h2>
        <button style={s.btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Add Item"}
        </button>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div style={{ ...s.card, marginBottom: 20, border: "1.5px solid #1a1a1a" }}>
          <div style={s.cardTitle}>New Stock Item</div>
          <div style={s.grid3}>
            <FormField label="Product Name *" value={form.name} onChange={v => set("name", v)} />
            <FormField label="Company / Brand" value={form.company} onChange={v => set("company", v)} />
            <FormField label="HSN Code" value={form.hsnCode} onChange={v => set("hsnCode", v)} mono />
            <FormField label="Cost Price (₹)" value={form.costPrice} onChange={v => set("costPrice", v)} type="number" />
            <FormField label="Selling Price (₹)" value={form.sellingPrice} onChange={v => set("sellingPrice", v)} type="number" />
            <div>
              <label style={s.label}>GST Rate (%)</label>
              <select style={s.input} value={form.gstPct} onChange={e => set("gstPct", e.target.value)}>
                {GST_SLABS.map(g => <option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
            <FormField label="Date of Purchase" value={form.dateOfPurchase} onChange={v => set("dateOfPurchase", v)} type="date" />
            <FormField label="Stock Qty (optional)" value={form.quantity} onChange={v => set("quantity", v)} type="number" placeholder="Unlimited" />
            <div>
              <label style={s.label}>Taxable</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {[true, false].map(v => (
                  <button key={String(v)} onClick={() => set("taxable", v)}
                    style={{ padding: "8px 18px", borderRadius: 8, border: `1.5px solid ${form.taxable === v ? "#1a1a1a" : "#ddd"}`,
                      background: form.taxable === v ? "#1a1a1a" : "#fff", color: form.taxable === v ? "#fff" : "#888",
                      cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
                    {v ? "Taxable" : "Non-Taxable"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {form.costPrice && form.sellingPrice && (
            <div style={{ marginTop: 12, fontSize: 13, padding: "8px 14px", background: "#f0fdf4", borderRadius: 8, color: "#15803d", fontWeight: 500 }}>
              Profit: ₹{(parseFloat(form.sellingPrice) - parseFloat(form.costPrice)).toFixed(2)} &nbsp;|&nbsp;
              Margin: {form.costPrice > 0 ? (((form.sellingPrice - form.costPrice) / form.costPrice) * 100).toFixed(1) : 0}%
              {form.taxable && ` | GST: ${form.gstPct}% (CGST ${form.gstPct/2}% + SGST ${form.gstPct/2}%)`}
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={s.btnPrimary} onClick={handleAdd}>Add to Stock</button>
            <button style={s.btnSecondary} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Search ── */}
      <div style={{ marginBottom: 16 }}>
        <input style={{ ...s.input, width: 280, background: "#fff" }} placeholder="🔍 Search by name, company, HSN..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* ── Table ── */}
      <div style={s.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Product", "Company", "HSN", "GST", "Cost", "Selling", "Profit", "Stock", ""].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const profit = item.sellingPrice - item.costPrice;
                const margin = item.costPrice > 0 ? ((profit / item.costPrice) * 100).toFixed(1) : "—";
                return (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                    <td style={{ ...s.td, fontWeight: 500 }}>
                      {item.name}
                      {!item.taxable && <span style={{ ...badge("gray"), marginLeft: 6 }}>Non-Tax</span>}
                    </td>
                    <td style={s.td}>{item.company || "—"}</td>
                    <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12 }}>{item.hsnCode || "—"}</td>
                    <td style={s.td}>
                      {item.taxable
                        ? <span style={badge("blue")}>{item.gstPct}%</span>
                        : <span style={badge("gray")}>Nil</span>
                      }
                    </td>
                    <td style={s.td}>₹{item.costPrice.toFixed(2)}</td>
                    <td style={{ ...s.td, fontWeight: 500 }}>₹{item.sellingPrice.toFixed(2)}</td>
                    <td style={s.td}>
                      <span style={badge(profit >= 0 ? "green" : "red")}>
                        ₹{profit.toFixed(2)} ({margin}%)
                      </span>
                    </td>
                    <td style={s.td}>{item.quantity ?? "∞"}</td>
                    <td style={s.td}>
                      <button style={s.btnDanger} onClick={() => onDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>
                  {stock.length === 0 ? "No items in stock. Add your first product →" : "No matching products found"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = "text", placeholder, mono }) {
  return (
    <div>
      <label style={{ fontSize: 11, color: "#666", marginBottom: 5, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{label}</label>
      <input style={{
        width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8,
        fontSize: 14, outline: "none", background: "#fafafa", color: "#1a1a1a",
        boxSizing: "border-box", fontFamily: mono ? "monospace" : "inherit",
      }} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} />
    </div>
  );
}