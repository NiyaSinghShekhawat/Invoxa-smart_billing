// src/components/EmergencyAlert/AlertSound.jsx
import { useEffect, useRef } from "react";

/** Public asset; copied to dist/sounds/ at build time (see public/sounds/). */
const ALERT_SRC = `${import.meta.env.BASE_URL}sounds/alert.mp3`;

export function AlertSound({ alertId }) {
  const primedRef = useRef(false);

  // One quiet play after first gesture helps satisfy autoplay policy for later alert playback.
  useEffect(() => {
    const prime = () => {
      if (primedRef.current) return;
      primedRef.current = true;
      const a = new Audio(ALERT_SRC);
      a.volume = 0.001;
      void a
        .play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
        })
        .catch(() => {});
    };
    document.addEventListener("pointerdown", prime, { passive: true });
    document.addEventListener("keydown", prime);
    return () => {
      document.removeEventListener("pointerdown", prime);
      document.removeEventListener("keydown", prime);
    };
  }, []);

  useEffect(() => {
    if (!alertId) return;
    const audio = new Audio(ALERT_SRC);
    audio.loop = true;
    audio.volume = 1;

    const tryPlay = () => void audio.play().catch(() => {});
    tryPlay();

    const onGesture = () => tryPlay();
    document.addEventListener("pointerdown", onGesture, { passive: true });
    document.addEventListener("keydown", onGesture);

    return () => {
      document.removeEventListener("pointerdown", onGesture);
      document.removeEventListener("keydown", onGesture);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [alertId]);

  return null;
}
