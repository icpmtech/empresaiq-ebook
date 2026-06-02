const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateIcon(size, outputPath) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });

  const svg = `
    <html>
      <head>
        <style>
          html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
          body { background: linear-gradient(160deg, #1D2951 0%, #141e3c 100%); }
          .frame { position: relative; width: 100%; height: 100%; }
          .spine { position: absolute; left: 0; top: 0; bottom: 0; width: ${Math.max(8, Math.round(size * 0.06))}px; background: #E8720C; }
          .grid { position: absolute; inset: 0; opacity: 0.18; background-image: linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px); background-size: ${Math.round(size * 0.08)}px ${Math.round(size * 0.08)}px; }
          .hex { position: absolute; left: 50%; top: 44%; width: ${Math.round(size * 0.44)}px; height: ${Math.round(size * 0.36)}px; transform: translate(-50%, -50%); }
          .hex::before, .hex::after { content: ''; position: absolute; inset: 0; border: ${Math.max(2, Math.round(size * 0.01))}px solid #fff; border-radius: 18px; transform: skewY(-8deg); }
          .core { position: absolute; left: 50%; top: 44%; width: ${Math.round(size * 0.2)}px; height: ${Math.round(size * 0.2)}px; transform: translate(-50%, -50%) rotate(45deg); border: ${Math.max(2, Math.round(size * 0.01))}px solid #E8720C; border-radius: 18px; display: flex; align-items: center; justify-content: center; color: #fff; font: bold ${Math.round(size * 0.11)}px Arial, sans-serif; letter-spacing: 0.08em; background: rgba(232,114,12,0.08); }
          .text { position: absolute; left: 50%; bottom: ${Math.round(size * 0.1)}px; transform: translateX(-50%); color: #fff; text-align: center; font-family: Arial, sans-serif; width: 88%; }
          .title { font-size: ${Math.round(size * 0.08)}px; font-weight: bold; letter-spacing: 0.12em; }
          .sub { margin-top: ${Math.round(size * 0.014)}px; font-size: ${Math.round(size * 0.035)}px; letter-spacing: 0.08em; opacity: 0.92; }
        </style>
      </head>
      <body>
        <div class="frame">
          <div class="spine"></div>
          <div class="grid"></div>
          <div class="hex"></div>
          <div class="core">EQ</div>
          <div class="text">
            <div class="title">EMPRESAIQ</div>
            <div class="sub">IA LOCAL • OLLAMA • QWEN2.5</div>
          </div>
        </div>
      </body>
    </html>`;

  await page.setContent(svg, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: outputPath, omitBackground: false });
  await browser.close();
}

(async () => {
  const outDir = path.join(__dirname, '..', 'static', 'img');
  fs.mkdirSync(outDir, { recursive: true });
  await generateIcon(192, path.join(outDir, 'icon-192.png'));
  await generateIcon(512, path.join(outDir, 'icon-512.png'));
  console.log('Generated PWA icons in', outDir);
})();
