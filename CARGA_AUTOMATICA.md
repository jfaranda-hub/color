# Carga Automática de Colores Pantone

## 📚 Sistema de Bibliotecas de Color

La aplicación FlexColor Pro ahora incluye un sistema completo de gestión de bibliotecas de colores Pantone con carga automática.

## 🚀 Carga Automática al Iniciar

Al iniciar la aplicación, se carga automáticamente una biblioteca base con **674 colores Pantone** desde el archivo `src/data/colors.csv`.

### ¿Qué se carga automáticamente?

- **Nombre de la biblioteca**: "Pantone Solid Coated 2024"
- **Total de colores**: 674 colores Pantone
- **Formato**: CSV con valores LAB (L*, a*, b*)
- **Estado**: Activa por defecto
- **Persistencia**: Se guarda en localStorage

### Verificación en Consola

Al cargar la aplicación, abre la consola del navegador (F12) y verás:

```
📚 CARGANDO BIBLIOTECA BASE DE COLORES PANTONE

✅ Biblioteca base cargada: 674 colores
```

## 📊 Cargar los 3,219 Colores Completos

Para tener acceso a la base de datos completa de **3,219 colores Pantone Solid Coated 2024**, sigue estos pasos:

### Paso 1: Descargar el archivo CSV

1. Ve al repositorio oficial: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
2. Haz clic en el archivo `colors.csv`
3. Haz clic en "Raw" o "Download"
4. Guarda el archivo en tu computadora

### Paso 2: Importar en la Aplicación

1. Abre FlexColor Pro en tu navegador
2. Ve a la pestaña **"Bibliotecas"**
3. En el campo "Nombre de la biblioteca", escribe: `Pantone Completo 2024`
4. Haz clic en **"Seleccionar archivo CSV"**
5. Selecciona el archivo `colors.csv` que descargaste
6. Revisa la vista previa de los primeros 10 colores
7. Haz clic en **"Importar Biblioteca"**

### Paso 3: Activar la Biblioteca

1. En la lista de bibliotecas, busca "Pantone Completo 2024"
2. Asegúrate de que el interruptor esté en posición **activa** (verde)
3. Ahora tienes acceso a los 3,219 colores

## 🔍 Formato del Archivo CSV

El archivo CSV tiene el siguiente formato:

```csv
PANTONENAME,UNIQUECODE,RED,GREEN,BLUE
PANTONE 185 C,10485,49,74,46
PANTONE 186 C,10486,45,68,38
```

**⚠️ IMPORTANTE**: Aunque las cabeceras dicen "RED, GREEN, BLUE", los valores son en realidad **CIELAB (L*, a*, b*)**:
- Columna "RED" = **L*** (Luminosidad: 0-100)
- Columna "GREEN" = **a*** (Verde-Rojo: -128 a 127)
- Columna "BLUE" = **b*** (Azul-Amarillo: -128 a 127)

El sistema detecta automáticamente este formato y convierte los valores correctamente.

## 📋 Gestión de Múltiples Bibliotecas

Puedes tener múltiples bibliotecas activas simultáneamente:

### Bibliotecas Incluidas

1. **Pantone Solid Coated 2024** (674 colores) - Cargada automáticamente
2. **Pantone Completo 2024** (3,219 colores) - Importación manual
3. **Bibliotecas personalizadas** - Puedes crear las tuyas propias

### Operaciones Disponibles

- ✅ **Activar/Desactivar**: Controla qué bibliotecas están disponibles
- ✅ **Eliminar**: Borra bibliotecas que no necesites
- ✅ **Buscar**: Encuentra colores en todas las bibliotecas activas
- ✅ **Comparar**: Compara colores entre diferentes bibliotecas

## 🎯 Búsqueda de Colores

### Por Nombre o Código
```
Ejemplo: "185 C" o "PANTONE 185"
```

### Por Valores LAB
```
Ejemplo: L=49, a=74, b=46
```

### Por Color Más Cercano
El sistema usa **Delta E CIEDE2000** para encontrar el color más cercano:
- ΔE < 1.0: Diferencia imperceptible
- ΔE < 2.0: Diferencia apenas perceptible
- ΔE < 5.0: Diferencia perceptible pero aceptable

## 📊 Estadísticas

En la pestaña "Bibliotecas" verás:

- **Total de bibliotecas**: Número de bibliotecas cargadas
- **Bibliotecas activas**: Número de bibliotecas actualmente activas
- **Total de colores**: Suma de colores en todas las bibliotecas activas

## 🔄 Sincronización y Persistencia

- Las bibliotecas se guardan en **localStorage** del navegador
- Los datos persisten entre sesiones
- Si limpias el caché del navegador, perderás las bibliotecas importadas
- La biblioteca base (674 colores) se recarga automáticamente

## 🛠️ Solución de Problemas

### "No se cargan los colores"

1. Abre la consola del navegador (F12)
2. Busca mensajes de error
3. Verifica que el archivo `src/data/colors.csv` exista
4. Asegúrate de que el formato sea correcto

### "Faltan colores después de importar"

1. Verifica que el archivo CSV tenga el formato correcto
2. Revisa la consola para ver errores de parsing
3. Asegúrate de que los valores LAB estén en rangos válidos:
   - L: 0-100
   - a: -128 a 127
   - b: -128 a 127

### "La búsqueda no encuentra colores"

1. Verifica que la biblioteca esté **activa**
2. Asegúrate de que los colores estén correctamente indexados
3. Prueba buscar por código en lugar de nombre completo

## 📈 Rendimiento

- **Búsqueda lineal**: O(n) para bibliotecas pequeñas
- **KD-Tree**: O(log n) para bibliotecas grandes (>1000 colores)
- **Caché**: Los resultados se cachean para búsquedas repetidas
- **Lazy loading**: Las bibliotecas se cargan bajo demanda

## 🎨 Ejemplos de Uso

### Ejemplo 1: Buscar un color específico

1. Ve a la pestaña "Pantone DB"
2. Escribe "185 C" en el campo de búsqueda
3. Selecciona el color de los resultados
4. Úsalo en tu formulación

### Ejemplo 2: Encontrar el color más cercano

1. Ve a la pestaña "Pantone DB"
2. Cambia a modo "Buscar por color"
3. Introduce valores LAB: L=50, a=70, b=45
4. El sistema mostrará los 10 colores más cercanos
5. Selecciona el que mejor se ajuste

### Ejemplo 3: Comparar colores entre bibliotecas

1. Activa múltiples bibliotecas
2. Busca un color por nombre
3. Los resultados mostrarán de qué biblioteca proviene cada color
4. Compara las variaciones entre diferentes ediciones

## 📝 Notas Técnicas

### Conversión LAB a RGB

El sistema convierte automáticamente los valores LAB a RGB para visualización:

```typescript
// Conversión LAB → XYZ → RGB
const rgb = labToRgb(L, a, b);
const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
```

### Delta E CIEDE2000

La fórmula utilizada para calcular la diferencia entre colores:

```typescript
const deltaE = getDeltaE00(lab1, lab2);
```

Esta es la fórmula más precisa y recomendada por la CIE.

### Almacenamiento

```typescript
localStorage.setItem('flexcolor_bibliotecas', JSON.stringify(bibliotecas));
```

Límite típico de localStorage: 5-10 MB (suficiente para miles de colores)

## 🔮 Futuras Mejoras

- [ ] Soporte para IndexedDB (bibliotecas más grandes)
- [ ] Sincronización en la nube
- [ ] Exportación de bibliotecas personalizadas
- [ ] Importación desde APIs externas (Pantone Connect)
- [ ] Historial de cambios en bibliotecas
- [ ] Sistema de versiones de bibliotecas

## 📞 Soporte

Si tienes problemas con la carga de colores:

1. Revisa la consola del navegador (F12)
2. Verifica el formato del archivo CSV
3. Asegúrate de que los valores estén en rangos válidos
4. Consulta la documentación en `BIBLIOTECAS_FICHAS.md`

---

**Última actualización**: 2026-01-XX  
**Versión**: 3.0  
**Colores incluidos**: 674 (base) + 3,219 (completo, importación manual)
