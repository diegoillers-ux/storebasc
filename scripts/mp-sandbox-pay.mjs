/* Automatización sandbox: paga una preferencia como comprador de prueba.
 * Uso: node scripts/mp-sandbox-pay.mjs <init_point_url>
 * Lee credenciales de /tmp/opencode/mp-test-buyer.json (no commitear).
 * Tarjeta de prueba APRO según doc oficial MP (sin dinero real).
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
const shot = (n) => page.screenshot({ path: `/tmp/opencode/mp-${n}.png` });

await page.goto(initPoint, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
await shot('1-checkout');

// Si pide login, autenticar como comprador de prueba
const emailInput = page.locator('input[type="email"], input[name="user"], input#user_id').first();
if (await emailInput.isVisible({ timeout: 8000 }).catch(() => false)) {
  await emailInput.fill(buyer.email);
  await page.locator('button[type="submit"], button:has-text("Continuar")').first().click();
  await page.waitForTimeout(3000);
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible({ timeout: 8000 }).catch(() => false)) {
    await passInput.fill(buyer.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
  }
}
await shot('2-autenticado');

// Elegir tarjeta como medio de pago
for (const label of [/tarjeta/i, /crédito/i, /débito/i, /card/i]) {
  const el = page.getByText(label).first();
  if (await el.isVisible({ timeout: 3000 }).catch(() => false)) { await el.click(); break; }
}
await page.waitForTimeout(3000);
await shot('3-medio');

// Nueva tarjeta: número
const numInput = page.locator('input[inputmode="numeric"], input[name*="card" i], input[placeholder*="mero" i]').first();
if (await numInput.isVisible({ timeout: 8000 }).catch(() => false)) {
  await numInput.click();
  await numInput.pressSequentially(CARD.number, { delay: 50 });
  await page.waitForTimeout(2000);
  await shot('4-numero');
  const nameInput = page.locator('input[name*="name" i], input[placeholder*="titular" i], input[placeholder*="ombre" i]').first();
  if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) await nameInput.fill(CARD.name);
  const expInput = page.locator('input[placeholder*="MM" i], input[name*="expir" i], input[placeholder*="encim" i]').first();
  if (await expInput.isVisible({ timeout: 5000 }).catch(() => false)) await expInput.fill(CARD.expiry);
  const cvvInput = page.locator('input[name*="cvv" i], input[name*="security" i], input[placeholder*="digo" i]').first();
  if (await cvvInput.isVisible({ timeout: 5000 }).catch(() => false)) await cvvInput.fill(CARD.cvv);
  const docInput = page.locator('input[name*="doc" i], input[placeholder*="cumento" i]').first();
  if (await docInput.isVisible({ timeout: 5000 }).catch(() => false)) await docInput.fill(CARD.doc);
  await shot('5-form');
  const payBtn = page.locator('button:has-text("Pagar"), button:has-text("Pay"), button[type="submit"]').last();
  if (await payBtn.isVisible({ timeout: 5000 }).catch(() => false)) await payBtn.click();
  await page.waitForTimeout(10000);
}
await shot('6-final');
console.log('URL final:', page.url().slice(0, 120));
await browser.close();
