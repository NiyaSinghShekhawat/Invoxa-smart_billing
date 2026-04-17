import { useEffect, useRef } from "react";

const ALERT_SRC = "/sounds/alert.mp3";

/**
 * Loops or plays alert while `alertId` is set (priority popup open).
 * Stops and resets audio when `alertId` clears (e.g. acknowledge).
 */
export function AlertSound({ alertId }) {
  const ref = useRef(null);
  const lastStartedId = useRef(null);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    if (!alertId) {
      audio.pause();
      audio.currentTime = 0;
      lastStartedId.current = null;
      return;
    }

    if (alertId === lastStartedId.current) return;

    lastStartedId.current = alertId;
    audio.currentTime = 0;
    audio.loop = true;
    audio.play().catch(() => {
      /* autoplay blocked or missing asset */
    });
  }, [alertId]);

  return <audio ref={ref} src={ALERT_SRC} preload="auto" />;
}
