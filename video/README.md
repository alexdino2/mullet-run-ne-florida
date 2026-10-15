# Mullet run explainer video

A ~2-minute narrated explainer of the Atlantic mullet run, from Northeast Florida
to Miami. Every fact comes from the site's own guides (`src/lib/content/guides.ts`),
and the peak-window chart uses the same season model as the Atlantic score
(`seasonFactor` in `src/lib/score.ts`).

This is a one-time build, so nothing here runs on a schedule.

| File | What it does |
| ---- | ------------ |
| `narration.json` | The script: what the voice says and the on-screen captions, scene by scene |
| `voiceover.py` | Speaks each line with a Piper neural voice and writes `build/timeline.json` |
| `music.py` | Generates a soft music bed (pad, plucks, surf) to sit under the voice |
| `explainer.html` | The animation, drawn on a canvas as a pure function of time |
| `render.cjs` | Steps through the animation frame by frame and encodes it with ffmpeg |
| `extract_florida.py` | Builds `data/florida.json` (state outline + Atlantic coast) from us-atlas |

## Rebuild

```bash
pip install piper-tts numpy
curl -sSLO https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/high/en_US-lessac-high.onnx
curl -sSLO https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/high/en_US-lessac-high.onnx.json

python3 video/voiceover.py --voice en_US-lessac-high.onnx   # build/narration.wav + timeline.json
python3 video/music.py                                      # build/music.wav
node video/render.cjs                                       # build/florida-mullet-run-explainer.mp4
```

Needs Node with Playwright (Chromium), ffmpeg, and the Inter font installed.

To check a scene without a full render, grab stills (seconds into the video):

```bash
node video/render.cjs --stills 6,23,52,88
```

or serve the folder (`python3 -m http.server -d video`) and open
`explainer.html?play` for a live preview with the voice.

To change the words, edit `narration.json` and rerun all three steps. Scene
lengths follow the voiceover, so the animation stays in sync.
