-- ==============================================================================
-- SETUP DO BANCO DE DADOS AQUARISMO PANUCCI — RELACIONAL COMPLETO
-- Copie e cole este código no SQL Editor do seu projeto Supabase e clique "Run".
-- Projeto: ltnkqxfrtvnmsmllebkq
-- ==============================================================================

-- ATENÇÃO: Este script APAGA e RECRIA as tabelas.
-- Se você já tem dados importantes, faça backup antes de rodar.

-- =============================================================
-- 0. LIMPA TABELAS EXISTENTES (ordem inversa das dependências)
-- =============================================================
DROP TABLE IF EXISTS public.product_collections CASCADE;
DROP TABLE IF EXISTS public.product_tags CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- =============================================================
-- 1. TABELA: categories
-- =============================================================
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- =============================================================
-- 2. TABELA: tags
-- =============================================================
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL UNIQUE
);

-- =============================================================
-- 3. TABELA: collections
-- =============================================================
CREATE TABLE public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- =============================================================
-- 4. TABELA: products (com FK para categories)
-- =============================================================
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_promo NUMERIC,
  stock INTEGER DEFAULT 0,
  "limit" INTEGER,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  
  -- Campos específicos de aquarismo
  size TEXT,
  ph TEXT,
  aggressiveness TEXT,
  color TEXT,
  
  -- Campos para equipamentos
  brand TEXT,
  filtration_type TEXT,
  capacity TEXT,
  
  -- Pagamento
  pix_key TEXT,
  payment_link TEXT
);

-- =============================================================
-- 5. TABELA: product_tags (junção N:N)
-- =============================================================
CREATE TABLE public.product_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(product_id, tag_id)
);

-- =============================================================
-- 6. TABELA: product_collections (junção N:N)
-- =============================================================
CREATE TABLE public.product_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  UNIQUE(product_id, collection_id)
);

-- =============================================================
-- 7. TABELA: customers
-- =============================================================
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT
);

-- =============================================================
-- 8. TABELA: orders
-- =============================================================
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL DEFAULT 0,
  tracking_code TEXT,
  notes TEXT
);

-- =============================================================
-- 9. TABELA: order_items
-- =============================================================
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  image_url TEXT
);

-- =============================================================
-- 10. TABELA: user_roles (controle de acesso)
-- =============================================================
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer'
);

-- =============================================================
-- 11. ÍNDICES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_product ON public.product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON public.product_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_product ON public.product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection ON public.product_collections(collection_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- =============================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_write" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags_write" ON public.tags FOR ALL USING (true) WITH CHECK (true);

-- Collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections_read" ON public.collections FOR SELECT USING (true);
CREATE POLICY "collections_write" ON public.collections FOR ALL USING (true) WITH CHECK (true);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_write" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Product Tags
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_tags_read" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "product_tags_write" ON public.product_tags FOR ALL USING (true) WITH CHECK (true);

-- Product Collections
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_collections_read" ON public.product_collections FOR SELECT USING (true);
CREATE POLICY "product_collections_write" ON public.product_collections FOR ALL USING (true) WITH CHECK (true);

-- Customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_read" ON public.customers FOR SELECT USING (true);
CREATE POLICY "customers_write" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_read" ON public.orders FOR SELECT USING (true);
CREATE POLICY "orders_write" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_read" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "order_items_write" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_read" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles_write" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);

-- =============================================================
-- 13. STORAGE BUCKET (Imagens)
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas do Storage
DROP POLICY IF EXISTS "Imagens Publicas" ON storage.objects;
DROP POLICY IF EXISTS "Upload de Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Gerenciar Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Deletar Imagens" ON storage.objects;

CREATE POLICY "Imagens Publicas"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

CREATE POLICY "Upload de Imagens"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' );

CREATE POLICY "Gerenciar Imagens"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' );

CREATE POLICY "Deletar Imagens"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' );

-- =============================================================
-- 14. SEED DATA — CATEGORIAS
-- =============================================================
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Jumbos', 'jumbos', 1),
  ('Peixes Marinhos Importados', 'marinhos-importados', 2),
  ('Peixes Marinhos Nacionais', 'marinhos-nacionais', 3),
  ('Primitivos', 'primitivos', 4),
  ('Ciclideos Africanos', 'ciclideos-africanos', 5),
  ('Amazonicos', 'amazonicos', 6),
  ('Cascudos', 'cascudos', 7),
  ('Poecilideos', 'poecilideos', 8),
  ('Bettas', 'bettas', 9),
  ('Variados', 'variados', 10),
  ('Equipamentos', 'equipamentos', 11),
  ('Aquários', 'aquarios', 12),
  ('Plantas', 'plantas', 13),
  ('Alimentos', 'alimentos', 14),
  ('Substratos', 'substratos', 15);

-- =============================================================
-- 15. SEED DATA — COLEÇÕES
-- =============================================================
INSERT INTO public.collections (name, description) VALUES
  ('Destaques da Semana', 'Espécies em promoção ou recém-chegadas'),
  ('Raridades', 'Peixes raros e difíceis de encontrar'),
  ('Monstros', 'Peixes de grande porte'),
  ('Iniciantes', 'Perfeitos para quem está começando'),
  ('Nano', 'Ideais para aquários pequenos'),
  ('Plantados', 'Compatíveis com aquários plantados');

-- =============================================================
-- 16. SEED DATA — TAGS DE EXEMPLO
-- =============================================================
INSERT INTO public.tags (name) VALUES
  ('Água Doce'),
  ('Água Salgada'),
  ('Predador'),
  ('Cardume'),
  ('Fundo'),
  ('Noturno');

-- =============================================================
-- 17. SEED DATA — ADMIN USER
-- =============================================================
INSERT INTO public.user_roles (email, role) VALUES
  ('jhonathan@panucci.com', 'admin');

-- =============================================================
-- 18. SEED DATA — PRODUTOS DE EXEMPLO
-- =============================================================
DO $$
DECLARE
  cat_jumbos UUID;
  cat_primitivos UUID;
  cat_equipamentos UUID;
BEGIN
  SELECT id INTO cat_jumbos FROM public.categories WHERE slug = 'jumbos';
  SELECT id INTO cat_primitivos FROM public.categories WHERE slug = 'primitivos';
  SELECT id INTO cat_equipamentos FROM public.categories WHERE slug = 'equipamentos';

  INSERT INTO public.products (name, description, price, stock, category_id, size, aggressiveness, ph, pix_key, image_url)
  VALUES 
  (
    'Aruanã Prateada (Osteoglossum bicirrhosum)',
    'Peixe majestoso da bacia amazônica. Possui escamas grandes e um nado elegante. Requer aquários de grande porte com tampas reforçadas.',
    850.00, 3, cat_jumbos, '20cm - 25cm', 'Semi-agressivo', '6.0 - 7.0', '11973828507',
    'https://i.postimg.cc/brDgBVTJ/Logo-Panucci.png'
  ),
  (
    'Arraia Motoro (Potamotrygon motoro)',
    'Arraia de água doce muito resistente e ativa. Padrão de cores deslumbrante com ocelos marcantes.',
    1200.00, 2, cat_primitivos, 'Disco 15cm', 'Pacífico', '6.5 - 7.5', '11973828507',
    'https://i.postimg.cc/brDgBVTJ/Logo-Panucci.png'
  ),
  (
    'Filtro Canister Premium 2000L/H',
    'Filtro externo de alta performance com esterilizador UV integrado. Extremamente silencioso.',
    1450.00, 5, cat_equipamentos, 'N/A', 'N/A', 'N/A', '11973828507',
    'https://i.postimg.cc/brDgBVTJ/Logo-Panucci.png'
  );
END $$;

-- ==============================================================================
-- PRONTO! Seu banco de dados relacional está configurado.
-- ==============================================================================
