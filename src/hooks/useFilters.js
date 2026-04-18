import { useCallback, useMemo, useState } from "react";

export function useFilters(items) {
  const [type,   setType]   = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((e) => {
      if (type   !== "all" && e.type   !== type)   return false;
      if (status !== "all" && e.status !== status) return false;
      return true;
    });
  }, [items, type, status]);

  const reset = useCallback(() => { setType("all"); setStatus("all"); }, []);

  return { type, setType, status, setStatus, filtered, reset };
}