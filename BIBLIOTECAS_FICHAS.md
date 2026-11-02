# Sistema de Bibliotecas de Color y Fichas Técnicas

## 📚 Descripción

Este sistema permite gestionar múltiples bibliotecas de colores Pantone y fichas técnicas de tintas, facilitando la organización y búsqueda de información técnica en la aplicación FlexColor Pro.

## 🎯 Características

### Bibliotecas de Color
- **Carga automática** del archivo `colors.csv` con 3,219 colores Pantone
- **Múltiples bibliotecas**: Carga y gestiona varias bibliotecas simultáneamente
- **Formatos soportados**: CSV y JSON
- **Activar/Desactivar**: Controla qué bibliotecas están activas
- **Persistencia**: Las bibliotecas se guardan en localStorage
- **Validación**: Verificación automática de formatos y rangos de valores

### Fichas Técnicas
- **Gestión completa**: Crear, editar, eliminar fichas técnicas
- **Búsqueda avanzada**: Por nombre, proveedor, tipo de tinta, Pantone
- **Cruce de información**: Asocia fichas técnicas con colores Pantone
- **Importación masiva**: Carga fichas desde archivos JSON
- **Condiciones de impresión**: Registra anilox, velocidad, temperatura
- **Estadísticas**: Total de fichas, fichas con Pantone, fichas generales

## 🚀 Uso

### Cargar una Biblioteca de Colores

1. Ve a la pestaña **"Bibliotecas"**
2. Escribe un nombre para la biblioteca (ej: "Pantone Solid Coated 2024")
3. Selecciona un archivo CSV o JSON con colores
4. Revisa la vista previa de los primeros 10 colores
5. Haz clic en **"Confirmar Importación"**

#### Formato CSV Esperado
```csv
PANTONENAME,UNIQUECODE,RED,GREEN,BLUE
PANTONE 185 C,10485,49,74,46
PANTONE 186 C,10486,45,68,38
```

**Nota**: Aunque las cabeceras dicen RED/GREEN/BLUE, los valores son en realidad **LAB** (L*, a*, b*). El sistema detecta automáticamente el formato.

#### Formato JSON Esperado
```json
[
  {
    "name": "PANTONE 185 C",
    "uniqueCode": 10485,
    "lab": { "L": 49, "a": 74, "b": 46 }
  },
  {
    "name": "PANTONE 186 C",
    "uniqueCode": 10486,
    "lab": { "L": 45, "a": 68, "b": 38 }
  }
]
```

### Gestionar Bibliotecas

- **Activar/Desactivar**: Usa el icono de toggle para activar o desactivar una biblioteca
- **Eliminar**: Haz clic en el icono de papelera para eliminar una biblioteca
- **Ver estadísticas**: Consulta el total de bibliotecas, activas y colores disponibles

### Crear una Ficha Técnica

1. Ve a la pestaña **"Fichas Técnicas"**
2. Haz clic en **"Nueva Ficha"**
3. Completa los campos:
   - **Nombre** (obligatorio): Nombre descriptivo de la ficha
   - **Proveedor**: Empresa fabricante (ej: Flint Group)
   - **Tipo de Tinta**: Tipo de tinta (ej: UV Flexo, Solvente)
   - **Referencia Pantone**: Código Pantone asociado (ej: 185 C)
   - **Sustrato**: Material donde se imprime (ej: Film BOPP)
   - **Condiciones de Impresión**: Anilox, velocidad, temperatura
   - **Observaciones**: Notas adicionales
4. Haz clic en **"Crear Ficha"**

### Importar Fichas Técnicas desde JSON

1. Ve a la pestaña **"Fichas Técnicas"**
2. Haz clic en **"Importar JSON"**
3. Selecciona un archivo JSON con el formato:

```json
[
  {
    "id": "ficha-001",
    "nombre": "Tinta Flexocure LEAP - Pantone 185 C",
    "proveedor": "Flint Group",
    "tipoTinta": "UV Flexo",
    "pantoneRef": "185 C",
    "sustrato": "Film BOPP",
    "condicionesImpresion": {
      "anilox": "360 lpi",
      "velocidad": "150 m/min",
      "temperatura": "60°C"
    },
    "observaciones": "Baja migración, apto contacto alimentario"
  }
]
```

### Buscar Fichas Técnicas

- Usa el campo de búsqueda para filtrar por:
  - Nombre de la ficha
  - Proveedor
  - Tipo de tinta
  - Referencia Pantone
  - Sustrato

## 📊 Estadísticas

### Bibliotecas
- **Total**: Número total de bibliotecas cargadas
- **Activas**: Número de bibliotecas actualmente activas
- **Colores**: Total de colores disponibles en bibliotecas activas

### Fichas Técnicas
- **Total**: Número total de fichas técnicas
- **Con Pantone**: Fichas asociadas a un color Pantone específico
- **Generales**: Fichas sin referencia Pantone específica

## 🔧 Estructura de Datos

### ColorPantone
```typescript
interface ColorPantone {
  name: string;           // "PANTONE 185 C"
  uniqueCode?: number;    // 10485
  lab: {
    L: number;            // 0-100
    a: number;            // -128 a 127
    b: number;            // -128 a 127
  };
  rgb?: {
    r: number;            // 0-255
    g: number;            // 0-255
    b: number;            // 0-255
  };
  hex?: string;           // "#RRGGBB"
  category?: string;      // Categoría del color
}
```

### BibliotecaColor
```typescript
interface BibliotecaColor {
  id: string;
  nombre: string;
  colores: ColorPantone[];
  activa: boolean;
  fechaCarga: string;     // ISO string
  formato: 'csv' | 'json' | 'txt';
  totalColores: number;
}
```

### FichaTecnica
```typescript
interface FichaTecnica {
  id: string;
  nombre: string;
  proveedor?: string;
  tipoTinta?: string;
  pantoneRef?: string;    // "185 C"
  lab?: { L: number; a: number; b: number };
  sustrato?: string;
  condicionesImpresion?: {
    anilox?: string;
    velocidad?: string;
    temperatura?: string;
  };
  observaciones?: string;
}
```

## 🛠️ Servicios

### parserCSV.ts
- `parsePantoneCSV()`: Parsea archivos CSV de colores Pantone
- `parseColorJSON()`: Parsea archivos JSON de colores
- `parseColorFile()`: Detecta formato y parsea automáticamente

### gestorBibliotecas.ts
- `getBibliotecas()`: Obtiene todas las bibliotecas
- `crearBiblioteca()`: Crea una nueva biblioteca desde archivo
- `eliminarBiblioteca()`: Elimina una biblioteca
- `toggleBiblioteca()`: Activa/desactiva una biblioteca
- `getColoresActivos()`: Obtiene colores de bibliotecas activas
- `buscarColor()`: Busca colores por nombre o código
- `encontrarColorMasCercano()`: Encuentra color más cercano por Delta E

### gestorFichasTecnicas.ts
- `getFichasTecnicas()`: Obtiene todas las fichas
- `addFichaTecnica()`: Añade una nueva ficha
- `updateFichaTecnica()`: Actualiza una ficha existente
- `deleteFichaTecnica()`: Elimina una ficha
- `getFichasByPantoneRef()`: Busca fichas por referencia Pantone
- `searchFichas()`: Búsqueda avanzada de fichas
- `importFichasFromJSON()`: Importa fichas desde JSON

## 📝 Ejemplos de Uso

### Ejemplo 1: Cargar biblioteca Pantone oficial
1. Descarga el archivo `colors.csv` del repositorio oficial
2. Ve a "Bibliotecas"
3. Nombre: "Pantone Solid Coated 2024"
4. Selecciona el archivo CSV
5. Confirma la importación
6. Activa la biblioteca

### Ejemplo 2: Crear ficha técnica para una tinta específica
1. Ve a "Fichas Técnicas"
2. Clic en "Nueva Ficha"
3. Nombre: "EkoCure ANCORA F2 YEP - Pantone 489 C"
4. Proveedor: "Flint Group"
5. Tipo de Tinta: "UV Flexo"
6. Referencia Pantone: "489 C"
7. Sustrato: "Plástico Blanco"
8. Anilox: "360 lpi / 4.0 BCM"
9. Velocidad: "150 m/min"
10. Observaciones: "Excelente adherencia en PE y PP"
11. Crear ficha

### Ejemplo 3: Buscar todas las fichas de un proveedor
1. Ve a "Fichas Técnicas"
2. En el campo de búsqueda escribe: "Flint Group"
3. El sistema mostrará todas las fichas de ese proveedor

## ⚠️ Consideraciones Importantes

### Validación de Colores
- Los valores LAB deben estar en rangos válidos:
  - L: 0-100
  - a: -128 a 127
  - b: -128 a 127
- Los colores fuera de estos rangos serán rechazados

### Persistencia
- Las bibliotecas y fichas se guardan en localStorage
- Los datos persisten entre sesiones del navegador
- Limpiar el caché del navegador eliminará todos los datos

### Rendimiento
- El sistema está optimizado para manejar hasta 10,000 colores
- Para bibliotecas más grandes, considera usar IndexedDB (futuro)
- Las búsquedas usan algoritmos optimizados (KD-Tree)

## 🔮 Futuras Mejoras

- [ ] Soporte para IndexedDB (bibliotecas más grandes)
- [ ] Exportación de bibliotecas a CSV/JSON
- [ ] Sincronización en la nube
- [ ] Importación de fichas desde PDF/Word
- [ ] Generación automática de fichas desde formulaciones
- [ ] Historial de cambios en fichas técnicas
- [ ] Sistema de permisos y roles de usuario

## 📞 Soporte

Si encuentras problemas o tienes sugerencias:
1. Revisa la consola del navegador (F12) para ver errores
2. Verifica que los archivos tengan el formato correcto
3. Asegúrate de que los valores estén en los rangos válidos
4. Consulta la documentación de la aplicación

---

**Desarrollado para FlexColor Pro v3.0**
