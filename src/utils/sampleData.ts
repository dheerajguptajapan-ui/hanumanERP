import { db } from '../db';

export async function seedSampleData() {
  // 1. CLEAR EXISTING DATA (Optional, but better for a clean start)
  await Promise.all([
    db.products.clear(),
    db.partners.clear(),
    db.quotations.clear(),
    db.salesOrders.clear(),
    db.invoices.clear(),
    db.purchaseOrders.clear(),
    db.purchaseBills.clear(),
    db.payments.clear()
  ]);

  // 2. SEED PRODUCTS
  const productIds = await db.products.bulkAdd([
    { name: 'Steel Wood Screws (1 inch)', sku: 'SCRW-001', hsnCode: '7318', category: 'Fasteners', price: 2.5, costPrice: 1.5, stock: 5000, unit: 'pcs', description: 'Zinc coated', minStock: 500, gstRate: 18 },
    { name: 'Asian Paints Royal Luxury Emulsion (20L)', sku: 'PNT-ROY-20', hsnCode: '3208', category: 'Paints', price: 8500, costPrice: 7200, stock: 25, unit: 'bucket', description: 'White color', minStock: 5, gstRate: 18 },
    { name: 'Bosch Professional Hammer Drill', sku: 'TOOL-DRL-BSH', hsnCode: '8467', category: 'Power Tools', price: 5400, costPrice: 4500, stock: 12, unit: 'pcs', description: '750W high power', minStock: 2, gstRate: 18 },
    { name: 'Marine Grade Plywood (8x4 ft)', sku: 'PLY-MAR-19', hsnCode: '4412', category: 'Timber', price: 3200, costPrice: 2800, stock: 40, unit: 'sheet', description: '19mm thick', minStock: 10, gstRate: 12 },
    { name: 'Ultratech Cement (50kg Bag)', sku: 'CEM-ULT-50', hsnCode: '2523', category: 'Cement', price: 420, costPrice: 380, stock: 200, unit: 'bag', description: 'OPC 53 Grade', minStock: 50, gstRate: 28 }
  ], { allKeys: true }) as number[];

  // 3. SEED PARTNERS
  const customerIds = await db.partners.bulkAdd([
    { name: 'Sharma Construction Co.', customerType: 'Business', phone: '9876543210', email: 'sharma@const.com', gstin: '07AAAAA0000A1Z5', billingLine1: '45 Okhla Phase 3', billingCity: 'New Delhi', billingState: 'Delhi', billingCountry: 'India', billingPincode: '110020', shippingLine1: '45 Okhla Phase 3', shippingCity: 'New Delhi', shippingState: 'Delhi', shippingCountry: 'India', shippingPincode: '110020', state: 'Delhi', type: 'customer', group: 'Contractor', contactPersons: [], creditLimit: 100000 },
    { name: 'Modern Interiors Pvt Ltd', customerType: 'Business', phone: '9988776655', gstin: '27BBBBB0000B1Z2', billingLine1: 'Bandra West, Link Rd', billingCity: 'Mumbai', billingState: 'Maharashtra', billingCountry: 'India', billingPincode: '400050', shippingLine1: 'Bandra West, Link Rd', shippingCity: 'Mumbai', shippingState: 'Maharashtra', shippingCountry: 'India', shippingPincode: '400050', state: 'Maharashtra', type: 'customer', group: 'Contractor', contactPersons: [], creditLimit: 50000 },
    { name: 'Local Contractor (Walk-in)', customerType: 'Business', phone: '9123456789', billingLine1: 'Lajpat Nagar', billingCity: 'New Delhi', billingState: 'Delhi', billingCountry: 'India', billingPincode: '110024', shippingLine1: 'Lajpat Nagar', shippingCity: 'New Delhi', shippingState: 'Delhi', shippingCountry: 'India', shippingPincode: '110024', state: 'Delhi', type: 'customer', group: 'Retail', contactPersons: [] }
  ], { allKeys: true }) as number[];

  const supplierIds = await db.partners.bulkAdd([
    { name: 'Global Hardware Wholesalers', customerType: 'Business', phone: '1122334455', gstin: '09CCCCC0000C1Z8', billingLine1: 'Noida Sector 62', billingCity: 'Noida', billingState: 'Uttar Pradesh', billingCountry: 'India', billingPincode: '201301', shippingLine1: 'Noida Sector 62', shippingCity: 'Noida', shippingState: 'Uttar Pradesh', shippingCountry: 'India', shippingPincode: '201301', state: 'Uttar Pradesh', type: 'supplier', group: 'Wholesale', contactPersons: [] },
    { name: 'Reliance Paints Distribution', customerType: 'Business', phone: '8877665544', gstin: '24DDDDD0000D1Z9', billingLine1: 'Ahmedabad Industrial Area', billingCity: 'Ahmedabad', billingState: 'Gujarat', billingCountry: 'India', billingPincode: '380001', shippingLine1: 'Ahmedabad Industrial Area', shippingCity: 'Ahmedabad', shippingState: 'Gujarat', shippingCountry: 'India', shippingPincode: '380001', state: 'Gujarat', type: 'supplier', group: 'Wholesale', contactPersons: [] }
  ], { allKeys: true }) as number[];

  // 4. SEED QUOTATIONS
  await db.quotations.bulkAdd([
    { customerId: customerIds[0], customerName: 'Sharma Construction Co.', date: new Date(), items: [{ productId: productIds[0], productName: 'Steel Wood Screws (1 inch)', hsnCode: '7318', quantity: 1000, price: 2.5, gstRate: 18, gstAmount: 450, total: 2950 }], subtotal: 2500, totalGst: 450, cgst: 225, sgst: 225, igst: 0, total: 2950, status: 'sent' },
    { customerId: customerIds[1], customerName: 'Modern Interiors Pvt Ltd', date: new Date(), items: [{ productId: productIds[1], productName: 'Asian Paints Royal Luxury Emulsion (20L)', hsnCode: '3208', quantity: 2, price: 8500, gstRate: 18, gstAmount: 3060, total: 20060 }], subtotal: 17000, totalGst: 3060, cgst: 0, sgst: 0, igst: 3060, total: 20060, status: 'draft' }
  ]);

  // 5. SEED SALES ORDERS
  await db.salesOrders.bulkAdd([
    { orderNumber: `SO-${Date.now()}`, customerId: customerIds[0], partnerName: 'Sharma Construction Co.', date: new Date(), items: [{ productId: productIds[4], productName: 'Ultratech Cement (50kg Bag)', hsnCode: '2523', quantity: 100, price: 420, gstRate: 28, gstAmount: 11760, total: 53760 }], subtotal: 42000, totalGst: 11760, cgst: 5880, sgst: 5880, igst: 0, totalAmount: 53760, total: 53760, status: 'confirmed' }
  ]);

  // 6. SEED INVOICES (Paid, Unpaid, Overdue)
  const invDate1 = new Date(); invDate1.setDate(invDate1.getDate() - 40); // Overdue
  const invDate2 = new Date(); invDate2.setDate(invDate2.getDate() - 5); // Recent Unpaid
  
  await db.invoices.bulkAdd([
    { invoiceNumber: `INV-${Date.now()}-1`, customerId: customerIds[0], customerName: 'Sharma Construction Co.', date: invDate1, dueDate: new Date(invDate1.getTime() + 15*24*60*60*1000), paymentTerms: "15", items: [{ productId: productIds[2], productName: 'Bosch Drill', hsnCode: '8467', quantity: 1, price: 5400, gstRate: 18, gstAmount: 972, total: 6372 }], subtotal: 5400, totalGst: 972, cgst: 486, sgst: 486, igst: 0, discount: 0, discountType: '%', shippingCharges: 0, adjustment: 0, total: 6372, amountPaid: 0, status: 'unpaid' },
    { invoiceNumber: `INV-${Date.now()}-2`, customerId: customerIds[1], customerName: 'Modern Interiors Pvt Ltd', date: new Date(), dueDate: new Date(), paymentTerms: "0", items: [{ productId: productIds[3], productName: 'Plywood', hsnCode: '4412', quantity: 10, price: 3200, gstRate: 12, gstAmount: 3840, total: 35840 }], subtotal: 32000, totalGst: 3840, cgst: 0, sgst: 0, igst: 3840, discount: 0, discountType: '%', shippingCharges: 0, adjustment: 0, total: 35840, amountPaid: 35840, status: 'paid' },
    { invoiceNumber: `INV-${Date.now()}-3`, customerId: customerIds[2], customerName: 'Local Contractor', date: invDate2, dueDate: new Date(invDate2.getTime() + 7*24*60*60*1000), paymentTerms: "7", items: [{ productId: productIds[4], productName: 'Cement', hsnCode: '2523', quantity: 10, price: 420, gstRate: 28, gstAmount: 1176, total: 5376 }], subtotal: 4200, totalGst: 1176, cgst: 588, sgst: 588, igst: 0, discount: 0, discountType: '%', shippingCharges: 0, adjustment: 0, total: 5376, amountPaid: 2000, status: 'partial' }
  ]);

  // 7. SEED PURCHASE BILLS
  await db.purchaseBills.bulkAdd([
    { supplierId: supplierIds[0], supplierName: 'Global Hardware Wholesalers', billNumber: 'PUR/24/001', date: new Date(), dueDate: new Date(), paymentTerms: "15", items: [{ productId: productIds[0], productName: 'Steel Wood Screws', hsnCode: '7318', quantity: 10000, price: 1.5, gstRate: 18, gstAmount: 2700, total: 17700 }], subtotal: 15000, totalGst: 2700, cgst: 1350, sgst: 1350, igst: 0, total: 17700, amountPaid: 0, status: 'unpaid' }
  ]);

  return true;
}
