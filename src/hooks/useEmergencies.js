import { useCallback, useEffect, useState } from "react";
import { subscribeToEmergencies } from "../services/api.js";
import { useDashboard } from "../store/DashboardContext.jsx";

export function useEmergencies() {
  const { dispatch } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToEmergencies(
      (data) => {
        dispatch({ type: "SET_EMERGENCIES", payload: data });
        setLoading(false);
      },
      (err) => {
        console.error("Firebase subscription error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [dispatch]);

  return { loading, error };
}