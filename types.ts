
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Product {
  id: string;
  name: string;
  category: 
    | 'Peixes Marinhos Importados' 
    | 'Peixes Marinhos Nacionais' 
    | 'Primitivos' 
    | 'Jumbos' 
    | 'Ciclideos Africanos' 
    | 'Amazonicos' 
    | 'Cascudos' 
    | 'Poecilideos' 
    | 'Bettas' 
    | 'Variados'
    | 'Peixes' // Mantido para compatibilidade legado
    | 'Equipamentos' 
    | 'Aquários' 
    | 'Plantas' 
    | 'Alimentos'
    | 'Substratos'; // Nova Categoria
  price: number;
  image: string;
  description: string;
  stock: number;
  ph?: string; // Novo campo pH
  paymentLink?: string; 
  pixKey?: string; 
  size?: string; 
  
  // Novos campos de Taxonomia
  tags?: string[];
  collections?: string[];

  // Filtros Específicos - Peixes
  aggressiveness?: 'Pacífico' | 'Semi-agressivo' | 'Agressivo';
  color?: string;

  // Filtros Específicos - Equipamentos
  brand?: string;
  filtrationType?: 'Mecânica' | 'Biológica' | 'Química' | 'UV' | 'Completa';
  capacity?: string;
}

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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  trackingCode?: string;
}
