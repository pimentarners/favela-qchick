import { supabase } from '../supabaseClient';
import { Product } from '../types';

/**
 * Faz upload da imagem para o storage 'products' do Supabase.
 */
export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {
      console.error('Erro no upload da imagem:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return null;
  }
};

/**
 * Busca todos os produtos da tabela 'products'.
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    // Mapeia os dados do Supabase para o formato da interface Product
    return (data || []).map((row: any) => ({
      id: row.id.toString(),
      name: row.name,
      category: row.category as any,
      price: Number(row.price),
      image: row.image_url || '',
      description: row.description || '',
      stock: Number(row.stock),
      size: row.size || '',
      paymentLink: row.payment_link || '',
      pixKey: row.pix_key || '',
      aggressiveness: row.aggressiveness as any,
      color: row.color || '',
      brand: row.brand || '',
      filtrationType: row.filtration_type as any,
      capacity: row.capacity || '',
      ph: row.ph || '',
      tags: row.tags || [],
      collections: row.collections || []
    }));
  } catch (error) {
    console.error('Erro inesperado ao buscar produtos:', error);
    return [];
  }
};

/**
 * Cria ou atualiza um produto. Se imageFile for passado, faz o upload primeiro.
 */
export const saveProduct = async (product: Partial<Product>, imageFile?: File): Promise<{ success: boolean; error?: string }> => {
  try {
    let imageUrl = product.image;

    // Se houver um arquivo novo, faz o upload
    if (imageFile) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return { success: false, error: 'Falha ao fazer upload da imagem' };
      }
    }

    const payload = {
      name: product.name,
      category: product.category,
      price: product.price,
      image_url: imageUrl,
      description: product.description,
      stock: product.stock,
      size: product.size,
      payment_link: product.paymentLink,
      pix_key: product.pixKey,
      aggressiveness: product.aggressiveness,
      color: product.color,
      brand: product.brand,
      filtration_type: product.filtrationType,
      capacity: product.capacity,
      ph: product.ph,
      tags: product.tags,
      collections: product.collections
    };

    if (product.id) {
      // Update
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', parseInt(product.id));

      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar produto:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove um produto.
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return false;
  }
};

/**
 * Remove múltiplos produtos em lote.
 */
export const deleteProductBatch = async (ids: string[]): Promise<boolean> => {
  try {
    const numericIds = ids.map(id => parseInt(id));
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', numericIds);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar lote de produtos:', error);
    return false;
  }
};
