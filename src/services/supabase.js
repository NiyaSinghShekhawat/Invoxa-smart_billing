import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;


// ─────────────────────────────────────────────────────────────
//  DROP YOUR SUPABASE CREDENTIALS HERE
//  Get them from: https://supabase.com/dashboard → Project Settings → API
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = VITE_SUPABASE_URL ;
const SUPABASE_ANON_KEY = VITE_SUPABASE_ANON_KEY ;
// ─────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
