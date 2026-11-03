#!/usr/bin/env node

/**
 * FlexColor Pro - Lanzador Universal
 * Este script funciona en Windows, Linux y Mac
 * 
 * Uso: node iniciar.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function showBanner() {
    console.clear();
    log(colors.cyan, '========================================');
    log(colors.cyan, '  FlexColor Pro - Aplicación de Color');
    log(colors.cyan, '========================================');
    console.log('');
}

function checkNode() {
    try {
        const version = process.version;
        log(colors.green, `[✓] Node.js detectado: ${version}`);
        return true;
    } catch (error) {
        log(colors.red, '[ERROR] Node.js no está disponible');
        return false;
    }
}

function checkDependencies() {
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
        log(colors.blue, '[i] Instalando dependencias...');
        log(colors.yellow, 'Esto puede tardar unos minutos...');
        console.log('');
        
        const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const install = spawn(npm, ['install'], {
            stdio: 'inherit',
            shell: true
        });
        
        install.on('close', (code) => {
            if (code !== 0) {
                log(colors.red, '[ERROR] Error al instalar dependencias');
                process.exit(1);
            }
            console.log('');
            log(colors.green, '[✓] Dependencias instaladas correctamente');
            console.log('');
            startServer();
        });
    } else {
        log(colors.green, '[✓] Dependencias ya instaladas');
        console.log('');
        startServer();
    }
}

function openBrowser() {
    const url = 'http://localhost:5173';
    let command;
    
    switch (process.platform) {
        case 'win32':
            command = `start ${url}`;
            break;
        case 'darwin':
            command = `open ${url}`;
            break;
        default: // Linux
            command = `xdg-open ${url} 2>/dev/null || firefox ${url} 2>/dev/null || chromium ${url} 2>/dev/null &`;
    }
    
    setTimeout(() => {
        try {
            require('child_process').exec(command);
        } catch (error) {
            log(colors.yellow, `[i] No se pudo abrir el navegador automáticamente`);
            log(colors.blue, `[i] Abre manualmente: ${url}`);
        }
    }, 2000);
}

function startServer() {
    log(colors.blue, '[i] Iniciando servidor de desarrollo...');
    console.log('');
    log(colors.cyan, '========================================');
    log(colors.cyan, '  La aplicación se abrirá en tu navegador');
    log(colors.cyan, '  URL: http://localhost:5173');
    console.log('');
    log(colors.cyan, '  Para detener el servidor: Ctrl+C');
    log(colors.cyan, '========================================');
    console.log('');
    
    // Abrir navegador
    openBrowser();
    
    // Iniciar servidor
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const server = spawn(npm, ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
    });
    
    server.on('close', (code) => {
        if (code !== 0) {
            log(colors.red, `[ERROR] El servidor se cerró con código ${code}`);
        }
        process.exit(code);
    });
    
    // Manejar Ctrl+C
    process.on('SIGINT', () => {
        console.log('');
        log(colors.yellow, '[i] Deteniendo servidor...');
        server.kill();
        process.exit(0);
    });
}

// Ejecutar el lanzador
showBanner();

if (!checkNode()) {
    log(colors.red, 'Por favor, instala Node.js desde: https://nodejs.org/');
    process.exit(1);
}

console.log('');
checkDependencies();
