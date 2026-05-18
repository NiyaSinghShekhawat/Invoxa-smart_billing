export const INDIAN_STATES = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
  { name: "Delhi", code: "07" },
  { name: "Jammu & Kashmir", code: "01" },
  { name: "Ladakh", code: "38" },
  { name: "Puducherry", code: "34" },
  { name: "Chandigarh", code: "04" },
];

export const PAYMENT_METHODS = ["Cash", "UPI", "Bank Transfer", "Cheque", "Credit", "Mixed"];

export const DEFAULT_SETTINGS = {
  businessName: "",
  ownerName: "",
  gstin: "",
  phone: "",
  email: "",
  address: "",
  state: "Rajasthan",
  stateCode: "08",
  pincode: "",
  logo: null,
  terms: "1. All sales are final.\n2. Goods once sold will not be taken back.\n3. Subject to local jurisdiction.\n4. E&OE.",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  branchName: "",
};

export const EMPTY_STOCK_ITEM = {
  name: "",
  company: "",
  hsnCode: "",
  costPrice: "",
  sellingPrice: "",
  gstPct: 18,
  taxable: true,
  dateOfPurchase: "",
  quantity: "",
};

export const EMPTY_BILL_ITEM = {
  productId: null,
  name: "",
  hsnCode: "",
  company: "",
  qty: 1,
  rate: 0,
  gstPct: 18,
  taxable: true,
};

export function generateInvoiceNumber() {
  const d = new Date();
  const yy = d.getFullYear().toString().slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${yy}${mm}-${rand}`;
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtDateDisplay(str) {
  if (!str) return "—";
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}