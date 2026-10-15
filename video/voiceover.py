"""Synthesize the narration with Piper and write the timeline the animation follows.

Each caption line is spoken as its own clip, so caption timing is exact.

Usage:
  pip install piper-tts numpy
  # voice: https://huggingface.co/rhasspy/piper-voices (en_US-lessac-high)
  python3 video/voiceover.py --voice path/to/en_US-lessac-high.onnx
Writes video/build/narration.wav and video/build/timeline.json.
"""
import argparse
import json
import os
import wave

import numpy as np
from piper import PiperVoice
from piper.config import SynthesisConfig

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
LINE_GAP = 0.42     # pause between sentences
SCENE_LEAD = 0.55   # quiet beat at the start of each scene
SCENE_TAIL = 0.75   # beat after the last line of a scene


def synth(voice, text, cfg):
    chunks = list(voice.synthesize(text, syn_config=cfg))
    audio = np.concatenate([c.audio_float_array for c in chunks])
    return audio, chunks[0].sample_rate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True)
    ap.add_argument("--length-scale", type=float, default=1.06, help=">1 speaks slower")
    args = ap.parse_args()

    os.makedirs(BUILD, exist_ok=True)
    script = json.load(open(os.path.join(HERE, "narration.json")))
    voice = PiperVoice.load(args.voice)
    cfg = SynthesisConfig(length_scale=args.length_scale, noise_scale=0.6, noise_w_scale=0.75)

    rate = None
    track = []
    t = 0.0
    scenes = []
    for scene in script["scenes"]:
        start = t
        t += scene.get("leadIn", SCENE_LEAD)
        lines = []
        for i, line in enumerate(scene["lines"]):
            audio, sr = synth(voice, line["say"], cfg)
            rate = rate or sr
            # trim leading/trailing near-silence so gaps are consistent
            idx = np.where(np.abs(audio) > 0.01)[0]
            audio = audio[max(0, idx[0] - 200): idx[-1] + 400] if len(idx) else audio
            dur = len(audio) / sr
            track.append((t, audio))
            lines.append({"text": line["show"], "start": round(t, 3), "end": round(t + dur, 3)})
            t += dur + (LINE_GAP if i < len(scene["lines"]) - 1 else 0)
        t += scene.get("tail", SCENE_TAIL)
        scenes.append({"id": scene["id"], "visual": scene["visual"], "start": round(start, 3),
                       "end": round(t, 3), "lines": lines})
        print(f"{scene['id']:>8}: {start:6.2f} -> {t:6.2f}")

    total = t
    mix = np.zeros(int(total * rate) + rate, dtype=np.float32)
    for at, audio in track:
        i = int(at * rate)
        mix[i:i + len(audio)] += audio
    mix = np.clip(mix / max(1e-6, np.abs(mix).max()) * 0.89, -1, 1)
    with wave.open(os.path.join(BUILD, "narration.wav"), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(rate)
        wf.writeframes((mix * 32767).astype(np.int16).tobytes())

    json.dump({"duration": round(total, 3), "scenes": scenes},
              open(os.path.join(BUILD, "timeline.json"), "w"), indent=1)
    print(f"total {total:.2f}s")


if __name__ == "__main__":
    main()
