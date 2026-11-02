@echo off
chcp 65001 >nul
title FlexColor Pro - Iniciando...
color 0A

echo ========================================
echo   FlexColor Pro - Aplicación de Color
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js no está instalado
    echo.
    echo Por favor, instala Node.js desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js detectado
node --version
echo.

REM Verificar si las dependencias están instaladas
if not exist "node_modules" (
    echo [i] Instalando dependencias...
    echo Esto puede tardar unos minutos...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo [ERROR] Error al instalar dependencias
        pause
        exit /b 1
    )
    echo.
    echo [✓] Dependencias instaladas correctamente
    echo.
) else (
    echo [✓] Dependencias ya instaladas
    echo.
)

echo [i] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo   La aplicación se abrirá en tu navegador
echo   URL: http://localhost:5173
echo.
echo   Para detener el servidor: Ctrl+C
echo ========================================
echo.

REM Esperar 2 segundos antes de abrir el navegador
timeout /t 2 /nobreak >nul

REM Abrir el navegador
start http://localhost:5173

REM Iniciar el servidor
call npm run dev

pause
