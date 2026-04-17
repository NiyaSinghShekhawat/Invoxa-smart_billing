import { useMemo, useState } from "react";
import { EMERGENCY_TYPE_LABELS } from "../utils/constants.js";
import { formatLocation } from "../utils/formatters.js";
import { reporterDetailsSearchBlob } from "../utils/reporterDetails.js";

export function useSearch(items) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((e) => {
      const id = String(e.id).toLowerCase();
      const loc = formatLocation(e.location).toLowerCase();
      const notes = String(e.additionalNotes ?? e.summary ?? "").toLowerCase();
      const typeLabel = String(EMERGENCY_TYPE_LABELS[e.type] ?? e.type ?? "").toLowerCase();
      const reporter = reporterDetailsSearchBlob(e.reporterDetails);
      return (
        id.includes(q) ||
        loc.includes(q) ||
        notes.includes(q) ||
        typeLabel.includes(q) ||
        reporter.includes(q)
      );
    });
  }, [items, query]);

  return { query, setQuery, results };
}
