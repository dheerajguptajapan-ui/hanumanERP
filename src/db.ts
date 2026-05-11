import Dexie, { type EntityTable } from 'dexie';

// --- CORE MODELS ---

export interface Product {
  id?: number;
  name: string;
  sku: string;
  hsnCode: string;
  category: string;
  brand?: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  description: string;
  minStock: number;
  gstRate: number;
  taxType?: string;
  imageFront?: string;
  imageRear?: string;
  inventoryAccount?: string;
  purchaseAccount?: string;
  salesAccount?: string;
  attachments?: { name: string, base64: string }[];
}

export interface ContactPerson {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  workPhone: string;
  mobile: string;
}

export interface BusinessPartner {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  customerType: 'Business' | 'Individual';
  companyName?: string;
  
  // Structured Billing (Sold To)
  billingAttention?: string;
  billingCountry: string;
  billingLine1: string;
  billingLine2?: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;
  billingPhone?: string;
  billingFax?: string;

  // Structured Shipping (Ship To)
  shippingAttention?: string;
  shippingCountry: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  shippingPhone?: string;
  shippingFax?: string;

  contactPersons: ContactPerson[];
  
  state: string; // Master state for tax calculation
  type: 'customer' | 'supplier' | 'both';
  group: 'Retail' | 'Wholesale' | 'Contractor' | '5% Discount' | '10% Discount';
  creditLimit?: number;
  currency?: string;
  paymentTerms?: string;
  enablePortal?: boolean;
  attachments?: { name: string, base64: string }[];
}

export interface Settings {
  id?: number;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  shopEmail: string;
  shopGSTIN: string;
  shopState: string;
  shopPAN?: string;
  taxRate: number;
  currency: string;
  receiptHeader?: string;
  receiptFooter?: string;
  pdfTemplate: string;
  pdfColor: string;
  logoUrl?: string;
  pdfLogoBase64?: string;
  bankName?: string;
  bankAccount?: string;
  bankIFSC?: string;
  showHSN?: boolean;
  showUnit?: boolean;
  enabledModules?: string[];
  attachPDF?: boolean;
  encryptPDF?: boolean;
  discountType?: 'none' | 'line-item' | 'transaction';
  discountOption?: 'before-tax' | 'after-tax';
  additionalCharges?: string[];
  taxInclusive?: 'inclusive' | 'exclusive' | 'both';
  roundOffTax?: 'transaction' | 'line-item';
  salesRounding?: 'none' | 'whole' | 'incremental';
  favoriteReports?: string[];
  showSalesperson?: boolean;
  enableProfitMargin?: boolean;
  markupPercentage?: number;
  stockTrackingMode?: 'physical' | 'accounting';
  addressFormat?: string;
  documentCopyLabels?: Record<string, string[]>;
  printPreferences?: string;
  paymentRetention?: boolean;
  showRate?: boolean;
  showGST?: boolean;
  appearance?: 'light' | 'dark';
  accentColor?: string;
  showBranding?: boolean;
  industry?: string;
  location?: string;
  website?: string;
  fiscalYear?: string;
  fiscalYearStart?: string;
  language?: string;
  timeZone?: string;
  dateFormat?: string;
  companyID?: string;
  organizationName?: string;
  companySealBase64?: string;
  transactionSeries?: Record<string, {
    prefix: string;
    nextNumber: number;
    digitCount: number;
  }>;
  currencies?: { code: string, symbol: string, exchangeRate: number, isBase: boolean }[];
  paymentTerms?: { label: string, days: number }[];
  reminders?: { type: string, days: number, subject: string, message: string, active: boolean }[];
  portalSettings?: { customerPortal: boolean, vendorPortal: boolean, bannerMessage?: string };
}

// --- OTC & PTP MODELS ---

export interface OrderItem {
  productId: number;
  productName: string;
  hsnCode: string;
  quantity: number;
  price: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface SalesOrder {
  id?: number;
  orderNumber: string;
  reference?: string;
  customerId: number;
  partnerName: string;
  date: Date;
  shipmentDate?: Date;
  paymentTerms?: string;
  items: any[];
  subtotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  totalAmount: number;
  status: 'draft' | 'confirmed' | 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'invoiced';
}

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  orderNumber?: string;
  salesOrderId?: number;
  customerId: number;
  customerName: string;
  date: Date;
  dueDate: Date;
  paymentTerms: string;
  salesperson?: string;
  subject?: string;
  items: OrderItem[];
  subtotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  discountType: '%' | 'fixed';
  shippingCharges: number;
  adjustment: number;
  total: number;
  amountPaid: number;
  status: 'draft' | 'unpaid' | 'partial' | 'paid' | 'overdue' | 'void';
  customerNotes?: string;
  termsConditions?: string;
  attachments?: { name: string, base64: string }[];
}

export interface SalesReceipt {
  id?: number;
  receiptNumber: string;
  customerId: number;
  customerName: string;
  date: Date;
  salesperson?: string;
  items: OrderItem[];
  subtotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  discountType: '%' | 'fixed';
  shippingCharges: number;
  adjustment: number;
  total: number;
  paymentMode: string;
  depositTo: string;
  reference?: string;
  status: 'draft' | 'saved' | 'void';
  customerNotes?: string;
  termsConditions?: string;
  attachments?: { name: string, base64: string }[];
}

export interface PurchaseOrder {
  id?: number;
  purchaseOrderNumber: string;
  vendorId: number;
  vendorName: string;
  deliveryDestination: 'organization' | 'customer';
  deliveryAddress: string;
  date: Date;
  deliveryDate?: Date;
  paymentTerms: string;
  reference?: string;
  shipmentPreference?: string;
  items: any[];
  subtotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  discountType: '%' | 'fixed';
  adjustment: number;
  total: number;
  status: 'draft' | 'issued' | 'partially_received' | 'received' | 'billed' | 'cancelled';
  notes?: string;
  termsConditions?: string;
  attachments?: { name: string, base64: string }[];
}

export interface PurchaseBill {
  id?: number;
  purchaseOrderId?: number;
  supplierId: number;
  supplierName: string;
  billNumber: string;
  orderNumber?: string;
  date: Date;
  dueDate: Date;
  paymentTerms: string;
  subject?: string;
  items: any[];
  subtotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount?: number;
  discountType?: '%' | 'fixed';
  adjustment?: number;
  total: number;
  amountPaid: number;
  status: 'draft' | 'open' | 'unpaid' | 'partial' | 'paid' | 'void';
}

export interface GoodsReceipt {
  id?: number;
  grnNumber: string;
  purchaseOrderId: number;
  vendorId: number;
  vendorName: string;
  date: Date;
  reference?: string;
  items: {
    productId: number;
    productName: string;
    orderedQuantity: number;
    receivedQuantity: number;
    price: number;
  }[];
  notes?: string;
  attachments?: { name: string, base64: string }[];
}

export interface Payment {
  id?: number;
  paymentNumber: string;
  invoiceId?: number;
  purchaseBillId?: number;
  customerId: number;
  customerName: string;
  date: Date;
  amount: number;
  bankCharges?: number;
  taxDeducted?: boolean;
  paymentMode: string;
  depositTo: string;
  reference?: string;
  notes?: string;
  type: 'inbound' | 'outbound';
  status: 'draft' | 'paid';
}

export interface Expense {
  id?: number;
  date: Date;
  category: string;
  amount: number;
  isTaxInclusive: boolean;
  taxRate?: string;
  vendorId?: number;
  reference?: string;
  notes?: string;
  customerId?: number;
  attachments?: { name: string, base64: string }[];
}

export interface Category {
  id?: number;
  name: string;
  parentId?: number;
}

export interface Brand {
  id?: number;
  name: string;
}

export interface Manufacturer {
  id?: number;
  name: string;
}

export interface StockAdjustment {
  id?: number;
  productId: number;
  productName: string;
  date: Date;
  reason: string;
  type: 'quantity' | 'value';
  adjustmentType: 'add' | 'remove';
  quantityAdjusted: number;
  newQuantityOnHand: number;
  costPrice: number;
  account: string;
  referenceNumber: string;
  description: string;
  status: 'draft' | 'adjusted';
}

export interface VendorCredit {
  id?: number;
  vendorId: number;
  vendorName: string;
  creditNoteNumber: string;
  orderNumber?: string;
  reference?: string;
  date: string;
  subject?: string;
  items: any[];
  notes?: string;
  discount?: number;
  adjustment?: number;
  subtotal: number;
  total: number;
  balance: number;
  status: 'draft' | 'open' | 'void';
  createdAt: string;
}

export interface Role {
  id?: number;
  name: string;
  description: string;
  permissions: {
    [module: string]: {
      [subModule: string]: {
        full?: boolean;
        view?: boolean;
        create?: boolean;
        edit?: boolean;
        delete?: boolean;
        approve?: boolean;
        others?: string[];
      } | boolean;
    };
  };
}

export interface User {
  id?: number;
  name: string;
  email: string;
  roleId: number;
  status: 'active' | 'inactive';
}

export interface Tax {
  id?: number;
  name: string;
  rate: number;
  isCompound: boolean;
  status: 'active' | 'inactive';
}

export type NumberSeriesDocType =
  | 'quotation'
  | 'salesOrder'
  | 'purchaseOrder'
  | 'invoice'
  | 'creditNote'
  | 'grn'
  | 'bill'
  | 'vendorCredit'
  | 'salesReceipt'
  | 'paymentReceived'
  | 'paymentMade'
  | 'stockAdjustment';

export interface NumberSeries {
  id?: number;
  docType: NumberSeriesDocType;
  label: string;         // Human-readable label e.g. "Sales Invoice"
  prefix: string;        // 4-char alpha prefix e.g. "INVX"
  nextNumber: number;    // Current counter, incremented atomically
  padLength: number;     // Numeric padding length, default 6
  isActive: boolean;
}

class HardwareERPDB extends Dexie {
  products!: EntityTable<Product, 'id'>;
  partners!: EntityTable<BusinessPartner, 'id'>;
  quotations!: EntityTable<any, 'id'>;
  salesOrders!: EntityTable<SalesOrder, 'id'>;
  deliveryNotes!: EntityTable<any, 'id'>;
  invoices!: EntityTable<Invoice, 'id'>;
  purchaseOrders!: EntityTable<PurchaseOrder, 'id'>;
  purchaseBills!: EntityTable<PurchaseBill, 'id'>;
  payments!: EntityTable<Payment, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  brands!: EntityTable<Brand, 'id'>;
  manufacturers!: EntityTable<Manufacturer, 'id'>;
  adjustments!: EntityTable<StockAdjustment, 'id'>;
  salesReceipts!: EntityTable<SalesReceipt, 'id'>;
  expenses!: EntityTable<Expense, 'id'>;
  goodsReceipts!: EntityTable<GoodsReceipt, 'id'>;
  vendorCredits!: EntityTable<VendorCredit, 'id'>;
  roles!: EntityTable<Role, 'id'>;
  users!: EntityTable<User, 'id'>;
  taxes!: EntityTable<Tax, 'id'>;
  numberSeries!: EntityTable<NumberSeries, 'id'>;

  constructor() {
    super('HanumanERPDB_V1');
    this.version(7).stores({
      products: '++id, name, sku, category, hsnCode, stock',
      partners: '++id, name, phone, type, gstin',
      quotations: '++id, customerId, status, date',
      salesOrders: '++id, orderNumber, partnerName, customerId, status, date',
      deliveryNotes: '++id, salesOrderId, date',
      invoices: '++id, invoiceNumber, customerId, status, date, dueDate, total',
      purchaseOrders: '++id, purchaseOrderNumber, vendorId, status, date',
      purchaseBills: '++id, billNumber, supplierId, date, dueDate, status, total',
      payments: '++id, invoiceId, purchaseBillId, date, type, paymentNumber',
      settings: '++id',
      categories: '++id, name, parentId',
      brands: '++id, name',
      manufacturers: '++id, name',
      adjustments: '++id, productId, date, status',
      salesReceipts: '++id, customerId, status, date',
      expenses: '++id, date, category, vendorId',
      goodsReceipts: '++id, purchaseOrderId, vendorId, date, grnNumber',
      vendorCredits: '++id, creditNoteNumber, vendorId, date, status',
      roles: '++id, name',
      users: '++id, email, roleId, status',
      taxes: '++id, name, rate'
    });
    // Version 8: Add Transaction Number Series
    this.version(8).stores({
      products: '++id, name, sku, category, hsnCode, stock',
      partners: '++id, name, phone, type, gstin',
      quotations: '++id, customerId, status, date',
      salesOrders: '++id, orderNumber, partnerName, customerId, status, date',
      deliveryNotes: '++id, salesOrderId, date',
      invoices: '++id, invoiceNumber, customerId, status, date, dueDate, total',
      purchaseOrders: '++id, purchaseOrderNumber, vendorId, status, date',
      purchaseBills: '++id, billNumber, supplierId, date, dueDate, status, total',
      payments: '++id, invoiceId, purchaseBillId, date, type, paymentNumber',
      settings: '++id',
      categories: '++id, name, parentId',
      brands: '++id, name',
      manufacturers: '++id, name',
      adjustments: '++id, productId, date, status',
      salesReceipts: '++id, customerId, status, date',
      expenses: '++id, date, category, vendorId',
      goodsReceipts: '++id, purchaseOrderId, vendorId, date, grnNumber',
      vendorCredits: '++id, creditNoteNumber, vendorId, date, status',
      roles: '++id, name',
      users: '++id, email, roleId, status',
      taxes: '++id, name, rate',
      numberSeries: '++id, &docType'
    });
  }
}

export const db = new HardwareERPDB();
