/** Reject infrastructure/error documents even if they contain a <main>. */
export function assertHealthyDocument(status: number, html: string): void {
  if (status < 200 || status >= 300) {
    throw new Error(`La navegación devolvió HTTP ${status}`);
  }
  if (/DEPLOYMENT_NOT_FOUND|This deployment could not be found|Application error: a (?:client|server)-side exception/i.test(html)) {
    throw new Error('La respuesta contiene una página de error, no la aplicación');
  }
}
