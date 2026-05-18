// import { useRef } from "react";
// import { amountToWords, fmtINR } from "../utils/taxUtils";
// import { fmtDateDisplay } from "../utils/constants";
// import { s, badge } from "./styles";

// export default function InvoiceView({ invoice, onBack, onNewInvoice }) {
//   const printRef = useRef();

//   const { settings } = invoice;

//   const handlePrint = () => {
//     const content = printRef.current.innerHTML;
//     const win = window.open("", "_blank");
//     win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
// <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
// <style>
// *{margin:0;padding:0;box-sizing:border-box}
// body{font-family:'DM Sans',sans-serif;font-size:13px;color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
// .page{position:relative;padding:36px 44px;max-width:794px;margin:auto;min-height:1123px}
// .watermark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:0;pointer-events:none}
// .watermark img{max-width:320px;max-height:320px;opacity:0.055;filter:grayscale(1)}
// .body{position:relative;z-index:1}
// .serif{font-family:'DM Serif Display',serif}
// table{width:100%;border-collapse:collapse}
// .item-th{background:#1a1a1a;color:#fff;padding:8px 10px;font-size:10px;text-align:left;font-weight:500;text-transform:uppercase;letter-spacing:.5px}
// .item-td{padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:12px;vertical-align:middle}
// .item-td-r{text-align:right}
// tr.alt{background:#fafafa}
// .tax-th{font-size:10px;color:#888;text-align:left;padding:6px 8px;border-bottom:1px solid #eee;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
// .tax-td{padding:5px 8px;font-size:12px;border-bottom:1px solid #f5f5f5}
// .tax-td-r{text-align:right;font-weight:500}
// .divider{border:none;border-top:1px solid #eee;margin:16px 0}
// .divider-bold{border:none;border-top:2px solid #1a1a1a;margin:12px 0}
// .badge{padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600;display:inline-block}
// .b-blue{background:#dbeafe;color:#1d4ed8}
// .b-amber{background:#fef3c7;color:#b45309}
// .b-purple{background:#ede9fe;color:#7c3aed}
// .b-gray{background:#f3f4f6;color:#6b7280}
// .mono{font-family:monospace}
// @media print{@page{margin:0;size:A4}body{margin:0}}
// </style></head><body>${content}</body></html>`);
//     win.document.close();
//     win.focus();
//     setTimeout(() => win.print(), 600);
//   };

//   const isIGST = invoice.gstMode === "IGST";
//   const amtWords = amountToWords(invoice.totalAmount);

//   return (
//     <div style={s.container}>
//       {/* Controls */}
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//         <div style={{ display: "flex", gap: 10 }}>
//           <button style={s.btnGhost} onClick={onBack}>← Dashboard</button>
//           <button style={s.btnSecondary} onClick={onNewInvoice}>+ New Invoice</button>
//         </div>
//         <button style={{ ...s.btnPrimary, padding: "11px 28px", fontSize: 14 }} onClick={handlePrint}>
//           🖨️ Print / Download PDF
//         </button>
//       </div>

//       {/* Invoice Paper */}
//       <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ddd", overflow: "hidden" }}>
//         <div ref={printRef}>
//           <div className="page" style={{ position: "relative", padding: "36px 44px", background: "#fff" }}>

//             {/* Watermark */}
//             {settings.logo && (
//               <div className="watermark" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
//                 <img src={settings.logo} alt="" style={{ maxWidth: 320, maxHeight: 320, opacity: 0.055, filter: "grayscale(1)" }} />
//               </div>
//             )}

//             <div className="body" style={{ position: "relative", zIndex: 1 }}>

//               {/* ── Header ── */}
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
//                 <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
//                   {settings.logo && <img src={settings.logo} alt="logo" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, border: "1px solid #eee", padding: 4, background: "#fafafa" }} />}
//                   <div>
//                     <div className="serif" style={{ fontSize: 20, color: "#1a1a1a", lineHeight: 1.2 }}>{settings.businessName}</div>
//                     <div style={{ fontSize: 11, color: "#555", marginTop: 3, lineHeight: 1.7, maxWidth: 260 }}>
//                       {settings.address}{settings.pincode ? ` - ${settings.pincode}` : ""}<br />
//                       {settings.state}{settings.stateCode ? ` (${settings.stateCode})` : ""}<br />
//                       {settings.phone && `📞 ${settings.phone}`}
//                       {settings.email && ` | ✉️ ${settings.email}`}
//                     </div>
//                     {settings.gstin && <div className="mono" style={{ fontSize: 11, marginTop: 4, color: "#888" }}>GSTIN: {settings.gstin}</div>}
//                   </div>
//                 </div>
//                 <div style={{ textAlign: "right" }}>
//                   <div className="serif" style={{ fontSize: 30, color: "#1a1a1a", letterSpacing: -1 }}>INVOICE</div>
//                   <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}><b>#</b> {invoice.invoiceNumber}</div>
//                   <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Date: {fmtDateDisplay(invoice.invoiceDate)}</div>
//                   {invoice.dueDate && <div style={{ fontSize: 11, color: "#888" }}>Due: {fmtDateDisplay(invoice.dueDate)}</div>}
//                   {invoice.placeOfSupply && <div style={{ fontSize: 11, color: "#888" }}>Place of Supply: {invoice.placeOfSupply}</div>}
//                 </div>
//               </div>
//               <hr className="divider-bold" style={{ borderTop: "2px solid #1a1a1a", margin: "0 0 20px" }} />

//               {/* ── Bill To / Invoice Details ── */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
//                 <div>
//                   <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Bill To</div>
//                   <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{invoice.buyerName}</div>
//                   {invoice.buyerPhone && <div style={{ fontSize: 12, color: "#555" }}>📞 {invoice.buyerPhone}</div>}
//                   {invoice.buyerAddress && <div style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.6 }}>{invoice.buyerAddress}</div>}
//                   {invoice.buyerState && <div style={{ fontSize: 11, color: "#666" }}>{invoice.buyerState}{invoice.buyerStateCode ? ` (${invoice.buyerStateCode})` : ""}</div>}
//                   {invoice.buyerGstin && <div className="mono" style={{ fontSize: 11, color: "#888", marginTop: 3 }}>GSTIN: {invoice.buyerGstin}</div>}
//                 </div>
//                 <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "14px 16px" }}>
//                   <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Invoice Details</div>
//                   {[
//                     ["Invoice #", invoice.invoiceNumber],
//                     ["Payment", invoice.paymentMethod],
//                     ["GST Type", isIGST ? "IGST (Interstate)" : "CGST + SGST (Intrastate)"],
//                   ].map(([k, v]) => (
//                     <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, padding: "2px 0" }}>
//                       <span style={{ color: "#888", minWidth: 80 }}>{k}:</span>
//                       <span style={{ fontWeight: 500 }}>{v}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* ── Items Table ── */}
//               <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
//                 <thead>
//                   <tr>
//                     <th className="item-th" style={{ width: 28 }}>#</th>
//                     <th className="item-th">Product</th>
//                     <th className="item-th">HSN</th>
//                     <th className="item-th" style={{ textAlign: "right" }}>Qty</th>
//                     <th className="item-th" style={{ textAlign: "right" }}>Rate</th>
//                     <th className="item-th" style={{ textAlign: "right" }}>GST%</th>
//                     <th className="item-th" style={{ textAlign: "right" }}>GST Amt</th>
//                     <th className="item-th" style={{ textAlign: "right" }}>Taxable</th>
//                     <th className="item-th" style={{ textAlign: "right" }}>Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {invoice.taxedItems.map((it, i) => (
//                     <tr key={i} className={i % 2 === 0 ? "alt" : ""} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
//                       <td className="item-td" style={{ color: "#aaa", textAlign: "center", fontSize: 11 }}>{i + 1}</td>
//                       <td className="item-td" style={{ fontWeight: 500 }}>
//                         {it.name}
//                         {it.company && <div style={{ fontSize: 10, color: "#999" }}>{it.company}</div>}
//                       </td>
//                       <td className="item-td mono" style={{ fontSize: 11, color: "#777" }}>{it.hsnCode || "—"}</td>
//                       <td className="item-td item-td-r">{it.qty}</td>
//                       <td className="item-td item-td-r">{fmtINR(it.rate)}</td>
//                       <td className="item-td item-td-r">
//                         <span className="badge b-gray">{it.gstPct}%</span>
//                       </td>
//                       <td className="item-td item-td-r" style={{ fontSize: 11, color: "#666" }}>
//                         {isIGST
//                           ? <>{fmtINR(it.tax.igst)}</>
//                           : <span style={{ lineHeight: 1.7 }}>{fmtINR(it.tax.cgst)}<br />{fmtINR(it.tax.sgst)}</span>
//                         }
//                       </td>
//                       <td className="item-td item-td-r">{fmtINR(it.tax.subtotal)}</td>
//                       <td className="item-td item-td-r" style={{ fontWeight: 600 }}>{fmtINR(it.tax.total)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {/* ── Totals + Tax Summary side by side ── */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, alignItems: "start" }}>
//                 {/* Tax Summary */}
//                 <div>
//                   <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>GST Summary</div>
//                   <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                     <thead><tr>
//                       <th className="tax-th">Tax</th>
//                       <th className="tax-th" style={{ textAlign: "right" }}>Taxable</th>
//                       <th className="tax-th" style={{ textAlign: "right" }}>Amount</th>
//                     </tr></thead>
//                     <tbody>
//                       {invoice.taxSummary.map(row => (
//                         isIGST ? (
//                           <tr key={row.gstPct}>
//                             <td className="tax-td"><span className="badge b-purple">IGST @{row.gstPct}%</span></td>
//                             <td className="tax-td tax-td-r">{fmtINR(row.taxableAmt)}</td>
//                             <td className="tax-td tax-td-r">{fmtINR(row.igst)}</td>
//                           </tr>
//                         ) : (
//                           <>
//                             <tr key={`c-${row.gstPct}`}>
//                               <td className="tax-td"><span className="badge b-blue">CGST @{row.gstPct / 2}%</span></td>
//                               <td className="tax-td tax-td-r">{fmtINR(row.taxableAmt)}</td>
//                               <td className="tax-td tax-td-r">{fmtINR(row.cgst)}</td>
//                             </tr>
//                             <tr key={`s-${row.gstPct}`}>
//                               <td className="tax-td"><span className="badge b-amber">SGST @{row.gstPct / 2}%</span></td>
//                               <td className="tax-td tax-td-r">{fmtINR(row.taxableAmt)}</td>
//                               <td className="tax-td tax-td-r">{fmtINR(row.sgst)}</td>
//                             </tr>
//                           </>
//                         )
//                       ))}
//                       <tr style={{ background: "#f8f7f4" }}>
//                         <td className="tax-td" style={{ fontWeight: 600 }}>Total Tax</td>
//                         <td className="tax-td tax-td-r">{fmtINR(invoice.subtotal)}</td>
//                         <td className="tax-td tax-td-r" style={{ fontWeight: 700 }}>{fmtINR(invoice.totalGst)}</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Amount Summary */}
//                 <div>
//                   <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Amount Summary</div>
//                   {[
//                     ["Subtotal (taxable)", fmtINR(invoice.subtotal), false],
//                     ["Total GST", fmtINR(invoice.totalGst), false],
//                     ...(parseFloat(invoice.additionalCharges) > 0 ? [[invoice.additionalChargesLabel, fmtINR(invoice.additionalCharges), false]] : []),
//                     ...(parseFloat(invoice.discount) > 0 ? [["Discount", `− ${fmtINR(invoice.discount)}`, false]] : []),
//                   ].map(([l, v]) => (
//                     <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f5f5f5", color: "#555" }}>
//                       <span>{l}</span><span>{v}</span>
//                     </div>
//                   ))}
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, padding: "10px 0 6px", borderTop: "2px solid #1a1a1a", marginTop: 4 }}>
//                     <span>Total Amount</span><span>{fmtINR(invoice.totalAmount)}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#16a34a", padding: "3px 0" }}>
//                     <span>Received</span><span>{fmtINR(invoice.received)}</span>
//                   </div>
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: invoice.due > 0 ? "#dc2626" : "#16a34a", padding: "3px 0" }}>
//                     <span>Due</span><span>{fmtINR(invoice.due)}</span>
//                   </div>
//                   <div style={{ fontSize: 12, color: "#888", padding: "3px 0" }}>
//                     Mode: {invoice.paymentMethod}
//                   </div>
//                 </div>
//               </div>

//               <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0 0 20px" }} />

//               {/* ── Pay To ── */}
//               {(settings.bankName || settings.upiId) && (
//                 <div style={{ marginBottom: 20 }}>
//                   <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Pay To</div>
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
//                     {settings.bankName && (
//                       <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "12px 14px" }}>
//                         <div style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 6 }}>Bank Transfer</div>
//                         <div style={{ fontSize: 12, lineHeight: 1.8 }}>
//                           <b>{settings.accountHolder || settings.businessName}</b><br />
//                           {settings.bankName}{settings.branchName ? ` — ${settings.branchName}` : ""}<br />
//                           A/C: <span style={{ fontFamily: "monospace" }}>{settings.accountNumber}</span><br />
//                           IFSC: <span style={{ fontFamily: "monospace" }}>{settings.ifscCode}</span>
//                         </div>
//                       </div>
//                     )}
//                     {settings.upiId && (
//                       <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "12px 14px" }}>
//                         <div style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 6 }}>UPI Payment</div>
//                         <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{settings.upiId}</div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* ── Amount in Words ── */}
//               <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", marginBottom: 20, border: "1px solid #bbf7d0" }}>
//                 <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Amount in Words: </span>
//                 <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>{amtWords}</span>
//               </div>

//               {/* ── Signature + Notes ── */}
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
//                 <div style={{ maxWidth: 280 }}>
//                   {invoice.notes && (
//                     <>
//                       <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Notes</div>
//                       <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{invoice.notes}</div>
//                     </>
//                   )}
//                 </div>
//                 <div style={{ textAlign: "center" }}>
//                   <div style={{ width: 160, height: 52, borderBottom: "1.5px solid #1a1a1a", marginBottom: 6 }}></div>
//                   <div style={{ fontSize: 11, color: "#888" }}>Authorised Signatory</div>
//                   <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{settings.ownerName || settings.businessName}</div>
//                 </div>
//               </div>

//               {/* ── Thank you ── */}
//               <div style={{ textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#1a1a1a", letterSpacing: .5, marginBottom: 20, paddingTop: 10, borderTop: "1px dashed #ddd" }}>
//                 Thank you for choosing us! 🙏
//               </div>

//               {/* ── T&C Footer ── */}
//               {settings.terms && (
//                 <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
//                   <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Terms & Conditions</div>
//                   <div style={{ fontSize: 11, color: "#888", whiteSpace: "pre-line", lineHeight: 1.8 }}>{settings.terms}</div>
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useRef } from "react";
import { amountToWords, fmtINR } from "../utils/taxUtils";
import { fmtDateDisplay } from "../utils/constants";
import { s, badge } from "./styles";

export default function InvoiceView({ invoice, onBack, onNewInvoice }) {
  const printRef = useRef();

  const { settings } = invoice;

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;font-size:13px;color:#1a1a1a;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;padding:36px 44px;max-width:794px;margin:auto;min-height:1123px}
.watermark{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:0;pointer-events:none}
.watermark img{max-width:320px;max-height:320px;opacity:0.055;filter:grayscale(1)}
.body{position:relative;z-index:1}
.serif{font-family:'DM Serif Display',serif}
table{width:100%;border-collapse:collapse}
.item-th{background:#1e3a5f;color:#fff;padding:9px 8px;font-size:10px;text-align:center;font-weight:600;text-transform:uppercase;letter-spacing:.6px}
.item-td{padding:8px 8px;border-bottom:1px solid #eef2f7;font-size:12px;vertical-align:middle;text-align:center}
.row-even{background:#eef2f8}
.row-odd{background:#fff}
.tax-th{font-size:10px;color:#fff;background:#2d6a4f;text-align:center;padding:7px 10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.tax-td{padding:6px 10px;font-size:12px;border-bottom:1px solid #f0f0f0;text-align:center}
.tax-row-even{background:#edf7f2}
.tax-row-odd{background:#fff}
.tax-total{background:#d6eee3;font-weight:700}
.divider{border:none;border-top:1px solid #eee;margin:16px 0}
.divider-bold{border:none;border-top:2px solid #1a1a1a;margin:12px 0}
.badge{padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600;display:inline-block}
.b-blue{background:#dbeafe;color:#1d4ed8}
.b-amber{background:#fef3c7;color:#b45309}
.b-purple{background:#ede9fe;color:#7c3aed}
.b-gray{background:#f3f4f6;color:#6b7280}
.mono{font-family:monospace}
@media print{@page{margin:0;size:A4}body{margin:0}}
</style></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const isIGST = invoice.gstMode === "IGST";
  const amtWords = amountToWords(invoice.totalAmount);

  return (
    <div style={s.container}>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={s.btnGhost} onClick={onBack}>← Dashboard</button>
          <button style={s.btnSecondary} onClick={onNewInvoice}>+ New Invoice</button>
        </div>
        <button style={{ ...s.btnPrimary, padding: "11px 28px", fontSize: 14 }} onClick={handlePrint}>
          🖨️ Print / Download PDF
        </button>
      </div>

      {/* Invoice Paper */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ddd", overflow: "hidden" }}>
        <div ref={printRef}>
          <div className="page" style={{ position: "relative", padding: "36px 44px", background: "#fff" }}>

            {/* Watermark */}
            {settings.logo && (
              <div className="watermark" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
                <img src={settings.logo} alt="" style={{ maxWidth: 320, maxHeight: 320, opacity: 0.055, filter: "grayscale(1)" }} />
              </div>
            )}

            <div className="body" style={{ position: "relative", zIndex: 1 }}>

              {/* ── Header ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {settings.logo && <img src={settings.logo} alt="logo" style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, border: "1px solid #eee", padding: 4, background: "#fafafa" }} />}
                  <div>
                    <div className="serif" style={{ fontSize: 20, color: "#1a1a1a", lineHeight: 1.2 }}>{settings.businessName}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3, lineHeight: 1.7, maxWidth: 260 }}>
                      {settings.address}{settings.pincode ? ` - ${settings.pincode}` : ""}<br />
                      {settings.state}{settings.stateCode ? ` (${settings.stateCode})` : ""}<br />
                      {settings.phone && `📞 ${settings.phone}`}
                      {settings.email && ` | ✉️ ${settings.email}`}
                    </div>
                    {settings.gstin && <div className="mono" style={{ fontSize: 11, marginTop: 4, color: "#888" }}>GSTIN: {settings.gstin}</div>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="serif" style={{ fontSize: 30, color: "#1a1a1a", letterSpacing: -1 }}>INVOICE</div>
                  <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}><b>#</b> {invoice.invoiceNumber}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Date: {fmtDateDisplay(invoice.invoiceDate)}</div>
                  {invoice.dueDate && <div style={{ fontSize: 11, color: "#888" }}>Due: {fmtDateDisplay(invoice.dueDate)}</div>}
                  {invoice.placeOfSupply && <div style={{ fontSize: 11, color: "#888" }}>Place of Supply: {invoice.placeOfSupply}</div>}
                </div>
              </div>
              <hr className="divider-bold" style={{ borderTop: "2px solid #1a1a1a", margin: "0 0 20px" }} />

              {/* ── Bill To / Invoice Details ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Bill To</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{invoice.buyerName}</div>
                  {invoice.buyerPhone && <div style={{ fontSize: 12, color: "#555" }}>📞 {invoice.buyerPhone}</div>}
                  {invoice.buyerAddress && <div style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.6 }}>{invoice.buyerAddress}</div>}
                  {invoice.buyerState && <div style={{ fontSize: 11, color: "#666" }}>{invoice.buyerState}{invoice.buyerStateCode ? ` (${invoice.buyerStateCode})` : ""}</div>}
                  {invoice.buyerGstin && <div className="mono" style={{ fontSize: 11, color: "#888", marginTop: 3 }}>GSTIN: {invoice.buyerGstin}</div>}
                </div>
                <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Invoice Details</div>
                  {[
                    ["Invoice #", invoice.invoiceNumber],
                    ["Payment", invoice.paymentMethod],
                    ["GST Type", isIGST ? "IGST (Interstate)" : "CGST + SGST (Intrastate)"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, padding: "2px 0" }}>
                      <span style={{ color: "#888", minWidth: 80 }}>{k}:</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Items Table ── */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "7%" }} />
                  <col style={{ width: "17%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr>
                    {[
                      ["#",          "center"],
                      ["Product",    "left"  ],
                      ["HSN",        "center"],
                      ["Qty",        "center"],
                      ["Rate (₹)",   "center"],
                      ["GST %",      "center"],
                      [isIGST ? "IGST (₹)" : "CGST / SGST (₹)", "center"],
                      ["Taxable (₹)","center"],
                      ["Total (₹)",  "center"],
                    ].map(([label, align]) => (
                      <th key={label} className="item-th" style={{ textAlign: align, padding: "9px 8px", background: "#353535", color: "#fff" }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.taxedItems.map((it, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#eef2f8" : "#fff" }}>
                      <td className="item-td" style={{ textAlign: "center", color: "#aaa", fontSize: 11 }}>{i + 1}</td>
                      <td className="item-td" style={{ fontWeight: 500, wordBreak: "break-word", textAlign: "left" }}>
                        {it.name}
                        {it.company && <div style={{ fontSize: 10, color: "#999" }}>{it.company}</div>}
                      </td>
                      <td className="item-td mono" style={{ textAlign: "center", fontSize: 11, color: "#777" }}>{it.hsnCode || "—"}</td>
                      <td className="item-td" style={{ textAlign: "center" }}>{it.qty}</td>
                      <td className="item-td" style={{ textAlign: "center" }}>{fmtINR(it.rate)}</td>
                      <td className="item-td" style={{ textAlign: "center" }}>
                        <span className="badge b-gray">{it.gstPct}%</span>
                      </td>
                      <td className="item-td" style={{ textAlign: "center", fontSize: 11, color: "#555" }}>
                        {isIGST
                          ? fmtINR(it.tax.igst)
                          : <>{fmtINR(it.tax.cgst)}<span style={{ color: "#ccc", margin: "0 3px" }}>/</span>{fmtINR(it.tax.sgst)}</>
                        }
                      </td>
                      <td className="item-td" style={{ textAlign: "center" }}>{fmtINR(it.tax.subtotal)}</td>
                      <td className="item-td" style={{ textAlign: "center", fontWeight: 600 }}>{fmtINR(it.tax.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ── Totals + Tax Summary side by side ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, alignItems: "start" }}>
                {/* Tax Summary */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>GST Summary</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "40%" }} />
                      <col style={{ width: "30%" }} />
                      <col style={{ width: "30%" }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {[["Tax Type", "left"], ["Taxable Amt (₹)", "center"], ["Tax Amt (₹)", "center"]].map(([label, align]) => (
                          <th key={label} className="tax-th" style={{ textAlign: align, padding: "8px 10px", background: "#353535", color: "#fff" }}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.taxSummary.map((row, rowIdx) => (
                        isIGST ? (
                          <tr key={row.gstPct} style={{ background: rowIdx % 2 === 0 ? "#edf7f2" : "#fff" }}>
                            <td className="tax-td" style={{ textAlign: "left" }}><span className="badge b-purple">IGST @{row.gstPct}%</span></td>
                            <td className="tax-td" style={{ textAlign: "center" }}>{fmtINR(row.taxableAmt)}</td>
                            <td className="tax-td" style={{ textAlign: "center", fontWeight: 500 }}>{fmtINR(row.igst)}</td>
                          </tr>
                        ) : (
                          <>
                            <tr key={`c-${row.gstPct}`} style={{ background: rowIdx % 2 === 0 ? "#edf7f2" : "#fff" }}>
                              <td className="tax-td" style={{ textAlign: "left" }}><span className="badge b-blue">CGST @{row.gstPct / 2}%</span></td>
                              <td className="tax-td" style={{ textAlign: "center" }}>{fmtINR(row.taxableAmt)}</td>
                              <td className="tax-td" style={{ textAlign: "center", fontWeight: 500 }}>{fmtINR(row.cgst)}</td>
                            </tr>
                            <tr key={`s-${row.gstPct}`} style={{ background: rowIdx % 2 === 0 ? "#fff" : "#edf7f2" }}>
                              <td className="tax-td" style={{ textAlign: "left" }}><span className="badge b-amber">SGST @{row.gstPct / 2}%</span></td>
                              <td className="tax-td" style={{ textAlign: "center" }}>{fmtINR(row.taxableAmt)}</td>
                              <td className="tax-td" style={{ textAlign: "center", fontWeight: 500 }}>{fmtINR(row.sgst)}</td>
                            </tr>
                          </>
                        )
                      ))}
                      <tr style={{ background: "#d6eee3" }}>
                        <td className="tax-td" style={{ fontWeight: 700, textAlign: "left" }}>Total Tax</td>
                        <td className="tax-td" style={{ textAlign: "center", fontWeight: 600 }}>{fmtINR(invoice.subtotal)}</td>
                        <td className="tax-td" style={{ textAlign: "center", fontWeight: 700 }}>{fmtINR(invoice.totalGst)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Amount Summary */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Amount Summary</div>
                  {[
                    ["Subtotal (taxable)", fmtINR(invoice.subtotal), false],
                    ["Total GST", fmtINR(invoice.totalGst), false],
                    ...(parseFloat(invoice.additionalCharges) > 0 ? [[invoice.additionalChargesLabel, fmtINR(invoice.additionalCharges), false]] : []),
                    ...(parseFloat(invoice.discount) > 0 ? [["Discount", `− ${fmtINR(invoice.discount)}`, false]] : []),
                  ].map(([l, v]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: "1px solid #f5f5f5", color: "#555" }}>
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, padding: "10px 0 6px", borderTop: "2px solid #1a1a1a", marginTop: 4 }}>
                    <span>Total Amount</span><span>{fmtINR(invoice.totalAmount)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#16a34a", padding: "3px 0" }}>
                    <span>Received</span><span>{fmtINR(invoice.received)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: invoice.due > 0 ? "#dc2626" : "#16a34a", padding: "3px 0" }}>
                    <span>Due</span><span>{fmtINR(invoice.due)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#888", padding: "3px 0" }}>
                    Mode: {invoice.paymentMethod}
                  </div>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0 0 20px" }} />

              {/* ── Pay To ── */}
              {(settings.bankName || settings.upiId) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 8 }}>Pay To</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {settings.bankName && (
                      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 6 }}>Bank Transfer</div>
                        <div style={{ fontSize: 12, lineHeight: 1.8 }}>
                          <b>{settings.accountHolder || settings.businessName}</b><br />
                          {settings.bankName}{settings.branchName ? ` — ${settings.branchName}` : ""}<br />
                          A/C: <span style={{ fontFamily: "monospace" }}>{settings.accountNumber}</span><br />
                          IFSC: <span style={{ fontFamily: "monospace" }}>{settings.ifscCode}</span>
                        </div>
                      </div>
                    )}
                    {settings.upiId && (
                      <div style={{ background: "#f8f7f4", borderRadius: 8, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 6 }}>UPI Payment</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{settings.upiId}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Amount in Words ── */}
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", marginBottom: 20, border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Amount in Words: </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>{amtWords}</span>
              </div>

              {/* ── Signature + Notes ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
                <div style={{ maxWidth: 280 }}>
                  {invoice.notes && (
                    <>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Notes</div>
                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>{invoice.notes}</div>
                    </>
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 160, height: 52, borderBottom: "1.5px solid #1a1a1a", marginBottom: 6 }}></div>
                  <div style={{ fontSize: 11, color: "#888" }}>Authorised Signatory</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a" }}>{settings.ownerName || settings.businessName}</div>
                </div>
              </div>

              {/* ── Thank you ── */}
              <div style={{ textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#1a1a1a", letterSpacing: .5, marginBottom: 20, paddingTop: 10, borderTop: "1px dashed #ddd" }}>
                Thank you for choosing us! 🙏
              </div>

              {/* ── T&C Footer ── */}
              {settings.terms && (
                <div style={{ borderTop: "1px solid #eee", paddingTop: 14 }}>
                  <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Terms & Conditions</div>
                  <div style={{ fontSize: 11, color: "#888", whiteSpace: "pre-line", lineHeight: 1.8 }}>{settings.terms}</div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}