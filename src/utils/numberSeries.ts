import { db, type NumberSeriesDocType, type NumberSeries } from '../db';

/**
 * Default number series configuration for all document types.
 * Format: 4-letter prefix + hyphen + 6-digit zero-padded number
 * e.g. INVX-000001
 */
export const DEFAULT_NUMBER_SERIES: Omit<NumberSeries, 'id'>[] = [
  { docType: 'invoice',         label: 'Sales Invoice',         prefix: 'INVX', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'salesOrder',      label: 'Sales Order',           prefix: 'SORD', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'quotation',       label: 'Quotation',             prefix: 'QUOT', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'purchaseOrder',   label: 'Purchase Order',        prefix: 'PORD', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'bill',            label: 'Purchase Bill',         prefix: 'BILL', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'grn',             label: 'Goods Receipt (GRN)',   prefix: 'GRNR', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'creditNote',      label: 'Credit Note',           prefix: 'CRNT', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'vendorCredit',    label: 'Vendor Credit',         prefix: 'VCRD', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'salesReceipt',    label: 'Sales Receipt',         prefix: 'SRCP', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'paymentReceived', label: 'Payment Received',      prefix: 'PMTR', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'paymentMade',     label: 'Payment Made',          prefix: 'PMTM', nextNumber: 1, padLength: 6, isActive: true },
  { docType: 'stockAdjustment', label: 'Stock Adjustment',      prefix: 'SADJ', nextNumber: 1, padLength: 6, isActive: true },
];

/**
 * Seeds the default number series if the table is empty.
 * Call this once during app initialization.
 */
export async function seedNumberSeries(): Promise<void> {
  const count = await db.numberSeries.count();
  if (count === 0) {
    await db.numberSeries.bulkAdd(DEFAULT_NUMBER_SERIES);
  }
}

/**
 * Formats a number using the series configuration.
 * e.g. prefix='INVX', nextNumber=42, padLength=6 → 'INVX-000042'
 */
export function formatDocNumber(prefix: string, num: number, padLength: number): string {
  return `${prefix.toUpperCase()}-${num.toString().padStart(padLength, '0')}`;
}

/**
 * Atomically generates the next document number for a given document type.
 * Uses a Dexie transaction to prevent race conditions (duplicate numbers).
 *
 * @param docType - The document type key
 * @returns The formatted document number string e.g. 'INVX-000001'
 */
export async function generateDocNumber(docType: NumberSeriesDocType): Promise<string> {
  return await db.transaction('rw', db.numberSeries, async () => {
    const series = await db.numberSeries.where('docType').equals(docType).first();

    if (!series) {
      // Fallback if series not seeded yet — use timestamp to avoid collision
      const ts = Date.now().toString().slice(-6);
      return `${docType.slice(0, 4).toUpperCase()}-${ts}`;
    }

    const formatted = formatDocNumber(series.prefix, series.nextNumber, series.padLength);

    // Atomically increment
    await db.numberSeries.update(series.id!, { nextNumber: series.nextNumber + 1 });

    return formatted;
  });
}

/**
 * Preview the NEXT number without consuming it (for display only).
 */
export async function previewNextDocNumber(docType: NumberSeriesDocType): Promise<string> {
  const series = await db.numberSeries.where('docType').equals(docType).first();
  if (!series) return `${docType.slice(0, 4).toUpperCase()}-000001`;
  return formatDocNumber(series.prefix, series.nextNumber, series.padLength);
}
