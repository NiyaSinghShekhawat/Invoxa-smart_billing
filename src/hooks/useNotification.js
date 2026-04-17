import { useCallback, useState } from "react";

export function useNotification() {
  const [visualAlert, setVisualAlert] = useState(false);

  const triggerVisual = useCallback(() => {
    setVisualAlert(true);
  }, []);

  const dismissVisual = useCallback(() => {
    setVisualAlert(false);
  }, []);

  return { visualAlert, triggerVisual, dismissVisual };
}
