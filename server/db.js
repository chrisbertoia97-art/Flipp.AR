// Selección de motor de base de datos según entorno:
// - DATABASE_URL definida  -> Postgres (producción / cualquier hosting gestionado)
// - sin DATABASE_URL       -> SQLite local (desarrollo en la computadora)
//
// Las dos implementaciones exponen exactamente la misma interfaz (ver adapters/*.js),
// así que el resto del backend no sabe ni le importa cuál está usando.
const usePostgres = !!process.env.DATABASE_URL;

const engine = usePostgres ? require("./adapters/postgres") : require("./adapters/sqlite");

module.exports = engine;

/*
 * MODELO PREPARADO PARA EL FUTURO (no operativo todavía):
 * Cuando se implemente el "Proyecto" como entidad central, agregar:
 *
 *   properties(id, owner_intake_id, status, ...)
 *   projects(id, property_id, controller_owner_id, status, ...)
 *   project_team(project_id, actor_id, role)
 *   proposals(id, project_id, actor_id, price, scope, status, ...)
 *   budgets(id, project_id, provider_id, material, qty, unit_price, ...)
 *   users(id, email, password_hash, role) -- visitor/owner/investor/actor/admin
 *   status_history(entity_type, entity_id, from_status, to_status, changed_at)
 *
 * No se crean ahora para no construir tablas que nadie va a usar todavía.
 */
