import { useState } from "react";

export default function AuthScreen({ onSignInGoogle, onSignInEmail, onSignUpEmail, onForgotPassword }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEmailAuth = async () => {
    if (!email || !password) return setError("Email and password required");
    setLoading(true); setError(""); setMessage("");
    try {
      if (mode === "signin") {
        await onSignInEmail(email, password);
      } else {
        await onSignUpEmail(email, password);
        setMessage("Check your email to confirm your account!");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

    const handleGoogle = async () => {
        setLoading(true);
        setError("");

        try {
            await onSignInGoogle();
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

//   const onForgotPassword = async (email) => {
//     const { error } = await supabase.auth.resetPasswordForEmail(email);

//     if (error) throw error;
//     };

  const handleForgotPassword = async () => {
    if (!email) {
        return setError("Please enter your email first");
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
        await onForgotPassword(email);
        setMessage("Password reset email sent!");
    } catch (e) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
    };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #eee", padding: "40px 44px", width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 4 }}>📄 INVOXA</div>
        <div style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>GST Invoicing for Indian Businesses</div>

        {/* Google Sign-in */}
        <button onClick={handleGoogle} disabled={loading}
          style={{ width: "100%", padding: "11px 0", border: "1.5px solid #ddd", borderRadius: 10, background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, color: "#333" }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
          <span style={{ fontSize: 12, color: "#bbb" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#eee" }} />
        </div>

        {/* Email / Password */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: 5 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="you@business.com" onKeyDown={e => e.key === "Enter" && handleEmailAuth()} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: 5 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }}
            placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleEmailAuth()} />
        </div>
        <div style={{ textAlign: "right", marginBottom: 18 }}>
            <button
                onClick={handleForgotPassword}
                disabled={loading}
                style={{
                background: "none",
                border: "none",
                color: "#666",
                fontSize: 13,
                cursor: "pointer",
                padding: 0
                }}
            >
                Forgot Password?
            </button>
        </div>
        {error && <div style={{ fontSize: 13, color: "#dc2626", background: "#fee2e2", padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>{error}</div>}
        {message && <div style={{ fontSize: 13, color: "#15803d", background: "#dcfce7", padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>{message}</div>}

        <button onClick={handleEmailAuth} disabled={loading}
          style={{ width: "100%", padding: "11px 0", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888" }}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}
            style={{ background: "none", border: "none", color: "#1a1a1a", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}