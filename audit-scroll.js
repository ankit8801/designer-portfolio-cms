import puppeteer from 'puppeteer';
import fs from 'fs';

async function runScrollProfile() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000)); // Hydration
  
  console.log('Starting trace...');
  // Capture trace with advanced rendering metrics
  await page.tracing.start({ path: 'scroll-trace.json', screenshots: false });
  
  // Smooth scroll down the page
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if(totalHeight >= 2000){ // scroll 2000px
          clearInterval(timer);
          resolve();
        }
      }, 16); // 60fps scrolling
    });
  });
  
  await new Promise(r => setTimeout(r, 500)); // Let the final paints settle
  await page.tracing.stop();
  console.log('Trace complete.');
  
  // Try to get layer count by interrogating CDP
  const client = await page.target().createCDPSession();
  await client.send('DOM.enable');
  await client.send('LayerTree.enable');
  
  // Wait for layers to populate
  await new Promise(r => setTimeout(r, 500));
  
  const layers = await client.send('LayerTree.compositingReasons', { layerId: '0' }).catch(() => null);
  
  console.log('Layer extraction attempted.');
  await browser.close();
}

function parseTrace(filename) {
  if (!fs.existsSync(filename)) return;
  const trace = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const events = trace.traceEvents || [];
  
  let paintTime = 0;
  let compositeTime = 0;
  let layoutTime = 0;
  let frames = 0;

  for (const e of events) {
    if (e.ph === 'X' || e.ph === 'B' || e.ph === 'E') {
      const dur = e.dur || (e.tdur || 0);
      if (e.name === 'Paint') paintTime += dur;
      if (e.name === 'CompositeLayers') compositeTime += dur;
      if (e.name === 'Layout') layoutTime += dur;
    }
    if (e.name === 'DrawFrame') frames++;
  }
  
  console.log(`\n--- Scroll Performance (Home.jsx) ---`);
  console.log(`Paint Cost: ${(paintTime / 1000).toFixed(2)}ms`);
  console.log(`Composite Cost: ${(compositeTime / 1000).toFixed(2)}ms`);
  console.log(`Layout Cost: ${(layoutTime / 1000).toFixed(2)}ms`);
  console.log(`Frames Drawn: ${frames}`);
}

async function main() {
  await runScrollProfile();
  parseTrace('scroll-trace.json');
}

main().catch(console.error);
