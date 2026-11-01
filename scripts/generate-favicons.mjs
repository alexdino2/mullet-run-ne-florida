// One-off: render src/app/icon.svg into the raster icons Google and
// browsers look for. Next.js picks these up by filename from src/app/:
//   favicon.ico     -> /favicon.ico (48x48 + 32x32 + 16x16)
//   icon.png        -> <link rel="icon" sizes="192x192">
//   apple-icon.png  -> <link rel="apple-touch-icon">
// Re-run after changing icon.svg:  node scripts/generate-favicons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

// Playwright is pre-installed globally in dev/CI containers, not a project dep.
const { chromium } = createRequire(import.meta.url)("playwright");

const svg = readFileSync("src/app/icon.svg", "utf8");

async function render(page, size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">` +
      svg.replace("<svg ", `<svg width="${size}" height="${size}" `) +
      `</body></html>`,
  );
  return page.locator("svg").screenshot({ omitBackground: true });
}

// ICO container holding PNG-encoded images (supported by all modern browsers).
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // color planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += png.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

const browser = await chromium.launch();
const page = await browser.newPage();

const ico = [];
for (const size of [48, 32, 16]) ico.push({ size, png: await render(page, size) });
writeFileSync("src/app/favicon.ico", buildIco(ico));
writeFileSync("src/app/icon.png", await render(page, 192));
writeFileSync("src/app/apple-icon.png", await render(page, 180));

await browser.close();
console.log("Wrote src/app/favicon.ico, icon.png, apple-icon.png");
