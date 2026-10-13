import { test, expect, type Page } from '@playwright/test';
import { assertHealthyDocument } from './health';

async function navigate(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response, `Sin respuesta para ${path}`).not.toBeNull();
  assertHealthyDocument(response!.status(), await response!.text());
}

test('Portada muestra la navegación de Ananda', async ({ page }) => {
  await navigate(page, '/');
  await expect(page).toHaveTitle(/Espíritu Ananda/);
  await expect(page.locator('header').first()).toBeVisible();
  await expect(page.locator('header').first().getByRole('link', { name: /Tienda/i })).toBeVisible();
});

test('Tienda muestra su catálogo o estado vacío', async ({ page }) => {
  await navigate(page, '/tienda');
  await expect(page.getByRole('heading', { name: 'Objetos con Alma & Propósito' })).toBeVisible();
});

test('Servicios muestra su catálogo o estado vacío', async ({ page }) => {
  await navigate(page, '/servicios');
  await expect(page.getByRole('heading', { name: 'Sesiones & Lecturas Astrales' })).toBeVisible();
});

test('Login muestra campos y botón de acceso reales', async ({ page }) => {
  await navigate(page, '/login');
  await expect(page.locator('form input[name="email"]')).toBeVisible();
  await expect(page.locator('form input[name="password"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /Iniciar Sesión/ })).toBeVisible();
});
