# Modelo de Datos - FlexColor Pro Industrial

## Arquitectura de Persistencia

### Problema Actual
- localStorage es local al navegador de cada usuario
- No hay sincronización entre equipos
- Riesgo de pérdida de datos
- Sin control de concurrencia
- Sin auditoría de cambios

### Solución Propuesta
Migrar a PostgreSQL con API REST para:
- Persistencia compartida en red local
- Control de acceso por usuarios
- Transacciones atómicas
- Copias de seguridad automatizadas
- Trazabilidad completa

## Esquema de Base de Datos

### 1. USUARIOS Y PERMISOS

```sql
-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'operario', 'supervisor', 'consulta')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- Registro de sesiones y accesos
CREATE TABLE auditoria_accesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. TINTAS Y MATERIAS PRIMAS

```sql
-- Catálogo de tintas base y materias primas
CREATE TABLE tintas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_interno VARCHAR(50) UNIQUE NOT NULL,
    nombre_comercial VARCHAR(100) NOT NULL,
    fabricante VARCHAR(100),
    familia VARCHAR(50), -- standard-pantone, hs-pantone, etc.
    tipo VARCHAR(50), -- base, pigmento, aditivo
    color_hex VARCHAR(7),
    lab_l DECIMAL(5,2),
    lab_a DECIMAL(5,2),
    lab_b DECIMAL(5,2),
    fuerza_tintorea DECIMAL(5,2) DEFAULT 1.0,
    opacidad DECIMAL(3,2) DEFAULT 0.5,
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id)
);

-- Lotes de materias primas recibidos
CREATE TABLE lotes_tinta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tinta_id UUID REFERENCES tintas(id) NOT NULL,
    numero_lote VARCHAR(50) NOT NULL,
    proveedor VARCHAR(100),
    fecha_recepcion DATE NOT NULL,
    fecha_vencimiento DATE,
    cantidad_recibida DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    precio_unitario DECIMAL(10,2) NOT NULL, -- Precio real de compra
    moneda VARCHAR(3) DEFAULT 'EUR',
    certificado_calidad TEXT,
    observaciones TEXT,
    recibido_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tinta_id, numero_lote)
);
```

### 3. INVENTARIO Y MOVIMIENTOS

```sql
-- Stock actual calculado desde movimientos
CREATE VIEW stock_actual AS
SELECT 
    lt.tinta_id,
    t.codigo_interno,
    t.nombre_comercial,
    COALESCE(SUM(
        CASE 
            WHEN im.tipo_movimiento = 'entrada' THEN im.cantidad
            WHEN im.tipo_movimiento = 'salida' THEN -im.cantidad
            WHEN im.tipo_movimiento = 'devolucion' THEN im.cantidad
            WHEN im.tipo_movimiento = 'merma' THEN -im.cantidad
            WHEN im.tipo_movimiento = 'ajuste' THEN im.cantidad
            ELSE 0
        END
    ), 0) as stock_disponible,
    COALESCE(SUM(
        CASE 
            WHEN im.tipo_movimiento = 'reserva' THEN im.cantidad
            ELSE 0
        END
    ), 0) as stock_reservado
FROM lotes_tinta lt
LEFT JOIN movimientos_inventario im ON im.lote_tinta_id = lt.id
LEFT JOIN tintas t ON t.id = lt.tinta_id
GROUP BY lt.tinta_id, t.codigo_interno, t.nombre_comercial;

-- Movimientos de inventario (tabla de hechos)
CREATE TABLE movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_tinta_id UUID REFERENCES lotes_tinta(id) NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN (
        'entrada',      -- Recepción de material
        'salida',       -- Consumo en fabricación
        'devolucion',   -- Devolución de material no usado
        'merma',        -- Pérdida justificada
        'ajuste',       -- Ajuste autorizado de inventario
        'reserva'       -- Reserva para orden de fabricación
    )),
    cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
    motivo TEXT,
    referencia_documento VARCHAR(100), -- Nº albarán, orden fabricación, etc.
    autorizado_por UUID REFERENCES usuarios(id),
    registrado_por UUID REFERENCES usuarios(id) NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ubicacion_fisica VARCHAR(100)
);

-- Índices para consultas frecuentes
CREATE INDEX idx_movimientos_lote ON movimientos_inventario(lote_tinta_id);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX idx_movimientos_tipo ON movimientos_inventario(tipo_movimiento);
```

### 4. FÓRMULAS MAESTRAS VERSIONADAS

```sql
-- Fórmulas maestras (cabecera)
CREATE TABLE formulas_maestras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    pantone_referencia VARCHAR(50),
    sustrato_objetivo VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'validada', 'aprobada', 'obsoleta')),
    creado_por UUID REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Versiones de fórmulas (historial completo)
CREATE TABLE versiones_formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formula_id UUID REFERENCES formulas_maestras(id) NOT NULL,
    numero_version INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id) NOT NULL,
    motivo_cambio TEXT,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'validada', 'aprobada', 'obsoleta')),
    UNIQUE(formula_id, numero_version)
);

-- Componentes de cada versión de fórmula
CREATE TABLE componentes_formulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID REFERENCES versiones_formulas(id) NOT NULL,
    tinta_id UUID REFERENCES tintas(id) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
    gramos_por_litro DECIMAL(10,2), -- Dosis estándar
    orden_preparacion INTEGER,
    observaciones TEXT,
    UNIQUE(version_id, tinta_id)
);

-- Validación: suma de porcentajes debe ser 100%
CREATE OR REPLACE FUNCTION validar_suma_porcentajes()
RETURNS TRIGGER AS $$
DECLARE
    suma_total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(porcentaje), 0) INTO suma_total
    FROM componentes_formulas
    WHERE version_id = NEW.version_id;
    
    IF suma_total != 100 THEN
        RAISE EXCEPTION 'La suma de porcentajes debe ser 100%. Actual: %', suma_total;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_porcentajes
AFTER INSERT OR UPDATE ON componentes_formulas
FOR EACH ROW EXECUTE FUNCTION validar_suma_porcentajes();
```

### 5. LOTES DE FABRICACIÓN

```sql
-- Órdenes de fabricación
CREATE TABLE ordenes_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    formula_id UUID REFERENCES formulas_maestras(id) NOT NULL,
    version_id UUID REFERENCES versiones_formulas(id) NOT NULL,
    cantidad_objetivo DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    estado VARCHAR(20) DEFAULT 'preparada' CHECK (estado IN (
        'preparada',
        'en_fabricacion',
        'pendiente_validacion',
        'aprobada',
        'rechazada',
        'cerrada'
    )),
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    operario_responsable UUID REFERENCES usuarios(id),
    validado_por UUID REFERENCES usuarios(id),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lotes fabricados (producción real)
CREATE TABLE lotes_fabricados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_id UUID REFERENCES ordenes_fabricacion(id) NOT NULL,
    numero_lote VARCHAR(50) UNIQUE NOT NULL,
    cantidad_producida DECIMAL(10,2) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    fecha_fabricacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operario UUID REFERENCES usuarios(id) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente_validacion' CHECK (estado IN (
        'pendiente_validacion',
        'aprobado',
        'rechazado'
    )),
    validado_por UUID REFERENCES usuarios(id),
    fecha_validacion TIMESTAMP,
    observaciones TEXT
);

-- Consumos reales en fabricación
CREATE TABLE consumos_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL,
    lote_tinta_id UUID REFERENCES lotes_tinta(id) NOT NULL,
    cantidad_consumida DECIMAL(10,2) NOT NULL CHECK (cantidad_consumida > 0),
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    fecha_consumo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por UUID REFERENCES usuarios(id) NOT NULL
);

-- Devoluciones de material no consumido
CREATE TABLE devoluciones_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL,
    lote_tinta_id UUID REFERENCES lotes_tinta(id) NOT NULL,
    cantidad_devuelta DECIMAL(10,2) NOT NULL CHECK (cantidad_devuelta > 0),
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    motivo TEXT,
    fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por UUID REFERENCES usuarios(id) NOT NULL
);

-- Mermas justificadas
CREATE TABLE mermas_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL,
    lote_tinta_id UUID REFERENCES lotes_tinta(id) NOT NULL,
    cantidad_merma DECIMAL(10,2) NOT NULL CHECK (cantidad_merma > 0),
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    motivo TEXT NOT NULL,
    justificacion TEXT,
    autorizado_por UUID REFERENCES usuarios(id),
    fecha_merma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por UUID REFERENCES usuarios(id) NOT NULL
);

-- Sobrantes recuperables
CREATE TABLE sobrantes_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL,
    cantidad_sobrante DECIMAL(10,2) NOT NULL CHECK (cantidad_sobrante > 0),
    unidad_medida VARCHAR(20) DEFAULT 'kg',
    destino VARCHAR(50), -- 'almacen', 'reutilizar', 'descartar'
    observaciones TEXT,
    registrado_por UUID REFERENCES usuarios(id) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. COSTES HISTÓRICOS

```sql
-- Costes de fabricación (inmutables una vez cerrados)
CREATE TABLE costes_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL UNIQUE,
    coste_materias_primas DECIMAL(10,2) NOT NULL,
    coste_mano_obra DECIMAL(10,2) DEFAULT 0,
    coste_indirecto DECIMAL(10,2) DEFAULT 0,
    coste_total DECIMAL(10,2) NOT NULL,
    cantidad_producida DECIMAL(10,2) NOT NULL,
    coste_por_kg DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'EUR',
    fecha_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculado_por UUID REFERENCES usuarios(id) NOT NULL
);

-- Detalle de costes por componente (trazabilidad completa)
CREATE TABLE detalle_costes_componentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coste_fabricacion_id UUID REFERENCES costes_fabricacion(id) NOT NULL,
    lote_tinta_id UUID REFERENCES lotes_tinta(id) NOT NULL,
    cantidad_consumida DECIMAL(10,2) NOT NULL,
    precio_unitario_historico DECIMAL(10,2) NOT NULL, -- Precio real del lote
    coste_componente DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'EUR'
);

-- Costes de mermas
CREATE TABLE costes_mermas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coste_fabricacion_id UUID REFERENCES costes_fabricacion(id) NOT NULL,
    merma_id UUID REFERENCES mermas_fabricacion(id) NOT NULL,
    cantidad_merma DECIMAL(10,2) NOT NULL,
    precio_unitario_historico DECIMAL(10,2) NOT NULL,
    coste_merma DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'EUR'
);

-- Vista de costes históricos
CREATE VIEW vista_costes_historicos AS
SELECT 
    lf.numero_lote,
    of.numero_orden,
    fm.nombre as formula_nombre,
    vf.numero_version,
    cf.coste_materias_primas,
    cf.coste_mano_obra,
    cf.coste_indirecto,
    cf.coste_total,
    cf.cantidad_producida,
    cf.coste_por_kg,
    cf.fecha_calculo,
    u.nombre_completo as operario
FROM lotes_fabricados lf
JOIN ordenes_fabricacion of ON of.id = lf.orden_id
JOIN versiones_formulas vf ON vf.id = of.version_id
JOIN formulas_maestras fm ON fm.id = vf.formula_id
JOIN costes_fabricacion cf ON cf.lote_fabricado_id = lf.id
LEFT JOIN usuarios u ON u.id = lf.operario;
```

### 7. MEDICIONES Y CONTROL DE CALIDAD

```sql
-- Mediciones de color en lotes fabricados
CREATE TABLE mediciones_color (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL,
    tipo_medicion VARCHAR(20) NOT NULL CHECK (tipo_medicion IN ('objetivo', 'producido')),
    lab_l DECIMAL(5,2) NOT NULL,
    lab_a DECIMAL(5,2) NOT NULL,
    lab_b DECIMAL(5,2) NOT NULL,
    delta_e00 DECIMAL(5,2),
    instrumento VARCHAR(100),
    condiciones_medicion TEXT,
    fecha_medicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    medido_por UUID REFERENCES usuarios(id) NOT NULL
);

-- Ajustes realizados durante fabricación
CREATE TABLE ajustes_fabricacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lote_fabricado_id UUID REFERENCES lotes_fabricados(id) NOT NULL,
    lote_tinta_id UUID REFERENCES lotes_tinta(id) NOT NULL,
    cantidad_ajuste DECIMAL(10,2) NOT NULL,
    motivo TEXT NOT NULL,
    delta_e_antes DECIMAL(5,2),
    delta_e_despues DECIMAL(5,2),
    fecha_ajuste TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registrado_por UUID REFERENCES usuarios(id) NOT NULL
);
```

### 8. COPIAS DE SEGURIDAD Y MIGRACIÓN

```sql
-- Registro de copias de seguridad
CREATE TABLE copias_seguridad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('completa', 'incremental', 'manual')),
    archivo_ruta TEXT NOT NULL,
    tamaño_bytes BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por UUID REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'completada' CHECK (estado IN ('completada', 'fallida', 'en_progreso')),
    observaciones TEXT
);

-- Migración desde localStorage
CREATE TABLE migracion_datos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_dato VARCHAR(50) NOT NULL,
    cantidad_registros INTEGER NOT NULL,
    fecha_migracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    migrado_por UUID REFERENCES usuarios(id),
    estado VARCHAR(20) DEFAULT 'completada',
    errores TEXT
);
```

## Reglas de Negocio Críticas

### 1. Inventario
- ✅ Stock se calcula desde movimientos, no se almacena directamente
- ✅ Todo movimiento debe tener usuario registrado y autorización
- ✅ No se permiten salidas si no hay stock suficiente
- ✅ Concurrencia controlada con transacciones

### 2. Lotes de Fabricación
- ✅ No se puede cerrar un lote sin validar consumos, sobrantes y mermas
- ✅ Cada lote referencia la versión exacta de fórmula utilizada
- ✅ Consumos deben conciliar con producción + sobrantes + mermas

### 3. Fórmulas Versionadas
- ✅ Modificar una fórmula crea nueva versión, no altera anteriores
- ✅ Versiones aprobadas no se pueden editar
- ✅ Cada lote fabricado referencia versión específica

### 4. Costes Históricos
- ✅ Costes se calculan con precios reales de lotes consumidos
- ✅ Una vez cerrado, el coste es inmutable
- ✅ Cambio de precio no afecta lotes históricos

### 5. Auditoría
- ✅ Todo cambio importante se registra con usuario y timestamp
- ✅ No se permiten borrados físicos, solo marcado como inactivo
- ✅ Trazabilidad completa desde materia prima hasta producto final

## Migración desde localStorage

### Estrategia
1. Exportar datos actuales de localStorage a JSON
2. Validar integridad de datos
3. Importar a PostgreSQL manteniendo IDs originales
4. Verificar consistencia
5. Documentar migración

### Datos a migrar
- Tintas base (tintasBase)
- Bibliotecas Pantone
- Fichas técnicas
- Recetas guardadas
- Configuraciones de usuario

## Pruebas Obligatorias

### Test 1: Movimiento de inventario
```sql
-- Entrada de 100 kg
INSERT INTO movimientos_inventario (lote_tinta_id, tipo_movimiento, cantidad, ...)
VALUES ('lote-1', 'entrada', 100, ...);

-- Salida de 25 kg
INSERT INTO movimientos_inventario (lote_tinta_id, tipo_movimiento, cantidad, ...)
VALUES ('lote-1', 'salida', 25, ...);

-- Verificar stock = 75 kg
SELECT stock_disponible FROM stock_actual WHERE tinta_id = 'tinta-1';
-- Esperado: 75
```

### Test 2: Conciliación de lote
```sql
-- Consumo: 10 kg tinta A + 5 kg tinta B = 15 kg total
-- Producción: 14 kg
-- Merma: 0.5 kg
-- Sobrante: 0.5 kg
-- Verificar: 15 = 14 + 0.5 + 0.5 ✓
```

### Test 3: Concurrencia
```sql
-- Dos transacciones simultáneas intentando consumir último kg
-- Una debe succeed, otra debe fallar con error de stock insuficiente
```

### Test 4: Coste histórico inmutable
```sql
-- Lote comprado a 10€/kg
-- Fabricación usa ese lote: coste = 10€ * cantidad
-- Cambiar precio a 12€/kg
-- Verificar que lote fabricado mantiene coste de 10€
```

### Test 5: Versionado de fórmulas
```sql
-- Fórmula v1 aprobada
-- Modificar fórmula → crea v2
-- Verificar que v1 permanece inalterada
-- Fabricar lote con v1, otro con v2
-- Verificar referencias correctas
```

## Siguiente Paso

Implementar este esquema en PostgreSQL y crear API REST con:
- Autenticación JWT
- Endpoints para cada módulo
- Control de permisos por rol
- Transacciones atómicas
- Validación de reglas de negocio
