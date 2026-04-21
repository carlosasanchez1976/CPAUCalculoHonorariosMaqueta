// create-deployment-package.js
// Script para crear paquete de deployment para AWS Lambda
// Versión optimizada - Sin carpeta lambda-deploy permanente

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const crypto = require('crypto');

console.log('📦 Creando paquete de deployment para AWS Lambda\n');

// Usar carpeta temporal del sistema
const DEPLOY_DIR = path.join(os.tmpdir(), `lambda-deploy-${Date.now()}`);
const ZIP_NAME = 'ch2026-backend-api-lambda.zip';
const DEPLOYMENT_INFO = 'deployment-info.json';

// Archivos y carpetas a incluir
const INCLUDE_FILES = [
    'lambda.js',
    'app.js',
    'package.json',
    'package-lock.json',
    'src/'
];

// Archivos y carpetas a excluir
const EXCLUDE_PATTERNS = [
    'node_modules/',
    '.env',
    '.env.qa',
    'test-*.js',
    'test-*.html',
    '*.md',
    'lambda-deploy/',
    '.git/',
    'coverage/',
    '*.log'
];

try {
    // Paso 1: Limpiar ZIP anterior
    console.log('🧹 Limpiando paquete anterior...');
    if (fs.existsSync(ZIP_NAME)) {
        fs.unlinkSync(ZIP_NAME);
    }
    console.log('   ✅ Limpieza completada\n');

    // Paso 2: Crear directorio temporal
    console.log('📁 Creando directorio temporal de deployment...');
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
    console.log(`   📂 ${DEPLOY_DIR}`);
    console.log('   ✅ Directorio creado\n');

    // Paso 3: Copiar archivos necesarios
    console.log('📋 Copiando archivos...');
    
    function copyRecursive(src, dest) {
        if (fs.statSync(src).isDirectory()) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            const files = fs.readdirSync(src);
            files.forEach(file => {
                copyRecursive(path.join(src, file), path.join(dest, file));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }

    INCLUDE_FILES.forEach(item => {
        const srcPath = path.join(__dirname, item);
        const destPath = path.join(DEPLOY_DIR, item);
        
        if (fs.existsSync(srcPath)) {
            console.log(`   - Copiando ${item}...`);
            if (fs.statSync(srcPath).isDirectory()) {
                copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        } else {
            console.log(`   ⚠️  No encontrado: ${item}`);
        }
    });
    console.log('   ✅ Archivos copiados\n');

    // Paso 4: Instalar dependencias de producción
    console.log('📦 Instalando dependencias de producción...');
    console.log('   (esto puede tomar unos minutos)');
    
    execSync('npm install --production --no-optional', {
        cwd: DEPLOY_DIR,
        stdio: 'inherit'
    });
    console.log('   ✅ Dependencias instaladas\n');

    // Paso 5: Crear archivo ZIP
    console.log('🗜️  Creando archivo ZIP...');
    
    // Usar PowerShell para crear ZIP en Windows
    const zipCommand = `Compress-Archive -Path "${DEPLOY_DIR}\\*" -DestinationPath "${ZIP_NAME}" -Force`;
    execSync(zipCommand, { shell: 'powershell.exe', stdio: 'inherit' });
    
    console.log('   ✅ ZIP creado\n');

    // Paso 6: Verificar tamaño del paquete y generar info
    const stats = fs.statSync(ZIP_NAME);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Calcular hash del ZIP
    const fileBuffer = fs.readFileSync(ZIP_NAME);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    
    // Generar archivo de deployment info
    const deploymentInfo = {
        timestamp: new Date().toISOString(),
        version: require('./package.json').version || '1.0.0',
        zipFile: ZIP_NAME,
        zipSizeMB: sizeInMB,
        sha256: hex,
        files: INCLUDE_FILES,
        nodeVersion: process.version,
        platform: process.platform
    };
    
    fs.writeFileSync(DEPLOYMENT_INFO, JSON.stringify(deploymentInfo, null, 2));
    
    console.log('📊 Información del paquete:');
    console.log(`   Archivo: ${ZIP_NAME}`);
    console.log(`   Tamaño: ${sizeInMB} MB`);
    console.log(`   SHA256: ${hex.substring(0, 16)}...`);
    console.log(`   Info guardada en: ${DEPLOYMENT_INFO}`);
    
    if (stats.size > 50 * 1024 * 1024) {
        console.log('   ⚠️  ADVERTENCIA: El paquete es mayor a 50MB');
        console.log('   Deberás subirlo a S3 primero y luego referenciar desde Lambda');
    } else {
        console.log('   ✅ Tamaño OK para upload directo a Lambda');
    }
    
    // Paso 7: Limpiar directorio temporal
    console.log('\n🧹 Limpiando archivos temporales...');
    fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
    console.log('   ✅ Limpieza completada');
    
    console.log('\n✨ Paquete de deployment creado exitosamente!\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Ir a AWS Lambda Console');
    console.log('   2. Abrir función: ch2026-api-qa');
    console.log(`   3. Subir el archivo: ${ZIP_NAME}`);
    console.log('   4. Verificar que handler sea: lambda.handler');
    console.log('   5. Verificar variables de entorno');
    console.log(`   6. Hash del paquete: ${hex.substring(0, 32)}...\n`);

} catch (error) {
    console.error('\n❌ Error al crear paquete:');
    console.error(error.message);
    
    // Limpiar en caso de error
    if (fs.existsSync(DEPLOY_DIR)) {
        console.log('\n🧹 Limpiando archivos temporales...');
        fs.rmSync(DEPLOY_DIR, { recursive: true, force: true });
    }
    
    process.exit(1);
}
