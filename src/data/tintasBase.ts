// Tintas base para formulación en flexografía
// Cada tinta tiene su contribución LAB por gramo de tinta en la mezcla

export interface TintaBase {
  id: string;
  name: string;
  color: string; // Color visual
  lab: { L: number; a: number; b: number }; // LAB de la tinta pura (drawdown)
  tintingStrength: number; // Fuerza tintórea (1.0 = estándar)
  opacity: number; // Opacidad de la tinta (0-1)
  maxConcentration: number; // Máximo % en mezcla
  costPerKg: number; // Coste por kg (€)
}

export const tintasBase: TintaBase[] = [
  {
    id: "transparente",
    name: "Base Transparente",
    color: "#FFFFFF",
    lab: { L: 96.0, a: 0.0, b: 0.0 },
    tintingStrength: 0.0,
    opacity: 0.0,
    maxConcentration: 100,
    costPerKg: 8.50
  },
  {
    id: "blanco",
    name: "Blanco Cobertor",
    color: "#FFFFFF",
    lab: { L: 97.0, a: -0.2, b: 0.5 },
    tintingStrength: 0.0,
    opacity: 1.0,
    maxConcentration: 100,
    costPerKg: 12.00
  },
  {
    id: "rojo",
    name: "Rojo Rubine",
    color: "#E31937",
    lab: { L: 45.0, a: 72.0, b: 35.0 },
    tintingStrength: 1.0,
    opacity: 0.85,
    maxConcentration: 60,
    costPerKg: 28.00
  },
  {
    id: "rojo-amarillento",
    name: "Rojo 032",
    color: "#E8290E",
    lab: { L: 48.0, a: 68.0, b: 52.0 },
    tintingStrength: 0.95,
    opacity: 0.80,
    maxConcentration: 55,
    costPerKg: 26.50
  },
  {
    id: "naranja",
    name: "Naranja 021",
    color: "#E85D00",
    lab: { L: 55.0, a: 55.0, b: 62.0 },
    tintingStrength: 0.90,
    opacity: 0.85,
    maxConcentration: 50,
    costPerKg: 25.00
  },
  {
    id: "amarillo",
    name: "Amarillo 012",
    color: "#FFD700",
    lab: { L: 80.0, a: 5.0, b: 82.0 },
    tintingStrength: 0.85,
    opacity: 0.70,
    maxConcentration: 50,
    costPerKg: 22.00
  },
  {
    id: "amarillo-verdoso",
    name: "Amarillo 100",
    color: "#C8B400",
    lab: { L: 72.0, a: -12.0, b: 72.0 },
    tintingStrength: 0.88,
    opacity: 0.75,
    maxConcentration: 45,
    costPerKg: 23.00
  },
  {
    id: "azul",
    name: "Azul Reflex",
    color: "#1B3A8C",
    lab: { L: 30.0, a: 25.0, b: -62.0 },
    tintingStrength: 1.1,
    opacity: 0.90,
    maxConcentration: 40,
    costPerKg: 32.00
  },
  {
    id: "azul-verdoso",
    name: "Azul Proceso",
    color: "#0096D6",
    lab: { L: 55.0, a: -20.0, b: -45.0 },
    tintingStrength: 0.95,
    opacity: 0.80,
    maxConcentration: 45,
    costPerKg: 30.00
  },
  {
    id: "verde",
    name: "Verde 347",
    color: "#007A33",
    lab: { L: 45.0, a: -50.0, b: 30.0 },
    tintingStrength: 0.92,
    opacity: 0.85,
    maxConcentration: 45,
    costPerKg: 27.00
  },
  {
    id: "violeta",
    name: "Violeta",
    color: "#5B2C87",
    lab: { L: 32.0, a: 48.0, b: -50.0 },
    tintingStrength: 1.05,
    opacity: 0.88,
    maxConcentration: 35,
    costPerKg: 35.00
  },
  {
    id: "negro",
    name: "Negro",
    color: "#1A1A1A",
    lab: { L: 12.0, a: 0.5, b: 1.0 },
    tintingStrength: 1.2,
    opacity: 0.95,
    maxConcentration: 30,
    costPerKg: 18.00
  },
  {
    id: "magenta",
    name: "Magenta",
    color: "#D6006E",
    lab: { L: 42.0, a: 65.0, b: -5.0 },
    tintingStrength: 0.98,
    opacity: 0.82,
    maxConcentration: 50,
    costPerKg: 29.00
  },
  {
    id: "brown",
    name: "Marrón 4625",
    color: "#6B3A2A",
    lab: { L: 30.0, a: 22.0, b: 20.0 },
    tintingStrength: 0.88,
    opacity: 0.90,
    maxConcentration: 40,
    costPerKg: 24.00
  }
];

// Anilox configurations
export interface AniloxConfig {
  id: string;
  name: string;
  lineatura: number; // LPI (líneas por pulgada)
  bcm: number; // BCM (milímetros cúbicos por centímetro cuadrado) - volumen de celda
  angle: number; // Ángulo de grabado (grados)
}

export const aniloxConfigs: AniloxConfig[] = [
  { id: "anilox-360-4.0", name: "360 LPI / 4.0 BCM", lineatura: 360, bcm: 4.0, angle: 60 },
  { id: "anilox-400-3.5", name: "400 LPI / 3.5 BCM", lineatura: 400, bcm: 3.5, angle: 60 },
  { id: "anilox-500-2.8", name: "500 LPI / 2.8 BCM", lineatura: 500, bcm: 2.8, angle: 60 },
  { id: "anilox-600-2.2", name: "600 LPI / 2.2 BCM", lineatura: 600, bcm: 2.2, angle: 60 },
  { id: "anilox-800-1.5", name: "800 LPI / 1.5 BCM", lineatura: 800, bcm: 1.5, angle: 60 },
  { id: "anilox-1000-1.0", name: "1000 LPI / 1.0 BCM", lineatura: 1000, bcm: 1.0, angle: 60 },
  { id: "anilox-360-6.0", name: "360 LPI / 6.0 BCM", lineatura: 360, bcm: 6.0, angle: 60 },
  { id: "anilox-360-8.0", name: "360 LPI / 8.0 BCM", lineatura: 360, bcm: 8.0, angle: 60 },
  { id: "anilox-250-10.0", name: "250 LPI / 10.0 BCM", lineatura: 250, bcm: 10.0, angle: 60 },
];
