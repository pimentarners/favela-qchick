import { useState, useEffect, useRef } from 'react';
import { Product } from '../types';
import { fetchProducts } from '../services/supabaseService';

export const useProductCache = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refreshProducts = async () => {
    if (mounted.current) setIsLoading(true);
    
    try {
      const fetchedProducts = await fetchProducts();
      
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
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const removeProducts = (ids: string[]) => {
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  };

  const clearAllProducts = () => {
    setProducts([]);
  };

  useEffect(() => {
    mounted.current = true;
    refreshProducts();
    return () => { mounted.current = false; };
  }, []);

  return { products, isLoading, error, refreshProducts, removeProduct, removeProducts, clearAllProducts };
};
