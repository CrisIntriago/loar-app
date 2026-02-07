-- ENUMS
create type categoria_enum as enum ('camiseta', 'crop_top', 'ranglan', 'oversize', 'polo', 'hoodie', 'buzo', 'boxer', 'pijama', 'almohada', 'taza');
-- Note: array enums can be complex, storing tecnicas as text[] is often easier but strict enum array works too.
create type tecnica_enum as enum ('dtf', 'bordado', 'sublimado', 'llano');
create type estado_pedido_enum as enum ('pendiente','pagado','en_produccion','entregado','cancelado');
create type accion_enum as enum ('creo_pedido','aprobo_pago','actualizo_stock','creo_producto', 'elimino', 'actualizo');
create type entidad_enum as enum ('pedido','producto');

-- 1. PRODUCTOS
create table public.productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  categoria categoria_enum not null,
  tecnicas text[] not null,      -- e.g. ['dtf','bordado']
  tallas text[] not null,        -- e.g. ['S','M']
  colores text[] not null,       -- e.g. ['Blanco','Negro']
  stock integer default 0,
  precio_base decimal(10,2) not null,
  activo boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PEDIDOS
create table public.pedidos (
  id uuid default gen_random_uuid() primary key,
  cliente_nombre text not null,
  cliente_whatsapp text not null,
  producto_id uuid references public.productos(id) not null,
  talla text not null,
  color text not null,
  tecnica text not null,
  cantidad integer default 1 check (cantidad > 0),
  total decimal(10,2) not null,
  estado estado_pedido_enum default 'pendiente',
  comprobante_url text, -- opcional
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HISTORIAL ACCIONES
create table public.historial_acciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id text not null, -- 'admin_id' or 'system' or 'public_user'
  accion text not null, -- using text to be flexible or use enum
  entidad_tipo text not null, -- 'pedido' or 'producto'
  entidad_id uuid,
  detalles jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CONFIGURACION WEBHOOK
create table public.configuracion_webhook (
  id uuid default gen_random_uuid() primary key,
  tipo text default 'nuevo_pedido',
  webhook_url text not null,
  activo boolean default true
);

-- ENABLE RLS
alter table public.productos enable row level security;
alter table public.pedidos enable row level security;
alter table public.historial_acciones enable row level security;
alter table public.configuracion_webhook enable row level security;

-- POLICIES (Simplified for development)
-- Productos
create policy "Public read products" on public.productos for select using (true);
create policy "Admin full access products" on public.productos for all using (true); -- Replace 'true' with auth check in production

-- Pedidos
create policy "Public insert orders" on public.pedidos for insert with check (true);
create policy "Admin read orders" on public.pedidos for select using (true); -- Replace 'true' with auth check
create policy "Admin update orders" on public.pedidos for update using (true);

-- Historial
create policy "Admin read history" on public.historial_acciones for select using (true);
create policy "System insert history" on public.historial_acciones for insert with check (true);

-- Webhook
create policy "Admin read/write webhook" on public.configuracion_webhook for all using (true);
