import { useState } from "react";
import { supabase } from "../services/supabase.js";
import { INDIAN_STATES } from "../utils/constants";
import { s } from "./styles";

export default function SettingsPanel({ settings, onSave }) {
  const [draft, setDraft] = useState({ ...settings });
  const [activeSection, setActiveSection] = useState("business");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  const handleStateChange = (stateName) => {
    const found = INDIAN_STATES.find(st => st.name === stateName);
    setDraft(d => ({ ...d, state: stateName, stateCode: found ? found.code : "" }));
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set("logo", ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(draft);
    alert("✅ Settings saved successfully!");
  };
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
        return alert("Please fill all password fields");
    }

    if (newPassword !== confirmPassword) {
        return alert("Passwords do not match");
    }

    if (newPassword.length < 6) {
        return alert("Password must be at least 6 characters");
    }

    try {
        setPasswordLoading(true);

        const { error } = await supabase.auth.updateUser({
        password: newPassword,
        });

        if (error) throw error;

        alert("✅ Password updated successfully!");

        setNewPassword("");
        setConfirmPassword("");

    } catch (e) {
        alert(e.message);
    } finally {
        setPasswordLoading(false);
    }
    };

  const tabs = [
    { key: "business", label: "Business Info" },
    { key: "bank", label: "Bank Details" },
    { key: "terms", label: "Terms & Invoice" },
    { key: "security", label: "Security" },
    ];

  return (
    <div style={s.container}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={s.pageTitle}>Settings</h2>
        <button style={s.btnPrimary} onClick={handleSave}>💾 Save All Changes</button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f0efeb", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveSection(t.key)}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: activeSection === t.key ? "#fff" : "transparent",
              color: activeSection === t.key ? "#1a1a1a" : "#888",
              boxShadow: activeSection === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Business Info ── */}
      {activeSection === "business" && (
        <div style={s.card}>
          <div style={s.cardTitle}>Business Information</div>
          <div style={s.grid2}>
            <Field label="Business Name *" value={draft.businessName} onChange={v => set("businessName", v)} placeholder="Your Business Name" />
            <Field label="Owner / Manager Name" value={draft.ownerName} onChange={v => set("ownerName", v)} placeholder="Full Name" />
            <Field label="GSTIN" value={draft.gstin} onChange={v => set("gstin", v.toUpperCase())} placeholder="27AABCU9603R1ZX" mono />
            <Field label="Phone Number" value={draft.phone} onChange={v => set("phone", v)} placeholder="+91 98765 43210" />
            <Field label="Email Address" value={draft.email} onChange={v => set("email", v)} placeholder="you@business.com" type="email" />
            <Field label="Pincode" value={draft.pincode} onChange={v => set("pincode", v)} placeholder="302001" />
          </div>
          <div style={{ marginTop: 16 }}>
            <Field label="Full Business Address" value={draft.address} onChange={v => set("address", v)} placeholder="Street, Area, City" multiline />
          </div>
          <div style={{ ...s.grid2, marginTop: 16 }}>
            <div>
              <label style={s.label}>State</label>
              <select style={s.input} value={draft.state} onChange={e => handleStateChange(e.target.value)}>
                {INDIAN_STATES.map(st => <option key={st.code}>{st.name}</option>)}
              </select>
            </div>
            <Field label="State Code" value={draft.stateCode} onChange={v => set("stateCode", v)} placeholder="08" />
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #eee" }}>
            <label style={s.label}>Company Logo</label>
            <input type="file" accept="image/*" onChange={handleLogo} style={{ marginBottom: 12, display: "block" }} />
            {draft.logo && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <img src={draft.logo} alt="logo" style={{ width: 80, height: 80, objectFit: "contain", border: "1px solid #eee", borderRadius: 10, padding: 6, background: "#fafafa" }} />
                <div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Logo appears in invoice header and as background watermark</div>
                  <button style={s.btnDanger} onClick={() => set("logo", null)}>Remove Logo</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bank Details ── */}
      {activeSection === "bank" && (
        <div style={s.card}>
          <div style={s.cardTitle}>Bank & Payment Details</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>These details appear in the "Pay To" section of every invoice.</div>
          <div style={s.grid2}>
            <Field label="Bank Name" value={draft.bankName} onChange={v => set("bankName", v)} placeholder="State Bank of India" />
            <Field label="Account Holder Name" value={draft.accountHolder} onChange={v => set("accountHolder", v)} placeholder="Business Legal Name" />
            <Field label="Account Number" value={draft.accountNumber} onChange={v => set("accountNumber", v)} placeholder="XXXXXXXXXXXX" mono />
            <Field label="IFSC Code" value={draft.ifscCode} onChange={v => set("ifscCode", v.toUpperCase())} placeholder="SBIN0001234" mono />
            <Field label="UPI ID" value={draft.upiId} onChange={v => set("upiId", v)} placeholder="yourbusiness@upi" />
            <Field label="Branch Name (optional)" value={draft.branchName} onChange={v => set("branchName", v)} placeholder="Main Branch, City" />
          </div>
          {(draft.bankName || draft.upiId) && (
            <div style={{ marginTop: 20, padding: "14px 18px", background: "#f8f7f4", borderRadius: 10, border: "1px solid #eee" }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Preview — Pay To Section</div>
              {draft.bankName && <div style={{ fontSize: 13, color: "#333", lineHeight: 1.8 }}>
                <b>{draft.accountHolder || draft.businessName}</b><br />
                Bank: {draft.bankName}{draft.branchName ? ` — ${draft.branchName}` : ""}<br />
                A/C: <span style={{ fontFamily: "monospace" }}>{draft.accountNumber}</span><br />
                IFSC: <span style={{ fontFamily: "monospace" }}>{draft.ifscCode}</span>
              </div>}
              {draft.upiId && <div style={{ fontSize: 13, color: "#333", marginTop: 8 }}>UPI: <b>{draft.upiId}</b></div>}
            </div>
          )}
        </div>
      )}

      {/* ── Terms ── */}
      {activeSection === "terms" && (
        <div style={s.card}>
          <div style={s.cardTitle}>Terms & Conditions</div>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Appears in the footer of every invoice.</div>
          <textarea style={{ ...s.input, resize: "vertical", minHeight: 160, fontFamily: "inherit" }}
            value={draft.terms} onChange={e => set("terms", e.target.value)} />
        </div>
      )}
        {/* ── Security ── */}
        {activeSection === "security" && (
        <div style={s.card}>
            <div style={s.cardTitle}>Security Settings</div>

            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
            Change your account password securely.
            </div>

            <div style={s.grid2}>
            <Field
                label="New Password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter new password"
            />

            <Field
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
            />
            </div>

            <div style={{ marginTop: 20 }}>
            <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                style={s.btnPrimary}
            >
                {passwordLoading ? "Updating..." : "Update Password"}
            </button>
            </div>
        </div>
        )}

      
    </div>
  );
}

// ── Reusable Field ──
function Field({ label, value, onChange, placeholder, type = "text", multiline, mono }) {
  const { s: _, ...rest } = {};
  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8,
    fontSize: 14, outline: "none", background: "#fafafa", color: "#1a1a1a",
    boxSizing: "border-box", fontFamily: mono ? "monospace" : "inherit",
  };
  return (
    <div>
      <label style={{ fontSize: 11, color: "#666", marginBottom: 5, display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px" }}>{label}</label>
      {multiline
        ? <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  );
}