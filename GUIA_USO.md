# FlexColor Pro - Guía de Uso

## 🚀 Cómo usar la aplicación

### 1. Arrancar la aplicación

**En este entorno:**
- La aplicación ya está construida y disponible en la vista previa

**Fuera de este entorno:**
```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

### 2. Importar base de datos Pantone completa

La aplicación incluye un sistema de importación de colores Pantone desde la app:

#### Opción A: Importar datos de ejemplo (50 colores)
1. Ve a la pestaña **"Pantone DB"**
2. Haz clic en el botón **"✨ Importar 50 colores Pantone de ejemplo"**
3. Los colores se importarán automáticamente

#### Opción B: Importar base de datos completa (3,219 colores)
1. Descarga el repositorio: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
2. Extrae el archivo `colors.csv`
3. En la app, ve a la pestaña **"Pantone DB"**
4. Haz clic en **"Subir CSV"** y selecciona el archivo `colors.csv`
5. Los 3,219 colores se importarán automáticamente

#### Opción C: Pegar datos manualmente
1. Ve a la pestaña **"Pantone DB"**
2. Haz clic en **"Pegar datos"**
3. Pega datos en formato JSON o CSV
4. Haz clic en **"Importar datos"**

### 3. Flujo de trabajo completo

#### Paso 1: Configuración
1. Selecciona **familia de tinta** (Standard Pantone, HS Pantone, HR Pantone, etc.)
2. Selecciona **resistencias requeridas** (luz, solvente, jabón, grasa, álcalis)
3. Selecciona **Pantone objetivo** (ahora con 3,219+ colores disponibles)
4. Selecciona **sustrato** (plástico blanco, couché, kraft, etc.)

#### Paso 2: Formulación
1. Haz clic en **"Calcular Formulación (100g)"**
2. La app calculará la mezcla óptima usando el modelo Kubelka-Munk
3. Verás la receta con gramos de cada tinta base

#### Paso 3: Medición y Ajuste
1. Prepara la mezcla de 100g en el taller
2. Mide con el colorímetro Linshang
3. Introduce los valores LAB (manual o CSV)
4. La app calculará el ΔE*00
5. Si ΔE > tolerancia, la app sugerirá ajustes automáticos
6. Repite hasta conseguir ΔE ≤ tolerancia

#### Paso 4: Escalado a producción
1. Una vez aprobado (ΔE ≤ tolerancia), escala a 1000g
2. La app calculará el coste estimado
3. Guarda la receta maestra

## 📊 Funcionalidades

### Gestión de Tintas Base
- CRUD completo de tintas base
- Medición con colorímetro
- Persistencia en localStorage
- Reset a valores de fábrica

### Gestión de Anilox
- CRUD de rodillos anilox
- Asignación por máquina
- Lineatura y aporte (BCM)

### Calibración de Sustratos
- Medición de punto blanco con colorímetro
- Comparación entre lotes
- Correcciones automáticas

### Tests de Validación
- Tests de conversión RGB ↔ LAB
- Validación de precisión Delta E
- Resultados en tiempo real

### Base de Datos Pantone
- 3,219+ colores Pantone
- Búsqueda por nombre/código/LAB
- KD-Tree para búsquedas rápidas
- Múltiples formatos (LAB, RGB, CMYK, HSL, HSV, HEX)

## 🔧 Motor de Cálculo

### Delta E
- **CIE76**: Distancia euclidiana (rápido)
- **CIE94**: Con factores de ponderación
- **CIEDE2000**: Estándar actual (más preciso)

### Modelo de Mezcla
- **Kubelka-Munk**: Modelo físico real para mezcla sustractiva
- K/S = (1-R)²/(2R)
- Correcciones por sustrato y opacidad

### Optimización
- **KD-Tree**: Búsquedas O(log n) en lugar de O(n)
- Para 3,000 colores: ~250x más rápido

## 📝 Notas importantes

### Datos Pantone
- Los valores Pantone son aproximaciones no oficiales
- Para uso profesional, consulta las guías físicas de Pantone
- Los valores pueden variar según el sustrato y condiciones de impresión

### Almacenamiento
- Todos los datos se guardan en localStorage
- No se requiere conexión a internet
- Los datos persisten entre sesiones

### Compatibilidad
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- No requiere instalación de software adicional
- Funciona offline

## 🐛 Solución de problemas

### La app no arranca
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Los colores no se importan
- Verifica que el CSV tenga las columnas correctas
- Revisa la consola del navegador (F12) para ver errores
- Asegúrate de que los valores LAB estén en rangos válidos (L: 0-100, a/b: -128 a 127)

### El cálculo de formulación es incorrecto
- Verifica que las tintas base estén correctamente calibradas
- Asegúrate de que el sustrato esté bien seleccionado
- Revisa las resistencias requeridas

## 📚 Recursos

- **Repositorio Pantone**: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
- **Documentación CIELAB**: https://en.wikipedia.org/wiki/CIELAB_color_space
- **Calculadora Delta E**: https://zschuessler.github.io/DeltaE/learn/
- **Pantone Connect API**: https://www.pantone.com/na/en-us/license/pantone-api

## ⚖️ Aviso Legal

Los colores Pantone mostrados son aproximaciones no oficiales basadas en datasets de código abierto. Los valores pueden variar respecto a las guías físicas oficiales de Pantone LLC. Para uso profesional de alta precisión en impresión, consulte las guías físicas Pantone o utilice la API oficial de Pantone Connect. El sistema PANTONE® es una marca registrada de Pantone LLC.
