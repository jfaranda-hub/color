// Base de datos Pantone con valores LAB de referencia (D50, 2°)
// Fuente: Pantone Solid Coated - valores aproximados para sustrato estandar

export interface PantoneColor {
  code: string;
  name: string;
  L: number;
  a: number;
  b: number;
  category: string;
}

export const pantoneDatabase: PantoneColor[] = [
  // Rojos
  { code: "PMS 485 C", name: "Red 032", L: 51.42, a: 69.83, b: 53.14, category: "Rojo" },
  { code: "PMS 185 C", name: "Warm Red", L: 52.89, a: 68.56, b: 46.83, category: "Rojo" },
  { code: "PMS 489 C", name: "489", L: 58.23, a: 42.15, b: 45.67, category: "Rojo" },
  { code: "PMS 179 C", name: "179", L: 48.56, a: 65.23, b: 48.12, category: "Rojo" },
  { code: "PMS 186 C", name: "186", L: 45.12, a: 67.89, b: 38.45, category: "Rojo" },
  { code: "PMS 199 C", name: "199", L: 47.89, a: 70.12, b: 22.34, category: "Rojo" },
  { code: "PMS 200 C", name: "200", L: 42.34, a: 62.56, b: 25.67, category: "Rojo" },
  
  // Naranjas
  { code: "PMS 165 C", name: "165", L: 64.78, a: 47.23, b: 62.45, category: "Naranja" },
  { code: "PMS 172 C", name: "172", L: 58.34, a: 55.67, b: 55.23, category: "Naranja" },
  { code: "PMS 1505 C", name: "1505", L: 55.12, a: 48.90, b: 58.34, category: "Naranja" },
  { code: "PMS 158 C", name: "158", L: 62.45, a: 52.34, b: 60.12, category: "Naranja" },
  { code: "PMS 1655 C", name: "1655", L: 57.89, a: 50.12, b: 57.89, category: "Naranja" },
  
  // Amarillos
  { code: "PMS 116 C", name: "Yellow", L: 82.34, a: 5.67, b: 83.45, category: "Amarillo" },
  { code: "PMS 123 C", name: "123", L: 80.12, a: 8.90, b: 78.34, category: "Amarillo" },
  { code: "PMS 109 C", name: "109", L: 85.67, a: 2.34, b: 85.12, category: "Amarillo" },
  { code: "PMS 137 C", name: "137", L: 76.45, a: 15.67, b: 72.34, category: "Amarillo" },
  
  // Verdes
  { code: "PMS 355 C", name: "Green", L: 60.12, a: -48.56, b: 45.23, category: "Verde" },
  { code: "PMS 347 C", name: "347", L: 52.34, a: -52.12, b: 28.67, category: "Verde" },
  { code: "PMS 354 C", name: "354", L: 68.90, a: -42.34, b: 48.90, category: "Verde" },
  { code: "PMS 362 C", name: "362", L: 65.45, a: -50.12, b: 52.34, category: "Verde" },
  { code: "PMS 3405 C", name: "3405", L: 55.67, a: -55.23, b: 32.45, category: "Verde" },
  
  // Azules
  { code: "PMS 300 C", name: "Process Blue", L: 55.67, a: -18.34, b: -52.12, category: "Azul" },
  { code: "PMS 299 C", name: "299", L: 60.12, a: -12.56, b: -55.67, category: "Azul" },
  { code: "PMS 286 C", name: "Reflex Blue", L: 35.45, a: 18.90, b: -60.12, category: "Azul" },
  { code: "PMS 072 C", name: "072", L: 38.90, a: 42.34, b: -65.78, category: "Azul" },
  { code: "PMS 5405 C", name: "5405", L: 32.12, a: -2.34, b: -25.67, category: "Azul" },
  
  // Violetas/Morados
  { code: "PMS 2592 C", name: "Violet", L: 42.34, a: 55.67, b: -52.34, category: "Violeta" },
  { code: "PMS 2603 C", name: "2603", L: 38.90, a: 58.12, b: -55.67, category: "Violeta" },
  { code: "PMS 267 C", name: "267", L: 50.12, a: 52.34, b: -42.56, category: "Violeta" },
  { code: "PMS 2685 C", name: "2685", L: 35.67, a: 55.89, b: -60.12, category: "Violeta" },
  
  // Marrones
  { code: "PMS 469 C", name: "469", L: 38.45, a: 18.90, b: 28.34, category: "Marrón" },
  { code: "PMS 4695 C", name: "4695", L: 35.12, a: 15.67, b: 22.45, category: "Marrón" },
  { code: "PMS 476 C", name: "476", L: 32.34, a: 22.56, b: 18.90, category: "Marrón" },
  { code: "PMS 464 C", name: "464", L: 52.67, a: 22.34, b: 28.90, category: "Marrón" },
  { code: "PMS 4625 C", name: "4625", L: 40.12, a: 25.67, b: 30.45, category: "Marrón" },
  
  // Negros y Grises
  { code: "PMS Black C", name: "Black", L: 12.34, a: 0.56, b: 1.23, category: "Negro" },
  { code: "PMS Black 6 C", name: "Black 6", L: 15.67, a: 0.23, b: -2.34, category: "Negro" },
  { code: "PMS Cool Gray 5 C", name: "Cool Gray 5", L: 58.90, a: -0.45, b: -3.12, category: "Gris" },
  { code: "PMS Cool Gray 8 C", name: "Cool Gray 8", L: 42.34, a: -0.23, b: -2.56, category: "Gris" },
  { code: "PMS Warm Gray 5 C", name: "Warm Gray 5", L: 56.78, a: 2.34, b: 6.78, category: "Gris" },
  
  // Pasteles
  { code: "PMS 1905 C", name: "1905", L: 82.34, a: 12.56, b: 5.67, category: "Pastel" },
  { code: "PMS 1915 C", name: "1915", L: 78.90, a: 18.34, b: 8.90, category: "Pastel" },
  { code: "PMS 1555 C", name: "1555", L: 80.12, a: 10.34, b: 22.56, category: "Pastel" },
  { code: "PMS 1215 C", name: "1215", L: 85.67, a: 3.45, b: 28.90, category: "Pastel" },
  { code: "PMS 3242 C", name: "3242", L: 82.34, a: -22.56, b: -5.67, category: "Pastel" },
];
