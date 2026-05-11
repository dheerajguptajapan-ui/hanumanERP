import { useLiveQuery } from 'dexie-react-hooks';
import { PartnerService } from '../services/partner.service';

export function usePartners(type: 'customer' | 'vendor' | 'all' = 'all', search: string = '') {
  return useLiveQuery(async () => {
    let partners = [];
    if (type === 'customer') {
      partners = await PartnerService.getCustomers();
    } else if (type === 'vendor') {
      partners = await PartnerService.getVendors();
    } else {
      partners = await PartnerService.getAll();
    }

    if (!search) return partners;
    
    const query = search.toLowerCase();
    return partners.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.companyName && p.companyName.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.phone && p.phone.toLowerCase().includes(query))
    );
  }, [type, search]);
}
