#!/bin/bash

# FlexColor Pro - Script de inicio para Linux/Mac

clear
echo "========================================"
echo "  FlexColor Pro - Aplicación de Color"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js no está instalado${NC}"
    echo ""
    echo "Por favor, instala Node.js desde:"
    echo "https://nodejs.org/"
    echo ""
    echo "En Ubuntu/Debian:"
    echo "  sudo apt update"
    echo "  sudo apt install nodejs npm"
    echo ""
    echo "En Mac (con Homebrew):"
    echo "  brew install node"
    echo ""
    exit 1
fi

echo -e "${GREEN}[✓] Node.js detectado${NC}"
node --version
echo ""

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}[i] Instalando dependencias...${NC}"
    echo "Esto puede tardar unos minutos..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR] Error al instalar dependencias${NC}"
        exit 1
    fi
    echo ""
    echo -e "${GREEN}[✓] Dependencias instaladas correctamente${NC}"
    echo ""
else
    echo -e "${GREEN}[✓] Dependencias ya instaladas${NC}"
    echo ""
fi

echo -e "${BLUE}[i] Iniciando servidor de desarrollo...${NC}"
echo ""
echo "========================================"
echo "  La aplicación se abrirá en tu navegador"
echo "  URL: http://localhost:5173"
echo ""
echo "  Para detener el servidor: Ctrl+C"
echo "========================================"
echo ""

# Función para abrir el navegador según el sistema operativo
open_browser() {
    sleep 2
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open "http://localhost:5173" &
        elif command -v firefox &> /dev/null; then
            firefox "http://localhost:5173" &
        elif command -v chromium &> /dev/null; then
            chromium "http://localhost:5173" &
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # Mac
        open "http://localhost:5173"
    fi
}

# Abrir navegador en background
open_browser &

# Iniciar el servidor
npm run dev
