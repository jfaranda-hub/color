# 🚀 FlexColor Pro - Guía de Inicio Rápido

## ⚡ Inicio en 3 pasos

### Windows
1. **Doble clic** en `iniciar-windows.bat`
2. Espera a que se instalen las dependencias (primera vez)
3. El navegador se abrirá automáticamente en http://localhost:5173

### Linux / Mac
1. Abre la terminal en esta carpeta
2. Ejecuta: `chmod +x iniciar-linux-mac.sh && ./iniciar-linux-mac.sh`
3. El navegador se abrirá automáticamente

### Universal (todas las plataformas)
1. Abre la terminal en esta carpeta
2. Ejecuta: `node iniciar.js`
3. El navegador se abrirá automáticamente

---

## 📋 Requisitos previos

### Node.js (obligatorio)
- Descarga e instala desde: https://nodejs.org/
- Versión recomendada: 18 o superior
- Verifica la instalación: `node --version`

---

## 🎯 Uso de la aplicación

### 1. Importar colores Pantone
- Ve a la pestaña **"Pantone DB"**
- Haz clic en **"✨ Importar 50 colores Pantone de ejemplo"** (prueba rápida)
- O importa los 3,219 colores completos:
  1. Descarga: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
  2. Extrae `colors.csv`
  3. Impórtalo desde la app

### 2. Flujo de trabajo
1. **Configuración**: Selecciona familia, resistencias, Pantone y sustrato
2. **Formulación**: Calcula la mezcla óptima (100g)
3. **Medición**: Mide con colorímetro y ajusta iterativamente
4. **Producción**: Escala a 1000g y guarda la receta

---

## 🛠️ Solución de problemas

### "Node.js no está instalado"
- Instala Node.js desde https://nodejs.org/
- Reinicia la terminal después de instalar

### "Error al instalar dependencias"
```bash
# Limpia e instala de nuevo
rm -rf node_modules package-lock.json
npm install
```

### "El puerto 5173 está en uso"
```bash
# Detén otros procesos de Node
# Windows:
taskkill /F /IM node.exe

# Linux/Mac:
pkill -f node
```

### "La app no se abre en el navegador"
- Abre manualmente: http://localhost:5173
- O ejecuta: `npm run dev` y abre la URL que aparece en la consola

---

## 📊 Estructura del proyecto

```
flexcolor-pro/
├── iniciar-windows.bat       # ⚡ Ejecutable Windows
├── iniciar-linux-mac.sh      # ⚡ Ejecutable Linux/Mac
├── iniciar.js                # ⚡ Ejecutable universal
├── src/
│   ├── App.tsx               # Aplicación principal
│   ├── components/           # Componentes UI
│   ├── data/                 # Datos (Pantone, tintas, sustratos)
│   ├── services/             # Servicios (TintasService, PantoneService)
│   ├── hooks/                # Hooks de React
│   └── utils/                # Utilidades (cálculos de color)
├── package.json              # Dependencias
└── GUIA_USO.md              # Guía completa
```

---

## 🎨 Funcionalidades principales

✅ **Gestión de tintas base** - CRUD completo con persistencia  
✅ **Loop de corrección automática** - Ajustes iterativos con ΔE*00  
✅ **Base de datos Pantone** - 3,219+ colores con búsqueda KD-Tree  
✅ **Modelo Kubelka-Munk** - Mezcla sustractiva real  
✅ **Delta E CIEDE2000** - Estándar de la industria  
✅ **Múltiples formatos** - LAB, RGB, CMYK, HSL, HSV, HEX  
✅ **Importación CSV** - Compatible con repositorios open source  
✅ **Calibración de sustratos** - Mediciones con colorímetro  
✅ **Gestión de anilox** - CRUD con asignación por máquina  
✅ **Tests de validación** - Conversión RGB ↔ LAB  

---

## 📚 Recursos

- **Repositorio Pantone**: https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5
- **Documentación CIELAB**: https://en.wikipedia.org/wiki/CIELAB_color_space
- **Calculadora Delta E**: https://zschuessler.github.io/DeltaE/learn/
- **Guía completa**: Ver archivo `GUIA_USO.md`

---

## ⚖️ Aviso Legal

Los colores Pantone mostrados son aproximaciones no oficiales basadas en datasets de código abierto. Para uso profesional de alta precisión, consulte las guías físicas oficiales de Pantone LLC.

---

## 💡 Consejos

- **Primera vez**: La instalación de dependencias puede tardar 2-3 minutos
- **Actualizaciones**: Si cambias el código, el servidor se recarga automáticamente
- **Datos**: Todo se guarda en localStorage del navegador (no se pierde al cerrar)
- **Offline**: La app funciona sin conexión a internet una vez instalada

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que Node.js esté instalado: `node --version`
3. Asegúrate de estar en la carpeta correcta del proyecto
4. Consulta la guía completa: `GUIA_USO.md`

---

**¡Disfruta de FlexColor Pro!** 🎨
