import puppeteer from 'puppeteer';
import fs from 'fs';

async function runProfile() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Inject spy to count getBoundingClientRect calls
  await page.evaluateOnNewDocument(() => {
    window.rectCalls = 0;
    const original = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
      // Only count calls on the main execution thread to avoid noise
      window.rectCalls++;
      return original.apply(this, arguments);
    };
    
    // Also track forced layouts (scrollTop/offsetHeight reads)
    window.layoutReads = 0;
    const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight').get;
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      get: function() {
        window.layoutReads++;
        return origOffsetHeight.call(this);
      }
    });
  });

  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000)); // Hydration

  const themeButton = await page.$('button[title="Dark"]');
  if (!themeButton) {
    console.log('No Dark theme button found!');
    await browser.close();
    return;
  }

  console.log('Resetting counters...');
  await page.evaluate(() => { window.rectCalls = 0; window.layoutReads = 0; });

  await page.tracing.start({ path: 'layoutId-trace.json', screenshots: false });
  
  const startTime = Date.now();
  await themeButton.click();
  
  // Wait for exactly 180ms (the duration of the tween in Navbar.jsx) plus a small buffer
  await new Promise(r => setTimeout(r, 250)); 
  
  await page.tracing.stop();
  const endTime = Date.now();

  const metrics = await page.evaluate(() => ({
    rectCalls: window.rectCalls,
    layoutReads: window.layoutReads
  }));

  console.log('\n=======================================');
  console.log('    LAYOUT_ID INDICATOR PROFILE');
  console.log('=======================================');
  console.log(`getBoundingClientRect calls: ${metrics.rectCalls}`);
  console.log(`offsetHeight reads: ${metrics.layoutReads}`);
  console.log(`Measured Execution Window: ${endTime - startTime}ms`);
  
  await browser.close();
}

function parseTrace(filename) {
  if (!fs.existsSync(filename)) return;
  const trace = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const events = trace.traceEvents || [];
  
  let layoutTime = 0;
  let paintTime = 0;
  let forcedLayouts = 0;

  for (const e of events) {
    if (e.ph === 'X' || e.ph === 'B' || e.ph === 'E') {
      const dur = e.dur || (e.tdur || 0);
      if (e.name === 'Layout') layoutTime += dur;
      if (e.name === 'Paint' || e.name === 'CompositeLayers') paintTime += dur;
      if (e.name === 'UpdateLayoutTree') forcedLayouts++;
    }
  }
  
  console.log(`Layout (Trace) Time: ${(layoutTime / 1000).toFixed(2)}ms`);
  console.log(`Paint Cost: ${(paintTime / 1000).toFixed(2)}ms`);
  console.log(`Browser Layout Tree Updates: ${forcedLayouts}`);
}

async function main() {
  await runProfile();
  parseTrace('layoutId-trace.json');
}

main().catch(console.error);
