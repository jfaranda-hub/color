/**
 * Implementación de KD-Tree para búsqueda eficiente de colores en espacio LAB
 * 
 * Un KD-Tree es una estructura de datos que permite búsquedas O(log n) 
 * en lugar de O(n) para encontrar el punto más cercano en un espacio k-dimensional.
 * 
 * Para nuestra aplicación:
 * - Dimensión k = 3 (L*, a*, b*)
 * - Puntos = colores Pantone en espacio LAB
 * - Búsqueda = encontrar el color más cercano a un color dado
 * 
 * Complejidad:
 * - Construcción: O(n log n)
 * - Búsqueda: O(log n) promedio, O(n) peor caso
 * - vs búsqueda lineal: O(n) siempre
 * 
 * Para 3,000 colores:
 * - Búsqueda lineal: ~3,000 comparaciones
 * - KD-Tree: ~12 comparaciones (log2(3000) ≈ 12)
 * - Mejora: ~250x más rápido
 */

import { PantoneColorExpanded } from "../data/pantoneLabExpanded";

interface KDNode {
  point: PantoneColorExpanded;
  dimension: number; // 0=L, 1=a, 2=b
  left: KDNode | null;
  right: KDNode | null;
}

export class ColorKDTree {
  private root: KDNode | null = null;

  constructor(colors: PantoneColorExpanded[]) {
    this.root = this.buildTree(colors, 0);
  }

  /**
   * Construye el KD-Tree recursivamente
   */
  private buildTree(points: PantoneColorExpanded[], depth: number): KDNode | null {
    if (points.length === 0) return null;

    const dimension = depth % 3; // Cicla entre 0, 1, 2 (L, a, b)
    
    // Ordenar por la dimensión actual
    points.sort((a, b) => {
      const aVal = dimension === 0 ? a.L : dimension === 1 ? a.a : a.b;
      const bVal = dimension === 0 ? b.L : dimension === 1 ? b.a : b.b;
      return aVal - bVal;
    });

    const medianIndex = Math.floor(points.length / 2);
    
    return {
      point: points[medianIndex],
      dimension,
      left: this.buildTree(points.slice(0, medianIndex), depth + 1),
      right: this.buildTree(points.slice(medianIndex + 1), depth + 1)
    };
  }

  /**
   * Calcula distancia euclidiana en espacio LAB (Delta E CIE76)
   */
  private distance(p1: PantoneColorExpanded, p2: { L: number; a: number; b: number }): number {
    const dL = p1.L - p2.L;
    const da = p1.a - p2.a;
    const db = p1.b - p2.b;
    return Math.sqrt(dL * dL + da * da + db * db);
  }

  /**
   * Busca el color más cercano al punto dado
   */
  findNearest(target: { L: number; a: number; b: number }): PantoneColorExpanded | null {
    if (!this.root) return null;

    let bestMatch: PantoneColorExpanded | null = null;
    let bestDistance = Infinity;

    const search = (node: KDNode | null) => {
      if (!node) return;

      const dist = this.distance(node.point, target);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = node.point;
      }

      // Determinar qué rama explorar primero
      const targetVal = node.dimension === 0 ? target.L : 
                       node.dimension === 1 ? target.a : target.b;
      const nodeVal = node.dimension === 0 ? node.point.L : 
                     node.dimension === 1 ? node.point.a : node.point.b;
      
      const firstBranch = targetVal < nodeVal ? node.left : node.right;
      const secondBranch = targetVal < nodeVal ? node.right : node.left;

      // Explorar la rama más prometedora primero
      search(firstBranch);

      // Explorar la otra rama solo si podría contener un punto más cercano
      const splitDistance = Math.abs(targetVal - nodeVal);
      if (splitDistance < bestDistance) {
        search(secondBranch);
      }
    };

    search(this.root);
    return bestMatch;
  }

  /**
   * Busca los k colores más cercanos al punto dado
   */
  findKNearest(target: { L: number; a: number; b: number }, k: number): Array<PantoneColorExpanded & { deltaE: number }> {
    if (!this.root) return [];

    const results: Array<{ color: PantoneColorExpanded; distance: number }> = [];

    const search = (node: KDNode | null) => {
      if (!node) return;

      const dist = this.distance(node.point, target);
      
      // Mantener solo los k mejores resultados
      if (results.length < k) {
        results.push({ color: node.point, distance: dist });
        results.sort((a, b) => a.distance - b.distance);
      } else if (dist < results[results.length - 1].distance) {
        results[results.length - 1] = { color: node.point, distance: dist };
        results.sort((a, b) => a.distance - b.distance);
      }

      // Determinar qué rama explorar primero
      const targetVal = node.dimension === 0 ? target.L : 
                       node.dimension === 1 ? target.a : target.b;
      const nodeVal = node.dimension === 0 ? node.point.L : 
                     node.dimension === 1 ? node.point.a : node.point.b;
      
      const firstBranch = targetVal < nodeVal ? node.left : node.right;
      const secondBranch = targetVal < nodeVal ? node.right : node.left;

      search(firstBranch);

      // Explorar la otra rama si es necesario
      const splitDistance = Math.abs(targetVal - nodeVal);
      const worstDistance = results.length < k ? Infinity : results[results.length - 1].distance;
      
      if (splitDistance < worstDistance) {
        search(secondBranch);
      }
    };

    search(this.root);

    return results.map(r => ({
      ...r.color,
      deltaE: r.distance
    }));
  }
}

/**
 * Función helper para crear un KD-Tree desde un array de colores
 */
export function createColorKDTree(colors: PantoneColorExpanded[]): ColorKDTree {
  return new ColorKDTree(colors);
}
