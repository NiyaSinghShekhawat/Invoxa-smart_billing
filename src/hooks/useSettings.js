import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";
import { DEFAULT_SETTINGS } from "../utils/constants";

// ── camelCase ↔ snake_case mappers ──────────────────────────────────────────

function toDb(s, userId) {
  return {
    user_id:           userId,
    business_name:     s.businessName,
    owner_name:        s.ownerName,
    gstin:             s.gstin,
    phone:             s.phone,
    email:             s.email,
    address:           s.address,
    state:             s.state,
    state_code:        s.stateCode,
    pincode:           s.pincode,
    logo_url:          s.logo || "",
    terms:             s.terms,
    bank_name:         s.bankName,
    account_holder:    s.accountHolder,
    account_number:    s.accountNumber,
    ifsc_code:         s.ifscCode,
    upi_id:            s.upiId,
    branch_name:       s.branchName,
  };
}

function fromDb(row) {
  return {
    businessName:   row.business_name   ?? "",
    ownerName:      row.owner_name      ?? "",
    gstin:          row.gstin           ?? "",
    phone:          row.phone           ?? "",
    email:          row.email           ?? "",
    address:        row.address         ?? "",
    state:          row.state           ?? "Rajasthan",
    stateCode:      row.state_code      ?? "08",
    pincode:        row.pincode         ?? "",
    logo:           row.logo_url        ?? null,
    terms:          row.terms           ?? DEFAULT_SETTINGS.terms,
    bankName:       row.bank_name       ?? "",
    accountHolder:  row.account_holder  ?? "",
    accountNumber:  row.account_number  ?? "",
    ifscCode:       row.ifsc_code       ?? "",
    upiId:          row.upi_id          ?? "",
    branchName:     row.branch_name     ?? "",
  };
}

// ────────────────────────────────────────────────────────────────────────────

export function useSettings(userId) {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load on mount
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();  // returns null instead of error if no row yet

      if (error) { setError(error.message); }
      else if (data) { setSettings(fromDb(data)); }
      setLoading(false);
    })();
  }, [userId]);

  // Upsert on save
  const saveSettings = useCallback(async (newSettings) => {
    if (!userId) return;
    const { error } = await supabase
      .from("settings")
      .upsert(toDb(newSettings, userId), { onConflict: "user_id" });

    if (error) throw new Error(error.message);
    setSettings(newSettings);
  }, [userId]);

  // Logo upload to Supabase Storage → returns public URL
  const uploadLogo = useCallback(async (file) => {
    if (!userId) throw new Error("Not authenticated");
    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from("logos").getPublicUrl(path);
    return data.publicUrl;
  }, [userId]);

  return { settings, loading, error, saveSettings, uploadLogo };
}