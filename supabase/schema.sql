-- ================================================================
--  INVOXA — Supabase Schema
--  Run this entire file in:
--  Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";


-- ────────────────────────────────────────────────────────────────
--  TABLE: settings
--  One row per user. Stores business info + bank details.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.settings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null unique,

  -- Business info
  business_name    text default '',
  owner_name       text default '',
  gstin            text default '',
  phone            text default '',
  email            text default '',
  address          text default '',
  state            text default '',
  state_code       text default '',
  pincode          text default '',
  logo_url         text default '',        -- Supabase Storage URL
  terms            text default '',

  -- Bank details
  bank_name        text default '',
  account_holder   text default '',
  account_number   text default '',
  ifsc_code        text default '',
  upi_id           text default '',
  branch_name      text default '',

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.handle_updated_at();


-- ────────────────────────────────────────────────────────────────
--  TABLE: stock
--  Products/inventory with per-product GST.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.stock (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references auth.users(id) on delete cascade not null,

  name              text not null,
  company           text default '',
  hsn_code          text default '',
  cost_price        numeric(12, 2) default 0,
  selling_price     numeric(12, 2) not null,
  gst_pct           numeric(5, 2) default 18,   -- e.g. 5, 12, 18, 28
  taxable           boolean default true,
  quantity          integer,                      -- null = unlimited
  date_of_purchase  date,

  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create trigger stock_updated_at
  before update on public.stock
  for each row execute function public.handle_updated_at();

create index stock_user_id_idx on public.stock(user_id);


-- ────────────────────────────────────────────────────────────────
--  TABLE: invoices
--  Invoice header — one row per invoice.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade not null,

  invoice_number        text not null,
  invoice_date          date not null,
  due_date              date,
  place_of_supply       text default '',
  payment_method        text default 'Cash',
  gst_mode              text default 'CGST_SGST',  -- 'CGST_SGST' | 'IGST'

  -- Buyer
  buyer_name            text not null,
  buyer_phone           text default '',
  buyer_gstin           text default '',
  buyer_address         text default '',
  buyer_state           text default '',
  buyer_state_code      text default '',

  -- Adjustments
  additional_charges    numeric(12, 2) default 0,
  additional_charges_label text default 'Delivery Charges',
  discount              numeric(12, 2) default 0,

  -- Calculated totals (stored for history display, no recalc needed)
  subtotal              numeric(12, 2) default 0,
  total_gst             numeric(12, 2) default 0,
  total_amount          numeric(12, 2) default 0,
  received_amount       numeric(12, 2) default 0,
  due_amount            numeric(12, 2) default 0,

  notes                 text default '',
  status                text default 'unpaid',  -- 'paid' | 'unpaid' | 'partial'

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create trigger invoices_updated_at
  before update on public.invoices
  for each row execute function public.handle_updated_at();

create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_invoice_number_idx on public.invoices(user_id, invoice_number);


-- ────────────────────────────────────────────────────────────────
--  TABLE: invoice_items
--  Line items for each invoice.
-- ────────────────────────────────────────────────────────────────
create table if not exists public.invoice_items (
  id            uuid primary key default uuid_generate_v4(),
  invoice_id    uuid references public.invoices(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,

  product_id    uuid references public.stock(id) on delete set null,  -- nullable (custom item)
  name          text not null,
  company       text default '',
  hsn_code      text default '',
  qty           numeric(10, 3) not null,
  rate          numeric(12, 2) not null,
  gst_pct       numeric(5, 2) default 0,
  taxable       boolean default true,

  -- Calculated (stored for immutability — tax rates may change later)
  subtotal      numeric(12, 2) default 0,
  gst_amount    numeric(12, 2) default 0,
  cgst          numeric(12, 2) default 0,
  sgst          numeric(12, 2) default 0,
  igst          numeric(12, 2) default 0,
  total         numeric(12, 2) default 0,

  sort_order    integer default 0,
  created_at    timestamptz default now()
);

create index invoice_items_invoice_id_idx on public.invoice_items(invoice_id);


-- ────────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
--  Each user can only access their own data.
-- ────────────────────────────────────────────────────────────────
alter table public.settings      enable row level security;
alter table public.stock         enable row level security;
alter table public.invoices      enable row level security;
alter table public.invoice_items enable row level security;

-- Settings policies
create policy "users can manage own settings"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stock policies
create policy "users can manage own stock"
  on public.stock for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Invoice policies
create policy "users can manage own invoices"
  on public.invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Invoice items policies
create policy "users can manage own invoice items"
  on public.invoice_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────
--  STORAGE BUCKET: logos
--  For business logo uploads.
-- ────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict do nothing;

create policy "users can upload own logo"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "logos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "users can update own logo"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users can delete own logo"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);


-- ================================================================
--  DONE. Your schema is ready.
--  Next: add your Supabase URL + anon key to src/services/supabase.js
-- ================================================================