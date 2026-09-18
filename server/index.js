const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const db = require("./db");

const isProd = process.env.NODE_ENV === "production";

// ---------------------------------------------------------------------------
// ADMIN PASSWORD — nunca hardcodeada en producción.
// ---------------------------------------------------------------------------
const DEV_DEFAULT_PASSWORD = "flippar-dev-only";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (isProd && (!ADMIN_PASSWORD || ADMIN_PASSWORD === DEV_DEFAULT_PASSWORD)) {
  console.error(
    "ERROR FATAL: en producción (NODE_ENV=production) es obligatorio definir la variable de entorno ADMIN_PASSWORD con un valor propio. El servidor no va a arrancar sin esto."
  );
  process.exit(1);
}
if (!isProd && !ADMIN_PASSWORD) {
  console.warn(
    `Aviso: no definiste ADMIN_PASSWORD, se usa "${DEV_DEFAULT_PASSWORD}" solo para desarrollo local.`
  );
}
const EFFECTIVE_ADMIN_PASSWORD = ADMIN_PASSWORD || DEV_DEFAULT_PASSWORD;

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------
const app = express();
app.set("trust proxy", 1); // necesario detrás de proxies de hosting (Render/Railway) para rate limiting e IPs correctas

// CORS: en producción el mismo backend sirve el frontend (mismo origen), así que
// por defecto no hace falta abrir CORS a nadie. Si en algún momento el frontend
// se despliega en un dominio separado, se habilita explícitamente vía env var.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // same-origin, curl, apps móviles
      if (!isProd) return cb(null, true); // desarrollo: permisivo
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json({ limit: "2mb" }));

function nowIso() {
  return new Date().toISOString();
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function requireAdmin(req, res, next) {
  const provided = req.header("x-admin-password");
  if (provided !== EFFECTIVE_ADMIN_PASSWORD) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

// Rate limiting: evita abuso/spam en los formularios públicos y fuerza bruta en el login de admin.
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Probá de nuevo en unos minutos." },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
});

// ---------------------------------------------------------------------------
// RECURSOS GENÉRICOS (propietarios / actores / inversores / proveedores)
// ---------------------------------------------------------------------------
function makeResource(table, extraColumn) {
  return {
    async create(body, extraValue) {
      const id = crypto.randomUUID();
      const created_at = nowIso();
      await db.createRow(table, extraColumn, extraValue, id, body, created_at);
      return { id, created_at };
    },
    list() {
      return db.listRows(table);
    },
    get(id) {
      return db.getRow(table, id);
    },
  };
}

const ownerRes = makeResource("owner_intakes", "flow_type");
const actorRes = makeResource("actors", "category");
const investorRes = makeResource("investors", "flow_type");
const providerRes = makeResource("providers", null);

// ---------------------------------------------------------------------------
// PROPIETARIOS
// ---------------------------------------------------------------------------
app.post(
  "/api/propietarios",
  submitLimiter,
  asyncHandler(async (req, res) => {
    const { flowType, ...rest } = req.body;
    if (!flowType || !["rent", "sale", "opportunity"].includes(flowType)) {
      return res.status(400).json({ error: "flowType inválido" });
    }
    if (!rest?.owner?.name || !rest?.owner?.email || !rest?.owner?.phone) {
      return res.status(400).json({ error: "Faltan datos de contacto" });
    }
    const result = await ownerRes.create(req.body, flowType);
    res.status(201).json(result);
  })
);
app.get(
  "/api/propietarios",
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await ownerRes.list()))
);
app.get(
  "/api/propietarios/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const item = await ownerRes.get(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  })
);

// ---------------------------------------------------------------------------
// ACTORES
// ---------------------------------------------------------------------------
app.post(
  "/api/actores",
  submitLimiter,
  asyncHandler(async (req, res) => {
    const { category, ...rest } = req.body;
    if (!category) return res.status(400).json({ error: "Falta category" });
    if (!rest?.contact?.name || !rest?.contact?.email || !rest?.contact?.phone) {
      return res.status(400).json({ error: "Faltan datos de contacto" });
    }
    const result = await actorRes.create(req.body, category);
    res.status(201).json(result);
  })
);
app.get(
  "/api/actores",
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await actorRes.list()))
);

// ---------------------------------------------------------------------------
// INVERSORES
// ---------------------------------------------------------------------------
app.post(
  "/api/inversores",
  submitLimiter,
  asyncHandler(async (req, res) => {
    const { flowType, ...rest } = req.body;
    if (!flowType || !["inscribirse", "formar-equipo", "iniciar-compra"].includes(flowType)) {
      return res.status(400).json({ error: "flowType inválido" });
    }
    if (!rest?.contact?.name || !rest?.contact?.email || !rest?.contact?.phone) {
      return res.status(400).json({ error: "Faltan datos de contacto" });
    }
    const result = await investorRes.create(req.body, flowType);
    res.status(201).json(result);
  })
);
app.get(
  "/api/inversores",
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await investorRes.list()))
);

// ---------------------------------------------------------------------------
// PROVEEDORES
// ---------------------------------------------------------------------------
app.post(
  "/api/proveedores",
  submitLimiter,
  asyncHandler(async (req, res) => {
    if (!req.body?.contact?.name || !req.body?.contact?.email || !req.body?.contact?.phone) {
      return res.status(400).json({ error: "Faltan datos de contacto" });
    }
    const result = await providerRes.create(req.body);
    res.status(201).json(result);
  })
);
app.get(
  "/api/proveedores",
  requireAdmin,
  asyncHandler(async (_req, res) => res.json(await providerRes.list()))
);

// ---------------------------------------------------------------------------
// ARCHIVOS (imágenes y documentos de propiedades) — almacenamiento real, no metadata sola.
// ---------------------------------------------------------------------------
const UPLOAD_ROOT = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

function makeStorage(subfolder) {
  return multer.diskStorage({
    destination(req, _file, cb) {
      const dir = path.join(UPLOAD_ROOT, subfolder, req.params.id);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      cb(null, `${crypto.randomUUID()}-${safe}`);
    },
  });
}

const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"];
const DOC_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];

const uploadImages = multer({
  storage: makeStorage("propietarios-imagenes"),
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter(_req, file, cb) {
    cb(null, IMAGE_MIME_TYPES.includes(file.mimetype));
  },
});
const uploadDocs = multer({
  storage: makeStorage("propietarios-documentos"),
  limits: { fileSize: 15 * 1024 * 1024, files: 10 },
  fileFilter(_req, file, cb) {
    cb(null, DOC_MIME_TYPES.includes(file.mimetype));
  },
});

async function saveUploadedFiles(files, ownerId, field) {
  const saved = [];
  for (const file of files) {
    const meta = {
      id: crypto.randomUUID(),
      ownerTable: "owner_intakes",
      ownerId,
      field,
      originalName: file.originalname,
      storedPath: path.relative(UPLOAD_ROOT, file.path),
      mimeType: file.mimetype,
      sizeBytes: file.size,
      createdAt: nowIso(),
    };
    await db.insertFile(meta);
    saved.push({ id: meta.id, originalName: meta.originalName, sizeBytes: meta.sizeBytes });
  }
  return saved;
}

app.post(
  "/api/propietarios/:id/imagenes",
  uploadImages.array("images", 10),
  asyncHandler(async (req, res) => {
    const owner = await ownerRes.get(req.params.id);
    if (!owner) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (!req.files?.length) return res.status(400).json({ error: "No se recibieron imágenes válidas (JPG/PNG/WEBP, máx 8MB c/u)" });
    const saved = await saveUploadedFiles(req.files, req.params.id, "images");
    res.status(201).json({ saved });
  })
);

app.post(
  "/api/propietarios/:id/documentos",
  uploadDocs.array("files", 10),
  asyncHandler(async (req, res) => {
    const owner = await ownerRes.get(req.params.id);
    if (!owner) return res.status(404).json({ error: "Solicitud no encontrada" });
    if (!req.files?.length) return res.status(400).json({ error: "No se recibieron documentos válidos (PDF/JPG/PNG, máx 15MB c/u)" });
    const saved = await saveUploadedFiles(req.files, req.params.id, "documents");
    res.status(201).json({ saved });
  })
);

// Los archivos SIEMPRE se sirven a través de un endpoint autenticado, nunca como
// carpeta estática pública: pueden ser títulos de propiedad u otra documentación privada.
app.get(
  "/api/admin/propietarios/:id/files",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const files = await db.listFiles("owner_intakes", req.params.id);
    res.json(files);
  })
);
app.get(
  "/api/admin/files/:fileId",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const file = await db.getFile(req.params.fileId);
    if (!file) return res.status(404).json({ error: "Archivo no encontrado" });
    const fullPath = path.join(UPLOAD_ROOT, file.stored_path);
    if (!fullPath.startsWith(UPLOAD_ROOT)) return res.status(400).json({ error: "Ruta inválida" });
    res.sendFile(fullPath);
  })
);

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------
app.post("/api/admin/login", loginLimiter, (req, res) => {
  if (req.body?.password === EFFECTIVE_ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: "Contraseña incorrecta" });
});

app.get(
  "/api/admin/summary",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    res.json({
      propietarios: (await ownerRes.list()).length,
      actores: (await actorRes.list()).length,
      inversores: (await investorRes.list()).length,
      proveedores: (await providerRes.list()).length,
    });
  })
);

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: nowIso(), db: db.engineName })
);

// ---------------------------------------------------------------------------
// FRONTEND COMPILADO (mismo servicio sirve API + sitio)
// ---------------------------------------------------------------------------
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// ---------------------------------------------------------------------------
// MANEJO DE ERRORES (incluye errores de multer: tamaño, tipo de archivo, etc.)
// ---------------------------------------------------------------------------
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error de archivo: ${err.message}` });
  }
  if (err?.message === "Origen no permitido por CORS") {
    return res.status(403).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// ---------------------------------------------------------------------------
// ARRANQUE
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 4000;

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Flipp.AR API corriendo en puerto ${PORT} (DB: ${db.engineName}, prod: ${isProd})`);
    });
  })
  .catch((err) => {
    console.error("No se pudo inicializar la base de datos:", err);
    process.exit(1);
  });
