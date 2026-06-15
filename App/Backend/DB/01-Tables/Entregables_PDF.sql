-- ============================================================================
-- TABLA: Entregables_PDF
-- Almacena plantillas HTML/CSS para generar certificados PDF
-- Proyecto: CH2026 - CPAU Cálculo de Honorarios
-- Fecha: 2026-06-10
-- SPEC: SPEC010-CALC-Entregables (T010-001)
-- ============================================================================

DROP TABLE IF EXISTS Entregables_PDF;

CREATE TABLE Entregables_PDF (
  -- Identificación
  entregable_id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Datos descriptivos
  nombre VARCHAR(100) NOT NULL COMMENT 'Nombre descriptivo de la plantilla (ej: "Certificado Proyecto y Dirección")',
  codigo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Código único para resolver plantilla (ej: "basico-proyecto-direccion")',
  descripcion TEXT COMMENT 'Descripción detallada del entregable',
  
  -- Versionado
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0' COMMENT 'Versión semántica (MAJOR.MINOR.PATCH)',
  baja_fecha DATETIME DEFAULT NULL COMMENT 'Fecha de baja de la versión, NULL = versión actual en uso',
  
  -- Contenido de la plantilla
  html_template LONGTEXT NOT NULL COMMENT 'HTML con placeholders (ej: {{formData.nombreProyecto}})',
  css_styles LONGTEXT COMMENT 'CSS específico de la plantilla (inline o <style>)',
  
  -- Configuración del PDF
  pdf_config JSON COMMENT 'Configuración Puppeteer: { format, margin, orientation, etc. }',
  
  -- Metadata del template
  template_engine ENUM('handlebars', 'mustache', 'literal') DEFAULT 'handlebars' COMMENT 'Motor de templating usado',
  placeholders JSON COMMENT 'Lista de placeholders esperados con tipo y descripción',
  
  -- Assets embebidos (opcional)
  assets JSON COMMENT 'Imágenes/logos en base64 o URLs absolutas: { "logo": "data:image/svg+xml;base64,..." }',
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  user_id INT COMMENT 'Usuario que creó la plantilla',
  
  -- Índices
  INDEX idx_codigo (codigo),
  INDEX idx_baja_fecha (baja_fecha),
  INDEX idx_template_engine (template_engine),
  
  -- Foreign key
  FOREIGN KEY (user_id) REFERENCES Usuarios(user_id) ON DELETE SET NULL
  
) 
COMMENT='Plantillas HTML/CSS para generar entregables PDF con Puppeteer';

