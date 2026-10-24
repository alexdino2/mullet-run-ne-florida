"""Generate a soft, royalty-free music bed (pad + plucks + surf) to sit under the voice.

Usage: python3 video/music.py  (reads build/timeline.json for length, writes build/music.wav)
"""
import json
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
SR = 44100
BPM = 92
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # small enough to run as a plain loop
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


def pad_note(freq, dur):
    t = np.arange(int(dur * SR)) / SR
    tone = sum(np.sin(2 * np.pi * freq * d * t + rng.uniform(0, 6)) for d in (0.996, 1.0, 1.004))
    tone += 0.35 * sum(np.sin(2 * np.pi * 2 * freq * d * t) for d in (0.998, 1.002))
    env = np.minimum(1, t / 1.6) * np.minimum(1, (dur - t) / 1.8).clip(0)
    return tone * env / 4


def pluck(freq, dur=1.2):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 4.5)
    return (np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 9)) * env


def main():
    total = json.load(open(os.path.join(BUILD, "timeline.json")))["duration"] + 1.0
    n = int(total * SR)
    pad = np.zeros(n)
    plucks = np.zeros(n)

    # D major, laid back: D - Bm - G - A (two bars each)
    chords = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]]
    beat = 60 / BPM
    bar = 4 * beat
    chord_len = 2 * bar
    t = 0.0
    k = 0
    while t < total:
        notes = chords[k % 4]
        for m in notes:
            s = pad_note(midi(m), chord_len + 1.6)
            i = int(t * SR)
            pad[i:i + len(s)] += s[: max(0, n - i)]
        # pentatonic plucks on the off-beats, starting after the title card
        if t > 4:
            scale = [62, 64, 66, 69, 71, 74, 76]
            for e in range(16):
                if rng.random() < 0.42:
                    at = t + e * beat / 2
                    m = scale[rng.integers(len(scale))]
                    p = pluck(midi(m)) * (0.55 if e % 4 == 0 else 0.35)
                    i = int(at * SR)
                    plucks[i:i + len(p)] += p[: max(0, n - i)]
        t += chord_len
        k += 1

    pad = lowpass(pad, 1400)
    surf = lowpass(rng.standard_normal(n), 500)
    tt = np.arange(n) / SR
    surf *= 0.5 + 0.5 * np.sin(2 * np.pi * tt / 7.5) ** 2  # slow wave swells

    mix = 0.55 * pad / np.abs(pad).max() + 0.22 * plucks / np.abs(plucks).max() + 0.12 * surf / np.abs(surf).max()
    fade = np.minimum(1, tt / 2.5) * np.minimum(1, (total - tt) / 4).clip(0)
    mix = mix * fade
    mix = mix / np.abs(mix).max() * 0.9
    stereo = np.stack([mix, np.roll(mix, int(0.012 * SR))], axis=1)
    with wave.open(os.path.join(BUILD, "music.wav"), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes((stereo * 32767).astype(np.int16).tobytes())
    print(f"music {total:.1f}s")


if __name__ == "__main__":
    main()
