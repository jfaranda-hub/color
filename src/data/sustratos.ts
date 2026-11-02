// Sustratos comunes en flexografía con sus factores de corrección LAB

export interface Sustrato {
  id: string;
  name: string;
  description: string;
  color: string;
  correctionFactors: {
    dL: number;
    da: number;
    db: number;
  };
  opacity: number;
  inkAbsorption: number;
  whitePoint: { L: number; a: number; b: number };
}

export const sustratos: Sustrato[] = [
  {
    id: "plastico-blanco",
    name: "Plástico Blanco (PE/PP)",
    description: "Polietileno o Polipropileno blanco opaco",
    color: "#F5F5F5",
    correctionFactors: { dL: 0.5, da: -0.3, db: -0.2 },
    opacity: 0.95,
    inkAbsorption: 0.05,
    whitePoint: { L: 95.2, a: -0.3, b: 0.8 }
  },
  {
    id: "plastico-transparente",
    name: "Plástico Transparente (BOPP)",
    description: "BOPP transparente, requiere considerar fondo",
    color: "#FAFAFA",
    correctionFactors: { dL: -2.5, da: 0.5, db: 0.8 },
    opacity: 0.60,
    inkAbsorption: 0.02,
    whitePoint: { L: 92.0, a: 0.1, b: 1.2 }
  },
  {
    id: "papel-couche",
    name: "Papel Couché Brillante",
    description: "Papel estucado con acabado brillante",
    color: "#F8F4E8",
    correctionFactors: { dL: -1.2, da: 0.8, db: 2.5 },
    opacity: 0.85,
    inkAbsorption: 0.25,
    whitePoint: { L: 92.5, a: -0.5, b: 3.2 }
  },
  {
    id: "papel-offset",
    name: "Papel Offset",
    description: "Papel sin estucar, alta absorción",
    color: "#F0EDE0",
    correctionFactors: { dL: -3.5, da: 1.2, db: 4.0 },
    opacity: 0.75,
    inkAbsorption: 0.55,
    whitePoint: { L: 88.3, a: 0.5, b: 5.8 }
  },
  {
    id: "carton-kraft",
    name: "Cartón Kraft",
    description: "Cartón marrón sin blanquear",
    color: "#C4A265",
    correctionFactors: { dL: -8.0, da: 5.5, db: 12.0 },
    opacity: 0.65,
    inkAbsorption: 0.60,
    whitePoint: { L: 62.5, a: 8.2, b: 22.5 }
  },
  {
    id: "plastico-metalizado",
    name: "Plástico Metalizado",
    description: "PET o BOPP metalizado, alta reflectancia",
    color: "#D4D4D4",
    correctionFactors: { dL: 3.0, da: -1.0, db: -1.5 },
    opacity: 0.98,
    inkAbsorption: 0.01,
    whitePoint: { L: 82.0, a: -0.2, b: -0.5 }
  },
  {
    id: "film-retractil",
    name: "Film Retráctil (PE)",
    description: "Polietileno retráctil transparente",
    color: "#E8E8E8",
    correctionFactors: { dL: -1.8, da: 0.3, db: 0.5 },
    opacity: 0.55,
    inkAbsorption: 0.03,
    whitePoint: { L: 90.0, a: 0.0, b: 0.5 }
  },
  {
    id: "papel-reciclado",
    name: "Papel Reciclado",
    description: "Papel reciclado con tonalidad grisácea",
    color: "#D8D2C4",
    correctionFactors: { dL: -5.0, da: 1.5, db: 5.5 },
    opacity: 0.70,
    inkAbsorption: 0.50,
    whitePoint: { L: 78.5, a: 1.0, b: 8.0 }
  }
];
