import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertHealthyDocument } from '../e2e/health';

test('una página Vercel con main y HTTP 404 no cuenta como aplicación', () => {
  assert.throws(() => assertHealthyDocument(404, '<main>DEPLOYMENT_NOT_FOUND</main>'), /HTTP 404/);
});

test('una página de error con HTTP 200 tampoco supera el smoke', () => {
  assert.throws(() => assertHealthyDocument(200, '<main>DEPLOYMENT_NOT_FOUND</main>'), /página de error/);
});

test('un fallo de servidor no supera el smoke', () => {
  assert.throws(() => assertHealthyDocument(500, '<main>Error</main>'), /HTTP 500/);
});
