/**
 * Modo demo: habilita datos de ejemplo y bypass de autenticación para entornos
 * aislados de evaluación. Nunca debe activarse en producción.
 *
 * Fail-closed: con `NODE_ENV === 'production'` el modo demo queda desactivado
 * aunque `NEXT_PUBLIC_DEMO_MODE` esté en 'true' por error de configuración o por
 * un build contaminado. Todos los consumidores del bypass (middleware,
 * `requireAdminSession`, callback `jwt` y rutas API) pasan por esta función, de
 * modo que este único punto cierra el acceso demo en producción.
 */
let warnedAboutProdDemo = false;

export function isDemoMode() {
  const requested = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (process.env.NODE_ENV === 'production') {
    if (requested && !warnedAboutProdDemo) {
      warnedAboutProdDemo = true;
      console.warn(
        '[demoMode] NEXT_PUBLIC_DEMO_MODE=true ignorado: el modo demo está deshabilitado en producción (fail-closed).'
      );
    }
    return false;
  }

  return requested;
}
