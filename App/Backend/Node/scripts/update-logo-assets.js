/**
 * Script para convertir el logo CPAU a base64 y generar UPDATE SQL
 * Ejecutar con: node update-logo-assets.js
 */

const fs = require('fs');
const path = require('path');

// Leer el SVG
const logoPath = path.join(__dirname, '../../../Frontend/public/assets/icons/logoBlanco.svg');
const logoSvg = fs.readFileSync(logoPath, 'utf8');

// Convertir a base64
const logoBase64 = Buffer.from(logoSvg).toString('base64');

// Crear el data URI
const logoDataUri = `data:image/svg+xml;base64,${logoBase64}`;

// Crear el JSON para el campo assets
const assetsJson = {
  logoCPAU: logoDataUri
};

// Generar el UPDATE SQL
const updateSql = `
-- ============================================================================
-- UPDATE: Agregar logo CPAU a campo assets
-- Proyecto: CH2026 - CPAU Cálculo de Honorarios
-- Fecha: ${new Date().toISOString().split('T')[0]}
-- ============================================================================

UPDATE Entregables_PDF
SET assets = '${JSON.stringify(assetsJson).replace(/'/g, "''")}'
WHERE codigo = 'basico-proyecto-direccion';

-- Verificar el update
SELECT 
  entregable_id,
  codigo,
  nombre,
  JSON_EXTRACT(assets, '$.logoCPAU') AS logo_check
FROM Entregables_PDF
WHERE codigo = 'basico-proyecto-direccion';
`;

// Guardar el SQL en un archivo
const sqlOutputPath = path.join(__dirname, 'update-logo-entregables-pdf.sql');
fs.writeFileSync(sqlOutputPath, updateSql);

console.log('✅ Logo convertido a base64');
console.log(`📝 SQL generado en: ${sqlOutputPath}`);
console.log(`\n📦 Assets JSON:\n${JSON.stringify(assetsJson, null, 2)}`);
console.log(`\n📏 Tamaño base64: ${logoBase64.length} caracteres`);
