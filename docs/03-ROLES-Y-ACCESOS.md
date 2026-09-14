# Roles y Accesos — Espíritu Ananda (AnandaStore V2)

Documento de referencia para el manejo de roles, autenticación y permisos del proyecto.

## 1. Visión General

El sistema distingue dos mundos de usuarios:

| Mundo | Usuario | Acceso |
| :--- | :--- | :--- |
| **Público** | Consultante / Comprador (cliente) | Página pública, agendar citas, comprar, pagar |
| **Administrativo** | Equipo de Espíritu Ananda | Panel `/admin` y sus APIs |

Toda la autenticación se resuelve contra **Supabase Auth** (correo + contraseña). La verificación de "quién es administrador y con qué rol" se hace en el código del servidor consultando la tabla `admin_users` y la variable de entorno `ADMIN_EMAILS`.

## 2. Modelo de Roles

### 2.1 Roles de la tabla `admin_users`

| Rol | Constante | Descripción prevista |
| :--- | :--- | :--- |
| Super Administrador | `SUPER_ADMIN` | Control total: configuración, usuarios, finanzas, catálogo. |
| Administrador | `ADMIN` | Gestión operativa completa del panel. |
| Operador | `OPERATOR` | Gestión de agenda, clientes y pagos del día a día. |
| Lector | `READER` | Consulta de información (solo lectura). |

> **Estado actual:** el campo `role` se entrega en la sesión (`session.user.role`) y se puede usar para granular permisos por rol, pero **hoy la autorización efectiva es binaria**: un usuario es administrador (`isAdmin = true`) o no. Si quieres restringir secciones por rol (ej. solo `SUPER_ADMIN` puede entrar a Configuración), la lógica debe añadirse sobre `session.user.role` en el middleware o en las rutas API.

### 2.2 Rol implícito del cliente

Todo usuario autenticado que no sea administrador recibe `role = 'CLIENT'` e `isAdmin = false`. Los clientes no acceden al panel.

## 3. Flujo de Inicio de Sesión

1. El usuario envía **correo electrónico o cédula** + contraseña en `/login`.
2. Si usa cédula, el sistema busca el correo asociado en la tabla `customers`.
3. La contraseña se verifica SIEMPRE contra **Supabase Auth** (`signInWithPassword`). Supabase Auth es la única fuente de contraseñas.
4. Se determina el rol (ver §4) y se genera el JWT de NextAuth v5 con los campos `role` e `isAdmin`.

## 4. Orden de Resolución de Rol (prioridad)

| Prioridad | Fuente | Resultado |
| :--- | :--- | :--- |
| 1 | Tabla `admin_users` (con `active = true`) | `role` del registro + `isAdmin = true` |
| 2 | Variable de entorno `ADMIN_EMAILS` | `SUPER_ADMIN` + `isAdmin = true` |
| 3 | Tabla `customers` (con `active = true`) | `CLIENT` + `isAdmin = false` |
| 4 | Usuario autenticado sin perfil | `CLIENT` genérico + `isAdmin = false` |

Este mismo orden se aplica en dos lugares:

- `src/lib/auth.config.ts` → `authorize()` (login).
- `src/lib/auth.ts` → callback `jwt()` (refresco de sesión en cada request).

## 5. Tabla `admin_users` (estructura)

```sql
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'READER')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Ejemplo: crear un administrador manualmente (SQL Editor de Supabase)

```sql
INSERT INTO public.admin_users (email, name, role, active)
VALUES ('lina@espiritananda.com', 'Lina', 'SUPER_ADMIN', true)
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, active = EXCLUDED.active;
```

> La contraseña de acceso NO vive en `admin_users`; se gestiona en **Supabase Auth** (menú *Authentication > Users > Add user*). Ambos pasos son necesarios: el usuario debe existir en Supabase Auth (para la contraseña) y opcionalmente en `admin_users` (para el rol).

## 6. Variable `ADMIN_EMAILS`

- Formato: lista de correos separados por comas, p. ej. `ADMIN_EMAILS="diegoillers@gmail.com,lina@espiritananda.com"`.
- Los correos listados se convierten automáticamente en `SUPER_ADMIN` (prioridad 2), aunque no existan en `admin_users`.
- Es un mecanismo de respaldo/arranque: en producción se recomienda dar de alta los administradores en `admin_users` para tener control de roles y estado `active`.

## 7. Protección de Rutas

| Capa | Mecanismo | Archivo |
| :--- | :--- | :--- |
| Middleware (`/admin/:path*`) | Redirige a `/login` si no hay sesión de administrador | `src/middleware.ts` |
| API admin | `requireAdminSession()` → 401 (sin sesión) / 403 (sin `isAdmin`) | `src/lib/adminAuth.ts` |
| Panel (layout) | Sidebar + guard visual | `src/app/(admin)/layout.tsx` |

### Modo demo

`NEXT_PUBLIC_DEMO_MODE="true"` desactiva toda la verificación (middleware y `requireAdminSession`) para evaluar la app sin credenciales. **En producción debe estar en `"false"`.**

## 8. Sesión (JWT)

Campos expuestos en `session.user`:

```ts
{
  id: string;           // UUID de admin_users o identificador generado
  name?: string | null;
  email?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR' | 'READER' | 'CLIENT' | null;
  isAdmin: boolean;
}
```

- El rol se consulta contra la BD en cada login y se refresca en el callback `jwt` de NextAuth (por si cambia `role` o `active` en `admin_users`).
- Si `active = false`, el usuario deja de ser administrador (cae a `CLIENT` o al fallback de `ADMIN_EMAILS`).

## 9. Seguridad (RLS y claves)

- **`anon` key (pública):** solo puede leer lo que permiten las policies de lectura pública (servicios, productos, agenda, rifas).
- **`service_role` key (secreta, solo servidor):** tiene las policies "Service Role Full Access" (todas las operaciones sobre todas las tablas). Nunca debe exponerse en el navegador.
- Las rutas API del panel usan siempre la clave de servicio y están protegidas por `requireAdminSession()`.

## 10. Preguntas Frecuentes

**¿Cómo agrego un nuevo administrador?**
1. Crear el usuario en Supabase Auth (correo + contraseña).
2. Insertarlo en `admin_users` con su rol (ver §5).

**¿Por qué entro al panel sin estar en `admin_users`?**
Porque tu correo está en `ADMIN_EMAILS` (prioridad 2) o el modo demo está activo.

**¿Puedo restringir secciones por rol?**
Sí: el rol viaja en `session.user.role`. Falta implementar la granularidad (ej. ocultar Configuración a `OPERATOR`/`READER`); la infraestructura ya está lista.

**¿Qué pasa si desactivo a un administrador (`active = false`)?**
Pierde el acceso al panel en la siguiente sesión (el JWT se reevalúa en cada petición).
