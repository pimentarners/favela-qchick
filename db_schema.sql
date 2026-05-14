-- =============================================================
-- FAVELA +Q CHICK - Schema Supabase
-- Execute este SQL no SQL Editor do Supabase
-- =============================================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- CATEGORIAS
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT,
  description TEXT,
  sort_order INT DEFAULT 0
);

-- Categorias iniciais de streetwear
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Camisetas', 'camisetas', 1),
  ('Calcas', 'calcas', 2),
  ('Blusas', 'blusas', 3),
  ('Tenis', 'tenis', 4),
  ('Acessorios', 'acessorios', 5),
  ('Bones & Gorros', 'bones-gorros', 6),
  ('Conjuntos', 'conjuntos', 7),
  ('Jaquetas', 'jaquetas', 8)
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- TAGS
-- =============================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE
);

-- =============================================================
-- COLECOES
-- =============================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Colecoes iniciais
INSERT INTO collections (name) VALUES
  ('Destaques da Semana'),
  ('Edicao Limitada'),
  ('Lancamentos'),
  ('Promocoes'),
  ('Collab'),
  ('Essentials')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- PRODUTOS
-- =============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_promo DECIMAL(10,2),
  stock INT DEFAULT 0,
  "limit" INT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT DEFAULT '',
  
  -- Campos de moda/streetwear
  size TEXT,
  color TEXT,
  brand TEXT,
  material TEXT,
  
  -- Pagamento
  pix_key TEXT,
  payment_link TEXT
);

-- =============================================================
-- TABELAS DE JUNCAO (Many-to-Many)
-- =============================================================

CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS product_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  UNIQUE(product_id, collection_id)
);

-- =============================================================
-- CLIENTES
-- =============================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
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
-- PEDIDOS
-- =============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) DEFAULT 0,
  tracking_code TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  image_url TEXT
);

-- =============================================================
-- STORAGE BUCKET (Criar manualmente no Supabase Dashboard)
-- =============================================================
-- 1. Va em Storage > New Bucket
-- 2. Nome: "products"
-- 3. Marque como "Public"
-- 4. Adicione policy: Allow public read (SELECT) para authenticated e anon
-- 5. Adicione policy: Allow upload (INSERT) para authenticated e anon

-- =============================================================
-- RLS (Row Level Security) - Permitir acesso publico para leitura
-- =============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies de leitura publica
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_tags" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Public read product_collections" ON product_collections FOR SELECT USING (true);

-- Policies de escrita (anon pode escrever - para o admin funcionar sem auth)
CREATE POLICY "Anon write categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write tags" ON tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write collections" ON collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write product_tags" ON product_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write product_collections" ON product_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
