-- ==========================================
-- AQUARISMO PANUCCI - SETUP SUPABASE RELACIONAL
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. LIMPEZA (Cuidado: Isso apaga os dados existentes nestas tabelas)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.product_tags CASCADE;
DROP TABLE IF EXISTS public.product_collections CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- ==========================================
-- 3. CRIAÇÃO DAS TABELAS
-- ==========================================

-- Categorias
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Tags
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL UNIQUE
);

-- Coleções (ex: Destaques da Semana, Raridades)
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Produtos
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    price_promo DECIMAL(10,2),
    stock INTEGER NOT NULL DEFAULT 0,
    limit_per_user INTEGER,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    
    -- Específicos de Aquarismo
    size TEXT,
    ph TEXT,
    aggressiveness TEXT,
    color TEXT,
    
    -- Equipamentos
    brand TEXT,
    filtration_type TEXT,
    capacity TEXT,
    
    -- Pagamento
    pix_key TEXT,
    payment_link TEXT
);

-- Relacionamento Produto <-> Tags (N:N)
CREATE TABLE public.product_tags (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- Relacionamento Produto <-> Coleções (N:N)
CREATE TABLE public.product_collections (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, collection_id)
);

-- Clientes
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    document TEXT UNIQUE -- CPF/CNPJ
);

-- Pedidos
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    shipping_address TEXT,
    tracking_code TEXT
);

-- Itens do Pedido
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Controle de Acesso (Admins)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Referência à tabela auth.users do Supabase
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (Catálogo)
CREATE POLICY "categories_read_public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "tags_read_public" ON public.tags FOR SELECT USING (true);
CREATE POLICY "collections_read_public" ON public.collections FOR SELECT USING (true);
CREATE POLICY "products_read_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "product_tags_read_public" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "product_collections_read_public" ON public.product_collections FOR SELECT USING (true);

-- Políticas de Escrita (Atualmente abertas para facilitar a migração - Recomendado restringir por auth.uid() em produção)
CREATE POLICY "categories_write" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tags_write" ON public.tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "collections_write" ON public.collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "products_write" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "product_tags_write" ON public.product_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "product_collections_write" ON public.product_collections FOR ALL USING (true) WITH CHECK (true);

-- Clientes e Pedidos (Para que a loja funcione)
CREATE POLICY "customers_read_write" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "orders_read_write" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "order_items_read_write" ON public.order_items FOR ALL USING (true) WITH CHECK (true);


-- ==========================================
-- 5. STORAGE BUCKET (IMAGENS)
-- ==========================================

-- Criar o bucket "products" se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Limpar políticas antigas para evitar erro de duplicação
DROP POLICY IF EXISTS "Imagens Publicas" ON storage.objects;
DROP POLICY IF EXISTS "Upload de Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Gerenciar Imagens" ON storage.objects;
DROP POLICY IF EXISTS "Deletar Imagens" ON storage.objects;

-- Políticas de Storage (Permite upload anônimo e acesso público)
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

-- ==========================================
-- 6. DADOS INICIAIS (SEED DATA)
-- ==========================================

-- Inserir Categorias Básicas
INSERT INTO public.categories (name, slug, sort_order) VALUES
('Jumbos', 'jumbos', 1),
('Primitivos', 'primitivos', 2),
('Plantados', 'plantados', 3),
('Água Salgada', 'agua-salgada', 4),
('Equipamentos', 'equipamentos', 5),
('Rações', 'racoes', 6)
ON CONFLICT (name) DO NOTHING;

-- Inserir Tags
INSERT INTO public.tags (name) VALUES
('Raro'),
('Iniciantes'),
('Predador'),
('Pacífico')
ON CONFLICT (name) DO NOTHING;

-- Inserir Coleções
INSERT INTO public.collections (name, description) VALUES
('Destaques da Semana', 'Os peixes mais procurados desta semana.'),
('Monstros do Rio', 'Peixes de grande porte para aquários jumbo.')
ON CONFLICT (name) DO NOTHING;
