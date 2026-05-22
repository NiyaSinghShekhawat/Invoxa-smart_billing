import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
//  DROP YOUR SUPABASE CREDENTIALS HERE
//  Get them from: https://supabase.com/dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://yxgllkgliqnnaxlopmie.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4Z2xsa2dsaXFubmF4bG9wbWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODcwMjUsImV4cCI6MjA5NDY2MzAyNX0.0x089K_bSgLe2thUxQbuGNUUJeu09a0npGnlglr7Je8";


// ─────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);