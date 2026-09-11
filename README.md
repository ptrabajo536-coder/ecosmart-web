# ECOsmart — Web + Backend + Registro de usuarios (Etapas 1–7 + auth)

Control inteligente de iluminación para un salón de clases. Este proyecto
cubre el **dashboard web**, el **backend API** (que también consumirá la
futura app Android) y el **registro/login de estudiantes**, en **modo
simulación** (sin hardware conectado todavía).

## Qué incluye esta entrega

- **Autenticación** con Supabase Auth (correo + contraseña): páginas
  `/register` y `/login`, sesión protegida por `src/proxy.ts` (antes
  `middleware.ts` — Next.js 16 renombró la convención).
- **Base de datos Postgres (Supabase)**:
  - `relay_state` — una sola fila con el estado real y **compartido** del
    relé del salón. Antes vivía en memoria; ahora vive en la base de datos
    porque varios estudiantes lo usan desde dispositivos distintos y todos
    deben ver el mismo estado.
  - `light_actions` — historial de acciones, con quién la ejecutó
    (`user_email`) y cuándo.
- `src/services/deviceService.ts` — única capa que "habla" con el
  dispositivo. Hoy simula el relé del Sonoff MINI R4 leyendo/escribiendo esa
  fila en Postgres; en el futuro solo se reemplaza su interior para hablar
  con el dispositivo real.
- `src/app/api/lights/route.ts` y `src/app/api/history/route.ts` — ahora
  exigen sesión iniciada (401 si no hay usuario autenticado) y reciben el
  salón mediante `?room=salon-a`.
- `src/types/lights.ts` — contrato de datos compartido (esto es lo que la
  app Android también deberá usar).

## 1. Requisitos

- Node.js 18.18 o superior (recomendado 20+)
- npm
- Una cuenta gratuita en https://supabase.com

## 2. Crear el proyecto en Supabase

1. Entra a https://supabase.com y crea un proyecto nuevo (gratis).
2. Ve a **SQL Editor → New query**, pega TODO el contenido de
   `supabase/schema.sql` de este repo y dale **Run**. Esto crea las tablas
   `relay_state` y `light_actions` con Row Level Security ya configurado.
3. Ve a **Settings → API** y copia:
   - `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. (Opcional, recomendado para hacer pruebas rápidas con estudiantes) Ve a
   **Authentication → Providers → Email** y desactiva "Confirm email" si no
   quieres que cada estudiante tenga que confirmar su correo antes de poder
   entrar. Para producción real, déjalo activado.

## 3. Instalación local

```bash
cd ecosmart-web
npm install
cp .env.example .env.local
```

Edita `.env.local` y pega las dos variables de Supabase que copiaste:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre http://localhost:3000 — como no tienes sesión, te redirige a
`/register`. Crea una cuenta con correo y contraseña, inicia sesión, y verás
el panel ECOsmart. El botón grande ON/OFF llama a `POST /api/lights`
(protegido: requiere tu sesión), que pasa por `deviceService`, actualiza la
fila `relay_state` en Supabase y registra la acción en `light_actions` con
tu correo.

Abre el dashboard en dos pestañas (o dos navegadores) con dos cuentas
distintas: si una enciende las luces, la otra lo ve reflejado al refrescar
o volver a consultar el estado — es un recurso compartido de verdad, no
algo local a cada sesión.

## 5. Cómo fluye una acción ahora (con usuario)

```
Botón "Encender todas" (Dashboard.tsx)
  -> hook useLightsSystem.sendAction("ON")
    -> fetch POST /api/rooms/salon-a/lights
      -> route.ts valida sesión (Supabase Auth) y el body
        -> deviceService.turnOnRelay(roomId, userId)
          -> UPDATE rooms en Postgres
        -> historyService.addHistoryEntry("ON", userId, userEmail, roomId)
          -> INSERT en light_actions
      -> route.ts responde con el nuevo estado completo
    -> el frontend re-renderiza las 6 luces, el consumo y el historial
```

## 6. Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Entra a https://vercel.com → **Add New → Project** → importa el repo.
3. Vercel detecta Next.js automáticamente (no necesitas configurar el build).
4. En **Settings → Environment Variables**, agrega:
   - `DEVICE_MODE` = `simulation`
   - `NEXT_PUBLIC_SUPABASE_URL` = la de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la de tu proyecto Supabase
   - (`SONOFF_*` se dejan vacías por ahora)
5. En Supabase, ve a **Authentication → URL Configuration** y agrega tu
   dominio de Vercel a "Site URL" / "Redirect URLs" para que el login
   funcione en producción.
6. Despliega. Cada `git push` a la rama principal vuelve a desplegar.

## 7. Por qué Supabase (y no otra cosa)

No marcaste preferencia, así que elegí Supabase porque resuelve dos
necesidades con un solo servicio gratuito: autenticación de estudiantes y
base de datos Postgres para el estado compartido del relé y el historial —
ambas cosas que este proyecto ya necesitaba. Si prefieres otra combinación
(NextAuth + una base de datos separada, Clerk, Firebase, etc.), el punto de
cambio está contenido en `src/lib/supabase/`, `src/proxy.ts` y
`src/app/auth/actions.ts` — el resto del proyecto (API routes, componentes,
tipos) no depende directamente de Supabase.

## 8. Próxima etapa (pendiente de tu confirmación)

Según el plan de trabajo por etapas, lo siguiente es:

- **Etapa 8-10:** app Android con Expo + React Native, consumiendo esta
  misma API y el mismo login (`/api/lights?room=salon-a`,
  `/api/history?room=salon-a`, Supabase Auth).
  → Ya está construida en `ecosmart-mobile/` (ver su propio README).
- **Etapa 11:** generar el APK con EAS Build.
- **Etapa 14:** investigar el protocolo real del Sonoff MINI R4 antes de
  implementar `DEVICE_MODE=real`.

## 9. Nota sobre autenticación desde Android

`/api/lights` y `/api/history` aceptan sesión de dos formas:

- **Cookie** (navegador web) — como hasta ahora.
- **`Authorization: Bearer <access_token>`** (app Android) — porque una
  app nativa no comparte cookies con el dominio del backend. Ambos caminos
  usan la misma validación contra Supabase Auth (`authenticateRequest.ts`),
  así que un estudiante autenticado desde cualquiera de las dos apps tiene
  exactamente el mismo acceso.

También se agregaron headers CORS (`src/lib/cors.ts`) para que el cliente
HTTP de Android pueda llamar estas rutas desde un origen distinto.
