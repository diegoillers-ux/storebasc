/* Paso 2 sandbox: paga la preferencia con tarjeta APRO (doc oficial MP).
 * Uso: node scripts/mp-sandbox-pay2.mjs <init_point_url>
 */
import { chromium } from '@playwright/test';
import fs from 'fs';

const CARD = { number: '5254133674403564', name: 'APRO', expiry: '11/30', cvv: '123', doc: '123456789' };
const buyer = JSON.parse(fs.readFileSync('/tmp/opencode/mp-test-buyer.json', 'utf8'));
const initPoint = process.argv[2];
if (!initPoint) throw new Error('Falta init_point');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1366, height: 900 },
  locale: 'es-CO',
});
const page = await context.newPage();
const shot = (n) => page.screenshot({ path: `/tmp/opencode/mp2-${n}.png` });

await page.goto(initPoint, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(5000);

const emailInput = page.locator('input[type="email"], input[name="user"], input#user_id').first();
if (await emailInput.isVisible({ timeout: 10000 }).catch(() => false)) {
  await emailInput.fill(buyer.email);
  await page.locator('button[type="submit"], button:has-text("Continuar")').first().click();
  await page.waitForTimeout(3000);
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible({ timeout: 10000 }).catch(() => false)) {
    await passInput.fill(buyer.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(6000);
  }
}
await shot('1-post-login');

// Elegir pagar con tarjeta si hay selector de medio
for (const sel of ['text=/tarjeta de crédito/i', 'text=/nueva tarjeta/i', 'text=/débito/i']) {
  const el = page.locator(sel).first();
  if (await el.isVisible({ timeout: 3000 }).catch(() => false)) { await el.click(); await page.waitForTimeout(2000); break; }
}

async function fillInFrames(placeholderRe, value) {
  for (const frame of page.frames()) {
    const loc = frame.locator('input').filter({ hasNot: frame.locator('[type="hidden"]') });
    const count = await loc.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const input = loc.nth(i);
      const ph = (await input.getAttribute('placeholder').catch(() => '')) || '';
      const name = (await input.getAttribute('name').catch(() => '')) || '';
      const id = (await input.getAttribute('id').catch(() => '')) || '';
      if (placeholderRe.test(`${ph} ${name} ${id}`) && await input.isVisible().catch(() => false)) {
        await input.click();
        await input.fill('');
        await input.pressSequentially(value, { delay: 40 });
        return true;
      }
    }
  }
  return false;
}

async function fillSecure(id, value) {
  for (const frame of page.frames()) {
    if (!frame.url().includes('secure-fields')) continue;
    const input = frame.locator(`#${id}`);
    if (await input.count() > 0 && await input.first().isVisible().catch(() => false)) {
      await input.first().click();
      await input.first().pressSequentially(value, { delay: 80 });
      return true;
    }
  }
  return false;
}

console.log('numero:', await fillSecure('cardNumber', CARD.number));
await page.waitForTimeout(2500);
console.log('cvv:', await fillSecure('securityCode', CARD.cvv));
console.log('vence:', (await fillSecure('expirationDate', CARD.expiry)) || ((await fillSecure('expirationMonth', '11')) && (await fillSecure('expirationYear', '30'))));
console.log('nombre:', await fillInFrames(/titular|cardholderName/i, CARD.name));
console.log('doc:', await fillInFrames(/cardholderIdentificationNumber/i, CARD.doc));
await shot('2-form');
const cont = page.locator('button:has-text("Continuar"), button:has-text("Pagar")').last();
if (await cont.isVisible({ timeout: 5000 }).catch(() => false)) { await cont.click(); await page.waitForTimeout(12000); }
await shot('3-final');
// Cuotas: elegir 1x y confirmar (click en el elemento más profundo con ese texto)
await page.getByText('cuotas', { exact: false }).first().waitFor({ timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
const clicked = await page.evaluate(() => {
  const all = Array.from(document.querySelectorAll('*'));
  const norm = (s) => (s || '').replace(/[\s\u00a0]+/g, ' ').trim();
  const cands = all.filter((el) => el.children.length === 0 && norm(el.textContent).startsWith('1x'));
  const target = cands[0];
  if (!target) return 'sin-candidatos:' + norm(document.body.innerText).slice(0, 120);
  (target.closest('li, div[role], button, a') || target).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  target.click();
  return true;
}).catch((e) => 'error:' + String(e).slice(0, 80));
console.log('click-1x:', clicked);
await page.waitForTimeout(6000);
await shot('4-cuota');
  // Revisión final: confirmar pago
  for (const sel of ['button:has-text("Pagar")', 'button:has-text("Confirmar")', 'button:has-text("Continuar")']) {
    const btn = page.locator(sel).last();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) { await btn.click(); await page.waitForTimeout(12000); break; }
  }
  await shot('5-pagado');
console.log('URL final:', page.url().slice(0, 160));
await browser.close();
