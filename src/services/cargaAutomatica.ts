/**
 * Servicio para cargar automáticamente la biblioteca base de colores Pantone
 * al iniciar la aplicación
 * 
 * Fuente: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
 * Total: 3,219 colores Pantone Solid Coated 2024
 */

import { parsePantoneCSV } from './parserCSV';
import { crearBiblioteca, getBibliotecas } from './gestorBibliotecas';

const BIBLIOTECA_BASE_ID = 'biblioteca-base-pantone-2024';
const BIBLIOTECA_BASE_NOMBRE = 'Pantone Solid Coated 2024 (3,219 colores)';

/**
 * Verifica si la biblioteca base ya está cargada
 */
export function bibliotecaBaseCargada(): boolean {
  const bibliotecas = getBibliotecas();
  return bibliotecas.some(b => b.id === BIBLIOTECA_BASE_ID);
}

/**
 * Carga automáticamente la biblioteca base desde el archivo colors.csv
 * Solo se ejecuta si la biblioteca no existe previamente
 */
export async function cargarBibliotecaBase(): Promise<{
  success: boolean;
  totalColores: number;
  errores: string[];
}> {
  // Si ya existe, no hacer nada
  if (bibliotecaBaseCargada()) {
    console.log('✅ Biblioteca base ya cargada');
    const bibliotecas = getBibliotecas();
    const base = bibliotecas.find(b => b.id === BIBLIOTECA_BASE_ID);
    return {
      success: true,
      totalColores: base?.totalColores || 0,
      errores: []
    };
  }

  try {
    console.log('📚 Cargando biblioteca base de colores Pantone (3,219 colores)...');
    console.log('📂 Fuente: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5');
    
    // Intentar cargar el archivo CSV
    const response = await fetch('/src/data/colors.csv');
    
    if (!response.ok) {
      throw new Error(`No se pudo cargar colors.csv: ${response.statusText}`);
    }

    const csvContent = await response.text();
    
    console.log(`📊 Archivo CSV cargado: ${(csvContent.length / 1024).toFixed(2)} KB`);
    
    // Parsear el CSV
    const parseResult = parsePantoneCSV(csvContent);
    
    console.log(`🔍 Parseo completado: ${parseResult.totalValidos} colores válidos de ${parseResult.totalProcesados} procesados`);
    
    if (!parseResult.success || parseResult.colores.length === 0) {
      throw new Error(`No se encontraron colores válidos. Errores: ${parseResult.errores.join(', ')}`);
    }

    // Crear la biblioteca base
    const result = crearBiblioteca(
      BIBLIOTECA_BASE_NOMBRE,
      csvContent,
      'colors.csv'
    );

    if (result.success && result.biblioteca) {
      // Forzar el ID específico para la biblioteca base
      const bibliotecas = getBibliotecas();
      const index = bibliotecas.findIndex(b => b.id === result.biblioteca!.id);
      if (index !== -1) {
        bibliotecas[index].id = BIBLIOTECA_BASE_ID;
        bibliotecas[index].activa = true;
        localStorage.setItem('flexcolor_bibliotecas', JSON.stringify(bibliotecas));
      }

      console.log(`✅ Biblioteca base cargada exitosamente: ${parseResult.totalValidos} colores Pantone`);
      
      if (result.errores.length > 0) {
        console.warn(`⚠️  Advertencias durante el parseo: ${result.errores.length}`);
      }
      
      return {
        success: true,
        totalColores: parseResult.totalValidos,
        errores: result.errores
      };
    } else {
      throw new Error(`Error al crear biblioteca base: ${result.errores.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error cargando biblioteca base:', error);
    return {
      success: false,
      totalColores: 0,
      errores: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Obtiene información sobre la biblioteca base
 */
export function getBibliotecaBaseInfo(): {
  existe: boolean;
  totalColores: number;
  activa: boolean;
  nombre: string;
} {
  const bibliotecas = getBibliotecas();
  const base = bibliotecas.find(b => b.id === BIBLIOTECA_BASE_ID);
  
  if (!base) {
    return {
      existe: false,
      totalColores: 0,
      activa: false,
      nombre: BIBLIOTECA_BASE_NOMBRE
    };
  }

  return {
    existe: true,
    totalColores: base.totalColores,
    activa: base.activa,
    nombre: base.nombre
  };
}
