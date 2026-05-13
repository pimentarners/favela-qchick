
import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { fetchBaserowProducts, getBaserowConfig } from '../services/baserowService';
import { LOCAL_PRODUCTS } from '../data/localProducts';

let globalCache: { data: Product[]; timestamp: number } | null = null;
const CACHE_DURATION = 1 * 60 * 1000; // Reduzido para 1 min para garantir frescor

const DELETED_LOCAL_IDS_KEY = 'panucci_deleted_local_ids';

export const useProductCache = () => {
  const [products, setProducts] = useState<Product[]>(globalCache?.data || []);
  const [isLoading, setIsLoading] = useState(!globalCache?.data);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const getDeletedIds = (): string[] => {
    try {
      const stored = localStorage.getItem(DELETED_LOCAL_IDS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const refreshProducts = async (force = false) => {
    if (!force && globalCache && (Date.now() - globalCache.timestamp < CACHE_DURATION)) {
        if (mounted.current) {
            setProducts(globalCache.data);
            setIsLoading(false);
        }
        return;
    }

    if (mounted.current) setIsLoading(true);
    
    try {
      const { token, tableId } = getBaserowConfig();
      const deletedIds = getDeletedIds();
      
      let fetchedProducts: Product[] = [];

      // Prioridade total para o Baserow se houver Token
      if (token && tableId) {
         const remote = await fetchBaserowProducts();
         fetchedProducts = remote;
      } else if (LOCAL_PRODUCTS.length > 0) {
         // Fallback legado (não deve ocorrer se o token estiver setado)
         fetchedProducts = LOCAL_PRODUCTS.filter(p => !deletedIds.includes(p.id));
      }

      globalCache = { data: fetchedProducts, timestamp: Date.now() };
      
      if (mounted.current) {
          setProducts(fetchedProducts);
          setError(null);
      }
    } catch (err) {
      console.error(err);
      if (mounted.current) setError('Falha ao atualizar produtos');
    } finally {
      if (mounted.current) setIsLoading(false);
    }
  };

  const removeProduct = (id: string) => {
    const current = getDeletedIds();
    if (!current.includes(id)) {
        const updated = [...current, id];
        localStorage.setItem(DELETED_LOCAL_IDS_KEY, JSON.stringify(updated));
    }
    
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    if (globalCache) globalCache.data = newProducts;
  };

  const removeProducts = (ids: string[]) => {
    const current = getDeletedIds();
    const updated = [...current, ...ids.filter(id => !current.includes(id))];
    localStorage.setItem(DELETED_LOCAL_IDS_KEY, JSON.stringify(updated));

    const newProducts = products.filter(p => !ids.includes(p.id));
    setProducts(newProducts);
    if (globalCache) globalCache.data = newProducts;
  };

  // FUNÇÃO DE LIMPEZA GERAL
  const clearAllProducts = () => {
    setProducts([]);
    if (globalCache) globalCache.data = [];
    
    // Limpa chaves específicas do app
    localStorage.removeItem(DELETED_LOCAL_IDS_KEY);
    
    // Não limpa o token do Baserow aqui, apenas dados de produto. 
    // Para limpar tokens, use o Reset de Fábrica no App.tsx
  };

  useEffect(() => {
    mounted.current = true;
    refreshProducts();
    return () => { mounted.current = false; };
  }, []);

  return { products, isLoading, error, refreshProducts, removeProduct, removeProducts, clearAllProducts };
};
