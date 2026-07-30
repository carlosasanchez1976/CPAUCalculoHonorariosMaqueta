# 🏢 GesTur - Backend API

**Stack:** Node.js + Express + MySQL  
**Deployment:** AWS ECS Fargate + Docker  
**Ambiente:** QA  

---

## 📋 Descripción

Backend API para GesTur, sistema multi-tenant de gestión de turnos, cobros, stock y múltiples disciplinas deportivas. 

El sistema corre en contenedores Docker desplegados en AWS ECS Fargate con integración a RDS MySQL.

---

## 🏗️ Arquitectura AWS

### Servicios Activos

```
┌─────────────────────────────────────────────────────────────┐
│                      ☁️ AWS Cloud                           │
│                   Account: 848685497128                     │
│                    Region: us-east-1                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    📱 FRONTEND           🐳 BACKEND           ⚡ LAMBDAS
   (Vercel)          (ECS Fargate)        (Node.js 24.x)
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ↓
                    🔒 VPC vpc-066d4888f63caa083
                              │
                    🛡️ Security Groups
                              │
                    🗄️ RDS MySQL 8.4.8
                       gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com
```

### Componentes

| Componente | Tecnología | Ubicación | Estado |
|-----------|-----------|-----------|---------|
| **Backend API** | Node.js + Express + Docker | ECS Fargate (`gestur-cluster`) | ✅ RUNNING |
| **Base de Datos** | MySQL 8.4.8 | RDS (`gestur-qa`) | ✅ HEALTHY |
| **Lambda CPAU PROD** | Node.js 24.x | `cpau-ch2026-api-prod` (VPC) | ✅ ACTIVE |
| **Lambda CPAU QA** | Node.js 24.x | `cpau-ch2026-api-qa` (VPC) | ✅ ACTIVE |
| **Lambda WebConsultas** | Node.js 24.x | `cpau-webconsultas-api-qa` (VPC) | ✅ ACTIVE |

---

## 🔒 Seguridad e Infraestructura

### ⚠️ CAMBIOS IMPORTANTES - 28 JUL 2026

> **Se implementaron mejoras críticas de seguridad en la infraestructura.**

#### ✅ Mejoras Implementadas

1. **🔐 RDS 100% Privado**
   - ✅ Eliminado acceso público desde Internet (0.0.0.0/0)
   - ✅ Solo accesible desde Security Groups autorizados dentro de la VPC
   - ✅ Arquitectura Zero Trust implementada

2. **⚡ Lambda PROD Migrado a VPC**
   - ✅ `cpau-ch2026-api-prod` ahora corre dentro de la VPC
   - ✅ Acceso directo al RDS sin pasar por Internet
   - ✅ Mayor seguridad y rendimiento

3. **🛡️ Security Groups Optimizados**
   - ✅ Limpiadas 20 IPs obsoletas de contenedores antiguos
   - ✅ Solo 1 IP autorizada: contenedor ECS actual
   - ✅ Autorización por Security Groups (no por IPs individuales)

#### 📊 Impacto para Desarrolladores

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **APIs públicas** | ✅ Funcionando | ✅ Funcionando (sin cambios) |
| **Endpoints** | Sin cambios | Sin cambios |
| **Performance** | Normal | ✅ Mejorado (VPC) |
| **Acceso RDS directo** | Posible desde cualquier IP | ❌ Solo desde VPC/SGs autorizados |
| **MySQL Workbench** | Funcionaba directamente | ⚠️ Requiere Session Manager o VPN |
| **Downtime** | - | ✅ Cero (migración sin interrupción) |

#### 🔑 Acceso a Base de Datos

**Para desarrollo local o debugging:**

El acceso directo a RDS desde laptops/IPs externas **ya no está disponible** por seguridad. Opciones:

1. **AWS Systems Manager Session Manager** (Recomendado)
   - Port forwarding seguro a través de AWS SSM
   - No requiere IPs públicas
   - Costo: ~$8/mes
   - Documentación: Ver `00-Análisis de Seguridad/GUIA-SESSION-MANAGER.md`

2. **AWS Client VPN** (Alternativa)
   - Cliente VPN completo
   - Acceso como si estuvieras en la VPC
   - Costo: ~$10-20/mes

3. **Consultar con DevOps**
   - Para casos especiales se puede autorizar IP temporalmente

### Security Groups

| Nombre | ID | Uso |
|--------|-----|-----|
| **GesTur-QA-sg** | `sg-09526121da392745a` | Contenedor ECS (1 IP) |
| **GesTur-RDS-QA-sg** | `sg-0d45580cc1c6b68c5` | RDS MySQL |
| **gestur-ecs-sg** | `sg-0db09a975dc27c479` | ECS + Lambdas |

---

## 🚀 Deployment

### Ambiente QA

**ECS Cluster:** `gestur-cluster`  
**Service:** `gestur-backend-service`  
**Task Definition:** `gestur-backend-task`

**Deployment Automático:**
```bash
# El push a rama 'main' activa GitHub Actions
git push origin main

# GitHub Actions:
# 1. Build imagen Docker
# 2. Push a ECR
# 3. Actualiza task definition
# 4. Force new deployment en ECS
```

### Variables de Entorno

Configuradas en Task Definition de ECS:

```env
DB_HOST=gestur-qa.ci9m4c08kg3p.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_NAME=gestur_qa
DB_PASSWORD=********** (almacenado en Secrets Manager)
NODE_ENV=qa
PORT=3000
```

---

## 📦 Instalación Local

```bash
# 1. Clonar repositorio
git clone [URL_REPO]
cd BackEnd/App/Node

# 2. Instalar dependencias
npm install

# 3. Configurar .env (usar valores de desarrollo local)
cp .env.example .env

# 4. Ejecutar
npm run dev
```

**⚠️ Nota:** Para conectar a RDS QA, necesitas acceso vía Session Manager o VPN (ver sección de Seguridad).

---

## 🗂️ Estructura del Proyecto

```
BackEnd/App/Node/
├── controllers/         # Lógica de negocio
├── routes/             # Definición de endpoints
├── services/           # Servicios de datos
├── middleware/         # Auth, validación, logs
├── database/           # Configuración DB
├── tests/              # Tests unitarios
├── uploads/            # Archivos temporales
├── logs/               # Application logs
├── Dockerfile          # Configuración Docker
├── package.json        # Dependencias
└── index.js           # Entry point
```

---

## 📚 Documentación Adicional

| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| **Análisis de Seguridad** | `00-Contexto/00-Análisis de Seguridad/` | Plan de seguridad completo |
| **Tickets Seguridad** | `TICKETS-SEGURIDAD-RDS.md` | Detalle de cambios implementados |
| **Resumen Ejecutivo** | `RESUMEN-EJECUTIVO-28JUL2026.md` | Resumen de mejoras 28 Jul 2026 |
| **Session Manager** | `GUIA-SESSION-MANAGER.md` | Cómo acceder a RDS |
| **Migración Lambda** | `MIGRACION-LAMBDA-PROD-VPC.md` | Documentación migración VPC |
| **Rollback Plan** | `ROLLBACK-EMERGENCY.ps1` | Plan de contingencia |

---

## 🔍 Monitoreo

### CloudWatch

- **Logs:** `/ecs/gestur-backend`
- **Métricas:** ECS Service + RDS Instance
- **Alarmas:** CPU > 80%, Memory > 90%

### Health Checks

```bash
# Backend ECS
curl https://[ECS_PUBLIC_IP]:3000/health

# Lambda PROD
curl https://[LAMBDA_URL]/health

# Lambda QA
curl https://[LAMBDA_URL]/health
```

---

## 📞 Soporte y Contacto

**Equipo:** DevOps GesTur  
**Documentación:** `00-Contexto/` en el repositorio  
**Cambios de Seguridad:** Ver resumen ejecutivo del 28 Jul 2026  

### En caso de problemas

1. **Revisar CloudWatch Logs** (primero)
2. **Verificar Health Checks** de componentes
3. **Consultar documentación** en `00-Análisis de Seguridad/`
4. **Contactar al equipo DevOps**

---

## 🎯 Aplicaciones en Producción

| Aplicación | URL | Backend | Estado |
|-----------|-----|---------|---------|
| **Calculadora CPAU** | https://calculadora-beta.cpau.org | Lambda PROD | ✅ ACTIVO |
| **WebConsultas QA** | [URL] | Lambda QA | ✅ ACTIVO |

---

## ⚡ Cambios Recientes

### 28 Julio 2026 - Mejoras de Seguridad Críticas ✅
- Eliminado acceso público (0.0.0.0/0) del RDS
- Migrado Lambda PROD a VPC
- Optimizados Security Groups (21 IPs → 1 IP)
- Arquitectura Zero Trust implementada
- **Impacto:** Cero downtime, mejoras de seguridad y performance

### 20 Julio 2026 - ABM Genérico
- Implementado panel ABM genérico para entidades
- Módulo de artículos con precios
- Modal de edición de precios mejorado

---

## 📄 Licencia

Proyecto privado - GesTur © 2026

---

**Última actualización:** 28 Julio 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Producción (Seguro)
