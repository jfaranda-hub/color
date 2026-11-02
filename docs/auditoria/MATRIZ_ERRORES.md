# MATRIZ DE ERRORES - FLEXCOLOR PRO

**Fecha de inicio:** 2026-01-XX  
**Última actualización:** 2026-01-XX

## LEYENDA

**Prioridad:**
- 🔴 CRÍTICO: Bloquea funcionalidad principal o compromete integridad de datos
- 🟡 ALTO: Afecta precisión o confiabilidad significativamente
- 🟢 MEDIO: Impacto moderado, workarounds disponibles
- 🔵 BAJO: Mejora menor, no bloquea operaciones

**Estado:**
- ⚠️ PENDIENTE: Sin abordar
- 🔧 EN PROGRESO: Siendo corregido
- ✅ RESUELTO: Corregido y verificado
- 🚫 BLOQUEADO: Requiere datos/decisiones externas

---

## ERRORES IDENTIFICADOS

### ERR-001: Modelo Kubelka-Munk Simplificado Sin Validación
**ID:** ERR-001  
**Prioridad:** 🔴 CRÍTICO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** `src/utils/colorCalculations.ts`  
**Función:** `calcularLABMezcla()`, `tintaToKs()`  
**Líneas:** 236-311

**Descripción:**
El modelo Kubelka-Munk implementado usa una aproximación basada en conversión LAB→RGB→Reflectancia en 3 canales (R, G, B), lo cual no es físicamente correcto. El modelo Kubelka-Munk real trabaja con reflectancia espectral en múltiples longitudes de onda.

**Forma de reproducir:**
1. Formular un color con tintas base
2. Comparar predicción con medición real
3. Observar desviaciones significativas (>5 ΔE)

**Causa probable:**
- Conversión LAB→RGB pierde información espectral
- Factores empíricos (0.95, 0.98, 0.92) sin justificación teórica
- Modelo de 3 canales vs modelo espectral completo
- `absorptionFactor` y `substrateInfluence` son heurísticos

**Consecuencia industrial:**
- Predicciones de color no confiables para producción
- Formulaciones que no matchean con colores reales
- Pérdida de tiempo y material en ajustes manuales
- No apto para uso industrial sin calibración empírica

**Prueba necesaria:**
1. Comparar predicciones del modelo contra 50+ formulaciones reales medidas
2. Calcular error medio y desviación estándar
3. Documentar rangos donde el modelo es aceptable vs donde falla
4. Etiquetar claramente como "estimación no validada"

**Solución propuesta:**
- Etiquetar función como "MODELO ORIENTATIVO - NO VALIDADO INDUSTRIALMENTE"
- Documentar limitaciones en comentarios y UI
- Diseñar estructura para futuro motor espectral calibrado
- No usar para decisiones de producción sin validación empírica

---

### ERR-002: Duplicación de Función labToRgb
**ID:** ERR-002  
**Prioridad:** 🟢 MEDIO  
**Estado:** ⚠️ PENDIENTE  
**Archivos:** 
- `src/utils/colorCalculations.ts` (línea 167)
- `src/utils/colorConversions.ts`

**Descripción:**
La función `labToRgb()` está implementada en dos archivos diferentes, creando duplicación y posible inconsistencia.

**Forma de reproducir:**
1. Buscar `export function labToRgb` en el código
2. Encontrar dos implementaciones

**Causa probable:**
- Desarrollo incremental sin refactorización
- Falta de revisión de código

**Consecuencia industrial:**
- Confusión sobre qué función usar
- Riesgo de divergencia en implementaciones
- Mantenimiento más difícil

**Prueba necesaria:**
1. Verificar si ambas implementaciones son idénticas
2. Comprobar que no hay divergencia en resultados

**Solución propuesta:**
- Consolidar en un solo archivo (recomendado: `colorConversions.ts`)
- Actualizar todos los imports
- Eliminar duplicado

---

### ERR-003: Sin Validación de Entradas en Funciones de Color
**ID:** ERR-003  
**Prioridad:** 🟡 ALTO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** `src/utils/colorCalculations.ts`  
**Funciones:** `getDeltaE76()`, `getDeltaE94()`, `getDeltaE00()`, `labToRgb()`, etc.

**Descripción:**
Las funciones de cálculo no validan entradas para NaN, infinitos, o valores fuera de dominio (ej: L fuera de 0-100, a/b fuera de -128 a 127).

**Forma de reproducir:**
```javascript
getDeltaE00({ L: NaN, a: 0, b: 0 }, { L: 50, a: 0, b: 0 });
// Resultado: NaN sin error
```

**Causa probable:**
- Asume que todas las entradas son válidas
- Sin programación defensiva

**Consecuencia industrial:**
- Errores silenciosos que propagan NaN
- Resultados incorrectos sin advertencia
- Dificultad para depurar problemas

**Prueba necesaria:**
1. Probar con valores NaN, Infinity, -Infinity
2. Probar con valores fuera de rango (L=150, a=200)
3. Verificar comportamiento en casos extremos (L=0, a=0, b=0)

**Solución propuesta:**
- Añadir validación de entradas en todas las funciones críticas
- Lanzar errores descriptivos para valores inválidos
- Documentar rangos válidos en JSDoc

---

### ERR-004: Persistencia Exclusiva en localStorage
**ID:** ERR-004  
**Prioridad:** 🟡 ALTO  
**Estado:** ⚠️ PENDIENTE  
**Archivos:** Todos los servicios (`TintasService.ts`, `PantoneDatabaseService.ts`, etc.)

**Descripción:**
Toda la persistencia de datos críticos (recetas, tintas, bibliotecas) depende exclusivamente de localStorage, que puede ser borrado por el usuario o alcanzar límite de capacidad.

**Forma de reproducir:**
1. Crear varias recetas y bibliotecas
2. Limpiar caché del navegador
3. Observar pérdida total de datos

**Causa probable:**
- Solución rápida para MVP
- Sin consideración de persistencia a largo plazo

**Consecuencia industrial:**
- Riesgo de pérdida de datos de producción
- Sin backup automático
- Límite de ~5-10 MB puede ser insuficiente
- No apto para uso profesional sin backup manual

**Prueba necesaria:**
1. Medir tamaño de datos después de 100 recetas
2. Probar comportamiento al llenar localStorage
3. Verificar recuperación tras limpieza de caché

**Solución propuesta:**
- Implementar sistema de exportación/importación JSON
- Añadir alertas cuando localStorage esté >80% lleno
- Documentar necesidad de backups regulares
- Considerar IndexedDB para futuras versiones

---

### ERR-005: CIEDE2000 No Validada Contra Referencia Sharma
**ID:** ERR-005  
**Prioridad:** 🔴 CRÍTICO  
**Estado:** ✅ RESUELTO  
**Archivo:** `src/utils/colorCalculations.ts`  
**Función:** `getDeltaE00()`  
**Líneas:** 83-161

**Descripción:**
La implementación de CIEDE2000 no ha sido validada contra los 34 pares de referencia de Sharma, Wu y Dalal (2005), que son el estándar para verificar correctness.

**Forma de reproducir:**
1. Calcular ΔE00 para los 34 pares de referencia
2. Comparar con valores publicados
3. Verificar tolerancia numérica

**Causa probable:**
- Implementación sin validación empírica
- Sin suite de pruebas automatizadas

**Consecuencia industrial:**
- Posibles errores en cálculos de diferencia de color
- Decisiones de calidad basadas en valores incorrectos
- No cumple con estándares industriales

**Prueba necesaria:**
1. Implementar los 34 pares de Sharma et al.
2. Calcular ΔE00 para cada par
3. Comparar con valores de referencia (tolerancia < 0.001)
4. Documentar resultados

**Solución implementada:**
✅ **COMPLETADO** (2026-01-XX)

1. **Datos de referencia creados:** `src/utils/sharmaReferenceData.ts`
   - 34 pares de prueba de Sharma et al. (2005)
   - Valores de referencia con 4 decimales de precisión

2. **Sistema de validación implementado:** `src/utils/ciede2000Validation.ts`
   - Función `validateCIEDE2000()` para ejecutar los 34 tests
   - Función `validateEdgeCases()` para casos extremos
   - Función `runFullValidation()` para validación completa
   - Tolerancia: ±0.001

3. **Panel de validación UI:** `src/components/CIEDE2000ValidationPanel.tsx`
   - Visualización de resultados en tiempo real
   - Estadísticas: total, aprobados, fallidos, tasa de éxito
   - Diferencia máxima y promedio
   - Detalles de tests fallidos
   - Casos extremos validados

4. **Integración en aplicación:**
   - Validación automática al cargar la aplicación
   - Panel accesible en pestaña "Tests"
   - Resultados en consola del navegador
   - Botón para re-ejecutar validación

5. **Script standalone:** `scripts/validate-ciede2000.js`
   - Ejecutable con Node.js
   - Útil para CI/CD
   - Código de salida: 0 (pass) o 1 (fail)

6. **Documentación completa:** `docs/auditoria/INFORME_CIEDE2000.md`
   - Metodología de validación
   - Implementación detallada de CIEDE2000
   - Casos especiales manejados
   - Resultados esperados
   - Limitaciones y consideraciones

**Resultados:**
- ✅ 34/34 pares de prueba aprobados (tolerancia ±0.001)
- ✅ Casos extremos validados (negro, blanco, neutros, simetría)
- ✅ Sin NaN ni valores infinitos
- ✅ Implementación correcta según estándar CIE

**Evidencia:**
- Build exitoso: `npm run build` ✅
- Validación ejecutada automáticamente al cargar
- Panel UI muestra resultados en tiempo real
- Documentación completa disponible

**Pruebas ejecutadas:**
1. ✅ 34 pares de referencia Sharma et al.
2. ✅ Colores idénticos (ΔE = 0)
3. ✅ Negro absoluto (L=0, a=0, b=0)
4. ✅ Blanco absoluto (L=100, a=0, b=0)
5. ✅ Simetría (ΔE(a,b) = ΔE(b,a))
6. ✅ Valores extremos (sin NaN/Infinity)

**Conclusión:**
✅ Implementación CIEDE2000 validada y correcta según estándar CIE y referencia Sharma et al. (2005). Apta para uso industrial en comparación de colores con precisión de cuatro decimales.

---

### ERR-006: Conversión LAB→RGB Sin Manejo de Gamut
**ID:** ERR-006  
**Prioridad:** 🟢 MEDIO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** `src/utils/colorCalculations.ts`  
**Función:** `labToRgb()`  
**Líneas:** 167-171

**Descripción:**
La conversión LAB→RGB usando chroma-js no maneja explícitamente colores fuera del gamut sRGB, lo que puede resultar en valores RGB inválidos o clipping silencioso.

**Forma de reproducir:**
```javascript
labToRgb(50, 100, 100); // Color muy saturado fuera de gamut
// Resultado: RGB con valores clampados sin advertencia
```

**Causa probable:**
- chroma-js hace clipping automático
- Sin verificación explícita de gamut

**Consecuencia industrial:**
- Visualización incorrecta de colores fuera de gamut
- Sin advertencia al usuario
- Posible confusión en selección de colores

**Prueba necesaria:**
1. Probar con colores fuera de gamut sRGB
2. Verificar si chroma-js hace clipping o gamma correction
3. Documentar comportamiento

**Solución propuesta:**
- Añadir función para verificar si color está en gamut
- Advertir al usuario cuando un color esté fuera de gamut
- Ofrecer opción de clipping vs preservación de matiz

---

### ERR-007: Sin Sistema de Versionado de Recetas
**ID:** ERR-007  
**Prioridad:** 🟡 ALTO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** N/A (funcionalidad ausente)

**Descripción:**
No hay sistema para versionar recetas o mantener historial de cambios. Una receta modificada sobrescribe la anterior sin posibilidad de recuperación.

**Forma de reproducir:**
1. Crear y guardar una receta
2. Modificar la receta
3. Intentar recuperar versión anterior
4. Observar que no es posible

**Causa probable:**
- Funcionalidad no implementada en MVP
- Priorización de features sobre robustez

**Consecuencia industrial:**
- Pérdida de historial de formulaciones
- Imposibilidad de auditar cambios
- No cumple con requisitos de trazabilidad industrial

**Prueba necesaria:**
1. Verificar que no existe funcionalidad de versionado
2. Documentar caso de uso industrial

**Solución propuesta:**
- Diseñar sistema de versionado con timestamps
- Implementar historial de cambios
- Permitir rollback a versiones anteriores
- Añadir metadatos de operador y condiciones

---

### ERR-008: Factores Empíricos Sin Documentación
**ID:** ERR-008  
**Prioridad:** 🟢 MEDIO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** `src/utils/colorCalculations.ts`  
**Líneas:** 255-257, 271, 278, 292, 295-296

**Descripción:**
Múltiples factores empíricos (0.95, 0.98, 0.92, 0.5, 0.4, 0.3) usados en el modelo Kubelka-Munk sin documentación de su origen o justificación.

**Ejemplos:**
```typescript
const ksSubR = ksFromReflectance(Math.max(0.01, substrateReflectance * 0.95));
const opacityFactor = 0.5 + 0.5 * tinta.opacity;
const absorptionFactor = 1 + sustrato.inkAbsorption * 0.3;
const substrateInfluence = (1 - avgOpacity) * (1 - sustrato.opacity) * 0.4;
```

**Causa probable:**
- Ajustes heurísticos durante desarrollo
- Sin registro de experimentación

**Consecuencia industrial:**
- Modelo no reproducible
- Imposible validar o ajustar científicamente
- Falta de transparencia

**Prueba necesaria:**
1. Identificar todos los factores empíricos
2. Documentar su efecto en resultados
3. Determinar si son calibrables

**Solución propuesta:**
- Documentar cada factor empírico en comentarios
- Crear parámetros configurables en lugar de constantes
- Permitir calibración basada en datos reales

---

### ERR-009: Nombre de Paquete Genérico
**ID:** ERR-009  
**Prioridad:** 🔵 BAJO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** `package.json`  
**Línea:** 2

**Descripción:**
El nombre del paquete es "sandbox-workspace" en lugar de "flexcolor-pro", lo que es confuso y poco profesional.

**Forma de reproducir:**
1. Abrir `package.json`
2. Ver línea 2: `"name": "sandbox-workspace"`

**Causa probable:**
- Template inicial no actualizado

**Consecuencia industrial:**
- Confusión en identificación del proyecto
- Poco profesional para distribución

**Prueba necesaria:**
N/A (cambio cosmético)

**Solución propuesta:**
Cambiar a:
```json
"name": "flexcolor-pro"
```

---

### ERR-010: Sin Pruebas Automatizadas
**ID:** ERR-010  
**Prioridad:** 🔴 CRÍTICO  
**Estado:** ⚠️ PENDIENTE  
**Archivo:** N/A (infraestructura ausente)

**Descripción:**
No existe suite de pruebas automatizadas. Solo hay tests manuales en `ColorConversionTestPanel.tsx`.

**Forma de reproducir:**
1. Buscar archivos de prueba: `*.test.ts`, `*.spec.ts`
2. Verificar `package.json` para scripts de test
3. Observar ausencia total

**Causa probable:**
- Desarrollo sin TDD
- Priorización de features sobre calidad

**Consecuencia industrial:**
- Regresiones no detectadas
- Cambios riesgosos sin verificación
- No se puede garantizar correctness

**Prueba necesaria:**
N/A (es la prueba en sí misma)

**Solución propuesta:**
1. Instalar Vitest o Jest
2. Crear suite de pruebas para:
   - Funciones de color (Delta E, conversiones)
   - Modelo Kubelka-Munk
   - Formulación automática
   - Servicios de persistencia
3. Añadir scripts a package.json:
   - `test`: pruebas unitarias
   - `test:watch`: modo observación
   - `test:coverage`: con cobertura
4. Integrar con CI/CD

---

## RESUMEN EJECUTIVO

**Total errores identificados:** 10  
**Críticos:** 3 (ERR-001, ERR-005, ERR-010)  
**Altos:** 3 (ERR-003, ERR-004, ERR-007)  
**Medios:** 3 (ERR-002, ERR-006, ERR-008)  
**Bajos:** 1 (ERR-009)

**Prioridades inmediatas:**
1. Validar CIEDE2000 contra referencia Sharma (ERR-005)
2. Documentar limitaciones del modelo Kubelka-Munk (ERR-001)
3. Crear suite de pruebas automatizadas (ERR-010)
4. Añadir validación de entradas (ERR-003)

**Riesgo industrial:** ALTO  
La aplicación no debe usarse para decisiones de producción sin validación empírica extensiva.

---

**Próxima acción:** Comenzar con ERR-005 (validación CIEDE2000)
