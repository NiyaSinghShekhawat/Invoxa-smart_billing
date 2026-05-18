import { supabase } from "./services/supabase.js";
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

export default function App() {
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const onForgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw error;
  };

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
        onForgotPassword={onForgotPassword}
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
          {[["dashboard","Dashboard"], ["stock","Stock"], ["settings","Settings"]].map(([key, label]) => (
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

// import { useState, useRef, useCallback } from "react";

// // ========== UTILITY FUNCTIONS ==========
// function calculateItemSubtotal(item) {
//   return (parseFloat(item.pricePerUnit) || 0) * (parseFloat(item.quantity) || 0);
// }

// function calculateItemGST(item, gstType) {
//   if (!item.taxable) return { gst: 0, cgst: 0, sgst: 0, igst: 0 };
  
//   const subtotal = calculateItemSubtotal(item);
//   const gstRate = parseFloat(item.gstRate) || 0;
//   const gst = (subtotal * gstRate) / 100;
  
//   if (gstType === "cgst_sgst") {
//     return { gst, cgst: gst / 2, sgst: gst / 2, igst: 0 };
//   }
//   return { gst, cgst: 0, sgst: 0, igst: gst };
// }

// function calculateInvoiceTotals(items, gstType) {
//   const subtotal = items.reduce((sum, it) => sum + calculateItemSubtotal(it), 0);
//   const gstBreakdown = items.reduce((acc, it) => {
//     const itemGst = calculateItemGST(it, gstType);
//     return {
//       cgst: acc.cgst + itemGst.cgst,
//       sgst: acc.sgst + itemGst.sgst,
//       igst: acc.igst + itemGst.igst,
//       total: acc.total + itemGst.gst,
//     };
//   }, { cgst: 0, sgst: 0, igst: 0, total: 0 });
  
//   return { subtotal, gstBreakdown };
// }

// function groupGSTBySlab(items, gstType) {
//   const grouped = {};
//   items.forEach((it) => {
//     if (!it.taxable) return;
//     const rate = parseFloat(it.gstRate) || 0;
//     const rateKey = rate.toString();
//     if (!grouped[rateKey]) {
//       grouped[rateKey] = { rate, cgst: 0, sgst: 0, igst: 0 };
//     }
//     const itemGst = calculateItemGST(it, gstType);
//     grouped[rateKey].cgst += itemGst.cgst;
//     grouped[rateKey].sgst += itemGst.sgst;
//     grouped[rateKey].igst += itemGst.igst;
//   });
//   return grouped;
// }

// // function numberToWordsIndian(num) {
// //   const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
// //   const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
// //   const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
// //   const scales = ['', 'Thousand', 'Lakh', 'Crore'];

// //   if (num === 0) return 'Zero';
// //   if (num < 0) return 'Negative ' + numberToWordsIndian(-num);

// //   let result = '';
// //   let scaleIdx = 0;

// //   while (num > 0) {
// //     if (num % 100 !== 0) {
// //       let groupWords = '';
// //       const group = num % 100;
      
// //       if (group >= 10 && group < 20) {
// //         groupWords = teens[group - 10];
// //       } else {
// //         const remainder = group % 10;
// //         groupWords = tens[Math.floor(group / 10)] + (remainder > 0 ? ' ' + ones[remainder] : '');
// //       }
      
// //       if (group >= 100) {
// //         const hundreds = Math.floor(group / 100);
// //         groupWords = ones[hundreds] + ' Hundred ' + groupWords;
// //       }
      
// //       if (groupWords.trim()) {
// //         result = groupWords.trim() + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : '') + (result ? ' ' + result : '');
// //       }
// //     }
    
// //     num = Math.floor(num / 100);
// //     scaleIdx++;
// //   }

// //   return result.trim() + ' Rupees Only';
// // }

// function numberToWordsIndian(num) {
//   if (num === 0) return "Zero Rupees Only";

//   const belowTwenty = [
//     "", "One", "Two", "Three", "Four", "Five",
//     "Six", "Seven", "Eight", "Nine", "Ten",
//     "Eleven", "Twelve", "Thirteen", "Fourteen",
//     "Fifteen", "Sixteen", "Seventeen",
//     "Eighteen", "Nineteen"
//   ];

//   const tens = [
//     "", "", "Twenty", "Thirty", "Forty",
//     "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
//   ];

//   function twoDigits(n) {
//     if (n < 20) return belowTwenty[n];
//     return (
//       tens[Math.floor(n / 10)] +
//       (n % 10 ? " " + belowTwenty[n % 10] : "")
//     );
//   }

//   function threeDigits(n) {
//     let str = "";

//     if (Math.floor(n / 100) > 0) {
//       str += belowTwenty[Math.floor(n / 100)] + " Hundred";
//     }

//     if (n % 100 > 0) {
//       str += (str ? " " : "") + twoDigits(n % 100);
//     }

//     return str;
//   }

//   let result = "";

//   const crore = Math.floor(num / 10000000);
//   num %= 10000000;

//   const lakh = Math.floor(num / 100000);
//   num %= 100000;

//   const thousand = Math.floor(num / 1000);
//   num %= 1000;

//   const hundred = num;

//   if (crore) {
//     result += twoDigits(crore) + " Crore ";
//   }

//   if (lakh) {
//     result += twoDigits(lakh) + " Lakh ";
//   }

//   if (thousand) {
//     result += twoDigits(thousand) + " Thousand ";
//   }

//   if (hundred) {
//     result += threeDigits(hundred);
//   }

//   return result.trim() + " Rupees Only";
// }

// const initialSettings = {
//   businessName: "My Business",
//   ownerName: "John Doe",
//   gstin: "27AABCU9603R1ZX",
//   email: "info@mybusiness.com",
//   phone: "+91 98765 43210",
//   address: "123 Main Street",
//   state: "Gujarat",
//   stateCode: "24",
//   pincode: "380001",
//   logo: null,
  
//   bankName: "ICICI Bank",
//   accountHolderName: "John Doe",
//   accountNumber: "1234567890123456",
//   ifscCode: "ICIC0000001",
//   upiId: "johndoe@icici",
//   branchName: "Ahmedabad",
  
//   additional: "Thank you for your business",
//   terms: "1. All sales are final. No refunds after 7 days.\n2. Goods once sold will not be taken back.\n3. Subject to local jurisdiction.\n4. E&OE (Errors and Omissions Excepted).",
// };

// const paymentMethods = ["Cash", "UPI", "Bank Transfer", "Cheque", "Credit Card", "Debit Card", "Net Banking"];

// function generateInvoiceNumber() {
//   const prefix = "INV";
//   const year = new Date().getFullYear().toString().slice(-2);
//   const month = String(new Date().getMonth() + 1).padStart(2, "0");
//   const rand = Math.floor(Math.random() * 9000) + 1000;
//   return `${prefix}-${year}${month}-${rand}`;
// }

// function formatDateTime(d) {
//   return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
// }
// function formatDate(d) {
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }
// function todayStr() {
//   const d = new Date();
//   return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
// }

// export default function BillGenerator() {
//   const [tab, setTab] = useState("dashboard");
//   const [settings, setSettings] = useState(initialSettings);
//   const [settingsDraft, setSettingsDraft] = useState(initialSettings);
//   const [stock, setStock] = useState([
//     { 
//       id: 1, 
//       name: "Product A", 
//       company: "Acme Corp", 
//       costPrice: 100, 
//       sellingPrice: 150, 
//       dateOfPurchase: "2025-01-10", 
//       quantity: 50,
//       gstRate: 9,
//       hsnCode: "6204",
//       taxable: true,
//     },
//     { 
//       id: 2, 
//       name: "Product B", 
//       company: "Beta Ltd", 
//       costPrice: 200, 
//       sellingPrice: 280, 
//       dateOfPurchase: "2025-02-15", 
//       quantity: 30,
//       gstRate: 5,
//       hsnCode: "3004",
//       taxable: true,
//     },
//   ]);
//   const [showStockForm, setShowStockForm] = useState(false);
//   const [stockForm, setStockForm] = useState({ 
//     name: "", 
//     company: "", 
//     costPrice: "", 
//     sellingPrice: "", 
//     dateOfPurchase: todayStr(), 
//     quantity: "",
//     gstRate: "9",
//     hsnCode: "",
//     taxable: true,
//   });
//   const [showBillForm, setShowBillForm] = useState(false);
//   const [bill, setBill] = useState(null);
//   const [billForm, setBillForm] = useState({
//     customerName: "",
//     customerPhone: "",
//     customerGSTIN: "",
//     customerAddress: "",
//     customerState: "",
//     customerStateCode: "",
//     invoiceNumber: generateInvoiceNumber(),
//     issueDate: new Date(),
//     dueDate: todayStr(),
//     items: [],
//     gstType: "cgst_sgst",
//     placeOfSupply: "",
//     paymentMethod: "Cash",
//     receivedAmount: 0,
//     notes: "",
//     additionalCharges: 0,
//     additionalChargesLabel: "Delivery Charges",
//     discount: 0,
//   });
//   const [showInvoice, setShowInvoice] = useState(false);
//   const printRef = useRef();

//   // --- SETTINGS ---
//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => setSettingsDraft(s => ({ ...s, logo: ev.target.result }));
//     reader.readAsDataURL(file);
//   };
//   const saveSettings = () => { setSettings({ ...settingsDraft }); alert("Settings saved!"); };

//   // --- STOCK ---
//   const addStockItem = () => {
//     if (!stockForm.name || !stockForm.sellingPrice) return;
//     setStock(s => [...s, { 
//       ...stockForm, 
//       id: Date.now(), 
//       costPrice: parseFloat(stockForm.costPrice)||0, 
//       sellingPrice: parseFloat(stockForm.sellingPrice)||0, 
//       quantity: stockForm.quantity ? parseInt(stockForm.quantity) : null,
//       gstRate: parseFloat(stockForm.gstRate) || 0,
//       hsnCode: stockForm.hsnCode || "",
//       taxable: stockForm.taxable,
//     }]);
//     setStockForm({ 
//       name: "", 
//       company: "", 
//       costPrice: "", 
//       sellingPrice: "", 
//       dateOfPurchase: todayStr(), 
//       quantity: "",
//       gstRate: "9",
//       hsnCode: "",
//       taxable: true,
//     });
//     setShowStockForm(false);
//   };
//   const deleteStock = (id) => setStock(s => s.filter(i => i.id !== id));

//   // --- BILL FORM ---
//   const autoDetectGSTType = (customerState) => {
//     if (customerState === settings.state) {
//       return "cgst_sgst";
//     }
//     return "igst";
//   };

//   const addBillItem = (stockItem) => {
//     setBillForm(f => ({
//       ...f,
//       items: [...f.items, { 
//         stockId: stockItem.id, 
//         name: stockItem.name, 
//         company: stockItem.company, 
//         hsnCode: stockItem.hsnCode,
//         pricePerUnit: stockItem.sellingPrice, 
//         quantity: 1, 
//         gstRate: stockItem.gstRate,
//         taxable: stockItem.taxable,
//       }]
//     }));
//   };
//   const updateBillItem = (idx, field, val) => {
//     setBillForm(f => {
//       const items = f.items.map((it, i) => {
//         if (i !== idx) return it;
//         const updated = { ...it, [field]: val };
//         return updated;
//       });
//       return { ...f, items };
//     });
//   };
//   const removeBillItem = (idx) => setBillForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

//   // Calculate totals using the new GST system
//   const { subtotal, gstBreakdown } = calculateInvoiceTotals(billForm.items, billForm.gstType);
//   const additionalAmt = parseFloat(billForm.additionalCharges) || 0;
//   const discountAmt = parseFloat(billForm.discount) || 0;
//   const total = subtotal + gstBreakdown.total + additionalAmt - discountAmt;
//   const dueAmount = Math.max(total - (parseFloat(billForm.receivedAmount) || 0), 0);
//   const gstGroupedBySlab = groupGSTBySlab(billForm.items, billForm.gstType);

//   const generateBill = () => {
//     if (!billForm.customerName) { alert("Enter customer name"); return; }
//     if (billForm.items.length === 0) { alert("Add at least one item"); return; }
//     setBill({ 
//       ...billForm, 
//       subtotal, 
//       gstBreakdown, 
//       gstGroupedBySlab,
//       total, 
//       dueAmount,
//       issueDateStr: formatDateTime(billForm.issueDate), 
//       settings: { ...settings } 
//     });
//     setShowInvoice(true);
//     setShowBillForm(false);
//   };

//   const printInvoice = () => {
//     const content = printRef.current.innerHTML;
//     const win = window.open("", "_blank");
//     win.document.write(`<html><head><title>Invoice</title><style>
//       @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
//       * { margin:0; padding:0; box-sizing:border-box; }
//       body { font-family:'DM Sans',sans-serif; font-size:13px; color:#1a1a1a; background:#fff; }
//       .inv-wrap { position:relative; padding:40px 48px; max-width:800px; margin:auto; min-height:1100px; }
//       .watermark { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:0; pointer-events:none; }
//       .watermark img { max-width:340px; max-height:340px; opacity:0.06; filter:grayscale(1); }
//       .inv-content { position:relative; z-index:1; }
//       table { width:100%; border-collapse:collapse; }
//       th { background:#1a1a1a; color:#fff; padding:8px 10px; font-weight:500; font-size:11px; text-transform:uppercase; letter-spacing:.5px; }
//       td { padding:7px 10px; border-bottom:1px solid #eee; font-size:12px; }
//       .right { text-align:right; }
//       .center { text-align:center; }
//       @media print { @page { margin:0; } body { margin:0; } }
//     </style></head><body>${content}</body></html>`);
//     win.document.close();
//     win.focus();
//     setTimeout(() => { win.print(); }, 500);
//   };

//   const styles = {
//     app: { minHeight: "100vh", background: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" },
//     topbar: { background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "0 32px", display: "flex", alignItems: "center", gap: 0 },
//     logo: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a1a", marginRight: 32, padding: "16px 0" },
//     tab: (active) => ({ padding: "18px 20px", borderBottom: active ? "2px solid #1a1a1a" : "2px solid transparent", color: active ? "#1a1a1a" : "#888", fontWeight: active ? 500 : 400, cursor: "pointer", fontSize: 14, transition: "all .2s", background: "none", border: "none", borderBottom: active ? "2px solid #1a1a1a" : "2px solid transparent" }),
//     container: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
//     card: { background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "24px 28px", marginBottom: 20 },
//     sectionTitle: { fontSize: 18, fontWeight: 600, color: "#1a1a1a", marginBottom: 20, fontFamily: "'DM Serif Display', serif" },
//     label: { fontSize: 12, color: "#666", marginBottom: 5, display: "block", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".4px" },
//     input: { width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", background: "#fafafa", color: "#1a1a1a", boxSizing: "border-box" },
//     textarea: { width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 13, outline: "none", background: "#fafafa", resize: "vertical", color: "#1a1a1a", boxSizing: "border-box" },
//     btn: (variant="primary") => ({
//       padding: variant==="sm" ? "7px 14px" : "11px 22px",
//       background: variant==="primary" ? "#1a1a1a" : variant==="danger" ? "#fee2e2" : "#f5f5f5",
//       color: variant==="primary" ? "#fff" : variant==="danger" ? "#dc2626" : "#333",
//       border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "opacity .15s"
//     }),
//     grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
//     grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
//     table: { width: "100%", borderCollapse: "collapse" },
//     th: { textAlign: "left", fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", padding: "8px 12px", borderBottom: "2px solid #eee" },
//     td: { padding: "10px 12px", fontSize: 13, color: "#333", borderBottom: "1px solid #f2f2f2" },
//     badge: (color) => ({ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: color==="green"?"#dcfce7":"#fef3c7", color: color==="green"?"#16a34a":"#b45309" }),
//   };

//   // ========== INVOICE TEMPLATE ==========
//   const InvoiceView = ({ data }) => {
//     if (!data) return null;
//     const s = data.settings;
    
//     return (
//       <div ref={printRef}>
//         <div className="inv-wrap" style={{ position: "relative", padding: "40px 48px", background: "#fff", maxWidth: 800, margin: "0 auto", minHeight: 1200 }}>
//           {s.logo && (
//             <div className="watermark" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
//               <img src={s.logo} alt="" style={{ maxWidth: 320, maxHeight: 320, opacity: 0.065, filter: "grayscale(1)" }} />
//             </div>
//           )}
//           <div className="inv-content" style={{ position: "relative", zIndex: 1 }}>
//             {/* Header */}
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
//                 {s.logo && <img src={s.logo} alt="logo" style={{ width: 60, height: 60, objectFit: "contain", borderRadius: 8, border: "1px solid #eee" }} />}
//                 <div>
//                   <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#1a1a1a", lineHeight: 1.2 }}>{s.businessName}</div>
//                   <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>GSTIN: {s.gstin}</div>
//                   <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{s.address}, {s.state} - {s.pincode}</div>
//                   <div style={{ fontSize: 12, color: "#666" }}>{s.phone} | {s.email}</div>
//                 </div>
//               </div>
//               <div style={{ textAlign: "right" }}>
//                 <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", letterSpacing: -1, fontFamily: "'DM Serif Display', serif" }}>INVOICE</div>
//                 <div style={{ fontSize: 13, color: "#555", marginTop: 6 }}><b>#</b> {data.invoiceNumber}</div>
//                 <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Issued: {data.issueDateStr}</div>
//                 <div style={{ fontSize: 11, color: "#888" }}>Due: {data.dueDate ? formatDate(new Date(data.dueDate)) : "—"}</div>
//                 <div style={{ fontSize: 11, color: "#888" }}>Place of Supply: {data.placeOfSupply || data.customerState || "—"}</div>
//               </div>
//             </div>
            
//             {/* Divider */}
//             <div style={{ borderTop: "2px solid #1a1a1a", marginBottom: 24 }} />
            
//             {/* Bill To Section */}
//             <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
//               <div>
//                 <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Bill To</div>
//                 <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{data.customerName}</div>
//                 {data.customerGSTIN && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>GSTIN: {data.customerGSTIN}</div>}
//                 {data.customerPhone && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{data.customerPhone}</div>}
//                 {data.customerAddress && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{data.customerAddress}</div>}
//                 {data.customerState && <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{data.customerState} - {data.customerStateCode || ""}</div>}
//               </div>
//               <div>
//                 <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Ship To</div>
//                 <div style={{ fontSize: 12, color: "#666" }}>Same as Bill To</div>
//               </div>
//             </div>
            
//             {/* Items Table */}
//             <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
//               <thead>
//                 <tr style={{ background: "#1a1a1a" }}>
//                   {["#", "Item", "HSN", "Qty", "Rate (₹)", "GST %", "GST Amt (₹)", "Total (₹)"].map(h => (
//                     <th key={h} style={{ padding: "9px 10px", color: "#fff", fontSize: 10, textAlign: h==="#"?"center":"right", fontWeight: 500, textTransform: "uppercase", letterSpacing: .4 }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.items.map((it, i) => {
//                   const itemSubtotal = calculateItemSubtotal(it);
//                   const itemGst = calculateItemGST(it, data.gstType);
//                   return (
//                     <tr key={i} style={{ background: i%2===0?"#fafafa":"#fff" }}>
//                       <td style={{ padding: "9px 10px", textAlign: "center", fontSize: 11, color: "#888" }}>{i+1}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 12, fontWeight: 500 }}>{it.name}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 11, color: "#666", textAlign: "center" }}>{it.hsnCode || "—"}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 12, textAlign: "right" }}>{it.quantity}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 12, textAlign: "right" }}>₹{parseFloat(it.pricePerUnit).toFixed(2)}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 12, textAlign: "right" }}>{it.taxable ? it.gstRate + "%" : "—"}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 12, textAlign: "right" }}>₹{itemGst.gst.toFixed(2)}</td>
//                       <td style={{ padding: "9px 10px", fontSize: 12, textAlign: "right", fontWeight: 500 }}>₹{(itemSubtotal + itemGst.gst).toFixed(2)}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
            
//             {/* Totals Section */}
//             <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
//               <div style={{ width: 280 }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", color: "#555", borderBottom: "1px solid #f0f0f0" }}>
//                   <span>Subtotal</span><span>₹{data.subtotal.toFixed(2)}</span>
//                 </div>
                
//                 {/* GST Summary by Slab */}
//                 {Object.entries(data.gstGroupedBySlab || {}).map(([rate, slabData]) => (
//                   <div key={rate}>
//                     {data.gstType === "cgst_sgst" ? (
//                       <>
//                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", color: "#666", borderBottom: "1px solid #f5f5f5" }}>
//                           <span>CGST @ {rate}%</span><span>₹{slabData.cgst.toFixed(2)}</span>
//                         </div>
//                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", color: "#666", borderBottom: "1px solid #f5f5f5" }}>
//                           <span>SGST @ {rate}%</span><span>₹{slabData.sgst.toFixed(2)}</span>
//                         </div>
//                       </>
//                     ) : (
//                       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", color: "#555", borderBottom: "1px solid #f5f5f5" }}>
//                         <span>IGST @ {rate}%</span><span>₹{slabData.igst.toFixed(2)}</span>
//                       </div>
//                     )}
//                   </div>
//                 ))}
                
//                 {parseFloat(data.additionalCharges) > 0 && (
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", color: "#555", borderBottom: "1px solid #f5f5f5" }}>
//                     <span>{data.additionalChargesLabel}</span><span>₹{parseFloat(data.additionalCharges).toFixed(2)}</span>
//                   </div>
//                 )}
                
//                 {parseFloat(data.discount) > 0 && (
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", color: "#555", borderBottom: "1px solid #f5f5f5" }}>
//                     <span>Discount</span><span>-₹{parseFloat(data.discount).toFixed(2)}</span>
//                   </div>
//                 )}
                
//                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#1a1a1a", padding: "10px 0", marginTop: 4, borderTop: "2px solid #1a1a1a" }}>
//                   <span>TOTAL</span><span>₹{data.total.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Amount in Words */}
//             <div style={{ marginBottom: 20, padding: "12px", background: "#fafafa", borderRadius: 8, borderLeft: "3px solid #1a1a1a" }}>
//               <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Amount in Words</div>
//               <div style={{ fontSize: 13, color: "#333" }}>{numberToWordsIndian(Math.floor(data.total))}</div>
//             </div>
            
//             {/* Payment Section */}
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderTop: "1px solid #eee", paddingTop: 16 }}>
//               <div>
//                 <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Payment Details</div>
//                 <div style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>
//                   <span style={{ fontWeight: 500 }}>Method:</span> {data.paymentMethod}
//                 </div>
//                 <div style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>
//                   <span style={{ fontWeight: 500 }}>Total:</span> ₹{data.total.toFixed(2)}
//                 </div>
//                 {parseFloat(data.receivedAmount) > 0 && (
//                   <>
//                     <div style={{ fontSize: 12, color: "#333", marginBottom: 4 }}>
//                       <span style={{ fontWeight: 500 }}>Received:</span> ₹{parseFloat(data.receivedAmount).toFixed(2)}
//                     </div>
//                     <div style={{ fontSize: 12, color: data.dueAmount > 0 ? "#dc2626" : "#16a34a", marginBottom: 4 }}>
//                       <span style={{ fontWeight: 500 }}>Due:</span> ₹{data.dueAmount.toFixed(2)}
//                     </div>
//                   </>
//                 )}
//               </div>
//               <div style={{ textAlign: "center" }}>
//                 <div style={{ width: 160, height: 56, borderBottom: "1.5px solid #1a1a1a", marginBottom: 6 }}></div>
//                 <div style={{ fontSize: 10, color: "#888" }}>Authorized Signatory</div>
//                 <div style={{ fontSize: 11, color: "#555", fontWeight: 500 }}>{s.ownerName}</div>
//               </div>
//             </div>
            
//             {/* Bank Details */}
//             {(s.bankName || s.accountNumber || s.upiId) && (
//               <div style={{ marginBottom: 20, padding: "12px", background: "#f5f5f5", borderRadius: 8 }}>
//                 <div style={{ fontSize: 10, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Bank & Payment Information</div>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11, color: "#333" }}>
//                   {s.bankName && <div><span style={{ fontWeight: 500 }}>Bank:</span> {s.bankName}</div>}
//                   {s.branchName && <div><span style={{ fontWeight: 500 }}>Branch:</span> {s.branchName}</div>}
//                   {s.accountHolderName && <div><span style={{ fontWeight: 500 }}>Account Holder:</span> {s.accountHolderName}</div>}
//                   {s.accountNumber && <div><span style={{ fontWeight: 500 }}>Account #:</span> {s.accountNumber}</div>}
//                   {s.ifscCode && <div><span style={{ fontWeight: 500 }}>IFSC:</span> {s.ifscCode}</div>}
//                   {s.upiId && <div><span style={{ fontWeight: 500 }}>UPI:</span> {s.upiId}</div>}
//                 </div>
//               </div>
//             )}
            
//             {/* Notes */}
//             {data.notes && (
//               <div style={{ marginBottom: 16, fontSize: 11, color: "#666", lineHeight: 1.6, paddingBottom: 12, borderBottom: "1px solid #eee" }}>
//                 <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Notes</div>
//                 {data.notes}
//               </div>
//             )}
            
//             {/* Thank you */}
//             <div style={{ textAlign: "center", fontSize: 14, fontFamily: "'DM Serif Display', serif", color: "#1a1a1a", letterSpacing: .5, marginBottom: 16, paddingTop: 8 }}>
//               Thank you for your business!
//             </div>
            
//             {/* Footer T&C */}
//             {s.terms && (
//               <div style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
//                 <div style={{ fontSize: 9, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Terms & Conditions</div>
//                 <div style={{ fontSize: 10, color: "#888", whiteSpace: "pre-line", lineHeight: 1.6 }}>{s.terms}</div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div style={styles.app}>
//       <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

//       {/* Topbar */}
//       <div style={styles.topbar}>
//         <div style={styles.logo}>📄 INVOXA</div>
//         {[["dashboard","Dashboard"],["stock","Stock"],["settings","Settings"]].map(([key,label]) => (
//           <button key={key} style={styles.tab(tab===key)} onClick={() => setTab(key)}>{label}</button>
//         ))}
//       </div>

//       {/* ========== SETTINGS ========== */}
//       {tab === "settings" && (
//         <div style={styles.container}>
//           {/* Business Settings */}
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>Business Settings</div>
//             <div style={styles.grid2}>
//               {[["businessName","Business Name"],["ownerName","Owner / Manager Name"],["gstin","GSTIN"],["email","Email Address"],["phone","Phone Number"],["pincode","PIN Code"]].map(([key,label]) => (
//                 <div key={key}>
//                   <label style={styles.label}>{label}</label>
//                   <input style={styles.input} value={settingsDraft[key]} onChange={e => setSettingsDraft(s => ({...s,[key]:e.target.value}))} />
//                 </div>
//               ))}
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={styles.label}>Business Address</label>
//                 <input style={styles.input} value={settingsDraft.address} onChange={e => setSettingsDraft(s => ({...s,address:e.target.value}))} />
//               </div>
//               <div style={styles.grid2}>
//                 <div>
//                   <label style={styles.label}>State</label>
//                   <input style={styles.input} value={settingsDraft.state} onChange={e => setSettingsDraft(s => ({...s,state:e.target.value}))} placeholder="e.g., Gujarat" />
//                 </div>
//                 <div>
//                   <label style={styles.label}>State Code</label>
//                   <input style={styles.input} value={settingsDraft.stateCode} onChange={e => setSettingsDraft(s => ({...s,stateCode:e.target.value}))} placeholder="e.g., 24" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bank Details */}
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>Bank Details</div>
//             <div style={styles.grid2}>
//               {[["bankName","Bank Name"],["branchName","Branch Name"],["accountHolderName","Account Holder Name"],["accountNumber","Account Number"],["ifscCode","IFSC Code"],["upiId","UPI ID"]].map(([key,label]) => (
//                 <div key={key}>
//                   <label style={styles.label}>{label}</label>
//                   <input style={styles.input} value={settingsDraft[key]} onChange={e => setSettingsDraft(s => ({...s,[key]:e.target.value}))} />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Additional Settings */}
//           <div style={styles.card}>
//             <div style={styles.sectionTitle}>Additional Settings</div>
//             <div style={styles.grid2}>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={styles.label}>Additional Info / Footer Message</label>
//                 <textarea style={styles.textarea} rows={3} value={settingsDraft.additional} onChange={e => setSettingsDraft(s => ({...s,additional:e.target.value}))} />
//               </div>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={styles.label}>Terms & Conditions</label>
//                 <textarea style={styles.textarea} rows={5} value={settingsDraft.terms} onChange={e => setSettingsDraft(s => ({...s,terms:e.target.value}))} />
//               </div>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={styles.label}>Company Logo</label>
//                 <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ marginBottom: 10 }} />
//                 {settingsDraft.logo && (
//                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                     <img src={settingsDraft.logo} alt="logo preview" style={{ width: 80, height: 80, objectFit: "contain", border: "1px solid #eee", borderRadius: 8, padding: 4 }} />
//                     <div>
//                       <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Logo preview — will appear as watermark on invoices</div>
//                       <button style={styles.btn("danger")} onClick={() => setSettingsDraft(s => ({...s,logo:null}))}>Remove Logo</button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div style={{ marginTop: 24 }}>
//               <button style={styles.btn("primary")} onClick={saveSettings}>💾 Save Settings</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ========== STOCK ========== */}
//       {tab === "stock" && (
//         <div style={styles.container}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//             <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22 }}>Stock Management</h2>
//             <button style={styles.btn("primary")} onClick={() => setShowStockForm(!showStockForm)}>+ Add Item</button>
//           </div>
//           {showStockForm && (
//             <div style={styles.card}>
//               <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>New Stock Item</div>
//               <div style={styles.grid3}>
//                 {[["name","Product Name"],["company","Company/Brand"],["dateOfPurchase","Date of Purchase"]].map(([key,label]) => (
//                   <div key={key}>
//                     <label style={styles.label}>{label}</label>
//                     <input style={styles.input} type={key==="dateOfPurchase"?"date":"text"} value={stockForm[key]} onChange={e => setStockForm(s => ({...s,[key]:e.target.value}))} />
//                   </div>
//                 ))}
//                 {[["costPrice","Cost Price (₹)"],["sellingPrice","Selling Price (₹)"],["quantity","Stock Qty (optional)"]].map(([key,label]) => (
//                   <div key={key}>
//                     <label style={styles.label}>{label}</label>
//                     <input style={styles.input} type="number" value={stockForm[key]} onChange={e => setStockForm(s => ({...s,[key]:e.target.value}))} />
//                   </div>
//                 ))}
//                 {[["hsnCode","HSN Code"],["gstRate","GST Rate (%)"],["taxable","Taxable"]].map(([key,label]) => {
//                   if (key === "taxable") {
//                     return (
//                       <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 24 }}>
//                         <input type="checkbox" checked={stockForm[key]} onChange={e => setStockForm(s => ({...s,[key]:e.target.checked}))} style={{ width: 20, height: 20, cursor: "pointer" }} />
//                         <label style={{...styles.label, marginBottom: 0}}>{label}</label>
//                       </div>
//                     );
//                   }
//                   return (
//                     <div key={key}>
//                       <label style={styles.label}>{label}</label>
//                       <input style={styles.input} type="number" value={stockForm[key]} onChange={e => setStockForm(s => ({...s,[key]:e.target.value}))} />
//                     </div>
//                   );
//                 })}
//               </div>
//               {stockForm.costPrice && stockForm.sellingPrice && (
//                 <div style={{ marginTop: 10, fontSize: 13, color: parseFloat(stockForm.sellingPrice) > parseFloat(stockForm.costPrice) ? "#16a34a" : "#dc2626" }}>
//                   Profit per unit: ₹{(parseFloat(stockForm.sellingPrice||0) - parseFloat(stockForm.costPrice||0)).toFixed(2)} ({stockForm.costPrice ? (((stockForm.sellingPrice-stockForm.costPrice)/stockForm.costPrice)*100).toFixed(1) : 0}%)
//                 </div>
//               )}
//               <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
//                 <button style={styles.btn("primary")} onClick={addStockItem}>Add to Stock</button>
//                 <button style={styles.btn()} onClick={() => setShowStockForm(false)}>Cancel</button>
//               </div>
//             </div>
//           )}
//           <div style={styles.card}>
//             <table style={styles.table}>
//               <thead>
//                 <tr>{["Product","Company","HSN","GST %","Taxable","Cost Price","Selling Price","Profit","Date Added","Stock","Actions"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
//               </thead>
//               <tbody>
//                 {stock.map(item => {
//                   const profit = item.sellingPrice - item.costPrice;
//                   const profPct = item.costPrice ? ((profit/item.costPrice)*100).toFixed(1) : 0;
//                   return (
//                     <tr key={item.id}>
//                       <td style={{...styles.td, fontWeight: 500}}>{item.name}</td>
//                       <td style={styles.td}>{item.company}</td>
//                       <td style={styles.td}>{item.hsnCode || "—"}</td>
//                       <td style={styles.td}>{item.gstRate}%</td>
//                       <td style={styles.td}><span style={styles.badge(item.taxable ? "green" : "red")}>{item.taxable ? "Yes" : "No"}</span></td>
//                       <td style={styles.td}>₹{item.costPrice.toFixed(2)}</td>
//                       <td style={styles.td}>₹{item.sellingPrice.toFixed(2)}</td>
//                       <td style={styles.td}><span style={styles.badge(profit>=0?"green":"red")}>₹{profit.toFixed(2)} ({profPct}%)</span></td>
//                       <td style={styles.td}>{item.dateOfPurchase}</td>
//                       <td style={styles.td}>{item.quantity ?? "—"}</td>
//                       <td style={styles.td}><button style={styles.btn("danger")} onClick={() => deleteStock(item.id)}>Delete</button></td>
//                     </tr>
//                   );
//                 })}
//                 {stock.length === 0 && <tr><td colSpan={11} style={{ textAlign:"center", padding:32, color:"#aaa" }}>No items in stock</td></tr>}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ========== DASHBOARD ========== */}
//       {tab === "dashboard" && !showBillForm && !showInvoice && (
//         <div style={styles.container}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
//             <div>
//               <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26, marginBottom: 4 }}>Welcome back, {settings.ownerName}</h2>
//               <div style={{ color: "#888", fontSize: 14 }}>{settings.businessName}</div>
//             </div>
//             <button style={{ ...styles.btn("primary"), fontSize: 15, padding: "13px 28px" }} onClick={() => {
//               setBillForm(f => ({ ...f, invoiceNumber: generateInvoiceNumber(), issueDate: new Date(), items: [] }));
//               setShowBillForm(true);
//             }}>
//               + Generate Bill
//             </button>
//           </div>
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
//             {[
//               { label: "Total Products", value: stock.length, icon: "📦" },
//               { label: "Total Stock Value", value: `₹${stock.reduce((s,i) => s + i.sellingPrice*(i.quantity||1),0).toLocaleString("en-IN")}`, icon: "💰" },
//               { label: "Avg Margin", value: stock.length ? `${(stock.reduce((s,i) => s + (i.sellingPrice-i.costPrice)/i.costPrice*100, 0)/stock.length).toFixed(1)}%` : "—", icon: "📈" },
//             ].map(card => (
//               <div key={card.label} style={{ ...styles.card, marginBottom: 0 }}>
//                 <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
//                 <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>{card.value}</div>
//                 <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{card.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ========== BILL FORM ========== */}
//       {tab === "dashboard" && showBillForm && (
//         <div style={styles.container}>
//           <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
//             <button style={styles.btn()} onClick={() => setShowBillForm(false)}>← Back</button>
//             <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22 }}>New Invoice</h2>
//           </div>

//           {/* Customer & Invoice Info */}
//           <div style={styles.card}>
//             <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#1a1a1a" }}>Customer & Invoice Details</div>
//             <div style={styles.grid3}>
//               <div>
//                 <label style={styles.label}>Customer Name *</label>
//                 <input style={styles.input} value={billForm.customerName} onChange={e => setBillForm(f=>({...f,customerName:e.target.value}))} placeholder="Full name" />
//               </div>
//               <div>
//                 <label style={styles.label}>Phone Number</label>
//                 <input style={styles.input} value={billForm.customerPhone} onChange={e => setBillForm(f=>({...f,customerPhone:e.target.value}))} placeholder="+91 XXXXX XXXXX" />
//               </div>
//               <div>
//                 <label style={styles.label}>GSTIN (if applicable)</label>
//                 <input style={styles.input} value={billForm.customerGSTIN} onChange={e => setBillForm(f=>({...f,customerGSTIN:e.target.value}))} placeholder="27AABCU9603R1ZX" />
//               </div>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={styles.label}>Customer Address</label>
//                 <input style={styles.input} value={billForm.customerAddress} onChange={e => setBillForm(f=>({...f,customerAddress:e.target.value}))} placeholder="Street, City" />
//               </div>
//               <div>
//                 <label style={styles.label}>State</label>
//                 <input style={styles.input} value={billForm.customerState} onChange={e => {
//                   setBillForm(f => {
//                     const updated = {...f, customerState: e.target.value};
//                     updated.gstType = autoDetectGSTType(e.target.value);
//                     return updated;
//                   });
//                 }} placeholder="e.g., Gujarat" />
//               </div>
//               <div>
//                 <label style={styles.label}>State Code</label>
//                 <input style={styles.input} value={billForm.customerStateCode} onChange={e => setBillForm(f=>({...f,customerStateCode:e.target.value}))} placeholder="e.g., 24" />
//               </div>
//             </div>
            
//             {/* GST Type & Other Info */}
//             <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginTop: 16 }}>
//               <div style={styles.grid3}>
//                 <div>
//                   <label style={styles.label}>Invoice Number</label>
//                   <input style={styles.input} value={billForm.invoiceNumber} onChange={e => setBillForm(f=>({...f,invoiceNumber:e.target.value}))} />
//                 </div>
//                 <div>
//                   <label style={styles.label}>Issue Date & Time</label>
//                   <input style={{ ...styles.input, color: "#888" }} value={formatDateTime(billForm.issueDate)} readOnly />
//                 </div>
//                 <div>
//                   <label style={styles.label}>Due Date</label>
//                   <input style={styles.input} type="date" value={billForm.dueDate} onChange={e => setBillForm(f=>({...f,dueDate:e.target.value}))} />
//                 </div>
//                 <div>
//                   <label style={styles.label}>Place of Supply</label>
//                   <input style={styles.input} value={billForm.placeOfSupply} onChange={e => setBillForm(f=>({...f,placeOfSupply:e.target.value}))} placeholder="State or City" />
//                 </div>
//                 <div>
//                   <label style={styles.label}>GST Type</label>
//                   <div style={{ display: "flex", gap: 8 }}>
//                     <button 
//                       onClick={() => setBillForm(f=>({...f,gstType:"cgst_sgst"}))} 
//                       style={{...styles.btn(billForm.gstType==="cgst_sgst"?"primary":""), flex: 1, fontSize: 12, padding: "9px 12px"}}
//                     >
//                       CGST/SGST
//                     </button>
//                     <button 
//                       onClick={() => setBillForm(f=>({...f,gstType:"igst"}))} 
//                       style={{...styles.btn(billForm.gstType==="igst"?"primary":""), flex: 1, fontSize: 12, padding: "9px 12px"}}
//                     >
//                       IGST
//                     </button>
//                   </div>
//                 </div>
//                 <div>
//                   <label style={styles.label}>Payment Method</label>
//                   <select style={styles.input} value={billForm.paymentMethod} onChange={e => setBillForm(f=>({...f,paymentMethod:e.target.value}))}>
//                     {paymentMethods.map(m => <option key={m}>{m}</option>)}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Items */}
//           <div style={styles.card}>
//             <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#1a1a1a" }}>Items</div>
//             <div style={{ marginBottom: 16 }}>
//               <label style={styles.label}>Add from Stock</label>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
//                 {stock.map(item => (
//                   <button key={item.id} style={{ padding: "7px 14px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 20, cursor: "pointer", fontSize: 13, transition: "background .15s" }}
//                     onClick={() => addBillItem(item)}>
//                     + {item.name} <span style={{ color: "#888" }}>₹{item.sellingPrice}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//             {billForm.items.length > 0 && (
//               <table style={{ ...styles.table, marginBottom: 8, fontSize: 12 }}>
//                 <thead><tr>{["Item","HSN","Qty","Rate","GST %","GST Amt","Total",""].map(h => <th key={h} style={{...styles.th, fontSize: 11}}>{h}</th>)}</tr></thead>
//                 <tbody>
//                   {billForm.items.map((it, idx) => {
//                     const itemSubtotal = calculateItemSubtotal(it);
//                     const itemGst = calculateItemGST(it, billForm.gstType);
//                     return (
//                       <tr key={idx}>
//                         <td style={{ ...styles.td, fontWeight: 500, fontSize: 12 }}>{it.name}</td>
//                         <td style={{...styles.td, textAlign: "center", fontSize: 11}}>{it.hsnCode || "—"}</td>
//                         <td style={styles.td}><input type="number" min="1" value={it.quantity} style={{ width: 50, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12 }} onChange={e => updateBillItem(idx,"quantity",e.target.value)} /></td>
//                         <td style={styles.td}><input type="number" value={it.pricePerUnit} style={{ width: 70, padding: "6px 8px", border: "1px solid #ddd", borderRadius: 6, fontSize: 12 }} onChange={e => updateBillItem(idx,"pricePerUnit",e.target.value)} /></td>
//                         <td style={{...styles.td, textAlign: "center", fontSize: 11}}>{it.taxable ? it.gstRate + "%" : "—"}</td>
//                         <td style={{...styles.td, fontSize: 11, color: "#666"}}>₹{itemGst.gst.toFixed(2)}</td>
//                         <td style={{ ...styles.td, fontWeight: 600, fontSize: 12 }}>₹{(itemSubtotal + itemGst.gst).toFixed(2)}</td>
//                         <td style={styles.td}><button onClick={() => removeBillItem(idx)} style={{ background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11 }}>✕</button></td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           {/* Tax, Charges & Discounts */}
//           <div style={styles.card}>
//             <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: "#1a1a1a" }}>Charges, Discounts & Payment</div>
//             <div style={styles.grid3}>
//               <div>
//                 <label style={styles.label}>Additional Charges Label</label>
//                 <input style={styles.input} value={billForm.additionalChargesLabel} onChange={e => setBillForm(f=>({...f,additionalChargesLabel:e.target.value}))} />
//               </div>
//               <div>
//                 <label style={styles.label}>Additional Charges (₹)</label>
//                 <input style={styles.input} type="number" value={billForm.additionalCharges} onChange={e => setBillForm(f=>({...f,additionalCharges:e.target.value}))} />
//               </div>
//               <div>
//                 <label style={styles.label}>Discount (₹)</label>
//                 <input style={styles.input} type="number" value={billForm.discount} onChange={e => setBillForm(f=>({...f,discount:e.target.value}))} />
//               </div>
//               <div>
//                 <label style={styles.label}>Received Amount (₹)</label>
//                 <input style={styles.input} type="number" value={billForm.receivedAmount} onChange={e => setBillForm(f=>({...f,receivedAmount:e.target.value}))} />
//               </div>
//               <div style={{ gridColumn: "1/-1" }}>
//                 <label style={styles.label}>Additional Notes</label>
//                 <textarea style={styles.textarea} rows={3} value={billForm.notes} onChange={e => setBillForm(f=>({...f,notes:e.target.value}))} />
//               </div>
//             </div>
            
//             {/* Live Total Preview */}
//             <div style={{ marginTop: 20, borderTop: "1px solid #eee", paddingTop: 16 }}>
//               <div style={{ maxWidth: 320, marginLeft: "auto" }}>
//                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", color: "#555", borderBottom: "1px solid #f0f0f0" }}>
//                   <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
//                 </div>
                
//                 {Object.entries(gstGroupedBySlab || {}).map(([rate, slabData]) => (
//                   <div key={rate}>
//                     {billForm.gstType === "cgst_sgst" ? (
//                       <>
//                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", color: "#666", borderBottom: "1px solid #f5f5f5" }}>
//                           <span>CGST @ {rate}%</span><span>₹{slabData.cgst.toFixed(2)}</span>
//                         </div>
//                         <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0", color: "#666", borderBottom: "1px solid #f5f5f5" }}>
//                           <span>SGST @ {rate}%</span><span>₹{slabData.sgst.toFixed(2)}</span>
//                         </div>
//                       </>
//                     ) : (
//                       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", color: "#555", borderBottom: "1px solid #f5f5f5" }}>
//                         <span>IGST @ {rate}%</span><span>₹{slabData.igst.toFixed(2)}</span>
//                       </div>
//                     )}
//                   </div>
//                 ))}
                
//                 {additionalAmt > 0 && (
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", color: "#555", borderBottom: "1px solid #f5f5f5" }}>
//                     <span>{billForm.additionalChargesLabel}</span><span>₹{additionalAmt.toFixed(2)}</span>
//                   </div>
//                 )}
                
//                 {discountAmt > 0 && (
//                   <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", color: "#555", borderBottom: "1px solid #f5f5f5" }}>
//                     <span>Discount</span><span>-₹{discountAmt.toFixed(2)}</span>
//                   </div>
//                 )}
                
//                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#1a1a1a", padding: "10px 0", marginTop: 4, borderTop: "2px solid #1a1a1a" }}>
//                   <span>TOTAL</span><span>₹{total.toFixed(2)}</span>
//                 </div>
                
//                 {parseFloat(billForm.receivedAmount) > 0 && (
//                   <>
//                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", marginTop: 4, color: "#555" }}>
//                       <span>Received</span><span>₹{parseFloat(billForm.receivedAmount).toFixed(2)}</span>
//                     </div>
//                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, padding: "5px 0", color: dueAmount > 0 ? "#dc2626" : "#16a34a" }}>
//                       <span>Due</span><span>₹{dueAmount.toFixed(2)}</span>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: 12 }}>
//             <button style={{ ...styles.btn("primary"), fontSize: 15, padding: "13px 32px" }} onClick={generateBill}>Generate Invoice →</button>
//             <button style={styles.btn()} onClick={() => setShowBillForm(false)}>Cancel</button>
//           </div>
//         </div>
//       )}

//       {/* ========== INVOICE PREVIEW ========== */}
//       {tab === "dashboard" && showInvoice && bill && (
//         <div style={styles.container}>
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//             <div style={{ display: "flex", gap: 12 }}>
//               <button style={styles.btn()} onClick={() => { setShowInvoice(false); }}>← Dashboard</button>
//               <button style={styles.btn()} onClick={() => { setShowInvoice(false); setShowBillForm(true); }}>Edit Invoice</button>
//             </div>
//             <button style={{ ...styles.btn("primary"), fontSize: 15, padding: "11px 28px" }} onClick={printInvoice}>🖨️ Print / Download PDF</button>
//           </div>
//           <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
//             <InvoiceView data={bill} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
