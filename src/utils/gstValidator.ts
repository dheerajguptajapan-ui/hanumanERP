/**
 * Offline GSTIN Validator using Mod-36 Checksum Algorithm
 * Format: 22AAAAA0000A1Z5
 */

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const CHAR_MAP = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function validateGSTIN(gstin: string): { isValid: boolean; error?: string } {
  if (!gstin) return { isValid: false, error: 'GSTIN is required' };
  const upperGstin = gstin.toUpperCase();

  // 1. Basic Length & Format Check
  if (upperGstin.length !== 15) {
    return { isValid: false, error: 'GSTIN must be 15 characters long' };
  }

  if (!GST_REGEX.test(upperGstin)) {
    return { isValid: false, error: 'Invalid GSTIN format' };
  }

  // 2. State Code Check (01 to 38 are valid Indian state codes)
  const stateCode = parseInt(upperGstin.substring(0, 2));
  if (stateCode < 1 || stateCode > 38) {
    return { isValid: false, error: 'Invalid State Code (First 2 digits)' };
  }

  // 3. Mod-36 Checksum Validation (The complex part)
  try {
    let factor = 1;
    let sum = 0;
    const checkDigit = upperGstin[14];

    for (let i = 0; i < 14; i++) {
      const codeValue = CHAR_MAP.indexOf(upperGstin[i]);
      let digitValue = codeValue * factor;
      
      // If result is > 36, sum digits in base 36
      digitValue = Math.floor(digitValue / 36) + (digitValue % 36);
      sum += digitValue;
      
      factor = factor === 1 ? 2 : 1;
    }

    const calculatedCheckDigitValue = (36 - (sum % 36)) % 36;
    const calculatedCheckDigit = CHAR_MAP[calculatedCheckDigitValue];

    if (calculatedCheckDigit !== checkDigit) {
      return { isValid: false, error: 'Checksum mismatch (Typo or Fake GSTIN)' };
    }

    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: 'Check digit calculation failed' };
  }
}

export function validatePAN(pan: string): { isValid: boolean; error?: string } {
  if (!pan) return { isValid: false, error: 'PAN is required' };
  const upperPan = pan.toUpperCase();
  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (upperPan.length !== 10) {
    return { isValid: false, error: 'PAN must be 10 characters long' };
  }

  if (!PAN_REGEX.test(upperPan)) {
    return { isValid: false, error: 'Invalid PAN format (e.g. ABCDE1234F)' };
  }
  return { isValid: true };
}

export interface GSTSplit {
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  isInterState: boolean;
}

/**
 * Automatically determines CGST/SGST vs IGST split
 */
export function calculateGSTSplit(
  sellerState: string,
  buyerState: string,
  taxableValue: number,
  totalGSTRate: number
): GSTSplit {
  const isInterState = sellerState.trim().toLowerCase() !== buyerState.trim().toLowerCase();
  
  if (isInterState) {
    return {
      cgstRate: 0,
      sgstRate: 0,
      igstRate: totalGSTRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: (taxableValue * totalGSTRate) / 100,
      isInterState: true
    };
  } else {
    const halfRate = totalGSTRate / 2;
    const halfAmount = (taxableValue * halfRate) / 100;
    return {
      cgstRate: halfRate,
      sgstRate: halfRate,
      igstRate: 0,
      cgstAmount: halfAmount,
      sgstAmount: halfAmount,
      igstAmount: 0,
      isInterState: false
    };
  }
}
