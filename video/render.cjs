/*
 * Render explainer.html to MP4, frame by frame, with the voiceover and music.
 *
 *   node video/render.cjs                      # full video -> build/florida-mullet-run-explainer.mp4
 *   node video/render.cjs --stills 5,20,48     # PNG stills at those seconds (for review)
 *   node video/render.cjs --fps 24 --to 30     # quick partial render
 *
 * Needs: Playwright (Chromium), ffmpeg, and build/{timeline.json,narration.wav,music.wav}
 * from voiceover.py and music.py.
 */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const BUILD = path.join(HERE, "build");
const arg = (name, def) => {
  const i = process.argv.indexOf("--" + name);
  return i > 0 ? process.argv[i + 1] : def;
};

(async () => {
  const timeline = fs.readFileSync(path.join(BUILD, "timeline.json"), "utf8");
  const florida = fs.readFileSync(path.join(HERE, "data", "florida.json"), "utf8");
  const duration = JSON.parse(timeline).duration;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", (e) => { console.error("page error:", e.message); process.exit(1); });
  await page.addInitScript(`window.TIMELINE=${timeline};window.FLORIDA=${florida};`);
  await page.goto("file://" + path.join(HERE, "explainer.html"));
  await page.waitForFunction("window.READY === true");

  const grab = (t, type, q) =>
    page.evaluate(([t, type, q]) => { window.renderAt(t); return document.getElementById("c").toDataURL(type, q); }, [t, type, q]);

  const stills = arg("stills");
  if (stills) {
    for (const s of stills.split(",").map(Number)) {
      const url = await grab(s, "image/png");
      const out = path.join(BUILD, `still-${String(s).padStart(6, "0")}.png`);
      fs.writeFileSync(out, Buffer.from(url.split(",")[1], "base64"));
      console.log(out);
    }
    await browser.close();
    return;
  }

  const fps = Number(arg("fps", 30));
  const to = Math.min(duration, Number(arg("to", duration)));
  const out = path.resolve(arg("out", path.join(BUILD, "florida-mullet-run-explainer.mp4")));
  const frames = Math.round(to * fps);
  const ff = spawn("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-i", path.join(BUILD, "narration.wav"),
    "-i", path.join(BUILD, "music.wav"),
    "-filter_complex",
    // voice up front; music ducks under it
    "[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[v1][v2];" +
      "[2:a]aresample=48000,volume=0.30[m];" +
      "[m][v2]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=450[md];" +
      "[v1][md]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-t", String(to), "-movflags", "+faststart",
    out,
  ], { stdio: ["pipe", "inherit", "inherit"] });

  const started = Date.now();
  for (let f = 0; f < frames; f++) {
    const url = await grab(f / fps, "image/jpeg", 0.95);
    const buf = Buffer.from(url.split(",")[1], "base64");
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % (fps * 10) === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  console.log("wrote", out);
})();
