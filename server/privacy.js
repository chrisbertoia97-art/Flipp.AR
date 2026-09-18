// La dirección exacta de una propiedad es información privada por defecto.
// Ningún endpoint público expone hoy fichas de propiedades (no existe esa
// funcionalidad todavía), así que esto no se usa activamente en ninguna ruta.
// Se deja preparado para cuando exista un listado público: cualquier endpoint
// que muestre una propiedad a un visitante NO logueado como admin debe pasar
// el registro por esta función antes de responder.
function redactOwnerRecordForPublic(ownerRecord) {
  const data = ownerRecord.data;
  if (data?.location?.showExactAddress) {
    return ownerRecord;
  }
  return {
    ...ownerRecord,
    data: {
      ...data,
      location: {
        ...data.location,
        exactAddress: null, // nunca se expone si el propietario lo desactivó
      },
    },
  };
}

module.exports = { redactOwnerRecordForPublic };
