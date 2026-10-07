import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  playTickSound,
  playWinFanfareSound,
  isAudioMuted,
  toggleAudioMuted,
} from './useAudioFeedback';

// Simple mock for AudioContext
class MockAudioParam {
  value = 1;
  setValueAtTime = vi.fn();
  linearRampToValueAtTime = vi.fn();
  setTargetAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class MockAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode extends MockAudioNode {
  frequency = new MockAudioParam();
  type = 'sine';
  start = vi.fn();
  stop = vi.fn();
  onended: (() => void) | null = null;
}

class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

class MockAudioContext {
  state = 'running';
  currentTime = 10;
  destination = new MockAudioNode();
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
  resume = vi.fn().mockResolvedValue(undefined);
}

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, val: string) => {
      store[key] = val;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

describe('Audio singleton and playback logic', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
    vi.stubGlobal('localStorage', mockLocalStorage);
    mockLocalStorage.clear();
  });

  it('permite reproducir tick y fanfare sin errores', () => {
    expect(() => playTickSound()).not.toThrow();
    expect(() => playWinFanfareSound()).not.toThrow();
  });

  it('sincroniza el estado de silencio (mute) correctamente', () => {
    const initial = isAudioMuted();
    expect(typeof initial).toBe('boolean');

    const toggled = toggleAudioMuted();
    expect(toggled).toBe(!initial);
    expect(isAudioMuted()).toBe(toggled);

    // Call sounds while muted/unmuted without throwing
    expect(() => playTickSound()).not.toThrow();
    expect(() => playWinFanfareSound()).not.toThrow();

    // Toggle back
    const restored = toggleAudioMuted();
    expect(restored).toBe(initial);
  });
});
