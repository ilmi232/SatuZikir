// Web Audio API Synthesizer for instant, lag-free tasbih bead click sounds
let audioCtx: AudioContext | null = null;

export function playTasbihClick(enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Woodblock / subtle prayer bead acoustic click
    osc.type = 'sine';
    const now = audioCtx.currentTime;

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio playback errors on restricted autoplay
  }
}

export function playMilestoneSound(enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    // Pleasant 3-note harmonic chime (33x milestone)
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      const noteTime = now + index * 0.09;

      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });
  } catch {
    // Ignore audio error
  }
}

export function triggerHaptic(type: 'tap' | 'milestone' | 'complete' = 'tap', enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;

  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'tap') {
        navigator.vibrate(22); // subtle haptic tap
      } else if (type === 'milestone') {
        navigator.vibrate([40, 60, 50]); // 33x round milestone vibration
      } else if (type === 'complete') {
        navigator.vibrate([100, 50, 100, 50, 200]); // Target complete celebration
      }
    }
  } catch {
    // Ignore unsupported vibration
  }
}
