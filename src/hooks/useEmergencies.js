import { useCallback, useEffect, useState } from "react";
import { subscribeToEmergencies } from "../services/api.js";
import { useDashboard } from "../store/DashboardContext.jsx";

export function useEmergencies() {
  const { dispatch } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    const unsubscribe = subscribeToEmergencies(
      (data) => {
        dispatch({ type: "SET_EMERGENCIES", payload: data });
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    let unsubscribe;
    setLoading(true);
    load().then((fn) => {
      unsubscribe = fn;
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [load]);

  return { loading, error };
}
