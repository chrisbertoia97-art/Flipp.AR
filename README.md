# Flipp.AR — Plataforma funcional (MVP listo para producción)

Aplicación real: los formularios de Propietarios, Actores, Inversores y Proveedores
guardan datos en una base de datos persistente de verdad, los archivos que se suben
(imágenes y documentación) se guardan como archivos reales (no solo su nombre), y
todo queda visible en un panel de administración protegido.

## Estructura

```
flippar/
  server/
    adapters/sqlite.js    → motor de base de datos para desarrollo local
    adapters/postgres.js  → motor de base de datos para producción
    db.js                 → elige automáticamente uno u otro según DATABASE_URL
    uploads/               → archivos subidos (ignorado por git; ver sección Storage)
    index.js               → API + seguridad + sirve el frontend compilado
  client/                 → Frontend React + Vite + TypeScript + Tailwind
```

## Variables de entorno (server/.env)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `ADMIN_PASSWORD` | **Sí, en producción** | Clave del panel `/admin`. El servidor NO arranca en producción sin esto (o si dejás el valor por defecto). |
| `DATABASE_URL` | Recomendada en producción | Cadena de conexión Postgres. Si no está definida, usa SQLite local (`server/flippar.db`) — cómodo para desarrollar, **no recomendado para producción real** porque muchos hostings no garantizan que el disco persista entre redeploys. |
| `NODE_ENV` | Sí, en producción | Poné `production`. Activa los chequeos de seguridad (obliga `ADMIN_PASSWORD` propio, restringe CORS). |
| `ALLOWED_ORIGINS` | Solo si el frontend vive en otro dominio | Lista separada por comas. No hace falta si usás el modo "todo en uno" (recomendado). |
| `PORT` | No | Puerto del servidor. La mayoría de los hostings lo define solos. |

Copiá `server/.env.example` a `server/.env` y completá los valores.

## Cómo correrlo en tu computadora (desarrollo, con SQLite)

```bash
cd server
npm install
cp .env.example .env    # dejá DATABASE_URL vacío para usar SQLite
npm start
```

```bash
cd client
npm install
npm run dev
```

Frontend en `http://localhost:5173`, hablando con el backend en `:4000` vía proxy.

## Modo producción local (para probar exactamente como va a quedar desplegado)

```bash
cd client && npm run build
cd ../server && NODE_ENV=production ADMIN_PASSWORD=tu-clave npm start
```

Entrá a `http://localhost:4000` — un solo servicio sirve todo.

## Base de datos: SQLite vs Postgres

- **Sin `DATABASE_URL` configurada** → usa SQLite (`server/flippar.db`). Sirve para
  desarrollar, pero **si tu hosting no garantiza disco persistente, los datos se
  pueden perder en un redeploy.**
- **Con `DATABASE_URL` configurada** → usa Postgres automáticamente, sin tocar código.
  Esto es lo que se probó (con Postgres real, no simulado) y se recomienda para la
  versión pública.

Cómo conseguir un Postgres gratuito en minutos (elegí uno):
- **Neon** (neon.tech) — plan gratuito, conexión lista para copiar y pegar.
- **Supabase** (supabase.com) → Project Settings → Database → Connection string.
- **Render** → "New +" → "PostgreSQL" (plan gratuito con expiración a los 90 días,
  igual sirve para probar ahora).

Una vez que tengas la cadena de conexión, se pone en `DATABASE_URL` y listo — las
tablas se crean solas al arrancar el servidor.

## Archivos (imágenes y documentos)

Se guardan de verdad en `server/uploads/`, organizados por solicitud, y su metadata
(nombre, tamaño, tipo, a qué solicitud pertenecen) queda en la base de datos. Nunca
se sirven como carpeta pública: solo se pueden descargar autenticándose como admin
(`GET /api/admin/files/:fileId` con el header `x-admin-password`).

**Importante sobre estos archivos en producción:** al igual que con SQLite, si el
hosting no tiene disco persistente, los archivos subidos se pueden perder en un
redeploy (la base de datos con Postgres externo no se ve afectada, pero si el
archivo físico estaba en el disco del servidor, sí). Para garantía total, el
siguiente paso sería subir los binarios a un storage externo (Supabase Storage,
Cloudinary o S3) en vez del disco local — el código ya aísla esa lógica en
`saveUploadedFiles()` dentro de `server/index.js`, así que cambiarlo no requiere
tocar el resto de la aplicación.

## Seguridad implementada

- `ADMIN_PASSWORD` obligatoria y sin valor por defecto válido en producción
  (probado: el servidor rechaza arrancar sin esto).
- Panel `/admin` y todos los endpoints de lectura (`GET`) protegidos por contraseña.
- Archivos privados servidos solo vía endpoint autenticado, nunca como carpeta pública.
- CORS restringido en producción: solo permite el propio dominio salvo que se
  agregue explícitamente otro en `ALLOWED_ORIGINS` (probado: bloquea orígenes no
  autorizados con 403).
- Rate limiting: máximo 30 envíos de formulario cada 15 minutos por IP, y máximo
  10 intentos de login de admin cada 15 minutos.
- Validación de tipo y tamaño de archivo (imágenes JPG/PNG/WEBP hasta 8MB,
  documentos PDF/JPG/PNG hasta 15MB; probado que rechaza otros tipos).
- La dirección exacta de una propiedad (`exactAddress`) nunca se expone
  públicamente: hoy no existe ningún endpoint público que muestre propiedades
  (todo pasa por `/admin`), y ya existe preparada en `server/privacy.js` la función
  de redacción para cuando se implemente un listado público.

## Panel de administración

`/admin` → ingresá con la clave de `ADMIN_PASSWORD`. Ahí ves, por categoría, todas
las solicitudes cargadas con su detalle completo.

## Deploy a un hosting con link público — pasos que el usuario tiene que hacer

Esto no lo puede hacer nadie más que vos, porque requiere tus propias cuentas:

1. Crear un repositorio en GitHub y subir esta carpeta completa (`client/` y `server/`).
2. Crear una cuenta gratis en Render (render.com) (o Railway).
3. En Render: "New +" → "Web Service" → conectar el repositorio.
   - Build Command: `cd client && npm install && npm run build && cd ../server && npm install`
   - Start Command: `cd server && npm start`
4. Variables de entorno en Render: `NODE_ENV=production`, `ADMIN_PASSWORD=<tu clave>`,
   y `DATABASE_URL=<tu cadena de Postgres>` (de Neon/Supabase/Render Postgres).
5. (Recomendado) Crear una base Postgres gratuita en Neon o Supabase y pegar su
   connection string en `DATABASE_URL`.
6. Deploy. Render entrega una URL pública tipo `https://flippar-xxxx.onrender.com`.

Puedo ayudarte a revisar cada uno de estos pasos mientras los hacés, pero las
cuentas y credenciales las tenés que crear vos.

## Qué NO está implementado todavía (a propósito)

- Autenticación de usuarios con roles (hoy el panel admin usa una clave única).
- Proyectos, propuestas, presupuestador, marketplace de proveedores — modelo de
  datos preparado en comentarios (`server/db.js`), no construido.
- Pagos, crowdfunding, subastas — fuera de alcance explícitamente.
- Storage externo para archivos (hoy disco local del servidor; ver sección de
  archivos arriba).
