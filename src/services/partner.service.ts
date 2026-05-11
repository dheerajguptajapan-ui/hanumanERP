import { db, type BusinessPartner } from '../db';

export class PartnerService {
  static async getAll() {
    return await db.partners.toArray();
  }

  static async getCustomers() {
    return await db.partners.filter(p => (p as any).type === 'customer' || (p as any).type === 'both').toArray();
  }

  static async getVendors() {
    return await db.partners.filter(p => (p as any).type === 'supplier' || (p as any).type === 'both').toArray();
  }

  static async getById(id: number) {
    return await db.partners.get(id);
  }

  static async add(partner: Omit<BusinessPartner, 'id'>) {
    return await db.partners.add(partner as BusinessPartner);
  }

  static async update(id: number, partner: Partial<BusinessPartner>) {
    return await db.partners.update(id, partner);
  }

  static async delete(id: number) {
    return await db.partners.delete(id);
  }
}
