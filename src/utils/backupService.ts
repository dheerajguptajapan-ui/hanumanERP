import { db } from '../db';
import { notifications } from '@mantine/notifications';

// ─────────────────────────────────────────────────────────────────────────────
// CSV Utilities
// ─────────────────────────────────────────────────────────────────────────────

function serializeCell(val: any): string {
  if (val === null || val === undefined) return '';
  if (Array.isArray(val) || typeof val === 'object') {
    // Nested objects/arrays → JSON string, then CSV-escaped
    const json = JSON.stringify(val);
    return `"${json.replace(/"/g, '""')}"`;
  }
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  const rows = data.map((row) => headers.map((h) => serializeCell(row[h])).join(','));
  return [headerRow, ...rows].join('\r\n');
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) {
      inQuotes = true;
    } else if (ch === '"' && inQuotes && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (ch === '"' && inQuotes) {
      inQuotes = false;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function csvToArray(text: string): any[] {
  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).filter((l) => l.trim()).map((line) => {
    const values = parseCSVLine(line);
    const obj: any = {};
    headers.forEach((h, i) => {
      const raw = (values[i] ?? '').trim();
      if (raw === '') {
        obj[h] = '';
        return;
      }
      // Try JSON parse first (for arrays/objects stored as JSON strings)
      if ((raw.startsWith('[') || raw.startsWith('{')) && raw.endsWith(']') || raw.endsWith('}')) {
        try {
          obj[h] = JSON.parse(raw);
          return;
        } catch {
          // Not valid JSON, treat as string
        }
      }
      // Auto-convert numbers (but not strings that look like IDs with leading zeros)
      if (raw !== '' && !isNaN(Number(raw)) && !raw.startsWith('0')) {
        obj[h] = Number(raw);
      } else {
        obj[h] = raw;
      }
    });
    return obj;
  });
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Configuration
// ─────────────────────────────────────────────────────────────────────────────

export type EntityKey =
  | 'products'
  | 'customers'
  | 'vendors'
  | 'salesOrders'
  | 'purchaseOrders'
  | 'invoices'
  | 'purchaseBills'
  | 'salesReceipts'
  | 'expenses'
  | 'payments'
  | 'goodsReceipts'
  | 'adjustments'
  | 'vendorCredits'
  | 'quotations'
  | 'deliveryNotes'
  | 'categories'
  | 'brands'
  | 'manufacturers'
  | 'taxes';

interface EntityConfig {
  key: EntityKey;
  label: string;
  /** Actual Dexie table name */
  table: string;
  /** Optional filter applied when exporting (e.g. for partners split) */
  filter?: Record<string, any>;
  /** Fields to inject when importing, on top of what's in the CSV */
  importDefaults?: (row: any) => Record<string, any>;
  /** Template columns + sample row */
  template: { headers: string[]; sample: any[] };
  category: 'master' | 'sales' | 'purchase' | 'finance' | 'inventory';
  hasItems: boolean; // whether the records contain a nested items[] array
}

export const ENTITY_CONFIGS: EntityConfig[] = [
  // ── Master Data ──────────────────────────────────────────────────────────
  {
    key: 'products',
    label: 'Products / Materials',
    table: 'products',
    category: 'master',
    hasItems: false,
    template: {
      headers: ['name', 'sku', 'hsnCode', 'category', 'brand', 'price', 'costPrice', 'stock', 'unit', 'description', 'minStock', 'gstRate', 'taxType'],
      sample: ['Steel Screw 1 inch', 'SCR-001', '7318', 'Fasteners', 'Generic', 2.5, 1.5, 1000, 'pcs', 'Zinc coated wood screw', 100, 18, 'GST'],
    },
  },
  {
    key: 'customers',
    label: 'Customers',
    table: 'partners',
    filter: { type: 'customer' },
    category: 'master',
    hasItems: false,
    importDefaults: (row) => ({
      type: 'customer',
      contactPersons: row.contactPersons || [],
      shippingLine1: row.shippingLine1 || row.billingLine1 || '',
      shippingCity: row.shippingCity || row.billingCity || '',
      shippingState: row.shippingState || row.billingState || '',
      shippingCountry: row.shippingCountry || row.billingCountry || 'India',
      shippingPincode: row.shippingPincode || row.billingPincode || '',
      state: row.state || row.billingState || '',
    }),
    template: {
      headers: ['name', 'phone', 'email', 'gstin', 'customerType', 'billingLine1', 'billingCity', 'billingState', 'billingCountry', 'billingPincode', 'group', 'creditLimit', 'currency', 'paymentTerms'],
      sample: ['Sharma Construction Co', '9876543210', 'sharma@example.com', '07AAAAA0000A1Z5', 'Business', '45 Okhla Phase 3', 'New Delhi', 'Delhi', 'India', '110020', 'Contractor', 100000, 'INR', 'Net 30'],
    },
  },
  {
    key: 'vendors',
    label: 'Vendors / Suppliers',
    table: 'partners',
    filter: { type: 'supplier' },
    category: 'master',
    hasItems: false,
    importDefaults: (row) => ({
      type: 'supplier',
      contactPersons: row.contactPersons || [],
      shippingLine1: row.shippingLine1 || row.billingLine1 || '',
      shippingCity: row.shippingCity || row.billingCity || '',
      shippingState: row.shippingState || row.billingState || '',
      shippingCountry: row.shippingCountry || row.billingCountry || 'India',
      shippingPincode: row.shippingPincode || row.billingPincode || '',
      state: row.state || row.billingState || '',
    }),
    template: {
      headers: ['name', 'phone', 'email', 'gstin', 'customerType', 'billingLine1', 'billingCity', 'billingState', 'billingCountry', 'billingPincode', 'group', 'currency', 'paymentTerms'],
      sample: ['Global Hardware Wholesalers', '9123456789', 'info@globalhard.com', '09CCCCC0000C1Z8', 'Business', 'Noida Sector 62', 'Noida', 'Uttar Pradesh', 'India', '201301', 'Wholesale', 'INR', 'Net 15'],
    },
  },
  {
    key: 'categories',
    label: 'Categories',
    table: 'categories',
    category: 'master',
    hasItems: false,
    template: {
      headers: ['name', 'parentId'],
      sample: ['Electricals', ''],
    },
  },
  {
    key: 'brands',
    label: 'Brands',
    table: 'brands',
    category: 'master',
    hasItems: false,
    template: {
      headers: ['name'],
      sample: ['Havells'],
    },
  },
  {
    key: 'manufacturers',
    label: 'Manufacturers',
    table: 'manufacturers',
    category: 'master',
    hasItems: false,
    template: {
      headers: ['name'],
      sample: ['Bosch'],
    },
  },
  {
    key: 'taxes',
    label: 'Tax Rates',
    table: 'taxes',
    category: 'master',
    hasItems: false,
    template: {
      headers: ['name', 'rate', 'isCompound', 'status'],
      sample: ['GST 18%', 18, false, 'active'],
    },
  },

  // ── Sales ────────────────────────────────────────────────────────────────
  {
    key: 'quotations',
    label: 'Quotations',
    table: 'quotations',
    category: 'sales',
    hasItems: true,
    template: {
      headers: ['customerId', 'customerName', 'date', 'status', 'subtotal', 'totalGst', 'cgst', 'sgst', 'igst', 'total', 'items'],
      sample: [1, 'Sharma Construction Co', '2024-01-15', 'draft', 10000, 1800, 900, 900, 0, 11800, '[{"productId":1,"productName":"Steel Screw","hsnCode":"7318","quantity":100,"price":100,"gstRate":18,"gstAmount":1800,"total":11800}]'],
    },
  },
  {
    key: 'salesOrders',
    label: 'Sales Orders (SO)',
    table: 'salesOrders',
    category: 'sales',
    hasItems: true,
    template: {
      headers: ['orderNumber', 'customerId', 'partnerName', 'date', 'shipmentDate', 'paymentTerms', 'status', 'subtotal', 'totalGst', 'cgst', 'sgst', 'igst', 'total', 'totalAmount', 'reference', 'items'],
      sample: ['SORD-000001', 1, 'Sharma Construction Co', '2024-01-15', '2024-01-25', 'Net 30', 'confirmed', 42000, 11760, 5880, 5880, 0, 53760, 53760, 'REF-001', '[{"productId":1,"productName":"Cement","hsnCode":"2523","quantity":100,"price":420,"gstRate":28,"gstAmount":11760,"total":53760}]'],
    },
  },
  {
    key: 'invoices',
    label: 'Invoices',
    table: 'invoices',
    category: 'sales',
    hasItems: true,
    template: {
      headers: ['invoiceNumber', 'customerId', 'customerName', 'date', 'dueDate', 'paymentTerms', 'status', 'subtotal', 'totalGst', 'cgst', 'sgst', 'igst', 'discount', 'discountType', 'shippingCharges', 'adjustment', 'total', 'amountPaid', 'salesperson', 'customerNotes', 'termsConditions', 'items'],
      sample: ['INVX-000001', 1, 'Sharma Construction Co', '2024-01-15', '2024-01-30', 'Net 15', 'unpaid', 5400, 972, 486, 486, 0, 0, '%', 0, 0, 6372, 0, 'Admin', '', 'Payment within 15 days', '[{"productId":1,"productName":"Bosch Drill","hsnCode":"8467","quantity":1,"price":5400,"gstRate":18,"gstAmount":972,"total":6372}]'],
    },
  },
  {
    key: 'deliveryNotes',
    label: 'Delivery Notes',
    table: 'deliveryNotes',
    category: 'sales',
    hasItems: true,
    template: {
      headers: ['deliveryNoteNumber', 'salesOrderId', 'customerId', 'customerName', 'date', 'status', 'items'],
      sample: ['DN-000001', 1, 1, 'Sharma Construction Co', '2024-01-20', 'delivered', '[{"productId":1,"productName":"Bosch Drill","quantity":1}]'],
    },
  },
  {
    key: 'salesReceipts',
    label: 'Sales Receipts',
    table: 'salesReceipts',
    category: 'sales',
    hasItems: true,
    template: {
      headers: ['receiptNumber', 'customerId', 'customerName', 'date', 'paymentMode', 'depositTo', 'status', 'subtotal', 'totalGst', 'cgst', 'sgst', 'igst', 'discount', 'discountType', 'shippingCharges', 'adjustment', 'total', 'reference', 'items'],
      sample: ['SRCP-000001', 1, 'Sharma Construction Co', '2024-01-15', 'Cash', 'Cash in Hand', 'saved', 5400, 972, 486, 486, 0, 0, '%', 0, 0, 6372, '', '[{"productId":1,"productName":"Bosch Drill","hsnCode":"8467","quantity":1,"price":5400,"gstRate":18,"gstAmount":972,"total":6372}]'],
    },
  },

  // ── Purchases ────────────────────────────────────────────────────────────
  {
    key: 'purchaseOrders',
    label: 'Purchase Orders (PO)',
    table: 'purchaseOrders',
    category: 'purchase',
    hasItems: true,
    template: {
      headers: ['purchaseOrderNumber', 'vendorId', 'vendorName', 'date', 'deliveryDate', 'paymentTerms', 'deliveryDestination', 'deliveryAddress', 'status', 'subtotal', 'totalGst', 'cgst', 'sgst', 'igst', 'discount', 'discountType', 'adjustment', 'total', 'reference', 'notes', 'items'],
      sample: ['PORD-000001', 1, 'Global Hardware Wholesalers', '2024-01-10', '2024-01-20', 'Net 30', 'organization', '45 Okhla Phase 3, Delhi', 'issued', 40000, 7200, 3600, 3600, 0, 0, '%', 0, 47200, 'PO-REF-001', '', '[{"productId":1,"productName":"Cement","hsnCode":"2523","quantity":100,"price":400,"gstRate":18,"gstAmount":7200,"total":47200}]'],
    },
  },
  {
    key: 'purchaseBills',
    label: 'Purchase Bills',
    table: 'purchaseBills',
    category: 'purchase',
    hasItems: true,
    template: {
      headers: ['billNumber', 'supplierId', 'supplierName', 'date', 'dueDate', 'paymentTerms', 'status', 'subtotal', 'totalGst', 'cgst', 'sgst', 'igst', 'discount', 'discountType', 'adjustment', 'total', 'amountPaid', 'orderNumber', 'subject', 'items'],
      sample: ['BILL-000001', 1, 'Global Hardware Wholesalers', '2024-01-12', '2024-01-27', 'Net 15', 'open', 40000, 7200, 3600, 3600, 0, 0, '%', 0, 47200, 0, 'PORD-000001', '', '[{"productId":1,"productName":"Cement","hsnCode":"2523","quantity":100,"price":400,"gstRate":18,"gstAmount":7200,"total":47200}]'],
    },
  },
  {
    key: 'goodsReceipts',
    label: 'Goods Receipts (GRN)',
    table: 'goodsReceipts',
    category: 'purchase',
    hasItems: true,
    template: {
      headers: ['grnNumber', 'purchaseOrderId', 'vendorId', 'vendorName', 'date', 'reference', 'notes', 'items'],
      sample: ['GRNR-000001', 1, 1, 'Global Hardware Wholesalers', '2024-01-15', 'REF-001', '', '[{"productId":1,"productName":"Cement","orderedQuantity":100,"receivedQuantity":100,"price":400}]'],
    },
  },

  // ── Finance ─────────────────────────────────────────────────────────────
  {
    key: 'expenses',
    label: 'Expenses',
    table: 'expenses',
    category: 'finance',
    hasItems: false,
    template: {
      headers: ['date', 'category', 'amount', 'isTaxInclusive', 'taxRate', 'vendorId', 'reference', 'notes', 'customerId'],
      sample: ['2024-01-15', 'Office Supplies', 500, false, '18%', '', 'EXP-001', 'Monthly stationery purchase', ''],
    },
  },
  {
    key: 'payments',
    label: 'Payments',
    table: 'payments',
    category: 'finance',
    hasItems: false,
    template: {
      headers: ['paymentNumber', 'customerId', 'customerName', 'date', 'amount', 'paymentMode', 'depositTo', 'type', 'status', 'invoiceId', 'purchaseBillId', 'bankCharges', 'reference', 'notes'],
      sample: ['PMTR-000001', 1, 'Sharma Construction Co', '2024-01-20', 6372, 'Bank Transfer', 'HDFC Current A/c', 'inbound', 'paid', 1, '', 0, 'TXN-REF-001', ''],
    },
  },
  {
    key: 'vendorCredits',
    label: 'Vendor Credits',
    table: 'vendorCredits',
    category: 'purchase',
    hasItems: true,
    template: {
      headers: ['creditNoteNumber', 'vendorId', 'vendorName', 'date', 'status', 'subtotal', 'total', 'balance', 'discount', 'adjustment', 'orderNumber', 'reference', 'subject', 'notes', 'createdAt', 'items'],
      sample: ['VCRD-000001', 1, 'Global Hardware Wholesalers', '2024-01-20', 'open', 1000, 1180, 1180, 0, 0, 'PORD-000001', '', 'Return of damaged goods', '', '2024-01-20', '[{"productId":1,"productName":"Cement","quantity":2,"price":500,"gstRate":18,"total":1180}]'],
    },
  },

  // ── Inventory Operations ─────────────────────────────────────────────────
  {
    key: 'adjustments',
    label: 'Stock Adjustments',
    table: 'adjustments',
    category: 'inventory',
    hasItems: false,
    template: {
      headers: ['referenceNumber', 'productId', 'productName', 'date', 'reason', 'type', 'adjustmentType', 'quantityAdjusted', 'newQuantityOnHand', 'costPrice', 'account', 'description', 'status'],
      sample: ['SADJ-000001', 1, 'Steel Screw 1 inch', '2024-01-15', 'Damaged goods', 'quantity', 'remove', 50, 950, 1.5, 'Stock Adjustment', 'Damaged in storage', 'adjusted'],
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Backup Service
// ─────────────────────────────────────────────────────────────────────────────

export const backupService = {
  // ── Full JSON Backup Export ──────────────────────────────────────────────

  async exportDatabase() {
    try {
      const exportData: any = {};
      for (const table of db.tables) {
        exportData[table.name] = await table.toArray();
      }
      const payload = {
        version: 3,
        appName: 'Inventory Management ERP',
        exportedAt: new Date().toISOString(),
        data: exportData,
      };
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      downloadFile(
        JSON.stringify(payload, null, 2),
        `erp-full-backup-${timestamp}.json`,
        'application/json'
      );
      notifications.show({ title: '✅ Backup Exported', message: 'Full database exported as JSON.', color: 'green' });
    } catch (error) {
      console.error('Export failed:', error);
      notifications.show({ title: 'Backup Failed', message: 'Could not export database.', color: 'red' });
    }
  },

  // ── JSON Import / Restore ────────────────────────────────────────────────

  async createSnapshot(): Promise<Record<string, any[]>> {
    const snapshot: Record<string, any[]> = {};
    for (const table of db.tables) {
      snapshot[table.name] = await table.toArray();
    }
    return snapshot;
  },

  async restoreSnapshot(snapshot: Record<string, any[]>): Promise<void> {
    for (const table of db.tables) {
      await table.clear();
    }
    for (const [tableName, rows] of Object.entries(snapshot)) {
      const tbl = db.tables.find((t) => t.name === tableName);
      if (tbl && Array.isArray(rows) && rows.length > 0) {
        await tbl.bulkAdd(rows);
      }
    }
  },

  async importDatabase(file: File): Promise<void> {
    let importData: any;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importData = parsed.data ?? parsed;
    } catch {
      notifications.show({ title: 'Invalid File', message: 'The file is not a valid JSON backup.', color: 'red' });
      return;
    }

    const notifId = 'backup-in-progress';
    notifications.show({
      id: notifId,
      title: 'Creating safety backup...',
      message: 'Saving current data before restoring.',
      color: 'blue',
      loading: true,
      autoClose: false,
    });

    let snapshot: Record<string, any[]> = {};
    try { snapshot = await backupService.createSnapshot(); } catch {}

    try {
      await backupService.restoreSnapshot(importData);
      notifications.hide(notifId);
      notifications.show({ title: '✅ Restore Complete', message: 'All data restored. Reloading app...', color: 'green' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Import failed, rolling back:', error);
      try {
        await backupService.restoreSnapshot(snapshot);
        notifications.hide(notifId);
        notifications.show({ title: 'Import Failed — Restored', message: 'Import failed. Your data has been rolled back automatically.', color: 'orange', autoClose: 8000 });
      } catch {
        notifications.hide(notifId);
        notifications.show({ title: '🚨 Critical Error', message: 'Import and rollback both failed. Restore from a manual backup file.', color: 'red', autoClose: false });
      }
    }
  },

  // ── CSV Export per Entity ─────────────────────────────────────────────────

  async exportEntityAsCSV(entityKey: EntityKey): Promise<void> {
    const config = ENTITY_CONFIGS.find((c) => c.key === entityKey);
    if (!config) {
      notifications.show({ title: 'Error', message: 'Unknown entity type.', color: 'red' });
      return;
    }

    try {
      let rows: any[];
      if (config.filter) {
        // Filter-based export (e.g. customers vs vendors from partners table)
        const tbl = db.tables.find((t) => t.name === config.table);
        if (!tbl) throw new Error(`Table ${config.table} not found`);
        const all = await tbl.toArray();
        rows = all.filter((r) =>
          Object.entries(config.filter!).every(([k, v]) => r[k] === v)
        );
      } else {
        const tbl = db.tables.find((t) => t.name === config.table);
        if (!tbl) throw new Error(`Table ${config.table} not found`);
        rows = await tbl.toArray();
      }

      if (rows.length === 0) {
        notifications.show({ title: 'No Data', message: `No ${config.label} records found to export.`, color: 'yellow' });
        return;
      }

      const csv = arrayToCSV(rows);
      downloadFile(csv, `${entityKey}-export-${today()}.csv`, 'text/csv;charset=utf-8;');
      notifications.show({
        title: '✅ Exported',
        message: `${config.label}: ${rows.length} records exported.`,
        color: 'green',
      });
    } catch (error: any) {
      console.error('CSV export error:', error);
      notifications.show({ title: 'Export Failed', message: error.message || 'Could not export CSV.', color: 'red' });
    }
  },

  // ── CSV Import per Entity ─────────────────────────────────────────────────

  async importEntityFromCSV(entityKey: EntityKey, file: File): Promise<number> {
    const config = ENTITY_CONFIGS.find((c) => c.key === entityKey);
    if (!config) throw new Error('Unknown entity type.');

    const text = await file.text();
    const rows = csvToArray(text);
    if (rows.length === 0) throw new Error('CSV file is empty or has no data rows.');

    const tbl = db.tables.find((t) => t.name === config.table);
    if (!tbl) throw new Error(`Table "${config.table}" not found in database.`);

    // Apply importDefaults + strip the id field
    const cleaned = rows.map((row) => {
      const { id, ...rest } = row;
      const defaults = config.importDefaults ? config.importDefaults(rest) : {};
      return { ...rest, ...defaults };
    });

    await (tbl as any).bulkAdd(cleaned);
    return cleaned.length;
  },

  // ── CSV Template Download ────────────────────────────────────────────────

  downloadTemplate(entityKey: EntityKey): void {
    const config = ENTITY_CONFIGS.find((c) => c.key === entityKey);
    if (!config) return;

    const { headers, sample } = config.template;
    const headerRow = headers.join(',');
    const sampleRow = sample.map((v) => serializeCell(v)).join(',');
    const csv = [headerRow, sampleRow].join('\r\n');
    downloadFile(csv, `${entityKey}-template.csv`, 'text/csv;charset=utf-8;');
  },

  // ── Auto-Backup ──────────────────────────────────────────────────────────

  async performAutoBackup(): Promise<void> {
    try {
      const exportData: any = {};
      for (const table of db.tables) {
        exportData[table.name] = await table.toArray();
      }
      const payload = JSON.stringify({ timestamp: Date.now(), data: exportData });
      try {
        localStorage.setItem('erp_auto_backup_ts', String(Date.now()));
        localStorage.setItem('erp_auto_backup', payload);
      } catch (e: any) {
        if (e?.name === 'QuotaExceededError') {
          console.warn('Auto-backup skipped: localStorage quota exceeded.');
        }
      }
    } catch (e) {
      console.warn('Auto-backup failed:', e);
    }
  },
};
