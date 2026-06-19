import puppeteer from 'puppeteer';
import fs from 'fs';

async function runThemeProfile() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000)); // wait for hydration and animations
  
  console.log('Starting trace...');
  await page.tracing.start({ path: 'theme-trace.json', screenshots: false });
  
  // Click the dark theme button
  await page.evaluate(() => {
    const darkBtn = document.querySelector('button[aria-label="Switch to dark theme"]');
    if (darkBtn) darkBtn.click();
    else {
      // Find by text or data attribute if aria-label is different
      const btns = Array.from(document.querySelectorAll('button'));
      const dBtn = btns.find(b => b.textContent.includes('Dark') || b.querySelector('.material-symbols-outlined')?.textContent.includes('dark_mode'));
      if (dBtn) dBtn.click();
    }
  });
  
  await new Promise(r => setTimeout(r, 1000)); // Let the paint settle
  await page.tracing.stop();
  console.log('Trace complete.');
  
  await browser.close();
}

function parseTrace(filename) {
  if (!fs.existsSync(filename)) return;
  const trace = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const events = trace.traceEvents || [];
  
  let paintTime = 0;
  let layoutTime = 0;
  let styleRecalcTime = 0;

  for (const e of events) {
    if (e.ph === 'X' || e.ph === 'B' || e.ph === 'E') {
      const dur = e.dur || (e.tdur || 0);
      if (e.name === 'Paint') paintTime += dur;
      if (e.name === 'Layout') layoutTime += dur;
      if (e.name === 'UpdateLayoutTree') styleRecalcTime += dur;
    }
  }
  
  console.log(`\n--- Theme Switch Performance ---`);
  console.log(`Style Recalc: ${(styleRecalcTime / 1000).toFixed(2)}ms`);
  console.log(`Layout Cost: ${(layoutTime / 1000).toFixed(2)}ms`);
  console.log(`Paint Cost: ${(paintTime / 1000).toFixed(2)}ms`);
}

async function main() {
  await runThemeProfile();
  parseTrace('theme-trace.json');
}

main().catch(console.error);
