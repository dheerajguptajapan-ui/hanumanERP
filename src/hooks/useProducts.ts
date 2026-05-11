import { useLiveQuery } from 'dexie-react-hooks';
import { ProductService } from '../services/product.service';

export function useProducts(search: string = '') {
  return useLiveQuery(async () => {
    const products = await ProductService.getAll();
    if (!search) return products;
    
    const query = search.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.hsnCode && p.hsnCode.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }, [search]);
}
