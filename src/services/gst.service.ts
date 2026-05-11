import { calculateGSTSplit, validateGSTIN, validatePAN, type GSTSplit } from '../utils/gstValidator';

export interface TaxCalculationResult {
  subtotal: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isInterState: boolean;
  items: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
    gstRate: number;
  }[];
}

export class GstService {
  /**
   * Calculates total tax and GST split for a list of items
   * @param items List of items with quantity, price, and gstRate
   * @param sellerState State of the selling organization
   * @param buyerState State of the customer/vendor
   * @param discount Discount amount (fixed)
   * @param adjustment Adjustment amount (fixed)
   */
  static calculateTotals(
    items: { quantity: number; price: number; gstRate: number }[],
    sellerState: string,
    buyerState: string,
    discount: number = 0,
    adjustment: number = 0
  ): TaxCalculationResult {
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const calculatedItems = items.map(item => {
      const itemTaxableValue = (item.quantity * item.price);
      // Proportionate discount per item for accurate GST calculation
      const itemDiscount = subtotal > 0 ? (itemTaxableValue / subtotal) * discount : 0;
      const itemNetTaxableValue = itemTaxableValue - itemDiscount;

      const split = calculateGSTSplit(sellerState, buyerState, itemNetTaxableValue, item.gstRate);
      
      totalCgst += split.cgstAmount;
      totalSgst += split.sgstAmount;
      totalIgst += split.igstAmount;

      return {
        cgst: split.cgstAmount,
        sgst: split.sgstAmount,
        igst: split.igstAmount,
        total: itemTaxableValue + split.cgstAmount + split.sgstAmount + split.igstAmount,
        gstRate: item.gstRate
      };
    });

    const totalGst = totalCgst + totalSgst + totalIgst;
    const total = (subtotal - discount) + totalGst + adjustment;

    return {
      subtotal,
      totalGst,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      total,
      isInterState: sellerState.trim().toLowerCase() !== buyerState.trim().toLowerCase(),
      items: calculatedItems
    };
  }

  static validateGST(gstin: string) {
    return validateGSTIN(gstin);
  }

  static validatePAN(pan: string) {
    return validatePAN(pan);
  }
}
