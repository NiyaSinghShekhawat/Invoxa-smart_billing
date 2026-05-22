import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";

// ── Mappers ──────────────────────────────────────────────────────────────────

function invoiceToDb(inv, userId) {
  return {
    user_id:                  userId,
    invoice_number:           inv.invoiceNumber,
    invoice_date:             inv.invoiceDate || new Date().toISOString().split("T")[0],
    due_date:                 inv.dueDate     || null,
    place_of_supply:          inv.placeOfSupply        ?? "",
    payment_method:           inv.paymentMethod        ?? "Cash",
    gst_mode:                 inv.gstMode              ?? "CGST_SGST",
    buyer_name:               inv.buyerName,
    buyer_phone:              inv.buyerPhone            ?? "",
    buyer_gstin:              inv.buyerGstin            ?? "",
    buyer_address:            inv.buyerAddress          ?? "",
    buyer_state:              inv.buyerState            ?? "",
    buyer_state_code:         inv.buyerStateCode        ?? "",
    additional_charges:       parseFloat(inv.additionalCharges) || 0,
    additional_charges_label: inv.additionalChargesLabel ?? "Delivery Charges",
    discount:                 parseFloat(inv.discount)  || 0,
    subtotal:                 parseFloat(inv.subtotal)  || 0,
    total_gst:                parseFloat(inv.totalGst)  || 0,
    total_amount:             parseFloat(inv.totalAmount) || 0,
    received_amount:          parseFloat(inv.received) || 0,
    due_amount:               parseFloat(inv.due)       || 0,
    notes:                    inv.notes                 ?? "",
    status: parseFloat(inv.due) <= 0 ? "paid"
           : parseFloat(inv.received) > 0 ? "partial"
           : "unpaid",
  };
}

function invoiceFromDb(row) {
  return {
    id:                      row.id,
    invoiceNumber:           row.invoice_number,
    invoiceDate:             row.invoice_date,
    dueDate:                 row.due_date,
    placeOfSupply:           row.place_of_supply,
    paymentMethod:           row.payment_method,
    gstMode:                 row.gst_mode,
    buyerName:               row.buyer_name,
    buyerPhone:              row.buyer_phone,
    buyerGstin:              row.buyer_gstin,
    buyerAddress:            row.buyer_address,
    buyerState:              row.buyer_state,
    buyerStateCode:          row.buyer_state_code,
    additionalCharges:       parseFloat(row.additional_charges),
    additionalChargesLabel:  row.additional_charges_label,
    discount:                parseFloat(row.discount),
    subtotal:                parseFloat(row.subtotal),
    totalGst:                parseFloat(row.total_gst),
    totalAmount:             parseFloat(row.total_amount),
    received:                parseFloat(row.received_amount),
    due:                     parseFloat(row.due_amount),
    notes:                   row.notes,
    status:                  row.status,
    createdAt:               row.created_at,
  };
}

function itemToDb(item, invoiceId, userId, index) {
  return {
    invoice_id:  invoiceId,
    user_id:     userId,
    product_id:  item.productId  || null,
    name:        item.name,
    company:     item.company    ?? "",
    hsn_code:    item.hsnCode    ?? "",
    qty:         parseFloat(item.qty) || 1,
    rate:        parseFloat(item.rate) || 0,
    gst_pct:     parseFloat(item.gstPct) || 0,
    taxable:     item.taxable    ?? true,
    subtotal:    parseFloat(item.tax?.subtotal)   || 0,
    gst_amount:  parseFloat(item.tax?.gstAmount)  || 0,
    cgst:        parseFloat(item.tax?.cgst)        || 0,
    sgst:        parseFloat(item.tax?.sgst)        || 0,
    igst:        parseFloat(item.tax?.igst)        || 0,
    total:       parseFloat(item.tax?.total)       || 0,
    sort_order:  index,
  };
}

function itemFromDb(row) {
  return {
    id:        row.id,
    productId: row.product_id,
    name:      row.name,
    company:   row.company,
    hsnCode:   row.hsn_code,
    qty:       parseFloat(row.qty),
    rate:      parseFloat(row.rate),
    gstPct:    parseFloat(row.gst_pct),
    taxable:   row.taxable,
    tax: {
      subtotal:   parseFloat(row.subtotal),
      gstAmount:  parseFloat(row.gst_amount),
      cgst:       parseFloat(row.cgst),
      sgst:       parseFloat(row.sgst),
      igst:       parseFloat(row.igst),
      total:      parseFloat(row.total),
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────

export function useInvoices(userId) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load invoice list (without items — items fetched on demand)
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setInvoices((data || []).map(invoiceFromDb));
      setLoading(false);
    })();
  }, [userId]);

  // Save a complete invoice (header + line items) in a transaction-safe way
  const saveInvoice = useCallback(async (invoiceData) => {
    if (!userId) return;

    // 1. Insert invoice header
    const { data: invRow, error: invErr } = await supabase
      .from("invoices")
      .insert(invoiceToDb(invoiceData, userId))
      .select()
      .single();

    if (invErr) throw new Error(invErr.message);

    // 2. Insert all line items
    const itemRows = invoiceData.taxedItems.map((item, i) =>
      itemToDb(item, invRow.id, userId, i)
    );

    const { error: itemsErr } = await supabase
      .from("invoice_items")
      .insert(itemRows);

    if (itemsErr) {
      // Rollback header if items fail
      await supabase.from("invoices").delete().eq("id", invRow.id);
      throw new Error(itemsErr.message);
    }

    const saved = invoiceFromDb(invRow);
    setInvoices(prev => [saved, ...prev]);
    return saved;
  }, [userId]);

  // Load a single invoice WITH its items (for re-printing)
  const getInvoiceWithItems = useCallback(async (invoiceId) => {
    const { data: invRow, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", userId)
      .single();

    if (invErr) throw new Error(invErr.message);

    const { data: itemRows, error: itemsErr } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId)
      .order("sort_order");

    if (itemsErr) throw new Error(itemsErr.message);

    return {
      ...invoiceFromDb(invRow),
      taxedItems: (itemRows || []).map(itemFromDb),
    };
  }, [userId]);

  // Delete invoice (cascade deletes items via FK)
  const deleteInvoice = useCallback(async (invoiceId) => {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  }, [userId]);

  // Update payment status / received amount
  const updatePayment = useCallback(async (
    invoiceId,
    { received, due, status, notes }
  ) => {
  
    const { error } = await supabase
      .from("invoices")
      .update({
        received_amount: received,
        due_amount: due,
        status,
        notes,
      })
      .eq("id", invoiceId)
      .eq("user_id", userId);
  
    if (error) throw new Error(error.message);
  
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? { ...inv, received, due, status, notes }
          : inv
      )
    );
  
  }, [userId]);
  return { invoices, saveInvoice, getInvoiceWithItems, deleteInvoice, updatePayment };
}