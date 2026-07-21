-- supabase/schema.sql
-- Database Schema for Foody App

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. ADDRESSES TABLE
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null, -- 'Home', 'Work', 'Other'
  address_line text not null,
  city text not null,
  pincode text not null,
  lat double precision,
  lng double precision,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Addresses
alter table public.addresses enable row level security;

-- Addresses Policies
create policy "Users can view their own addresses" on public.addresses
  for select using (auth.uid() = user_id);

create policy "Users can insert their own addresses" on public.addresses
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own addresses" on public.addresses
  for update using (auth.uid() = user_id);

create policy "Users can delete their own addresses" on public.addresses
  for delete using (auth.uid() = user_id);

-- 3. CATEGORIES TABLE
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Categories
alter table public.categories enable row level security;

-- Categories Policies
create policy "Categories are publicly readable" on public.categories
  for select using (true);

-- 4. RESTAURANTS TABLE
create table public.restaurants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text,
  cuisine_tags text[] not null,
  rating double precision default 0.0,
  reviews_count integer default 0,
  delivery_time_mins integer not null,
  delivery_fee double precision default 0.0,
  cost_for_two double precision not null,
  address text,
  opening_hours text,
  lat double precision,
  lng double precision,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Restaurants
alter table public.restaurants enable row level security;

-- Restaurants Policies
create policy "Restaurants are publicly readable" on public.restaurants
  for select using (true);

-- 5. MENU ITEMS TABLE
create table public.menu_items (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price double precision not null,
  image_url text,
  is_veg boolean default true,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Menu Items
alter table public.menu_items enable row level security;

-- Menu Items Policies
create policy "Menu items are publicly readable" on public.menu_items
  for select using (true);

-- 6. ORDERS TABLE
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  status text default 'Placed' not null, -- 'Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'
  subtotal_amount double precision not null,
  delivery_fee double precision not null,
  tax_amount double precision not null,
  discount_amount double precision default 0.0,
  total_amount double precision not null,
  delivery_address_id uuid references public.addresses(id) on delete set null,
  payment_method text not null, -- 'UPI', 'Card', 'COD'
  payment_status text default 'Pending' not null, -- 'Pending', 'Paid', 'Failed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Orders
alter table public.orders enable row level security;

-- Orders Policies
create policy "Users can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Users can place their own orders" on public.orders
  for insert with check (auth.uid() = user_id);

-- 7. ORDER ITEMS TABLE
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete cascade not null,
  quantity integer not null,
  price double precision not null
);

-- Enable RLS on Order Items
alter table public.order_items enable row level security;

-- Order Items Policies
create policy "Users can view order items for their own orders" on public.order_items
  for select using (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert order items for their own orders" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders 
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- 8. FAVORITES TABLE
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, restaurant_id)
);

-- Enable RLS on Favorites
alter table public.favorites enable row level security;

-- Favorites Policies
create policy "Users can view their own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can add favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- 9. REVIEWS TABLE
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Reviews
alter table public.reviews enable row level security;

-- Reviews Policies
create policy "Reviews are publicly readable" on public.reviews
  for select using (true);

create policy "Users can insert their own reviews" on public.reviews
  for insert with check (auth.uid() = user_id);

-- 10. CART ITEMS TABLE
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  menu_item_id uuid references public.menu_items(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, menu_item_id)
);

-- Enable RLS on Cart Items
alter table public.cart_items enable row level security;

-- Cart Items Policies
create policy "Users can view their own cart items" on public.cart_items
  for select using (auth.uid() = user_id);

create policy "Users can manage their own cart items" on public.cart_items
  for all using (auth.uid() = user_id);

-- 11. PROMO CODES TABLE
create table public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  description text,
  discount_type text not null, -- 'Percentage', 'Flat'
  discount_value double precision not null,
  min_order_amount double precision default 0.0,
  max_discount_amount double precision,
  expiry_date timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Promo Codes
alter table public.promo_codes enable row level security;

-- Promo Codes Policies
create policy "Promo codes are publicly readable" on public.promo_codes
  for select using (true);


-- 12. POSTGRES TRIGGER FOR AUTO-CREATING USER PROFILES
-- When a user signs up via Supabase Auth, this function will automatically
-- insert a matching row in the public.profiles table.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Foody User'),
    new.email,
    new.phone,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run handle_new_user() after a row is inserted in auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 13. SEED DATA SCRIPTS
-- Insert sample promo codes
insert into public.promo_codes (code, description, discount_type, discount_value, min_order_amount, max_discount_amount)
values 
('SAVE20', 'Get 20% off on your order, up to $10', 'Percentage', 20.0, 15.0, 10.0),
('FOODY50', 'Get 50% off on your first order, up to $15', 'Percentage', 50.0, 10.0, 15.0),
('FLAT5', 'Get a flat $5 off on orders above $20', 'Flat', 5.0, 20.0, 5.0);
