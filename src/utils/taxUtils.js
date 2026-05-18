// ─── GST Slabs ────────────────────────────────────────────────────────────────
export const GST_SLABS = [0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28];

// ─── Amount in Words ──────────────────────────────────────────────────────────
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numToWords(n) {
  if (n === 0) return "Zero";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
  if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
  if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
  return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
}

export function amountToWords(amount) {
  if (!amount || isNaN(amount)) return "Zero Rupees Only";
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);
  let result = numToWords(rupees) + " Rupees";
  if (paise > 0) result += " and " + numToWords(paise) + " Paise";
  return result + " Only";
}

// ─── Core Tax Calculator ───────────────────────────────────────────────────────
/**
 * Calculate tax for a single line item
 * @param {number} qty
 * @param {number} rate - price per unit (exclusive of GST)
 * @param {number} gstPct - total GST % (e.g. 18)
 * @param {"CGST_SGST"|"IGST"} gstMode
 * @returns {{ subtotal, gstPct, gstAmount, cgst, sgst, igst, total }}
 */
export function calcItemTax(qty, rate, gstPct, gstMode) {
  const subtotal = round2(qty * rate);
  const gstAmount = round2(subtotal * gstPct / 100);
  const half = round2(gstAmount / 2);

  return {
    subtotal,
    gstPct,
    gstAmount,
    cgst: gstMode === "CGST_SGST" ? half : 0,
    sgst: gstMode === "CGST_SGST" ? half : 0,
    igst: gstMode === "IGST" ? gstAmount : 0,
    total: round2(subtotal + gstAmount),
  };
}

/**
 * Aggregate tax summary grouped by GST slab
 * @param {Array} items - each has { qty, rate, gstPct, tax: calcItemTax result }
 * @param {"CGST_SGST"|"IGST"} gstMode
 * @returns {Array<{ gstPct, taxableAmt, cgst, sgst, igst }>}
 */
export function buildTaxSummary(items, gstMode) {
  const slabMap = {};
  for (const item of items) {
    const key = item.gstPct;
    if (!slabMap[key]) slabMap[key] = { gstPct: key, taxableAmt: 0, cgst: 0, sgst: 0, igst: 0 };
    slabMap[key].taxableAmt = round2(slabMap[key].taxableAmt + item.tax.subtotal);
    slabMap[key].cgst = round2(slabMap[key].cgst + item.tax.cgst);
    slabMap[key].sgst = round2(slabMap[key].sgst + item.tax.sgst);
    slabMap[key].igst = round2(slabMap[key].igst + item.tax.igst);
  }
  return Object.values(slabMap).sort((a, b) => a.gstPct - b.gstPct);
}

/**
 * Calculate complete invoice totals
 */
export function calcInvoiceTotals(items, gstMode, additionalCharges = 0, discount = 0, receivedAmount = 0) {
  const taxedItems = items.map(it => ({
    ...it,
    tax: calcItemTax(parseFloat(it.qty) || 0, parseFloat(it.rate) || 0, parseFloat(it.gstPct) || 0, gstMode),
  }));

  const subtotal = round2(taxedItems.reduce((s, it) => s + it.tax.subtotal, 0));
  const totalGst = round2(taxedItems.reduce((s, it) => s + it.tax.gstAmount, 0));
  const taxSummary = buildTaxSummary(taxedItems, gstMode);
  const totalBeforeAdj = round2(subtotal + totalGst);
  const totalAmount = round2(totalBeforeAdj + (parseFloat(additionalCharges) || 0) - (parseFloat(discount) || 0));
  const received = round2(parseFloat(receivedAmount) || 0);
  const due = round2(Math.max(0, totalAmount - received));

  return { taxedItems, subtotal, totalGst, taxSummary, totalAmount, received, due };
}

// ─── GST Mode Auto-Detection ──────────────────────────────────────────────────
export function suggestGstMode(sellerState, buyerState) {
  if (!sellerState || !buyerState) return null;
  return sellerState.trim().toLowerCase() === buyerState.trim().toLowerCase()
    ? "CGST_SGST"
    : "IGST";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function fmtINR(n) {
  return "₹" + (parseFloat(n) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}