
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =============================================================
// ENTIDADES DO BANCO DE DADOS (Supabase)
// =============================================================

export interface Category {
  id: string;
  created_at?: string;
  name: string;
  slug?: string;
  description?: string;
  sort_order?: number;
}

export interface TagDB {
  id: string;
  created_at?: string;
  name: string;
}

export interface CollectionDB {
  id: string;
  created_at?: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  created_at?: string;
  name: string;
  description: string;
  price: number;
  price_promo?: number;
  stock: number;
  limit?: number;
  category_id?: string;
  image: string;          // mapped from image_url
  
  // Campos específicos de aquarismo
  size?: string;
  ph?: string;
  aggressiveness?: 'Pacífico' | 'Semi-agressivo' | 'Agressivo';
  color?: string;
  
  // Campos para equipamentos
  brand?: string;
  filtrationType?: 'Mecânica' | 'Biológica' | 'Química' | 'UV' | 'Completa';
  capacity?: string;
  
  // Pagamento
  pixKey?: string;
  paymentLink?: string;
  
  // Campos computados (vindos de JOINs)
  category?: string;       // nome da categoria (via JOIN)
  tags?: string[];         // nomes das tags
  collections?: string[];  // nomes das coleções
}

export interface CartItem extends Product {
  quantity: number;
}

// =============================================================
// PEDIDOS
// =============================================================

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  created_at?: string;
  customer_id?: string;
  status: OrderStatus;
  total: number;
  tracking_code?: string;
  notes?: string;
  items?: OrderItem[];
  customer?: Customer;
}

// =============================================================
// CLIENTES
// =============================================================

export interface Customer {
  id: string;
  created_at?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
}

// =============================================================
// COMPONENTES (UI)
// =============================================================

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  day: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum Section {
  HERO = 'hero',
  STORE = 'store',
  SERVICES = 'services',
  ABOUT = 'about',
}
