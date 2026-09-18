// Estructura expandible: Provincia -> Ciudades -> Barrios/Zonas.
// No se busca cargar una base geográfica completa ahora, solo un modelo limpio
// que se pueda ampliar agregando entradas sin tocar el código de los formularios.

export interface CityData {
  name: string;
  neighborhoods: string[];
}

export interface ProvinceData {
  name: string;
  cities: CityData[];
}

export const LOCATIONS: ProvinceData[] = [
  {
    name: "CABA",
    cities: [
      {
        name: "Ciudad Autónoma de Buenos Aires",
        neighborhoods: [
          "Palermo",
          "Recoleta",
          "Belgrano",
          "Caballito",
          "Villa Urquiza",
          "Núñez",
          "San Telmo",
          "Puerto Madero",
          "Almagro",
          "Flores",
          "Otro barrio de CABA",
        ],
      },
    ],
  },
  {
    name: "Buenos Aires (Provincia)",
    cities: [
      { name: "La Plata", neighborhoods: ["Casco urbano", "City Bell", "Gonnet", "Otro"] },
      { name: "Mar del Plata", neighborhoods: ["Centro", "Playa Grande", "Otro"] },
      { name: "San Isidro", neighborhoods: ["Centro", "Beccar", "Martínez", "Otro"] },
      { name: "Vicente López", neighborhoods: ["Olivos", "Florida", "Otro"] },
    ],
  },
  {
    name: "Córdoba",
    cities: [{ name: "Córdoba Capital", neighborhoods: ["Centro", "Nueva Córdoba", "Cerro de las Rosas", "Otro"] }],
  },
  {
    name: "Santa Fe",
    cities: [
      { name: "Rosario", neighborhoods: ["Centro", "Pichincha", "Fisherton", "Otro"] },
      { name: "Santa Fe Capital", neighborhoods: ["Centro", "Otro"] },
    ],
  },
  {
    name: "Mendoza",
    cities: [{ name: "Mendoza Capital", neighborhoods: ["Centro", "Chacras de Coria", "Otro"] }],
  },
];

export const PROVINCE_NAMES = LOCATIONS.map((p) => p.name);

export function getCitiesForProvince(province: string): CityData[] {
  return LOCATIONS.find((p) => p.name === province)?.cities ?? [];
}

export function getNeighborhoodsForCity(province: string, city: string): string[] {
  return getCitiesForProvince(province).find((c) => c.name === city)?.neighborhoods ?? [];
}
