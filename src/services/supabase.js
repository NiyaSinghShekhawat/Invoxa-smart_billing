import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
//  DROP YOUR SUPABASE CREDENTIALS HERE
//  Get them from: https://supabase.com/dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = "YOUR PROJECT URL";
const SUPABASE_ANON_KEY = "YOUR ANON KEY";
// ─────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
