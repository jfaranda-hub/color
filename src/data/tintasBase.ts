// Tintas base para formulación en flexografía
// Adaptado a Flint Group EkoCure ANCORA F2 YEP
// Cada tinta tiene su contribución LAB por gramo de tinta en la mezcla

export type FamiliaTinta = 
  | 'standard-process'  // CMYK estándar
  | 'hs-process'        // High Strength process (procesos de alta fuerza)
  | 'standard-pantone'  // Pantone estándar
  | 'hs-pantone'        // High Strength Pantone
  | 'hr-pantone'        // High Resistance Pantone
  | 'otros';            // Bases, transparentes, especiales

export interface TintaBase {
  id: string;
  name: string;
  familia: FamiliaTinta;
  color: string; // Color visual
  lab: { L: number; a: number; b: number }; // LAB de la tinta pura (drawdown)
  tintingStrength: number; // Fuerza tintórea (1.0 = estándar)
  opacity: number; // Opacidad de la tinta (0-1)
  maxConcentration: number; // Máximo % en mezcla
  costPerKg: number; // Coste por kg (€)
  codigoFlint?: string; // Código del producto Flint
  lightFastness?: number; // Resistencia a la luz (1-8, donde 8 es excelente)
  solventResistance?: boolean; // Resistencia a solventes
  soapResistance?: boolean; // Resistencia al jabón
  greaseResistance?: boolean; // Resistencia a la grasa
  alkalineResistance?: boolean; // Resistencia a álcalis
  aniloxRecomendado?: {
    linesCm: [number, number]; // Rango de lineatura [min, max] en líneas/cm
    volumeCm3: [number, number]; // Rango de volumen [min, max] en cm³/m²
  };
}

export const tintasBase: TintaBase[] = [
  {
    id: "transparente",
    name: "Base Transparente",
    familia: "otros",
    color: "#FFFFFF",
    lab: { L: 96.0, a: 0.0, b: 0.0 },
    tintingStrength: 0.0,
    opacity: 0.0,
    maxConcentration: 100,
    costPerKg: 8.50,
    codigoFlint: "ANCORA-F2-TRANS",
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: true,
    aniloxRecomendado: { linesCm: [120, 200], volumeCm3: [4, 8] }
  },
  {
    id: "blanco",
    name: "Blanco Cobertor",
    familia: "otros",
    color: "#FFFFFF",
    lab: { L: 97.0, a: -0.2, b: 0.5 },
    tintingStrength: 0.0,
    opacity: 1.0,
    maxConcentration: 100,
    costPerKg: 12.00,
    codigoFlint: "ANCORA-F2-WHITE",
    lightFastness: 8,
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: true,
    aniloxRecomendado: { linesCm: [100, 160], volumeCm3: [6, 12] }
  },
  {
    id: "amarillo",
    name: "Yellow 012",
    familia: "standard-pantone",
    color: "#FFD700",
    lab: { L: 80.0, a: 5.0, b: 82.0 },
    tintingStrength: 0.85,
    opacity: 0.70,
    maxConcentration: 50,
    costPerKg: 22.00,
    codigoFlint: "ANCORA-F2-Y012",
    lightFastness: 6,
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: false,
    aniloxRecomendado: { linesCm: [140, 180], volumeCm3: [3.5, 6] }
  },
  {
    id: "naranja",
    name: "Orange 021",
    familia: "standard-pantone",
    color: "#E85D00",
    lab: { L: 55.0, a: 55.0, b: 62.0 },
    tintingStrength: 0.90,
    opacity: 0.85,
    maxConcentration: 50,
    costPerKg: 25.00,
    codigoFlint: "ANCORA-F2-O021",
    lightFastness: 7,
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: false,
    aniloxRecomendado: { linesCm: [140, 180], volumeCm3: [3.5, 6] }
  },
  {
    id: "rojo-amarillento",
    name: "Warm Red",
    familia: "standard-pantone",
    color: "#E8290E",
    lab: { L: 48.0, a: 68.0, b: 52.0 },
    tintingStrength: 0.95,
    opacity: 0.80,
    maxConcentration: 55,
    costPerKg: 26.50,
    codigoFlint: "ANCORA-F2-WR",
    lightFastness: 7,
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: false,
    aniloxRecomendado: { linesCm: [140, 180], volumeCm3: [3.5, 6] }
  },
  {
    id: "rojo",
    name: "Rubine",
    familia: "standard-pantone",
    color: "#E31937",
    lab: { L: 45.0, a: 72.0, b: 35.0 },
    tintingStrength: 1.0,
    opacity: 0.85,
    maxConcentration: 60,
    costPerKg: 28.00,
    codigoFlint: "ANCORA-F2-RUB",
    lightFastness: 6,
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: false,
    aniloxRecomendado: { linesCm: [140, 180], volumeCm3: [3.5, 6] }
  },
  {
    id: "azul",
    name: "Reflex Blue",
    familia: "standard-pantone",
    color: "#1B3A8C",
    lab: { L: 30.0, a: 25.0, b: -62.0 },
    tintingStrength: 1.1,
    opacity: 0.90,
    maxConcentration: 40,
    costPerKg: 32.00,
    codigoFlint: "ANCORA-F2-RFB",
    lightFastness: 8,
    solventResistance: true,
    soapResistance: true,
    greaseResistance: true,
    alkalineResistance: true,
    aniloxRecomendado: { linesCm: [140, 180], volumeCm3: [3.5, 6] }
  }
];
