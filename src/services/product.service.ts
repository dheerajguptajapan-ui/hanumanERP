import { db } from '../db';
import type { Product } from '../db';

export class ProductService {
  static async getAll() {
    return await db.products.toArray();
  }

  static async getById(id: number) {
    return await db.products.get(id);
  }

  static async add(product: Omit<Product, 'id'>) {
    return await db.products.add(product as Product);
  }

  static async update(id: number, product: Partial<Product>) {
    return await db.products.update(id, product);
  }

  static async delete(id: number) {
    return await db.products.delete(id);
  }

  /**
   * Adjusts stock level for a product
   * @param id Product ID
   * @param delta Amount to change (positive for increase, negative for decrease)
   */
  static async adjustStock(id: number, delta: number) {
    const product = await this.getById(id);
    if (!product) throw new Error('Product not found');
    
    const newStock = (product.stock || 0) + delta;
    return await this.update(id, { stock: newStock });
  }

  static async getLowStockItems() {
    const products = await this.getAll();
    return products.filter(p => p.stock <= (p.minStock || 5));
  }
}
