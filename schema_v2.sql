-- ESTRUCTURA DE BASE DE DATOS - LOAR V2
-- Basado en requerimiento del usuario (10/02/2026)

-- 1. PRODUCTOS
-- Representa el modelo base, ej: "Camiseta Oversize"
create table if not exists productos (
  id uuid default gen_random_uuid() primary key,
  sku text, -- opcional, para referencia base
  nombre text not null,
  categoria text not null, -- 'camiseta', 'hoodie', etc
  descripcion text,
  imagen_url text, -- imagen principal del producto
  tallas text[] default '{}', -- ["S", "M", "L"]
  colores text[] default '{}', -- ["Blanco", "Negro"]
  tecnicas text[] default '{}', -- ["DTF", "Bordado"]
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. VARIANTES
-- Combinación específica de Talla + Color + Técnica (+ opcional tamaño diseño)
create table if not exists variantes (
  id uuid default gen_random_uuid() primary key,
  producto_id uuid references productos(id) on delete cascade not null,
  sku text, -- sku especifico de la variante
  tecnica text not null,
  talla text not null,
  color text not null,
  tamano_diseno text, -- 'Normal', 'Pequeño', 'Grande', 'Sin diseño'
  stock integer default 0 not null,
  precios jsonb default '[]'::jsonb not null, -- Estructura: [{ "min": 1, "max": 12, "precio": 10.50 }, ...]
  activo boolean default true,
  created_at timestamptz default now()
);

-- Indice unico para evitar duplicados lógicos (opcional, pero recomendado)
create unique index if not exists idx_variantes_unique 
on variantes (producto_id, tecnica, talla, color, coalesce(tamano_diseno, ''));

-- 3. PEDIDOS
create table if not exists pedidos (
  id uuid default gen_random_uuid() primary key,
  cliente_nombre text not null,
  cliente_whatsapp text not null,
  variante_id uuid references variantes(id) not null,
  cantidad integer not null check (cantidad > 0),
  precio_unitario numeric not null,
  total numeric not null,
  disenos jsonb default '[]'::jsonb, -- [{ "url": "...", "posicion": "Pecho", "tamano": "Normal" }]
  estado text default 'pendiente' check (estado in ('pendiente', 'pagado', 'en_produccion', 'entregado', 'cancelado')),
  comprobante_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. HISTORIAL DE ACCIONES (Auditoría)
create table if not exists historial_acciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id text not null, -- 'admin' o id de auth
  accion text not null, -- 'creo_pedido', 'actualizo_stock', etc
  entidad_tipo text not null, -- 'pedido', 'producto', 'variante'
  entidad_id uuid,
  detalles jsonb,
  created_at timestamptz default now()
);

-- 5. BUCKETS STORAGE (Comandos referencia, ejecutar en dashboard de Supabase si no existen)
-- insert into storage.buckets (id, name, public) values ('productos', 'productos', true);
-- insert into storage.buckets (id, name, public) values ('disenos', 'disenos', false);

-- 6. RLS Policies (Ejemplos básicos)
alter table productos enable row level security;
create policy "Public Read Productos" on productos for select using (activo = true);
create policy "Admin All Productos" on productos for all using (true); -- Ajustar rol

alter table variantes enable row level security;
create policy "Public Read Variantes" on variantes for select using (activo = true);
create policy "Admin All Variantes" on variantes for all using (true);

alter table pedidos enable row level security;
create policy "Admin All Pedidos" on pedidos for all using (true);
create policy "Public Create Pedidos" on pedidos for insert with check (true);
