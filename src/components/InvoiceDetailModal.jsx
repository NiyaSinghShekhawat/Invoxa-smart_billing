import { useRef, useState } from "react";
import { fmtINR } from "../utils/taxUtils";
import { fmtDateDisplay } from "../utils/constants";

export default function InvoiceDetailModal({ invoice, onClose, onPaymentUpdate }) {
  const printRef = useRef();
  const [showPayment, setShowPayment] = useState(false);
  const [payAmount, setPayAmount]     = useState("");
  const [payNote, setPayNote]         = useState("");
  const [saving, setSaving]           = useState(false);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <!DOCTYPE html><html>
      <head>
        <title>Invoice ${invoice.invoiceNumber || ""}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; background: #fff; color: #1a1a1a; padding: 32px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const handlePaymentSave = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) return alert("Enter a valid amount");
    if (amt > due)        return alert(`Amount cannot exceed balance due (${fmtINR(due)})`);
    setSaving(true);
    try {
      const newReceived = received + amt;
      const newDue      = totalAmt - newReceived;
      const newStatus   = newDue <= 0 ? "paid" : "partial";
      await onPaymentUpdate(invoice.id, {
        received: newReceived,
        due:      newDue,
        status:   newStatus,
        paymentNote: payNote,
      });
      setShowPayment(false);
      setPayAmount("");
      setPayNote("");
    } catch (e) {
      alert("Error saving payment: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!invoice) return null;

  const s        = invoice.settings || {};
  const items    = invoice.items    || [];
  const gstMode  = invoice.gstMode  || "CGST_SGST";
  const isIGST   = gstMode === "IGST";

  const subtotal = items.reduce((acc, it) => acc + (it.subtotal ?? (it.rate * it.qty)), 0);
  const totalGst = items.reduce((acc, it) => acc + (it.gstAmount ?? 0), 0);
  const totalAmt = invoice.totalAmount ?? (subtotal + totalGst);
  const received = invoice.received ?? 0;
  const due      = invoice.due      ?? (totalAmt - received);

  const statusColor = invoice.status === "paid" ? "#16a34a" : invoice.status === "partial" ? "#b45309" : "#dc2626";
  const paidPct     = totalAmt > 0 ? Math.min((received / totalAmt) * 100, 100) : 0;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 800,
        maxHeight: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
      }}>

        {/* ── Modal toolbar ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 24px", borderBottom: "1px solid #eee", flexShrink: 0, gap: 10,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>
            Invoice #{invoice.invoiceNumber}
            <span style={{
              marginLeft: 10, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              background: statusColor, color: "#fff", borderRadius: 5, padding: "2px 8px",
            }}>{invoice.status}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {invoice.status !== "paid" && (
              <button onClick={() => setShowPayment(p => !p)} style={{
                padding: "8px 16px", background: "#dcfce7", color: "#16a34a",
                border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}>
                💳 Record Payment
              </button>
            )}
            <button onClick={handlePrint} style={{
              padding: "8px 16px", background: "#1e3a5f", color: "#fff",
              border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              🖨️ Print / PDF
            </button>
            <button onClick={onClose} style={{
              padding: "8px 14px", background: "#f5f5f5", color: "#555",
              border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
            }}>✕</button>
          </div>
        </div>

        {/* ── Payment tracker panel ── */}
        {showPayment && (
          <div style={{
            background: "#f0fdf4", borderBottom: "1px solid #bbf7d0",
            padding: "18px 24px", flexShrink: 0,
          }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#15803d", marginBottom: 12 }}>
              Record Payment
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 4 }}>
                <span>Received: <b style={{ color: "#16a34a" }}>{fmtINR(received)}</b></span>
                <span>Balance Due: <b style={{ color: "#dc2626" }}>{fmtINR(due)}</b></span>
                <span>Total: <b>{fmtINR(totalAmt)}</b></span>
              </div>
              <div style={{ height: 8, background: "#dcfce7", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${paidPct}%`, background: "#16a34a", borderRadius: 4, transition: "width .3s" }} />
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{paidPct.toFixed(1)}% collected</div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 4, fontWeight: 600 }}>Amount Received (₹)</div>
                <input
                  type="number" min="1" max={due}
                  placeholder={`Max ${fmtINR(due)}`}
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 8, border: "1.5px solid #86efac",
                    fontSize: 14, width: 180, outline: "none", fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontSize: 11, color: "#555", marginBottom: 4, fontWeight: 600 }}>Note (optional)</div>
                <input
                  type="text"
                  placeholder="e.g. UPI ref #12345"
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 8, border: "1.5px solid #86efac",
                    fontSize: 13, width: "100%", outline: "none",
                  }}
                />
              </div>
              <button onClick={handlePaymentSave} disabled={saving} style={{
                padding: "10px 20px", background: "#16a34a", color: "#fff",
                border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13,
                fontWeight: 700, whiteSpace: "nowrap",
              }}>
                {saving ? "Saving..." : "✓ Save Payment"}
              </button>
              <button onClick={() => setShowPayment(false)} style={{
                padding: "10px 14px", background: "#fff", color: "#555",
                border: "1px solid #ccc", borderRadius: 8, cursor: "pointer", fontSize: 13,
              }}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── Scrollable invoice body ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "28px 32px" }}>
          <div ref={printRef} style={{ fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" }}>

            {/* Header */}
            <div style={{
              background: "#1e3a5f", color: "#fff", borderRadius: 10,
              padding: "28px 32px", marginBottom: 24,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>
                  {s.businessName || invoice.businessName || "Your Business"}
                </div>
                {(s.address   || invoice.businessAddress) && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 2 }}>{s.address || invoice.businessAddress}</div>}
                {(s.gstin     || invoice.businessGstin)   && <div style={{ fontSize: 12, opacity: 0.8 }}>GSTIN: {s.gstin || invoice.businessGstin}</div>}
                {(s.phone     || invoice.businessPhone)   && <div style={{ fontSize: 12, opacity: 0.8 }}>📞 {s.phone || invoice.businessPhone}</div>}
                {(s.email     || invoice.businessEmail)   && <div style={{ fontSize: 12, opacity: 0.8 }}>✉️ {s.email || invoice.businessEmail}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1 }}>INVOICE</div>
                <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>#{invoice.invoiceNumber}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>Date: {fmtDateDisplay(invoice.invoiceDate)}</div>
                {invoice.dueDate && <div style={{ fontSize: 12, opacity: 0.75 }}>Due: {fmtDateDisplay(invoice.dueDate)}</div>}
                <div style={{
                  marginTop: 8, display: "inline-block",
                  background: statusColor, color: "#fff",
                  borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                }}>{invoice.status}</div>
              </div>
            </div>

            {/* Buyer info */}
            <div style={{
              border: "1px solid #e5e5e5", borderRadius: 8, padding: "16px 20px",
              marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Bill To</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{invoice.buyerName || "—"}</div>
                {invoice.buyerAddress && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{invoice.buyerAddress}</div>}
                {invoice.buyerGstin   && <div style={{ fontSize: 11, color: "#888", fontFamily: "monospace", marginTop: 4 }}>GSTIN: {invoice.buyerGstin}</div>}
                {invoice.buyerPhone   && <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>📞 {invoice.buyerPhone}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Payment Info</div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{invoice.paymentMethod || "—"}</div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>GST: <b>{isIGST ? "IGST" : "CGST + SGST"}</b></div>
              </div>
            </div>

            {/* Line items */}
            {items.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f5f4f0" }}>
                    {["#", "Item", "HSN", "Qty", "Rate", "Subtotal",
                      isIGST ? "IGST" : "CGST",
                      ...(!isIGST ? ["SGST"] : []),
                      "Total"
                    ].map((h, i) => (
                      <th key={i} style={{
                        padding: "10px 12px", textAlign: i >= 3 ? "right" : "left",
                        fontWeight: 600, fontSize: 11, color: "#555", textTransform: "uppercase",
                        borderBottom: "2px solid #e5e5e5",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => {
                    const sub   = item.subtotal  ?? (item.rate * item.qty);
                    const gst   = item.gstAmount ?? 0;
                    const total = sub + gst;
                    const half  = gst / 2;
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "10px 12px", color: "#aaa" }}>{i + 1}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                          {item.name}
                          {item.gstRate != null && (
                            <span style={{ fontSize: 10, color: "#aaa", marginLeft: 6, background: "#f0f0f0", borderRadius: 4, padding: "1px 5px" }}>
                              GST {item.gstRate}%
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "#888" }}>{item.hsn || "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>{item.qty}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>{fmtINR(item.rate)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>{fmtINR(sub)}</td>
                        {isIGST
                          ? <td style={{ padding: "10px 12px", textAlign: "right", color: "#6b7280" }}>{fmtINR(gst)}</td>
                          : <>
                              <td style={{ padding: "10px 12px", textAlign: "right", color: "#6b7280" }}>{fmtINR(half)}</td>
                              <td style={{ padding: "10px 12px", textAlign: "right", color: "#6b7280" }}>{fmtINR(half)}</td>
                            </>
                        }
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{fmtINR(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: "24px", color: "#bbb", fontSize: 13, marginBottom: 20, border: "1px dashed #e5e5e5", borderRadius: 8 }}>
                No line items found
              </div>
            )}

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
              <div style={{ minWidth: 290 }}>
                {[
                  { label: "Subtotal",  value: fmtINR(subtotal) },
                  ...(isIGST
                    ? [{ label: "IGST", value: fmtINR(totalGst) }]
                    : [{ label: "CGST", value: fmtINR(totalGst / 2) }, { label: "SGST", value: fmtINR(totalGst / 2) }]
                  ),
                  { label: "Total GST", value: fmtINR(totalGst), bold: true },
                ].map(row => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "5px 0", borderBottom: "1px solid #f0f0f0",
                    fontWeight: row.bold ? 600 : 400, fontSize: 13,
                  }}>
                    <span style={{ color: "#666" }}>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "12px 16px", marginTop: 8,
                  background: "#1e3a5f", color: "#fff", borderRadius: 8,
                  fontWeight: 700, fontSize: 15,
                }}>
                  <span>Grand Total</span><span>{fmtINR(totalAmt)}</span>
                </div>
              </div>
            </div>

            {/* Payment summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Total Invoice",   value: fmtINR(totalAmt),  color: "#1e3a5f" },
                { label: "Amount Received", value: fmtINR(received),  color: "#16a34a" },
                { label: "Balance Due",     value: fmtINR(due),       color: due > 0 ? "#dc2626" : "#16a34a" },
              ].map(card => (
                <div key={card.label} style={{ background: "#f9f9f9", border: "1px solid #eee", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>{card.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {(invoice.notes || s.termsAndConditions) && (
              <div style={{ borderTop: "1px solid #eee", paddingTop: 16, fontSize: 12, color: "#777" }}>
                {invoice.notes            && <div style={{ marginBottom: 8 }}><b>Notes:</b> {invoice.notes}</div>}
                {s.termsAndConditions     && <div><b>Terms & Conditions:</b> {s.termsAndConditions}</div>}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}