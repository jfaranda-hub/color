# 🎨 FlexColor Pro

**Aplicación profesional de formulación de color para impresión flexográfica**

![Version](https://img.shields.io/badge/version-3.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## ⚡ Inicio Rápido

### Windows
```
Doble clic en: iniciar-windows.bat
```

### Linux / Mac
```bash
chmod +x iniciar-linux-mac.sh
./iniciar-linux-mac.sh
```

### Universal (todas las plataformas)
```bash
node iniciar.js
```

**¡Eso es todo!** La aplicación se abrirá automáticamente en tu navegador.

---

## 🎯 ¿Qué es FlexColor Pro?

FlexColor Pro es una aplicación web profesional para la formulación de colores en impresión flexográfica. Permite:

- 🎨 **Formular colores Pantone** con precisión industrial
- 🔄 **Loop de corrección automática** con mediciones de colorímetro
- 📊 **Base de datos Pantone** con 3,219+ colores
- 🧪 **Modelo Kubelka-Munk** para mezcla sustractiva real
- 📏 **Delta E CIEDE2000** - estándar de la industria
- 💾 **Gestión completa** de tintas, anilox y sustratos

---

## 📸 Capturas de Pantalla

### Flujo de Trabajo
1. **Configuración** → Selecciona Pantone, sustrato y resistencias
2. **Formulación** → Calcula mezcla óptima (100g)
3. **Medición** → Ajuste iterativo con colorímetro
4. **Producción** → Escala a 1000g y guarda receta

---

## 🚀 Características

### 🎨 Gestión de Color
- ✅ Delta E CIE76, CIE94, CIEDE2000
- ✅ Modelo Kubelka-Munk para mezcla sustractiva
- ✅ Conversión LAB ↔ RGB ↔ CMYK ↔ HSL ↔ HSV
- ✅ KD-Tree para búsquedas rápidas (O(log n))

### 📦 Base de Datos Pantone
- ✅ 3,219+ colores Pantone Solid Coated
- ✅ Importación desde CSV (repositorio aj90909)
- ✅ Búsqueda por nombre, código o color
- ✅ Múltiples formatos de color

### 🔄 Loop de Corrección
- ✅ Medición con colorímetro (manual o CSV)
- ✅ Ajustes automáticos recomendados
- ✅ Historial de iteraciones
- ✅ Escalado a producción (100g → 1000g)

### 💼 Gestión Empresarial
- ✅ CRUD de tintas base con persistencia
- ✅ Gestión de anilox por máquina
- ✅ Calibración de sustratos
- ✅ Cálculo de costes
- ✅ Exportación de recetas

### 🧪 Tests y Validación
- ✅ Tests de conversión RGB ↔ LAB
- ✅ Validación de precisión Delta E
- ✅ Resultados en tiempo real

---

## 📋 Requisitos

- **Node.js** 18 o superior ([descargar](https://nodejs.org/))
- **Navegador** moderno (Chrome, Firefox, Safari, Edge)
- **Espacio en disco**: ~200 MB

---

## 📖 Documentación

- [📘 Guía de Inicio Rápido](INICIO_RAPIDO.md) - Para empezar en 3 pasos
- [📗 Guía de Uso Completa](GUIA_USO.md) - Documentación detallada
- [📙 Especificaciones Técnicas](ESPECIFICACIONES_TECNICAS.md) - Para desarrolladores

---

## 🎓 Uso Básico

### 1. Importar Colores Pantone
```
Pestaña "Pantone DB" → "✨ Importar 50 colores de ejemplo"
```

### 2. Formular un Color
```
1. Selecciona familia de tinta
2. Selecciona resistencias requeridas
3. Elige Pantone objetivo
4. Selecciona sustrato
5. Clic en "Calcular Formulación"
```

### 3. Medir y Ajustar
```
1. Prepara la mezcla de 100g
2. Mide con colorímetro
3. Introduce valores LAB
4. Aplica ajustes recomendados
5. Repite hasta ΔE ≤ tolerancia
```

### 4. Escalar a Producción
```
1. Una vez aprobado, escala a 1000g
2. Revisa el coste estimado
3. Guarda la receta maestra
```

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Previsualiza build de producción

# Tests
npm run test         # Ejecuta tests (próximamente)

# Linting
npm run lint         # Verifica estilo de código
```

---

## 📁 Estructura del Proyecto

```
flexcolor-pro/
├── 🚀 Ejecutables
│   ├── iniciar-windows.bat      # Windows
│   ├── iniciar-linux-mac.sh     # Linux/Mac
│   └── iniciar.js               # Universal
│
├── 📄 Documentación
│   ├── README.md                # Este archivo
│   ├── INICIO_RAPIDO.md         # Guía rápida
│   └── GUIA_USO.md              # Guía completa
│
├── 📦 Código Fuente
│   └── src/
│       ├── App.tsx              # Aplicación principal
│       ├── components/          # Componentes UI
│       │   ├── PantoneSelector.tsx
│       │   ├── IteracionPanel.tsx
│       │   ├── TintasBaseManager.tsx
│       │   └── ...
│       ├── data/                # Datos
│       │   ├── pantoneLabExpanded.ts
│       │   ├── tintasBase.ts
│       │   └── sustratos.ts
│       ├── services/            # Servicios
│       │   ├── TintasService.ts
│       │   └── PantoneDatabaseService.ts
│       ├── hooks/               # Hooks React
│       │   └── useTintasBase.ts
│       └── utils/               # Utilidades
│           ├── colorCalculations.ts
│           ├── ColorKDTree.ts
│           └── colorConversions.ts
│
└── ⚙️ Configuración
    ├── package.json
    ├── tsconfig.json
    └── vite.config.js
```

---

## 🔧 Tecnologías

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Color**: chroma-js
- **CSV**: PapaParse
- **IDs**: UUID

---

## 📊 Métricas

- **Tamaño del bundle**: ~325 KB (JS) + ~42 KB (CSS)
- **Colores Pantone**: 3,219+
- **Performance**: Búsquedas ~250x más rápidas con KD-Tree
- **Precisión**: ΔE < 1 en conversiones RGB ↔ LAB

---

## 🐛 Solución de Problemas

### La app no arranca
```bash
# Limpia e instala de nuevo
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Puerto 5173 en uso
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
pkill -f node
```

### Errores de TypeScript
```bash
# Verifica tipos
npm run typecheck
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver archivo [LICENSE](LICENSE) para detalles.

---

## ⚖️ Aviso Legal

Los colores Pantone mostrados son aproximaciones no oficiales basadas en datasets de código abierto. Para uso profesional de alta precisión, consulte las guías físicas oficiales de Pantone LLC.

PANTONE® es una marca registrada de Pantone LLC.

---

## 📞 Soporte

- 📧 Email: soporte@flexcolor.pro
- 📚 Documentación: [INICIO_RAPIDO.md](INICIO_RAPIDO.md)
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/flexcolor-pro/issues)

---

## 🙏 Agradecimientos

- [Pantone](https://www.pantone.com/) - Sistema de color
- [aj90909](https://github.com/aj90909/unofficial-pantone-solid-coated-2024-v5) - Dataset Pantone open source
- [chroma-js](https://gka.github.io/chroma.js/) - Librería de color
- [Flint Group](https://www.flintgroup.com/) - Tintas EkoCure ANCORA F2 YEP

---

**Hecho con ❤️ para la industria de impresión flexográfica**
