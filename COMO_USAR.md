# 🎯 CÓMO USAR FLEXCOLOR PRO

## ⚡ MÉTODO MÁS FÁCIL (Recomendado)

### Windows
1. **Doble clic** en el archivo: `iniciar-windows.bat`
2. Espera 10-30 segundos (primera vez instala dependencias)
3. ¡Listo! El navegador se abre automáticamente

### Linux / Mac
1. Abre terminal en esta carpeta
2. Ejecuta: `./iniciar-linux-mac.sh`
3. ¡Listo! El navegador se abre automáticamente

### Si no funciona el script
```bash
# Alternativa universal
node iniciar.js
```

---

## 📋 REQUISITOS

✅ **Node.js** instalado (versión 18 o superior)
   - Descarga: https://nodejs.org/
   - Verifica: `node --version`

✅ **Navegador web** moderno (Chrome, Firefox, Edge, Safari)

✅ **Conexión a internet** (solo la primera vez para instalar dependencias)

---

## 🎨 PRIMEROS PASOS

### 1. Importar colores Pantone (OPCIONAL pero recomendado)
- Abre la app en el navegador
- Ve a la pestaña **"Pantone DB"**
- Haz clic en **"✨ Importar 50 colores Pantone de ejemplo"**
- ¡Ya tienes colores para trabajar!

### 2. Formular tu primer color
1. Ve a la pestaña **"Formulación"**
2. Selecciona familia de tinta (ej: Standard Pantone)
3. Selecciona resistencias (si las necesitas)
4. Elige un Pantone (ej: PMS 489 C)
5. Selecciona sustrato (ej: Plástico Blanco)
6. Clic en **"Calcular Formulación (100g)"**

### 3. Medir y ajustar
1. Prepara la mezcla de 100g en el taller
2. Mide con el colorímetro
3. Introduce los valores LAB en la app
4. La app te dirá qué ajustar
5. Repite hasta que ΔE ≤ 2.0

### 4. Escalar a producción
1. Cuando el color esté aprobado (ΔE ≤ tolerancia)
2. Escala a 1000g
3. Guarda la receta maestra

---

## 🆘 PROBLEMAS COMUNES

### "Node.js no está instalado"
→ Instala Node.js desde https://nodejs.org/

### "Error al instalar dependencias"
```bash
# Limpia e intenta de nuevo
rm -rf node_modules package-lock.json
npm install
```

### "El puerto 5173 está en uso"
```bash
# Cierra otros programas de Node o cambia de puerto
# Windows:
taskkill /F /IM node.exe

# Linux/Mac:
pkill -f node
```

### "La app no se abre en el navegador"
→ Abre manualmente: http://localhost:5173

---

## 📚 MÁS INFORMACIÓN

- **Guía rápida**: `INICIO_RAPIDO.md`
- **Guía completa**: `GUIA_USO.md`
- **Documentación técnica**: `README.md`

---

## 💡 CONSEJOS

✅ **Primera vez**: La instalación tarda 2-3 minutos
✅ **Datos**: Todo se guarda en el navegador (no se pierde)
✅ **Offline**: Funciona sin internet una vez instalada
✅ **Actualizaciones**: El servidor se recarga solo al cambiar código

---

## 🎉 ¡LISTO!

Ya puedes usar FlexColor Pro para:
- Formular colores Pantone con precisión
- Ajustar mezclas con corrección automática
- Gestionar tintas, anilox y sustratos
- Calcular costes y escalar a producción

**¡Disfruta de la aplicación!** 🎨
