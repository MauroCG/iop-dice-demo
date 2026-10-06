import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
  durationSeconds: number;
  onExpire?: () => void;
  autoStart?: boolean;
}

export function useCountdown({
  durationSeconds,
  onExpire,
  autoStart = true,
}: UseCountdownOptions) {
  const [timeLeftMs, setTimeLeftMs] = useState(durationSeconds * 1000);
  const [isRunning, setIsRunning] = useState(autoStart);

  const endTimeRef = useRef<number>(Date.now() + durationSeconds * 1000);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const reset = useCallback(
    (newDurationSec?: number) => {
      const dur = newDurationSec !== undefined ? newDurationSec : durationSeconds;
      endTimeRef.current = Date.now() + dur * 1000;
      setTimeLeftMs(dur * 1000);
      setIsRunning(true);
    },
    [durationSeconds]
  );

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  useEffect(() => {
    if (!isRunning) return;

    let animFrameId: number;

    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, endTimeRef.current - now);
      setTimeLeftMs(diff);

      if (diff <= 0) {
        setIsRunning(false);
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      } else {
        animFrameId = requestAnimationFrame(tick);
      }
    };

    animFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animFrameId);
  }, [isRunning]);

  const totalMs = durationSeconds * 1000;
  const progressPercent = Math.min(100, Math.max(0, (timeLeftMs / totalMs) * 100));
  const secondsRemaining = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const isUrgent = secondsRemaining <= 5 && secondsRemaining > 2;
  const isCritical = secondsRemaining <= 2;

  return {
    timeLeftMs,
    secondsRemaining,
    progressPercent,
    isRunning,
    isUrgent,
    isCritical,
    reset,
    pause,
    resume,
  };
}
