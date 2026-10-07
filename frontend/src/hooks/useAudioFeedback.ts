import { useState, useCallback, useEffect } from 'react';

// Singleton AudioContext shared across all consumers
let sharedAudioContext: AudioContext | null = null;

function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }

  return sharedAudioContext;
}

// Global user-gesture unlocker to satisfy browser Autoplay policies
let isUnlockAttached = false;
function attachUnlockListeners() {
  if (isUnlockAttached || typeof window === 'undefined') return;
  isUnlockAttached = true;

  const unlockAudio = () => {
    const ctx = getSharedAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true, capture: true });
  });
}

// Global synchronized mute state across Header, GameContext, and any other components
let globalMuted = typeof window !== 'undefined'
  ? localStorage.getItem('ilp_audio_muted') === 'true'
  : false;

const muteListeners = new Set<(muted: boolean) => void>();

function setGlobalMuted(muted: boolean) {
  globalMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ilp_audio_muted', String(muted));
  }
  muteListeners.forEach((fn) => fn(muted));
}

// Initial listener attachment
if (typeof window !== 'undefined') {
  attachUnlockListeners();

  window.addEventListener('storage', (e) => {
    if (e.key === 'ilp_audio_muted') {
      const next = e.newValue === 'true';
      if (globalMuted !== next) {
        setGlobalMuted(next);
      }
    }
  });
}

export function playTickSound() {
  if (globalMuted) return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.04, now);
    // Clean decay to silence without RangeError risk
    gain.gain.setTargetAtTime(0.0001, now, 0.015);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);

    osc.onended = () => {
      try {
        osc.disconnect();
        gain.disconnect();
      } catch {}
    };
  } catch {
    // Audio not permitted or failed gracefully
  }
}

export function playWinFanfareSound() {
  if (globalMuted) return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = now + idx * 0.11;
      const noteDuration = 0.32;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(0.1, noteStart + 0.02);
      gain.gain.setTargetAtTime(0.0001, noteStart + 0.03, 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      };
    });
  } catch {
    // Audio fallback
  }
}

export function isAudioMuted(): boolean {
  return globalMuted;
}

export function toggleAudioMuted(): boolean {
  const next = !globalMuted;
  setGlobalMuted(next);
  return next;
}

export function useAudioFeedback() {
  const [isMuted, setIsMuted] = useState(globalMuted);

  useEffect(() => {
    const listener = (muted: boolean) => setIsMuted(muted);
    muteListeners.add(listener);
    return () => {
      muteListeners.delete(listener);
    };
  }, []);

  const toggleMute = useCallback(() => {
    toggleAudioMuted();
  }, []);

  const playTick = useCallback(() => {
    playTickSound();
  }, []);

  const playWinFanfare = useCallback(() => {
    playWinFanfareSound();
  }, []);

  return {
    isMuted,
    toggleMute,
    playTick,
    playWinFanfare,
  };
}
