/**
 * Tipos para el sistema de gestión industrial de tintas
 * FASE 9 - FlexColor Pro
 */

// ============================================
// USUARIOS Y PERMISOS
// ============================================

export type RolUsuario = 'admin' | 'operario' | 'supervisor' | 'consulta';

export interface Usuario {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

// ============================================
// TINTAS Y MATERIAS PRIMAS
// ============================================

export interface Tinta {
  id: string;
  codigoInterno: string;
  nombreComercial: string;
  fabricante?: string;
  familia?: string;
  tipo: 'base' | 'pigmento' | 'aditivo';
  colorHex?: string;
  lab?: { L: number; a: number; b: number };
  fuerzaTintorea?: number;
  opacidad?: number;
  unidadMedida: string;
  stockMinimo: number;
  activo: boolean;
  fechaCreacion: string;
  creadoPor: string;
}

export interface LoteTinta {
  id: string;
  tintaId: string;
  numeroLote: string;
  proveedor?: string;
  fechaRecepcion: string;
  fechaVencimiento?: string;
  cantidadRecibida: number;
  unidadMedida: string;
  precioUnitario: number; // Precio real de compra
  moneda: string;
  certificadoCalidad?: string;
  observaciones?: string;
  recibidoPor: string;
  fechaCreacion: string;
}

// ============================================
// INVENTARIO Y MOVIMIENTOS
// ============================================

export type TipoMovimiento = 'entrada' | 'salida' | 'devolucion' | 'merma' | 'ajuste' | 'reserva';

export interface MovimientoInventario {
  id: string;
  loteTintaId: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  motivo?: string;
  referenciaDocumento?: string;
  autorizadoPor?: string;
  registradoPor: string;
  fechaMovimiento: string;
  ubicacionFisica?: string;
}

export interface StockActual {
  tintaId: string;
  codigoInterno: string;
  nombreComercial: string;
  stockDisponible: number;
  stockReservado: number;
  stockTotal: number;
}

// ============================================
// FÓRMULAS MAESTRAS VERSIONADAS
// ============================================

export type EstadoFormula = 'borrador' | 'validada' | 'aprobada' | 'obsoleta';

export interface FormulaMaestra {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  pantoneReferencia?: string;
  sustratoObjetivo?: string;
  estado: EstadoFormula;
  creadoPor: string;
  fechaCreacion: string;
  fechaModificacion: string;
  versionActual: number;
}

export interface VersionFormula {
  id: string;
  formulaId: string;
  numeroVersion: number;
  fechaCreacion: string;
  creadoPor: string;
  motivoCambio?: string;
  estado: EstadoFormula;
  componentes: ComponenteFormula[];
}

export interface ComponenteFormula {
  id: string;
  versionId: string;
  tintaId: string;
  porcentaje: number;
  gramosPorLitro?: number;
  ordenPreparacion?: number;
  observaciones?: string;
}

// ============================================
// LOTES DE FABRICACIÓN
// ============================================

export type EstadoOrden = 'preparada' | 'en_fabricacion' | 'pendiente_validacion' | 'aprobada' | 'rechazada' | 'cerrada';
export type EstadoLote = 'pendiente_validacion' | 'aprobado' | 'rechazado';

export interface OrdenFabricacion {
  id: string;
  numeroOrden: string;
  formulaId: string;
  versionId: string;
  cantidadObjetivo: number;
  unidadMedida: string;
  estado: EstadoOrden;
  fechaInicio?: string;
  fechaFin?: string;
  operarioResponsable?: string;
  validadoPor?: string;
  observaciones?: string;
  fechaCreacion: string;
}

export interface LoteFabricado {
  id: string;
  ordenId: string;
  numeroLote: string;
  cantidadProducida: number;
  unidadMedida: string;
  fechaFabricacion: string;
  operario: string;
  estado: EstadoLote;
  validadoPor?: string;
  fechaValidacion?: string;
  observaciones?: string;
}

export interface ConsumoFabricacion {
  id: string;
  loteFabricadoId: string;
  loteTintaId: string;
  cantidadConsumida: number;
  unidadMedida: string;
  fechaConsumo: string;
  registradoPor: string;
}

export interface DevolucionFabricacion {
  id: string;
  loteFabricadoId: string;
  loteTintaId: string;
  cantidadDevuelta: number;
  unidadMedida: string;
  motivo?: string;
  fechaDevolucion: string;
  registradoPor: string;
}

export interface MermaFabricacion {
  id: string;
  loteFabricadoId: string;
  loteTintaId: string;
  cantidadMerma: number;
  unidadMedida: string;
  motivo: string;
  justificacion?: string;
  autorizadoPor?: string;
  fechaMerma: string;
  registradoPor: string;
}

export interface SobranteFabricacion {
  id: string;
  loteFabricadoId: string;
  cantidadSobrante: number;
  unidadMedida: string;
  destino: 'almacen' | 'reutilizar' | 'descartar';
  observaciones?: string;
  registradoPor: string;
  fechaRegistro: string;
}

// ============================================
// COSTES HISTÓRICOS
// ============================================

export interface CosteFabricacion {
  id: string;
  loteFabricadoId: string;
  costeMateriasPrimas: number;
  costeManoObra: number;
  costeIndirecto: number;
  costeTotal: number;
  cantidadProducida: number;
  costePorKg: number;
  moneda: string;
  fechaCalculo: string;
  calculadoPor: string;
}

export interface DetalleCosteComponente {
  id: string;
  costeFabricacionId: string;
  loteTintaId: string;
  cantidadConsumida: number;
  precioUnitarioHistorico: number; // Precio real del lote en momento de uso
  costeComponente: number;
  moneda: string;
}

// ============================================
// MEDICIONES Y CONTROL DE CALIDAD
// ============================================

export interface MedicionColor {
  id: string;
  loteFabricadoId: string;
  tipoMedicion: 'objetivo' | 'producido';
  lab: { L: number; a: number; b: number };
  deltaE00?: number;
  instrumento?: string;
  condicionesMedicion?: string;
  fechaMedicion: string;
  medidoPor: string;
}

export interface AjusteFabricacion {
  id: string;
  loteFabricadoId: string;
  loteTintaId: string;
  cantidadAjuste: number;
  motivo: string;
  deltaEAntes?: number;
  deltaEDespues?: number;
  fechaAjuste: string;
  registradoPor: string;
}

// ============================================
// AUDITORÍA
// ============================================

export interface RegistroAuditoria {
  id: string;
  tabla: string;
  registroId: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE';
  datosAnteriores?: any;
  datosNuevos?: any;
  usuarioId: string;
  fecha: string;
  ipAddress?: string;
}
