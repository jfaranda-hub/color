/**
 * Servicio de gestión de tintas base
 * Patrón Repository con persistencia en localStorage
 * 
 * Permite:
 * - CRUD completo de tintas
 * - Persistencia automática en localStorage
 * - Carga inicial desde datos por defecto
 * - Reset a valores originales
 */

import { TintaBase, tintasBase as tintasBaseDefaults } from "../data/tintasBase";

// ============================================
// INTERFAZ DEL SERVICIO
// ============================================

export interface ITintasService {
  /** Obtiene todas las tintas almacenadas */
  getAll(): TintaBase[];
  
  /** Obtiene una tinta por su ID */
  getById(id: string): TintaBase | undefined;
  
  /** Guarda una nueva tinta */
  save(tinta: TintaBase): TintaBase;
  
  /** Actualiza una tinta existente */
  update(id: string, data: Partial<TintaBase>): TintaBase | undefined;
  
  /** Elimina una tinta por su ID */
  delete(id: string): boolean;
  
  /** Resetea todas las tintas a los valores por defecto */
  resetToDefaults(): TintaBase[];
}

// ============================================
// IMPLEMENTACIÓN CON LOCALSTORAGE
// ============================================

const STORAGE_KEY = "tintasBase";

class LocalStorageTintasService implements ITintasService {
  /**
   * Inicializa el servicio cargando datos desde localStorage
   * Si no hay datos, carga los valores por defecto
   */
  private initializeStorage(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Primera vez: cargar datos por defecto
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tintasBaseDefaults));
    }
  }

  /**
   * Lee las tintas desde localStorage
   */
  private readFromStorage(): TintaBase[] {
    this.initializeStorage();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as TintaBase[];
      }
      return [];
    } catch (error) {
      console.error("Error reading tintas from localStorage:", error);
      return [];
    }
  }

  /**
   * Escribe las tintas en localStorage
   */
  private writeToStorage(tintas: TintaBase[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tintas));
    } catch (error) {
      console.error("Error writing tintas to localStorage:", error);
    }
  }

  /**
   * Obtiene todas las tintas almacenadas
   */
  getAll(): TintaBase[] {
    return this.readFromStorage();
  }

  /**
   * Obtiene una tinta por su ID
   */
  getById(id: string): TintaBase | undefined {
    const tintas = this.readFromStorage();
    return tintas.find(t => t && t.id === id);
  }

  /**
   * Guarda una nueva tinta
   */
  save(tinta: TintaBase): TintaBase {
    const tintas = this.readFromStorage();
    tintas.push(tinta);
    this.writeToStorage(tintas);
    return tinta;
  }

  /**
   * Actualiza una tinta existente
   */
  update(id: string, data: Partial<TintaBase>): TintaBase | undefined {
    const tintas = this.readFromStorage();
    const index = tintas.findIndex(t => t && t.id === id);
    
    if (index === -1) {
      return undefined;
    }

    // Actualizar solo los campos proporcionados
    tintas[index] = { ...tintas[index], ...data };
    this.writeToStorage(tintas);
    
    return tintas[index];
  }

  /**
   * Elimina una tinta por su ID
   */
  delete(id: string): boolean {
    const tintas = this.readFromStorage();
    const index = tintas.findIndex(t => t && t.id === id);
    
    if (index === -1) {
      return false;
    }

    tintas.splice(index, 1);
    this.writeToStorage(tintas);
    return true;
  }

  /**
   * Resetea todas las tintas a los valores por defecto
   */
  resetToDefaults(): TintaBase[] {
    this.writeToStorage(tintasBaseDefaults);
    return [...tintasBaseDefaults];
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

/**
 * Instancia singleton del servicio de tintas
 * Usar esta instancia en toda la aplicación
 */
export const tintasService: ITintasService = new LocalStorageTintasService();
