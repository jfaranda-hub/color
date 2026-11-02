/**
 * Hook de React para gestión reactiva de tintas base
 * 
 * Proporciona:
 * - Estado reactivo de tintas (se actualiza automáticamente en la UI)
 * - Funciones CRUD que actualizan tanto el estado local como localStorage
 * - Carga inicial automática al montar el componente
 * 
 * Uso:
 * const { tintas, añadirTinta, editarTinta, eliminarTinta, resetear } = useTintasBase();
 */

import { useState, useEffect } from "react";
import { TintaBase } from "../data/tintasBase";
import { tintasService } from "../services/TintasService";

// ============================================
// INTERFAZ DEL HOOK
// ============================================

export interface UseTintasBaseReturn {
  /** Array reactivo de tintas */
  tintas: TintaBase[];
  
  /** Añade una nueva tinta */
  añadirTinta: (tinta: TintaBase) => void;
  
  /** Edita una tinta existente */
  editarTinta: (id: string, data: Partial<TintaBase>) => void;
  
  /** Elimina una tinta */
  eliminarTinta: (id: string) => void;
  
  /** Resetea todas las tintas a los valores por defecto */
  resetear: () => void;
}

// ============================================
// IMPLEMENTACIÓN DEL HOOK
// ============================================

/**
 * Hook para gestionar tintas base con persistencia en localStorage
 * 
 * @returns Objeto con estado reactivo y funciones CRUD
 */
export function useTintasBase(): UseTintasBaseReturn {
  // Estado interno reactivo
  const [tintas, setTintas] = useState<TintaBase[]>([]);

  // Cargar tintas al montar el componente
  useEffect(() => {
    const tintasIniciales = tintasService.getAll();
    setTintas(tintasIniciales);
  }, []);

  /**
   * Añade una nueva tinta
   * Actualiza el estado local Y persiste en localStorage
   */
  const añadirTinta = (tinta: TintaBase): void => {
    const nuevaTinta = tintasService.save(tinta);
    setTintas(prev => [...prev, nuevaTinta]);
  };

  /**
   * Edita una tinta existente
   * Actualiza el estado local Y persiste en localStorage
   */
  const editarTinta = (id: string, data: Partial<TintaBase>): void => {
    const tintaActualizada = tintasService.update(id, data);
    if (tintaActualizada) {
      setTintas(prev => 
        prev.map(t => t && t.id === id ? tintaActualizada : t)
      );
    }
  };

  /**
   * Elimina una tinta
   * Actualiza el estado local Y persiste en localStorage
   */
  const eliminarTinta = (id: string): void => {
    const eliminado = tintasService.delete(id);
    if (eliminado) {
      setTintas(prev => prev.filter(t => t && t.id !== id));
    }
  };

  /**
   * Resetea todas las tintas a los valores por defecto
   * Actualiza el estado local Y persiste en localStorage
   */
  const resetear = (): void => {
    const tintasDefaults = tintasService.resetToDefaults();
    setTintas(tintasDefaults);
  };

  return {
    tintas,
    añadirTinta,
    editarTinta,
    eliminarTinta,
    resetear
  };
}
