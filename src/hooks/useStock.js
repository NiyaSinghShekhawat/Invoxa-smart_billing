import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabase";

function toDb(item, userId) {
  return {
    user_id:          userId,
    name:             item.name,
    company:          item.company         ?? "",
    hsn_code:         item.hsnCode         ?? "",
    cost_price:       parseFloat(item.costPrice)    || 0,
    selling_price:    parseFloat(item.sellingPrice) || 0,
    gst_pct:          parseFloat(item.gstPct)       ?? 18,
    taxable:          item.taxable         ?? true,
    quantity:         item.quantity != null ? parseInt(item.quantity) : null,
    date_of_purchase: item.dateOfPurchase  || null,
  };
}

function fromDb(row) {
  return {
    id:              row.id,
    name:            row.name,
    company:         row.company          ?? "",
    hsnCode:         row.hsn_code         ?? "",
    costPrice:       parseFloat(row.cost_price),
    sellingPrice:    parseFloat(row.selling_price),
    gstPct:          parseFloat(row.gst_pct),
    taxable:         row.taxable,
    quantity:        row.quantity,
    dateOfPurchase:  row.date_of_purchase ?? "",
  };
}

export function useStock(userId) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all stock for user
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("stock")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) setError(error.message);
      else setStock((data || []).map(fromDb));
      setLoading(false);
    })();
  }, [userId]);

  // Add new item
  const addItem = useCallback(async (item) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("stock")
      .insert(toDb(item, userId))
      .select()
      .single();

    if (error) throw new Error(error.message);
    setStock(prev => [fromDb(data), ...prev]);
    return fromDb(data);
  }, [userId]);

  // Update item
  const updateItem = useCallback(async (id, changes) => {
    if (!userId) return;
    const current = stock.find(s => s.id === id);
    if (!current) return;
    const merged = { ...current, ...changes };

    const { data, error } = await supabase
      .from("stock")
      .update(toDb(merged, userId))
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    setStock(prev => prev.map(s => s.id === id ? fromDb(data) : s));
  }, [userId, stock]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (!userId) return;
    const { error } = await supabase
      .from("stock")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    setStock(prev => prev.filter(s => s.id !== id));
  }, [userId]);

  return { stock, loading, error, addItem, updateItem, deleteItem };
}