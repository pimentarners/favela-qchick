import { supabase } from '../supabaseClient';
import { Product, Category, TagDB, CollectionDB, Order, OrderItem, Customer } from '../types';

// =============================================================
// IMAGENS (Storage)
// =============================================================

export const uploadProductImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('products')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      console.error('Erro no upload da imagem:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erro inesperado no upload:', error);
    return null;
  }
};

// =============================================================
// CATEGORIAS
// =============================================================

export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
  return data || [];
};

export const saveCategory = async (category: Partial<Category>): Promise<{ success: boolean; error?: string }> => {
  try {
    if (category.id) {
      const { error } = await supabase
        .from('categories')
        .update({ name: category.name, slug: category.slug, description: category.description, sort_order: category.sort_order })
        .eq('id', category.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: category.name, slug: category.slug, description: category.description, sort_order: category.sort_order }]);
      if (error) throw error;
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) { console.error('Erro ao deletar categoria:', error); return false; }
  return true;
};

// =============================================================
// TAGS
// =============================================================

export const fetchTags = async (): Promise<TagDB[]> => {
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) { console.error('Erro ao buscar tags:', error); return []; }
  return data || [];
};

export const createTag = async (name: string): Promise<TagDB | null> => {
  const { data, error } = await supabase.from('tags').insert([{ name }]).select().single();
  if (error) { console.error('Erro ao criar tag:', error); return null; }
  return data;
};

export const deleteTag = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) { console.error('Erro ao deletar tag:', error); return false; }
  return true;
};

// =============================================================
// COLEÇÕES
// =============================================================

export const fetchCollections = async (): Promise<CollectionDB[]> => {
  const { data, error } = await supabase.from('collections').select('*').order('name');
  if (error) { console.error('Erro ao buscar coleções:', error); return []; }
  return data || [];
};

export const createCollection = async (name: string): Promise<CollectionDB | null> => {
  const { data, error } = await supabase.from('collections').insert([{ name }]).select().single();
  if (error) { console.error('Erro ao criar coleção:', error); return null; }
  return data;
};

export const deleteCollection = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  if (error) { console.error('Erro ao deletar coleção:', error); return false; }
  return true;
};

// =============================================================
// PRODUTOS
// =============================================================

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Busca produtos com JOIN na categoria
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    // Busca tags e coleções de todos os produtos
    const productIds = (data || []).map((p: any) => p.id);
    
    let tagMap: Record<string, string[]> = {};
    let collectionMap: Record<string, string[]> = {};

    if (productIds.length > 0) {
      // Busca product_tags com JOIN
      const { data: ptData } = await supabase
        .from('product_tags')
        .select('product_id, tags ( name )')
        .in('product_id', productIds);
      
      if (ptData) {
        for (const pt of ptData) {
          const pid = (pt as any).product_id;
          const tagName = (pt as any).tags?.name;
          if (tagName) {
            if (!tagMap[pid]) tagMap[pid] = [];
            tagMap[pid].push(tagName);
          }
        }
      }

      // Busca product_collections com JOIN
      const { data: pcData } = await supabase
        .from('product_collections')
        .select('product_id, collections ( name )')
        .in('product_id', productIds);
      
      if (pcData) {
        for (const pc of pcData) {
          const pid = (pc as any).product_id;
          const colName = (pc as any).collections?.name;
          if (colName) {
            if (!collectionMap[pid]) collectionMap[pid] = [];
            collectionMap[pid].push(colName);
          }
        }
      }
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      description: row.description || '',
      price: Number(row.price),
      price_promo: row.price_promo ? Number(row.price_promo) : undefined,
      stock: Number(row.stock) || 0,
      limit: row.limit,
      category_id: row.category_id,
      category: row.categories?.name || 'Sem Categoria',
      image: row.image_url || '',
      size: row.size || '',
      ph: row.ph || '',
      aggressiveness: row.aggressiveness as any,
      color: row.color || '',
      brand: row.brand || '',
      filtrationType: row.filtration_type as any,
      capacity: row.capacity || '',
      pixKey: row.pix_key || '',
      paymentLink: row.payment_link || '',
      tags: tagMap[row.id] || [],
      collections: collectionMap[row.id] || []
    }));
  } catch (error) {
    console.error('Erro inesperado ao buscar produtos:', error);
    return [];
  }
};

export const saveProduct = async (
  product: Partial<Product>, 
  imageFile?: File,
  tagNames?: string[],
  collectionNames?: string[]
): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    let imageUrl = product.image;

    // Upload de imagem se houver arquivo novo
    if (imageFile) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return { success: false, error: 'Falha ao fazer upload da imagem.' };
      }
    }

    const payload: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      price_promo: product.price_promo || null,
      stock: product.stock,
      category_id: product.category_id || null,
      image_url: imageUrl,
      size: product.size || null,
      ph: product.ph || null,
      aggressiveness: product.aggressiveness || null,
      color: product.color || null,
      brand: product.brand || null,
      filtration_type: product.filtrationType || null,
      capacity: product.capacity || null,
      pix_key: product.pixKey || null,
      payment_link: product.paymentLink || null,
    };

    let productId = product.id;

    if (product.id) {
      // UPDATE
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id);
      if (error) throw error;
    } else {
      // INSERT
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select('id')
        .single();
      if (error) throw error;
      productId = data?.id;
    }

    // Atualiza tags (remove todas e re-insere)
    if (productId && tagNames) {
      await supabase.from('product_tags').delete().eq('product_id', productId);

      if (tagNames.length > 0) {
        // Busca ou cria cada tag
        for (const tagName of tagNames) {
          let { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();
          
          if (!existingTag) {
            const { data: newTag } = await supabase
              .from('tags')
              .insert([{ name: tagName }])
              .select('id')
              .single();
            existingTag = newTag;
          }

          if (existingTag) {
            await supabase.from('product_tags').insert([{
              product_id: productId,
              tag_id: existingTag.id
            }]);
          }
        }
      }
    }

    // Atualiza coleções (remove todas e re-insere)
    if (productId && collectionNames) {
      await supabase.from('product_collections').delete().eq('product_id', productId);

      if (collectionNames.length > 0) {
        for (const colName of collectionNames) {
          const { data: existingCol } = await supabase
            .from('collections')
            .select('id')
            .eq('name', colName)
            .single();

          if (existingCol) {
            await supabase.from('product_collections').insert([{
              product_id: productId,
              collection_id: existingCol.id
            }]);
          }
        }
      }
    }

    return { success: true, id: productId };
  } catch (error: any) {
    console.error('Erro ao salvar produto:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    // Junction tables são deletadas automaticamente via ON DELETE CASCADE
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return false;
  }
};

export const deleteProductBatch = async (ids: string[]): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao deletar lote de produtos:', error);
    return false;
  }
};

// =============================================================
// PEDIDOS
// =============================================================

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers ( name, phone, email ),
      order_items ( * )
    `)
    .order('created_at', { ascending: false });

  if (error) { console.error('Erro ao buscar pedidos:', error); return []; }

  return (data || []).map((row: any) => ({
    id: row.id,
    created_at: row.created_at,
    customer_id: row.customer_id,
    status: row.status,
    total: Number(row.total),
    tracking_code: row.tracking_code,
    notes: row.notes,
    customer: row.customers ? {
      id: row.customer_id,
      name: row.customers.name,
      phone: row.customers.phone,
      email: row.customers.email,
    } : undefined,
    items: (row.order_items || []).map((item: any) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      image_url: item.image_url,
    })),
  }));
};

export const updateOrderStatus = async (orderId: string, status: string, trackingCode?: string): Promise<boolean> => {
  const update: any = { status };
  if (trackingCode !== undefined) update.tracking_code = trackingCode;
  
  const { error } = await supabase.from('orders').update(update).eq('id', orderId);
  if (error) { console.error('Erro ao atualizar pedido:', error); return false; }
  return true;
};

// =============================================================
// CLIENTES
// =============================================================

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');

  if (error) { console.error('Erro ao buscar clientes:', error); return []; }
  return data || [];
};

export const saveCustomer = async (customer: Partial<Customer>): Promise<{ success: boolean; error?: string }> => {
  try {
    if (customer.id) {
      const { error } = await supabase.from('customers').update(customer).eq('id', customer.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('customers').insert([customer]);
      if (error) throw error;
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
