
import { Product } from '../types';

const BASEROW_API_URL = 'https://api.baserow.io/api';
// Credenciais exatas fornecidas pelo usuário
const DEFAULT_TABLE_ID = '819773'; 
const DEFAULT_TOKEN = 'ehGHc96HsLH4PuCMWTvxUdNZlo0DaH7M';

export const getBaserowConfig = () => {
  // Tenta pegar do storage, senão usa o hardcoded
  const localToken = localStorage.getItem('baserow_token');
  const localTableId = localStorage.getItem('baserow_table_id');
  
  return {
    token: localToken || DEFAULT_TOKEN,
    tableId: localTableId || DEFAULT_TABLE_ID
  };
};

export const saveBaserowConfig = (token: string, tableId: string) => {
  if (token) localStorage.setItem('baserow_token', token);
  if (tableId) localStorage.setItem('baserow_table_id', tableId);
};

export const testBaserowConnection = async (): Promise<boolean> => {
  const { token, tableId } = getBaserowConfig();
  if (!token || !tableId) return false;
  try {
    const response = await fetch(`${BASEROW_API_URL}/database/rows/table/${tableId}/?size=1&user_field_names=true`, {
      headers: { 'Authorization': `Token ${token}` },
      cache: 'no-store'
    });
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const fetchBaserowProducts = async (): Promise<Product[]> => {
  const { token, tableId } = getBaserowConfig();

  if (!token || !tableId) return [];

  try {
    // Adicionado timestamp para evitar cache do navegador agressivo
    const timestamp = new Date().getTime();
    const response = await fetch(`${BASEROW_API_URL}/database/rows/table/${tableId}/?user_field_names=true&size=200&t=${timestamp}`, {
      headers: { 'Authorization': `Token ${token}` },
      cache: 'no-store'
    });

    if (!response.ok) return [];

    const data = await response.json();
    
    return data.results
      .map((row: any) => {
        // Mapeamento defensivo: procura por todas as variações possíveis de nomes de coluna
        const name = row.Nome || row.Name || row.name || row['Product Name'];
        
        // Se não tem nome, é lixo ou linha vazia
        if (!name || String(name).trim() === '' || name === 'Sem Nome') return null;

        let price = 0;
        if (row.Preco !== undefined) price = parseFloat(row.Preco);
        else if (row.Price !== undefined) price = parseFloat(row.Price);
        else if (row.Value !== undefined) price = parseFloat(row.Value);
        
        const collectionNames = Array.isArray(row.Colecao) ? row.Colecao.map((c: any) => c.value) : [];
        const tagNames = Array.isArray(row.Tags) ? row.Tags.map((t: any) => t.value) : [];
        
        const imageUrl = row.Imagens?.[0]?.url || row.Images?.[0]?.url || row.Image?.[0]?.url || '';

        return {
          id: row.id.toString(),
          name: name,
          description: row.Descricao || row.Description || '',
          price: price || 0,
          stock: parseInt(row.Estoque || row.Stock || 0),
          category: row.Categoria?.value || row.Categoria || row.Category?.value || row.Category || 'Variados',
          image: imageUrl, 
          ph: row.PH || '', 
          size: row.Tamanho_Dimensoes || row.Size || '', 
          pixKey: row.Chave_Pix || '', 
          collections: collectionNames,
          tags: tagNames,
          paymentLink: '', 
          aggressiveness: '',
          filtrationType: '',
          brand: '',
          color: ''
        };
      })
      .filter((p: any) => p !== null); 

  } catch (error) {
    console.error("Erro ao buscar produtos do Baserow:", error);
    return [];
  }
};

export const uploadFileToBaserow = async (file: File): Promise<string | null> => {
  const { token } = getBaserowConfig();
  if (!token) return null;
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BASEROW_API_URL}/user-files/upload-file/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` },
      body: formData
    });
    if (response.ok) {
      const data = await response.json();
      return data.name; 
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const saveProductToBaserow = async (product: Partial<Product>, imageFile?: File): Promise<{ success: boolean; error?: string }> => {
  const { token, tableId } = getBaserowConfig();
  if (!token || !tableId) return { success: false, error: "Token ou ID da tabela faltando." };

  let imagePayload = null;
  if (imageFile) {
    const imageName = await uploadFileToBaserow(imageFile);
    if (imageName) imagePayload = [{ name: imageName }]; 
  }

  // Payload EXATO conforme screenshot do usuário (Nome, Preco, Descricao, Estoque, Categoria, Colecao, Tags)
  const payload: any = {
    "Nome": product.name,
    "Preco": typeof product.price === 'string' ? parseFloat(product.price) : product.price, // Garante number
    "Descricao": product.description || '',
    "Estoque": typeof product.stock === 'string' ? parseInt(product.stock) : (product.stock || 1), // Garante int
    "Categoria": product.category, 
    "Tamanho_Dimensoes": product.size || '', // Mapeia para campo livre se existir, ou ignorado
    "PH": product.ph || '',
    "Chave_Pix": product.pixKey || ''
  };

  if (imagePayload) {
      payload["Imagens"] = imagePayload;
  }

  try {
    const isBaserowId = product.id && /^\d+$/.test(product.id);
    const method = isBaserowId ? 'PATCH' : 'POST';
    const url = isBaserowId 
        ? `${BASEROW_API_URL}/database/rows/table/${tableId}/${product.id}/?user_field_names=true`
        : `${BASEROW_API_URL}/database/rows/table/${tableId}/?user_field_names=true`;

    const response = await fetch(url, {
        method: method,
        headers: { 
            'Authorization': `Token ${token}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `Erro API Baserow (${response.status}): ${errText}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteBaserowProduct = async (rowId: string): Promise<boolean> => {
  const { token, tableId } = getBaserowConfig();
  if (!token || !tableId) return false;
  
  // Se for ID local (não numérico), retorna true (já foi removido da view)
  if (!/^\d+$/.test(rowId)) return true; 
  
  try {
    const response = await fetch(`${BASEROW_API_URL}/database/rows/table/${tableId}/${rowId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    });
    return response.ok;
  } catch (error) { return false; }
};

export const deleteBaserowBatch = async (rowIds: string[]): Promise<boolean> => {
   const { token, tableId } = getBaserowConfig();
  if (!token || !tableId) return false;
  
  const numericIds = rowIds.filter(id => /^\d+$/.test(id)).map(id => parseInt(id));
  if (numericIds.length === 0) return true;

  try {
    const response = await fetch(`${BASEROW_API_URL}/database/rows/table/${tableId}/batch-delete/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: numericIds })
    });
    return response.ok;
  } catch (e) { return false; }
};

// Função "Nuclear" Melhorada
export const deleteAllRemoteProducts = async (): Promise<{ success: boolean; count: number }> => {
  const { token, tableId } = getBaserowConfig();
  if (!token || !tableId) return { success: false, count: 0 };

  let totalDeleted = 0;
  let hasMore = true;

  try {
    // Loop de segurança para apagar múltiplas páginas se houver
    while (hasMore) {
        // Busca IDs
        const response = await fetch(`${BASEROW_API_URL}/database/rows/table/${tableId}/?size=200`, {
           headers: { 'Authorization': `Token ${token}` },
           cache: 'no-store'
        });
        
        if (!response.ok) break;
        
        const data = await response.json();
        const ids = data.results.map((r: any) => r.id);
        
        if (ids.length === 0) {
            hasMore = false;
            break;
        }

        // Deleta IDs encontrados
        const deleteRes = await fetch(`${BASEROW_API_URL}/database/rows/table/${tableId}/batch-delete/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: ids })
        });

        if (deleteRes.ok) {
            totalDeleted += ids.length;
            // Se deletou menos que o chunk, provavelmente acabou
            if (ids.length < 200) hasMore = false;
        } else {
            hasMore = false; // Erro ao deletar, para o loop
        }
        
        await new Promise(r => setTimeout(r, 500)); // Throttle
    }

    return { success: true, count: totalDeleted };

  } catch (e) {
    return { success: false, count: totalDeleted };
  }
};
