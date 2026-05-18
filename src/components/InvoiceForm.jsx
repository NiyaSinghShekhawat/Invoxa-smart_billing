import { useState, useEffect } from "react";
import { INDIAN_STATES, PAYMENT_METHODS, generateInvoiceNumber, todayStr, EMPTY_BILL_ITEM } from "../utils/constants";
import { calcInvoiceTotals, suggestGstMode, fmtINR, GST_SLABS } from "../utils/taxUtils";
import { s, badge } from "./styles";

export default function InvoiceForm({ settings, stock, onGenerate, onBack }) {
  const [form, setForm] = useState({
    // Buyer
    buyerName: "", buyerPhone: "", buyerGstin: "",
    buyerAddress: "", buyerState: "", buyerStateCode: "",
    // Invoice meta
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: todayStr(), dueDate: "", placeOfSupply: settings.state || "",
    paymentMethod: "Cash",
    // GST mode
    gstMode: "CGST_SGST", gstModeSuggestion: null,
    // Items
    items: [],
    // Adjustments
    additionalCharges: 0, additionalChargesLabel: "Delivery Charges",
    discount: 0, receivedAmount: 0, notes: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto-suggest GST mode when buyer state changes
  useEffect(() => {
    const suggestion = suggestGstMode(settings.state, form.buyerState);
    setForm(f => ({
      ...f,
      gstModeSuggestion: suggestion,
      gstMode: suggestion || f.gstMode,
    }));
  }, [form.buyerState, settings.state]);

  const handleBuyerState = (stateName) => {
    const found = INDIAN_STATES.find(st => st.name === stateName);
    setForm(f => ({ ...f, buyerState: stateName, buyerStateCode: found ? found.code : "" }));
  };

  // ── Item management ──
  const addItemFromStock = (product) => {
    setForm(f => ({
      ...f,
      items: [...f.items, {
        productId: product.id,
        name: product.name,
        hsnCode: product.hsnCode || "",
        company: product.company || "",
        qty: 1,
        rate: product.sellingPrice,
        gstPct: product.taxable ? parseFloat(product.gstPct) : 0,
        taxable: product.taxable,
      }],
    }));
  };

  const updateItem = (idx, key, val) => {
    setForm(f => {
      const items = f.items.map((it, i) => i === idx ? { ...it, [key]: val } : it);
      return { ...f, items };
    });
  };

  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  // ── Live calculation ──
  const totals = calcInvoiceTotals(
    form.items, form.gstMode,
    form.additionalCharges, form.discount, form.receivedAmount
  );

  const handleGenerate = () => {
    if (!form.buyerName.trim()) return alert("Buyer name is required");
    if (form.items.length === 0) return alert("Add at least one item");
    onGenerate({ ...form, ...totals, settings });
  };

  const gstModeBtn = (mode, label, color) => (
    <button onClick={() => set("gstMode", mode)} style={{
      padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${form.gstMode === mode ? "#1a1a1a" : "#ddd"}`,
      background: form.gstMode === mode ? "#1a1a1a" : "#fff",
      color: form.gstMode === mode ? "#fff" : "#666",
      cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s",
    }}>{label}</button>
  );

  return (
    <div style={s.container}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button style={s.btnGhost} onClick={onBack}>← Back</button>
        <h2 style={s.pageTitle}>New Invoice</h2>
      </div>

      {/* ── Invoice Meta ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>Invoice Details</div>
        <div style={s.grid3}>
          <Field label="Invoice Number" value={form.invoiceNumber} onChange={v => set("invoiceNumber", v)} mono />
          <Field label="Invoice Date" value={form.invoiceDate} onChange={v => set("invoiceDate", v)} type="date" />
          <Field label="Due Date" value={form.dueDate} onChange={v => set("dueDate", v)} type="date" />
          <div>
            <label style={s.label}>Place of Supply</label>
            <select style={s.input} value={form.placeOfSupply} onChange={e => set("placeOfSupply", e.target.value)}>
              {INDIAN_STATES.map(st => <option key={st.code}>{st.name}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Payment Method</label>
            <select style={s.input} value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Buyer Details ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>Buyer Details</div>
        <div style={s.grid3}>
          <Field label="Buyer Name *" value={form.buyerName} onChange={v => set("buyerName", v)} placeholder="Full name / Business name" />
          <Field label="Phone Number" value={form.buyerPhone} onChange={v => set("buyerPhone", v)} placeholder="+91 XXXXX XXXXX" />
          <Field label="Buyer GSTIN (optional)" value={form.buyerGstin} onChange={v => set("buyerGstin", v.toUpperCase())} placeholder="27AABCU9603R1ZX" mono />
          <div style={{ gridColumn: "1/-1" }}>
            <Field label="Buyer Address" value={form.buyerAddress} onChange={v => set("buyerAddress", v)} placeholder="Street, Area, City" multiline />
          </div>
          <div>
            <label style={s.label}>Buyer State</label>
            <select style={s.input} value={form.buyerState} onChange={e => handleBuyerState(e.target.value)}>
              <option value="">— Select State —</option>
              {INDIAN_STATES.map(st => <option key={st.code}>{st.name}</option>)}
            </select>
          </div>
          <Field label="Buyer State Code" value={form.buyerStateCode} onChange={v => set("buyerStateCode", v)} placeholder="07" />
        </div>
      </div>

      {/* ── GST Mode ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>GST Type</div>
        {form.gstModeSuggestion && (
          <div style={{ marginBottom: 14, fontSize: 13, padding: "8px 14px", borderRadius: 8,
            background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>
            💡 Auto-detected: <b>{form.gstModeSuggestion === "CGST_SGST" ? "CGST + SGST" : "IGST"}</b>
            &nbsp;({settings.state} → {form.buyerState || "?"})
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          {gstModeBtn("CGST_SGST", "CGST + SGST (Same State)")}
          {gstModeBtn("IGST", "IGST (Interstate)")}
        </div>
        <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          {form.gstMode === "CGST_SGST"
            ? "Tax split equally: CGST = GST/2, SGST = GST/2"
            : "Full GST as IGST applied on interstate transactions"}
        </div>
      </div>

      {/* ── Items ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>Items</div>

        {/* Stock quick-add */}
        {stock.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={s.label}>Add from Stock</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
              {stock.map(p => (
                <button key={p.id} onClick={() => addItemFromStock(p)}
                  style={{ padding: "6px 14px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 20,
                    cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <span style={{ color: "#888" }}>₹{p.sellingPrice}</span>
                  {p.taxable && <span style={badge("blue")}>{p.gstPct}%</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items table */}
        {form.items.length > 0 && (
          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ ...s.table, minWidth: 820 }}>
              <thead>
                <tr>
                  {["Product", "HSN", "Qty", "Rate (₹)", "GST%", `${form.gstMode === "IGST" ? "IGST" : "CGST/SGST"} (₹)`, "Subtotal (₹)", "Total (₹)", ""].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {totals.taxedItems.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ ...s.td, fontWeight: 500, minWidth: 140 }}>
                      <input value={it.name} onChange={e => updateItem(idx, "name", e.target.value)}
                        style={{ width: "100%", border: "1px solid #eee", borderRadius: 6, padding: "5px 8px", fontSize: 13, background: "#fafafa" }} />
                    </td>
                    <td style={s.td}>
                      <input value={it.hsnCode} onChange={e => updateItem(idx, "hsnCode", e.target.value)}
                        style={{ width: 70, border: "1px solid #eee", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "monospace", background: "#fafafa" }} />
                    </td>
                    <td style={s.td}>
                      <input type="number" min="0.01" step="0.01" value={it.qty} onChange={e => updateItem(idx, "qty", e.target.value)}
                        style={{ width: 60, border: "1px solid #eee", borderRadius: 6, padding: "5px 8px", fontSize: 13, background: "#fafafa" }} />
                    </td>
                    <td style={s.td}>
                      <input type="number" min="0" value={it.rate} onChange={e => updateItem(idx, "rate", e.target.value)}
                        style={{ width: 80, border: "1px solid #eee", borderRadius: 6, padding: "5px 8px", fontSize: 13, background: "#fafafa" }} />
                    </td>
                    <td style={s.td}>
                      <select value={it.gstPct} onChange={e => updateItem(idx, "gstPct", parseFloat(e.target.value))}
                        style={{ border: "1px solid #eee", borderRadius: 6, padding: "5px 8px", fontSize: 12, background: "#fafafa" }}>
                        {GST_SLABS.map(g => <option key={g} value={g}>{g}%</option>)}
                      </select>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontSize: 12, color: "#555" }}>
                        {form.gstMode === "IGST"
                          ? <>{fmtINR(it.tax.igst)}</>
                          : <>{fmtINR(it.tax.cgst)} + {fmtINR(it.tax.sgst)}</>
                        }
                      </div>
                    </td>
                    <td style={s.td}>{fmtINR(it.tax.subtotal)}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{fmtINR(it.tax.total)}</td>
                    <td style={s.td}>
                      <button onClick={() => removeItem(idx)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={() => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_BILL_ITEM }] }))}
          style={{ ...s.btnGhost, fontSize: 13 }}>+ Add Custom Item</button>
      </div>

      {/* ── Tax Summary Preview ── */}
      {form.items.length > 0 && (
        <div style={s.card}>
          <div style={s.cardTitle}>Tax Summary</div>
          <table style={{ ...s.table, maxWidth: 420 }}>
            <thead><tr>
              <th style={s.th}>Tax</th>
              <th style={{ ...s.th, textAlign: "right" }}>Taxable Amt</th>
              <th style={{ ...s.th, textAlign: "right" }}>Tax Amt</th>
            </tr></thead>
            <tbody>
              {totals.taxSummary.map(row => (
                form.gstMode === "IGST" ? (
                  <tr key={row.gstPct}>
                    <td style={s.td}><span style={badge("purple")}>IGST @{row.gstPct}%</span></td>
                    <td style={{ ...s.td, textAlign: "right" }}>{fmtINR(row.taxableAmt)}</td>
                    <td style={{ ...s.td, textAlign: "right", fontWeight: 500 }}>{fmtINR(row.igst)}</td>
                  </tr>
                ) : (
                  <>
                    <tr key={`cgst-${row.gstPct}`}>
                      <td style={s.td}><span style={badge("blue")}>CGST @{row.gstPct / 2}%</span></td>
                      <td style={{ ...s.td, textAlign: "right" }}>{fmtINR(row.taxableAmt)}</td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 500 }}>{fmtINR(row.cgst)}</td>
                    </tr>
                    <tr key={`sgst-${row.gstPct}`}>
                      <td style={s.td}><span style={badge("amber")}>SGST @{row.gstPct / 2}%</span></td>
                      <td style={{ ...s.td, textAlign: "right" }}>{fmtINR(row.taxableAmt)}</td>
                      <td style={{ ...s.td, textAlign: "right", fontWeight: 500 }}>{fmtINR(row.sgst)}</td>
                    </tr>
                  </>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Adjustments & Totals ── */}
      <div style={s.card}>
        <div style={s.cardTitle}>Charges, Discount & Payment</div>
        <div style={s.grid3}>
          <Field label="Additional Label" value={form.additionalChargesLabel} onChange={v => set("additionalChargesLabel", v)} />
          <Field label="Additional Charges (₹)" value={form.additionalCharges} onChange={v => set("additionalCharges", v)} type="number" />
          <Field label="Discount (₹)" value={form.discount} onChange={v => set("discount", v)} type="number" />
          <Field label="Received Amount (₹)" value={form.receivedAmount} onChange={v => set("receivedAmount", v)} type="number" />
          <Field label="Notes / Remarks" value={form.notes} onChange={v => set("notes", v)} placeholder="Optional note on invoice" />
        </div>

        {/* Live total */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #eee", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 300 }}>
            {[
              ["Subtotal", fmtINR(totals.subtotal)],
              ["Total GST", fmtINR(totals.totalGst)],
              ...(parseFloat(form.additionalCharges) > 0 ? [[form.additionalChargesLabel, fmtINR(form.additionalCharges)]] : []),
              ...(parseFloat(form.discount) > 0 ? [["Discount", `− ${fmtINR(form.discount)}`]] : []),
            ].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", padding: "5px 0", borderBottom: "1px solid #f5f5f5" }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, padding: "10px 0 6px", borderTop: "2px solid #1a1a1a", marginTop: 4 }}>
              <span>Total</span><span>{fmtINR(totals.totalAmount)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#15803d", padding: "3px 0" }}>
              <span>Received</span><span>{fmtINR(totals.received)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: totals.due > 0 ? "#dc2626" : "#15803d", padding: "3px 0" }}>
              <span>Due</span><span>{fmtINR(totals.due)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button style={{ ...s.btnPrimary, padding: "13px 32px", fontSize: 15 }} onClick={handleGenerate}>
          Generate Invoice →
        </button>
        <button style={s.btnSecondary} onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, multiline, mono }) {
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#fafafa", color: "#1a1a1a",
    boxSizing: "border-box", fontFamily: mono ? "monospace" : "inherit",
  };
  return (
    <div>
      <label style={s.label}>{label}</label>
      {multiline
        ? <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} />
      }
    </div>
  );
}