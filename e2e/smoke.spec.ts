import { test, expect } from '@playwright/test';

/**
 * Smoke test: rutas públicas críticas de storebasc.
 * Solo lectura/verificación de render — no crea datos.
 */

test('Portada carga y muestra el header de marca', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/\S/);
  // Header visible (logo o navegación principal)
  await expect(page.locator('header').first()).toBeVisible();
});

test('Tienda lista productos', async ({ page }) => {
  await page.goto('/tienda');
  // Espera a que haya contenido de productos (cards)
  const cards = page.locator('main a[href*="/tienda/"], main article, main [class*="product"]').first();
  await expect(cards).toBeVisible({ timeout: 15_000 });
});

test('Servicios disponibles se renderizan', async ({ page }) => {
  await page.goto('/servicios');
  await expect(page.locator('main')).toBeVisible();
  const content = await page.locator('main').innerText();
  expect(content.trim().length).toBeGreaterThan(0);
});

test('Página de login accesible', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('main, form').first()).toBeVisible();
});
