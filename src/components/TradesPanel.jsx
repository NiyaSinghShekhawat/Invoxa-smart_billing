import InvoiceDetailModal from "./InvoiceDetailModal";
import { useState, useMemo } from "react";
import { fmtINR } from "../utils/taxUtils";
import { fmtDateDisplay } from "../utils/constants";
import { s, badge } from "./styles";

const PERIODS = ["All Time", "This Month", "Last Month", "This Quarter", "This Year"];

function filterByPeriod(invoices, period) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return invoices.filter(inv => {
    if (!inv.invoiceDate) return true;
    const d = new Date(inv.invoiceDate);
    if (period === "This Month")    return d.getFullYear() === y && d.getMonth() === m;
    if (period === "Last Month")    return d.getFullYear() === y && d.getMonth() === m - 1;
    if (period === "This Quarter")  return d.getFullYear() === y && Math.floor(d.getMonth() / 3) === Math.floor(m / 3);
    if (period === "This Year")     return d.getFullYear() === y;
    return true;
  });
}

function statusColor(status) {
  if (status === "paid")    return "green";
  if (status === "partial") return "amber";
  return "red";
}

// ── Tiny bar chart (pure CSS) ─────────────────────────────────────────────────
function BarChart({ data, color = "#1e3a5f" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 9, color: "#aaa", fontWeight: 500 }}>{d.value > 0 ? `₹${(d.value/1000).toFixed(0)}k` : ""}</div>
          <div style={{ width: "100%", background: color, borderRadius: "3px 3px 0 0", opacity: 0.85,
            height: `${Math.max((d.value / max) * 60, d.value > 0 ? 4 : 0)}px`, transition: "height .3s" }} />
          <div style={{ fontSize: 9, color: "#999", whiteSpace: "nowrap" }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart (SVG) ─────────────────────────────────────────────────────────
function DonutChart({ segments, size = 90 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#eee" }} />;
  let offset = 0;
  const r = 35, cx = 45, cy = 45, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 90 90">
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const rotate = offset * 360 - 90;
        offset += pct;
        return (
          <circle key={i} r={r} cx={cx} cy={cy} fill="none"
            stroke={seg.color} strokeWidth={14}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={0}
            transform={`rotate(${rotate} ${cx} ${cy})`} />
        );
      })}
      <circle r={24} cx={cx} cy={cy} fill="#fff" />
    </svg>
  );
}

export default function TradesPanel({ settings, invoices, onReopen, onDelete, onGetInvoice, onPaymentUpdate }) {
  const [period, setPeriod]   = useState("This Month");
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("date_desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    let list = filterByPeriod(invoices, period);
    if (statusFilter !== "all") list = list.filter(inv => inv.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(inv =>
        inv.buyerName?.toLowerCase().includes(q) ||
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.paymentMethod?.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "date_desc")   return new Date(b.invoiceDate) - new Date(a.invoiceDate);
      if (sortBy === "date_asc")    return new Date(a.invoiceDate) - new Date(b.invoiceDate);
      if (sortBy === "amount_desc") return b.totalAmount - a.totalAmount;
      if (sortBy === "amount_asc")  return a.totalAmount - b.totalAmount;
      return 0;
    });
  }, [invoices, period, search, sortBy, statusFilter]);

  // ── Analytics ──────────────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const periodInvs = filterByPeriod(invoices, period);
    const totalRevenue  = periodInvs.reduce((s, i) => s + (i.totalAmount || 0), 0);
    const totalReceived = periodInvs.reduce((s, i) => s + (i.received || 0), 0);
    const totalDue      = periodInvs.reduce((s, i) => s + (i.due || 0), 0);
    const totalGst      = periodInvs.reduce((s, i) => s + (i.totalGst || 0), 0);
    const paid          = periodInvs.filter(i => i.status === "paid").length;
    const partial       = periodInvs.filter(i => i.status === "partial").length;
    const unpaid        = periodInvs.filter(i => i.status === "unpaid").length;
    const avgInvoice    = periodInvs.length ? totalRevenue / periodInvs.length : 0;

    // Monthly revenue for last 6 months
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = d.toLocaleString("en-IN", { month: "short" });
      const value = invoices
        .filter(inv => {
          const id = new Date(inv.invoiceDate);
          return id.getFullYear() === d.getFullYear() && id.getMonth() === d.getMonth();
        })
        .reduce((s, inv) => s + (inv.totalAmount || 0), 0);
      return { label, value };
    });

    // Payment method breakdown
    const methodMap = {};
    periodInvs.forEach(inv => {
      const m = inv.paymentMethod || "Other";
      methodMap[m] = (methodMap[m] || 0) + (inv.totalAmount || 0);
    });
    const methodColors = ["#1e3a5f","#2d6a4f","#7c3aed","#b45309","#dc2626","#0891b2"];
    const methodBreakdown = Object.entries(methodMap).map(([name, value], i) => ({
      name, value, color: methodColors[i % methodColors.length],
    }));

    // Top buyers
    const buyerMap = {};
    periodInvs.forEach(inv => {
      const b = inv.buyerName || "Unknown";
      if (!buyerMap[b]) buyerMap[b] = { name: b, total: 0, count: 0 };
      buyerMap[b].total += inv.totalAmount || 0;
      buyerMap[b].count += 1;
    });
    const topBuyers = Object.values(buyerMap).sort((a, b) => b.total - a.total).slice(0, 5);

    return { totalRevenue, totalReceived, totalDue, totalGst, paid, partial, unpaid,
             avgInvoice, count: periodInvs.length, monthlyData, methodBreakdown, topBuyers };
  }, [invoices, period]);

  const handleDelete = async (id) => {
    await onDelete(id);
    setConfirmDelete(null);
  };

  return (
    <div style={s.container}>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={s.pageTitle}>Trades & Analytics</h2>
        {/* Period selector */}
        <div style={{ display: "flex", gap: 4, background: "#f0efeb", borderRadius: 10, padding: 4 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500,
                background: period === p ? "#fff" : "transparent",
                color: period === p ? "#1a1a1a" : "#888",
                boxShadow: period === p ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { icon: "🧾", label: "Total Invoices",  value: analytics.count,                       color: "#dbeafe", sub: `Avg ${fmtINR(analytics.avgInvoice)}` },
          { icon: "💰", label: "Total Revenue",   value: fmtINR(analytics.totalRevenue),         color: "#dcfce7", sub: `GST: ${fmtINR(analytics.totalGst)}` },
          { icon: "✅", label: "Received",        value: fmtINR(analytics.totalReceived),        color: "#d1fae5", sub: `${analytics.paid} paid invoices` },
          { icon: "⏳", label: "Outstanding Due", value: fmtINR(analytics.totalDue),             color: "#fee2e2", sub: `${analytics.unpaid} unpaid · ${analytics.partial} partial` },
        ].map(card => (
          <div key={card.label} style={{ ...s.card, marginBottom: 0, borderTop: `3px solid ${card.color}`, padding: "18px 20px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>{card.value}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{card.label}</div>
            <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Revenue Bar Chart */}
        <div style={{ ...s.card, marginBottom: 0 }}>
          <div style={{ ...s.cardTitle, marginBottom: 16 }}>Revenue — Last 6 Months</div>
          <BarChart data={analytics.monthlyData} color="#1e3a5f" />
        </div>

        {/* Payment Method Donut */}
        <div style={{ ...s.card, marginBottom: 0 }}>
          <div style={{ ...s.cardTitle, marginBottom: 12 }}>By Payment Mode</div>
          {analytics.methodBreakdown.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <DonutChart segments={analytics.methodBreakdown} size={90} />
              <div style={{ flex: 1 }}>
                {analytics.methodBreakdown.map(seg => (
                  <div key={seg.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#555", flex: 1 }}>{seg.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1a1a1a" }}>{fmtINR(seg.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No data</div>}
        </div>

        {/* Invoice Status Donut */}
        <div style={{ ...s.card, marginBottom: 0 }}>
          <div style={{ ...s.cardTitle, marginBottom: 12 }}>Invoice Status</div>
          {analytics.count > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <DonutChart segments={[
                { value: analytics.paid,    color: "#16a34a" },
                { value: analytics.partial, color: "#b45309" },
                { value: analytics.unpaid,  color: "#dc2626" },
              ]} size={90} />
              <div>
                {[
                  { label: "Paid",    value: analytics.paid,    color: "#16a34a" },
                  { label: "Partial", value: analytics.partial, color: "#b45309" },
                  { label: "Unpaid",  value: analytics.unpaid,  color: "#dc2626" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color }} />
                    <span style={{ fontSize: 11, color: "#555", minWidth: 44 }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ fontSize: 13, color: "#bbb", textAlign: "center", padding: "20px 0" }}>No data</div>}
        </div>
      </div>

      {/* ── Top Buyers ── */}
      {analytics.topBuyers.length > 0 && (
        <div style={{ ...s.card, marginBottom: 24 }}>
          <div style={s.cardTitle}>Top Buyers — {period}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {analytics.topBuyers.map((buyer, i) => {
              const pct = analytics.totalRevenue > 0 ? (buyer.total / analytics.totalRevenue) * 100 : 0;
              return (
                <div key={buyer.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1e3a5f", color: "#fff",
                    fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{buyer.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtINR(buyer.total)}
                        <span style={{ fontSize: 11, color: "#aaa", marginLeft: 6 }}>{buyer.count} inv</span>
                      </span>
                    </div>
                    <div style={{ height: 5, background: "#f0efeb", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#1e3a5f", borderRadius: 4, opacity: 0.7 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Invoice List ── */}
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={s.cardTitle}>All Invoices</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Search */}
            <input style={{ ...s.input, width: 200, fontSize: 13, padding: "8px 12px" }}
              placeholder="🔍 Search buyer / invoice #"
              value={search} onChange={e => setSearch(e.target.value)} />
            {/* Status filter */}
            <select style={{ ...s.input, width: "auto", fontSize: 13, padding: "8px 12px" }}
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {[["all","All Status"],["paid","Paid"],["partial","Partial"],["unpaid","Unpaid"]].map(([v,l]) =>
                <option key={v} value={v}>{l}</option>
              )}
            </select>
            {/* Sort */}
            <select style={{ ...s.input, width: "auto", fontSize: 13, padding: "8px 12px" }}
              value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {[["date_desc","Newest First"],["date_asc","Oldest First"],["amount_desc","Highest Amount"],["amount_asc","Lowest Amount"]].map(([v,l]) =>
                <option key={v} value={v}>{l}</option>
              )}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Invoice #","Buyer","Date","Due Date","Payment","GST Type","Amount","Received","Due","Status",""].map(h => (
                  <th key={h} style={{ ...s.th, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <tr key={inv.id} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#1e3a5f" }}>{inv.invoiceNumber}</td>
                  <td style={{ ...s.td, fontWeight: 500 }}>
                    {inv.buyerName}
                    {inv.buyerGstin && <div style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace" }}>{inv.buyerGstin}</div>}
                  </td>
                  <td style={{ ...s.td, whiteSpace: "nowrap" }}>{fmtDateDisplay(inv.invoiceDate)}</td>
                  <td style={{ ...s.td, whiteSpace: "nowrap", color: inv.due > 0 && inv.dueDate && new Date(inv.dueDate) < new Date() ? "#dc2626" : "#555" }}>
                    {inv.dueDate ? fmtDateDisplay(inv.dueDate) : "—"}
                  </td>
                  <td style={s.td}>{inv.paymentMethod}</td>
                  <td style={s.td}>
                    <span style={badge(inv.gstMode === "IGST" ? "purple" : "blue")}>
                      {inv.gstMode === "IGST" ? "IGST" : "C+S GST"}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{fmtINR(inv.totalAmount)}</td>
                  <td style={{ ...s.td, color: "#16a34a", fontWeight: 500 }}>{fmtINR(inv.received)}</td>
                  <td style={{ ...s.td, color: inv.due > 0 ? "#dc2626" : "#16a34a", fontWeight: 500 }}>{fmtINR(inv.due)}</td>
                  <td style={s.td}>
                    <span style={badge(statusColor(inv.status))}>
                      {inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {/* <button onClick={() => onReopen(inv.id)}
                        style={{ padding: "5px 10px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                        View
                      </button> */}
                      <button onClick={async () => {
                            try {
                            const full = await onGetInvoice(inv.id);
                            setDetailInvoice({ ...full, settings });
                            } catch (e) {
                            alert("Error loading invoice: " + e.message);
                            }
                        }}
                        style={{ padding: "5px 10px", background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                        View
                        </button>
                      <button onClick={() => setConfirmDelete(inv.id)}
                        style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 500 }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>
                  {invoices.length === 0 ? "No invoices yet. Generate your first bill!" : "No invoices match your filters"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888" }}>
            <span>Showing {filtered.length} of {invoices.length} invoices</span>
            <span>Total: <b style={{ color: "#1a1a1a" }}>{fmtINR(filtered.reduce((s, i) => s + i.totalAmount, 0))}</b></span>
          </div>
        )}
      </div>

      {detailInvoice && (
        <InvoiceDetailModal
            invoice={detailInvoice}
            onClose={() => setDetailInvoice(null)}
            onPaymentUpdate={async (id, data) => {
            await onPaymentUpdate(id, data);
            const updated = await onGetInvoice(id);
            setDetailInvoice({ ...updated, settings });
            }}
        />
        )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", maxWidth: 360, width: "90%", boxShadow: "0 8px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Invoice?</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>This will permanently delete the invoice and all its line items. This cannot be undone.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={s.btnSecondary}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)}
                style={{ ...s.btnPrimary, background: "#dc2626" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}