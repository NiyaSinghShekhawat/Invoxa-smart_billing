import { useState } from "react";
import { useAuth }     from "./hooks/useAuth";
import { useSettings } from "./hooks/useSettings";
import { useStock }    from "./hooks/useStock";
import { useInvoices } from "./hooks/useInvoices";

import AuthScreen    from "./components/AuthScreen";
import Dashboard     from "./components/Dashboard";
import SettingsPanel from "./components/SettingsPanel";
import StockPanel    from "./components/StockPanel";
import InvoiceForm   from "./components/InvoiceForm";
import InvoiceView   from "./components/InvoiceView";
import TradesPanel   from "./components/TradesPanel";

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();

  const { settings, loading: settingsLoading, saveSettings } = useSettings(user?.id);
  const { stock, loading: stockLoading, addItem, deleteItem }  = useStock(user?.id);
  const { invoices, saveInvoice, getInvoiceWithItems, deleteInvoice } = useInvoices(user?.id);

  const [tab, setTab]               = useState("dashboard");
  const [view, setView]             = useState("list");   // "list" | "form" | "invoice"
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [savingInvoice, setSavingInvoice] = useState(false);

  // ── Loading / Auth gates ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#888" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSignInGoogle={signInWithGoogle}
        onSignInEmail={signInWithEmail}
        onSignUpEmail={signUpWithEmail}
      />
    );
  }

  const dataLoading = settingsLoading || stockLoading;

  // ── Invoice generation ──────────────────────────────────────────────────────
  const handleGenerateInvoice = async (invoiceData) => {
    setSavingInvoice(true);
    try {
      const saved = await saveInvoice(invoiceData);
      // Attach settings for print view
      setActiveInvoice({ ...invoiceData, id: saved.id, settings });
      setView("invoice");
    } catch (e) {
      alert("Error saving invoice: " + e.message);
    } finally {
      setSavingInvoice(false);
    }
  };

  // Re-open a saved invoice for printing
  const reopenInvoice = async (invoiceId) => {
    try {
      const full = await getInvoiceWithItems(invoiceId);
      setActiveInvoice({ ...full, settings });
      setTab("dashboard");
      setView("invoice");
    } catch (e) {
      alert("Error loading invoice: " + e.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── Topbar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a1a", marginRight: 32, padding: "16px 0", cursor: "pointer" }}
            onClick={() => { setTab("dashboard"); setView("list"); }}>
            📄 INVOXA
          </div>
          {[["dashboard","Dashboard"], ["trades","Trades"], ["stock","Stock"], ["settings","Settings"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setView("list"); }}
              style={{ padding: "18px 18px", borderBottom: tab === key && view !== "form" && view !== "invoice" ? "2px solid #1a1a1a" : "2px solid transparent",
                color: tab === key ? "#1a1a1a" : "#888", fontWeight: tab === key ? 500 : 400,
                cursor: "pointer", fontSize: 14, background: "none", border: "none",
                borderBottom: tab === key && view === "list" ? "2px solid #1a1a1a" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#888" }}>{user.email}</span>
          <button onClick={signOut}
            style={{ padding: "7px 14px", background: "#f5f5f5", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "#555" }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Data loading ── */}
      {dataLoading && (
        <div style={{ textAlign: "center", padding: 40, color: "#aaa", fontSize: 14 }}>Loading your data...</div>
      )}

      {!dataLoading && (
        <>
          {/* ── Settings ── */}
          {tab === "settings" && (
            <SettingsPanel settings={settings} onSave={saveSettings} />
          )}

          {/* ── Stock ── */}
          {tab === "stock" && (
            <StockPanel stock={stock} onAdd={addItem} onDelete={deleteItem} />
          )}

          {/* ── Trades & Analytics ── */}
          {tab === "trades" && (
            <TradesPanel
              invoices={invoices}
              onReopen={reopenInvoice}
              onDelete={deleteInvoice}
            />
          )}

          {/* ── Dashboard ── */}
          {tab === "dashboard" && view === "list" && (
            <Dashboard
              settings={settings}
              stock={stock}
              invoices={invoices}
              onNewInvoice={() => setView("form")}
              onReopenInvoice={reopenInvoice}
              onDeleteInvoice={deleteInvoice}
            />
          )}

          {/* ── Invoice Form ── */}
          {tab === "dashboard" && view === "form" && (
            <>
              {savingInvoice && (
                <div style={{ textAlign: "center", padding: 20, color: "#888", fontSize: 14 }}>Saving invoice...</div>
              )}
              <InvoiceForm
                settings={settings}
                stock={stock}
                onGenerate={handleGenerateInvoice}
                onBack={() => setView("list")}
              />
            </>
          )}

          {/* ── Invoice View ── */}
          {tab === "dashboard" && view === "invoice" && activeInvoice && (
            <InvoiceView
              invoice={activeInvoice}
              onBack={() => setView("list")}
              onNewInvoice={() => setView("form")}
            />
          )}
        </>
      )}
    </div>
  );
}