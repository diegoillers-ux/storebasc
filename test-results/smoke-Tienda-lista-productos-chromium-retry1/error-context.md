# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Tienda lista productos
- Location: e2e\smoke.spec.ts:15:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('main a[href*="/tienda/"], main article, main [class*="product"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('main a[href*="/tienda/"], main article, main [class*="product"]').first()

```

```yaml
- main:
  - paragraph:
    - strong: "404"
    - text: ": NOT_FOUND Code:"
    - code: "`DEPLOYMENT_NOT_FOUND`"
    - text: "ID:"
    - code: "`iad1::qtnfz-1787779156648-cd0f00bb8e49`"
  - link "This deployment cannot be found. For more information and troubleshooting, see our documentation.":
    - /url: https://vercel.com/docs/errors/DEPLOYMENT_NOT_FOUND
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Smoke test: rutas públicas críticas de storebasc.
  5  |  * Solo lectura/verificación de render — no crea datos.
  6  |  */
  7  | 
  8  | test('Portada carga y muestra el header de marca', async ({ page }) => {
  9  |   await page.goto('/');
  10 |   await expect(page).toHaveTitle(/\S/);
  11 |   // Header visible (logo o navegación principal)
  12 |   await expect(page.locator('header').first()).toBeVisible();
  13 | });
  14 | 
  15 | test('Tienda lista productos', async ({ page }) => {
  16 |   await page.goto('/tienda');
  17 |   // Espera a que haya contenido de productos (cards)
  18 |   const cards = page.locator('main a[href*="/tienda/"], main article, main [class*="product"]').first();
> 19 |   await expect(cards).toBeVisible({ timeout: 15_000 });
     |                       ^ Error: expect(locator).toBeVisible() failed
  20 | });
  21 | 
  22 | test('Servicios disponibles se renderizan', async ({ page }) => {
  23 |   await page.goto('/servicios');
  24 |   await expect(page.locator('main')).toBeVisible();
  25 |   const content = await page.locator('main').innerText();
  26 |   expect(content.trim().length).toBeGreaterThan(0);
  27 | });
  28 | 
  29 | test('Página de login accesible', async ({ page }) => {
  30 |   await page.goto('/login');
  31 |   await expect(page.locator('main, form').first()).toBeVisible();
  32 | });
  33 | 
```