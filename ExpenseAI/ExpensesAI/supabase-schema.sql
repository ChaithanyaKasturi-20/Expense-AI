-- Supabase schema for ExpenseAI

-- Profiles table for user metadata
create table if not exists public.profiles (
  id uuid primary key default auth.uid(),
  full_name text,
  monthly_budget numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Expenses table for user-specific transactions
create table if not exists public.expenses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  category text not null,
  date timestamptz not null default now(),
  is_impulse boolean not null default false,
  source text not null default 'MANUAL',
  is_recurring boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Budget rules for categories
create table if not exists public.budgets (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  limit_amount numeric not null,
  period text not null default 'monthly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Savings goals for users
create table if not exists public.savings_goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Detected recurring subscriptions
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  merchant text,
  amount numeric not null,
  frequency text not null default 'monthly',
  next_payment_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- AI-driven insights history
create table if not exists public.ai_insights (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  insights jsonb not null,
  summary jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uploaded statements log
create table if not exists public.uploaded_statements (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text,
  file_type text,
  parsed jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Common trigger for updated_at
create function if not exists public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger if not exists trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger if not exists trg_expenses_set_updated_at
before update on public.expenses
for each row
execute function public.set_updated_at();

-- Enable row-level security
alter table if exists public.profiles enable row level security;
alter table if exists public.expenses enable row level security;

-- Profiles policies
drop policy if exists "Profiles can read own row" on public.profiles;
create policy "Profiles can read own row" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles can insert own row" on public.profiles;
create policy "Profiles can insert own row" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Profiles can update own row" on public.profiles;
create policy "Profiles can update own row" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Profiles can delete own row" on public.profiles;
create policy "Profiles can delete own row" on public.profiles
  for delete using (auth.uid() = id);

-- Expenses policies
drop policy if exists "Expenses can read own rows" on public.expenses;
create policy "Expenses can read own rows" on public.expenses
  for select using (auth.uid() = user_id);

drop policy if exists "Expenses can insert own rows" on public.expenses;
create policy "Expenses can insert own rows" on public.expenses
  for insert with check (auth.uid() = user_id);

drop policy if exists "Expenses can update own rows" on public.expenses;
create policy "Expenses can update own rows" on public.expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Expenses can delete own rows" on public.expenses;
create policy "Expenses can delete own rows" on public.expenses
  for delete using (auth.uid() = user_id);

-- Grants for authenticated role
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;

-- Indexes for common filters
create index if not exists idx_expenses_user_id_date on public.expenses (user_id, date desc);
create index if not exists idx_expenses_user_id_category on public.expenses (user_id, category);
