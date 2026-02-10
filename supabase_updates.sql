-- SQL updates for LOAR enhancements

-- 1. Add wholesale pricing columns to productos (Backward compatibility or if user wants simple)
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS precio_mayorista numeric,
ADD COLUMN IF NOT EXISTS cantidad_mayorista integer DEFAULT 6;

-- 2. Add design url to pedidos
ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS diseno_url text;

-- 3. Create storage bucket for designs if not exists
insert into storage.buckets (id, name, public)
values ('disenos', 'disenos', true)
on conflict (id) do nothing;

-- 4. Tiered Pricing Table
CREATE TABLE IF NOT EXISTS producto_precios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id uuid REFERENCES productos(id) ON DELETE CASCADE,
  cantidad_minima integer NOT NULL,
  cantidad_maxima integer, -- null means "and up"
  precio_unitario numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. RLS Policies (Simplified for development)
ALTER TABLE producto_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Precios" ON producto_precios
  FOR SELECT USING (true);

CREATE POLICY "Admin All Precios" ON producto_precios
  FOR ALL USING (true); -- Ideally restrict to admin role
