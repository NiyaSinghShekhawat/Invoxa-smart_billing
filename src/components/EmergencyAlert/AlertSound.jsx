// src/components/EmergencyAlert/AlertSound.jsx
import { useEffect, useRef } from "react";

export function AlertSound({ alertId }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!alertId) return;
    const audio = new Audio("/sounds/alert.mp3");
    audio.loop = true;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.currentTime = 0; };
  }, [alertId]);

  return null;
}
