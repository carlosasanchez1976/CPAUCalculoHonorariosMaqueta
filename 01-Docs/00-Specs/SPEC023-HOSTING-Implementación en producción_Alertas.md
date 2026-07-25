# SPEC-023: Alertas y Monitoreo CloudWatch - Backend PROD

## 📋 Información del Documento

| Campo | Valor |
|-------|-------|
| **Código** | SPEC-023-ALERTAS |
| **Título** | Sistema de Alertas CloudWatch - Backend Producción |
| **Versión** | 1.0 |
| **Fecha** | 24/07/2026 |
| **Estado** | ✅ Configurado y Activo |
| **Responsable** | Carlos Sanchez (csanchez@neosisweb.ar) |
| **Región AWS** | us-east-1 |

---

## 🎯 ¿Qué son las Alarmas de CloudWatch?

### Definición

**CloudWatch Alarms** es el sistema de monitoreo proactivo de AWS que permite:
- Monitorear métricas de recursos AWS en tiempo real
- Definir umbrales (thresholds) para detectar anomalías
- Recibir notificaciones automáticas cuando se superan los umbrales
- Tomar acciones automatizadas en respuesta a eventos

### ¿Cómo Funcionan?

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE UNA ALARMA                      │
└─────────────────────────────────────────────────────────────┘

1. Lambda ejecuta → Genera métricas (errores, duración, etc.)
                    ↓
2. CloudWatch recolecta métricas cada minuto
                    ↓
3. Alarma evalúa métricas según configuración:
   - Período: cada X segundos
   - Estadística: Sum, Average, Max, Min
   - Umbral: valor límite
                    ↓
4. Si métrica supera umbral → Alarma cambia a estado ALARM
                    ↓
5. SNS Topic recibe notificación
                    ↓
6. Email enviado a suscriptores
                    ↓
7. Responsable recibe alerta y actúa
```

---

## 📊 Estados de una Alarma

### 1. 🟢 OK (Normal)
- **Significado:** Métrica por debajo del umbral
- **Acción:** Ninguna - Sistema operando normalmente
- **Notificación:** No se envía (opcional configurar notificación de recovery)

### 2. 🔴 ALARM (Alerta Activa)
- **Significado:** Métrica superó el umbral definido
- **Acción:** Envío inmediato de notificación vía SNS
- **Notificación:** Email a csanchez@neosisweb.ar
- **Requiere:** Investigación y acción correctiva

### 3. 🟡 INSUFFICIENT_DATA (Datos Insuficientes)
- **Significado:** No hay suficientes datos para evaluar
- **Causas comunes:**
  - Lambda recién deployada (sin invocaciones)
  - Poco tráfico (normal en ambientes nuevos)
  - Período de evaluación muy corto
- **Acción:** Normal si el sistema está operativo
- **Notificación:** No se envía

---

## 🔔 Sistema de Notificaciones - SNS

### SNS Topic Configurado

```
Nombre:              CH2026-Prod-Alerts
ARN:                 arn:aws:sns:us-east-1:848685497128:CH2026-Prod-Alerts
Región:              us-east-1
Protocolo:           Email
Endpoint:            csanchez@neosisweb.ar
Estado Suscripción:  Confirmado
```

### ¿Qué es SNS (Simple Notification Service)?

**SNS** es el servicio de mensajería de AWS que:
- Recibe eventos de alarmas CloudWatch
- Distribuye notificaciones a múltiples suscriptores
- Soporta múltiples protocolos: Email, SMS, HTTP, Lambda, SQS

### Suscriptores Activos

| Protocolo | Endpoint | Estado | Fecha Confirmación |
|-----------|----------|--------|-------------------|
| Email | csanchez@neosisweb.ar | ✅ Confirmado | 24/07/2026 |

### Agregar Más Suscriptores

Para agregar más emails o canales de notificación:

```powershell
# Agregar otro email
aws sns subscribe `
  --topic-arn arn:aws:sns:us-east-1:848685497128:CH2026-Prod-Alerts `
  --protocol email `
  --notification-endpoint nuevo_email@ejemplo.com `
  --region us-east-1

# Agregar SMS (requiere número con +código país)
aws sns subscribe `
  --topic-arn arn:aws:sns:us-east-1:848685497128:CH2026-Prod-Alerts `
  --protocol sms `
  --notification-endpoint +5491112345678 `
  --region us-east-1

# Agregar webhook HTTP
aws sns subscribe `
  --topic-arn arn:aws:sns:us-east-1:848685497128:CH2026-Prod-Alerts `
  --protocol https `
  --notification-endpoint https://tu-webhook.com/alertas `
  --region us-east-1
```

**Nota:** Todos los nuevos suscriptores deben confirmar la suscripción.

---

## 🚨 Alarmas Configuradas - Backend PROD

### Resumen de Alarmas Activas

| Alarma | Métrica | Umbral | Período | Estado Actual |
|--------|---------|--------|---------|---------------|
| CH2026-Prod-Lambda-Errors | Errors | > 10 | 5 min | 🟢 OK |
| CH2026-Prod-Lambda-Duration | Duration | > 25000 ms | 5 min | 🟡 INSUFFICIENT_DATA |

---

## 🔴 ALARMA 1: Errores de Lambda

### Información General

```
Nombre:          CH2026-Prod-Lambda-Errors
Descripción:     Alerta cuando Lambda PROD tiene más de 10 errores en 5 minutos
ARN:             arn:aws:cloudwatch:us-east-1:848685497128:alarm:CH2026-Prod-Lambda-Errors
Estado Actual:   OK (sin errores detectados)
```

### Configuración Detallada

| Parámetro | Valor | Explicación |
|-----------|-------|-------------|
| **Namespace** | AWS/Lambda | Métricas de AWS Lambda |
| **Métrica** | Errors | Cuenta invocaciones fallidas |
| **Dimensión** | FunctionName=cpau-ch2026-api-prod | Filtra solo esta Lambda |
| **Estadística** | Sum | Suma total de errores |
| **Período** | 300 segundos (5 minutos) | Ventana de evaluación |
| **Evaluation Periods** | 1 | Dispara inmediatamente (no espera) |
| **Threshold** | 10 | Más de 10 errores |
| **Comparison** | GreaterThanThreshold | Si Sum > 10 |
| **Treat Missing Data** | notBreaching | Sin datos = No disparar |
| **Actions Enabled** | true | Notificaciones activas |
| **Alarm Actions** | SNS: CH2026-Prod-Alerts | Envía email |

### ¿Qué se considera un "Error"?

Lambda cuenta como error cuando:
- ❌ **Excepción no capturada** en el código Node.js
- ❌ **Timeout** (30 segundos en PROD)
- ❌ **Out of Memory** (supera 1024 MB)
- ❌ **Error de conexión DB** no manejado
- ❌ **Crash de Puppeteer/Chromium**
- ❌ **Error al parsear JSON** del request

**No se cuenta como error:**
- ✅ Response HTTP 400, 404, 500 (manejados por Express)
- ✅ Validaciones de negocio (return con error)
- ✅ Logs de error/warning (no exception)

### ¿Por qué 10 errores?

**Justificación del umbral:**
- **1-5 errores** → Pueden ser casos edge o usuarios específicos
- **6-10 errores** → Zona gris, monitorear manualmente
- **>10 errores en 5 min** → Problema sistémico que requiere atención inmediata

**Cálculo:**
- 10 errores / 5 minutos = **2 errores por minuto**
- Si tráfico es bajo (ej: 10 req/min) → **20% error rate** → CRÍTICO
- Si tráfico es alto (ej: 100 req/min) → **2% error rate** → Investigar

### Email de Notificación - Ejemplo

```
From: AWS Notifications <no-reply@sns.amazonaws.com>
To: csanchez@neosisweb.ar
Subject: ALARM: "CH2026-Prod-Lambda-Errors" in US East (N. Virginia)

═════════════════════════════════════════════════════════════

You are receiving this email because your Amazon CloudWatch 
Alarm "CH2026-Prod-Lambda-Errors" in the US East (N. Virginia) 
region has entered the ALARM state.

Alarm Details:
- State Change: OK -> ALARM
- Alarm Name: CH2026-Prod-Lambda-Errors
- Alarm Description: Alerta cuando Lambda PROD tiene más de 10 
  errores en 5 minutos
- Reason for State Change: Threshold Crossed: 1 datapoint [15.0] 
  was greater than the threshold (10.0).
- Timestamp: 2026-07-24T22:30:00.000+0000
- Alarm ARN: arn:aws:cloudwatch:us-east-1:848685497128:alarm:CH2026-Prod-Lambda-Errors

Monitored Metric:
- MetricNamespace: AWS/Lambda
- MetricName: Errors
- Dimensions: [FunctionName = cpau-ch2026-api-prod]
- Period: 300 seconds
- Statistic: Sum
- Threshold: 10.0

═════════════════════════════════════════════════════════════

View this alarm in the AWS Console:
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#s=Alarms&alarm=CH2026-Prod-Lambda-Errors
```

### Acciones Recomendadas al Recibir Alerta

**1. Verificar estado actual (1-2 minutos)**
```powershell
# Ver últimos logs de Lambda
aws logs tail /aws/lambda/cpau-ch2026-api-prod --follow --region us-east-1

# Ver métricas recientes
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Errors `
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod `
  --start-time (Get-Date).AddMinutes(-15).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --end-time (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --period 300 `
  --statistics Sum `
  --region us-east-1
```

**2. Identificar causa raíz (5-10 minutos)**
- Revisar CloudWatch Logs: Buscar stacktraces
- Verificar conexión DB: ¿Credenciales correctas?
- Verificar API Gateway: ¿Requests llegando?
- Verificar tráfico: ¿Ataque DDoS?
- Verificar deployment reciente: ¿Bug introducido?

**3. Mitigación inmediata (según causa)**
- **Error de código:** Rollback a versión anterior
- **DB caída:** Reiniciar RDS o escalar
- **Timeout:** Aumentar timeout o optimizar código
- **Memory:** Aumentar memoria Lambda
- **Chromium crash:** Verificar tamaño PDFs generados

**4. Resolución (15-30 minutos)**
- Aplicar fix
- Deploy corrección
- Monitorear 15 minutos adicionales
- Documentar incidente y RCA (Root Cause Analysis)

**5. Notificación al equipo**
- Informar al cliente si impacta servicio
- Documentar en post-mortem
- Actualizar runbooks si es necesario

---

## ⏱️ ALARMA 2: Duración de Lambda

### Información General

```
Nombre:          CH2026-Prod-Lambda-Duration
Descripción:     Alerta cuando Lambda PROD tarda más de 25 segundos en promedio
ARN:             arn:aws:cloudwatch:us-east-1:848685497128:alarm:CH2026-Prod-Lambda-Duration
Estado Actual:   INSUFFICIENT_DATA (normal, poco tráfico aún)
```

### Configuración Detallada

| Parámetro | Valor | Explicación |
|-----------|-------|-------------|
| **Namespace** | AWS/Lambda | Métricas de AWS Lambda |
| **Métrica** | Duration | Tiempo de ejecución en ms |
| **Dimensión** | FunctionName=cpau-ch2026-api-prod | Filtra solo esta Lambda |
| **Estadística** | Average | Promedio de duración |
| **Período** | 300 segundos (5 minutos) | Ventana de evaluación |
| **Evaluation Periods** | 1 | Dispara inmediatamente |
| **Threshold** | 25000 ms (25 segundos) | 83% del timeout |
| **Comparison** | GreaterThanThreshold | Si Average > 25000 |
| **Treat Missing Data** | notBreaching | Sin datos = No disparar |
| **Actions Enabled** | true | Notificaciones activas |
| **Alarm Actions** | SNS: CH2026-Prod-Alerts | Envía email |

### ¿Por qué 25 segundos?

**Contexto:**
- **Timeout Lambda:** 30 segundos (configurado)
- **Umbral alarma:** 25 segundos = **83% del timeout**
- **Margen seguridad:** 5 segundos antes del timeout

**Justificación:**
- Si Lambda empieza a tardar 25 seg consistentemente → **Riesgo alto de timeouts**
- Permite acción preventiva **antes** de que usuarios vean errores
- Identifica problemas de performance tempranamente

**Duraciones esperadas:**
- ❄️ **Cold start:** 3-7 segundos (primera invocación)
- 🔥 **Warm execution (API):** 200-500 ms
- 📄 **Warm execution (PDF):** 1-3 segundos
- ⚠️ **Promedio >25 seg:** PROBLEMA

### Causas Comunes de Lentitud

| Causa | Síntoma | Solución |
|-------|---------|----------|
| **Cold starts frecuentes** | Primeras requests lentas | Provisioned Concurrency |
| **Queries DB lentas** | Timeout en consultas | Optimizar queries, índices |
| **Puppeteer/Chromium** | PDFs muy grandes | Optimizar templates, limitar tamaño |
| **Memory insuficiente** | Swap, GC frecuente | Aumentar memoria (1024 → 2048 MB) |
| **Network latency** | Timeout conexión RDS | Verificar VPC, subnets |
| **Demasiadas conexiones** | Connection pool agotado | Aumentar pool o usar RDS Proxy |

### Email de Notificación - Ejemplo

```
From: AWS Notifications <no-reply@sns.amazonaws.com>
To: csanchez@neosisweb.ar
Subject: ALARM: "CH2026-Prod-Lambda-Duration" in US East (N. Virginia)

═════════════════════════════════════════════════════════════

You are receiving this email because your Amazon CloudWatch 
Alarm "CH2026-Prod-Lambda-Duration" in the US East (N. Virginia) 
region has entered the ALARM state.

Alarm Details:
- State Change: OK -> ALARM
- Alarm Name: CH2026-Prod-Lambda-Duration
- Alarm Description: Alerta cuando Lambda PROD tarda más de 25 
  segundos en promedio
- Reason for State Change: Threshold Crossed: 1 datapoint [26543.2] 
  was greater than the threshold (25000.0).
- Timestamp: 2026-07-24T23:15:00.000+0000

Monitored Metric:
- MetricNamespace: AWS/Lambda
- MetricName: Duration
- Dimensions: [FunctionName = cpau-ch2026-api-prod]
- Period: 300 seconds
- Statistic: Average
- Threshold: 25000.0 milliseconds

═════════════════════════════════════════════════════════════

View this alarm in the AWS Console:
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#s=Alarms&alarm=CH2026-Prod-Lambda-Duration
```

### Acciones Recomendadas al Recibir Alerta

**1. Verificar duración actual (1 minuto)**
```powershell
# Ver estadísticas de duración
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Duration `
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod `
  --start-time (Get-Date).AddMinutes(-30).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --end-time (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --period 300 `
  --statistics Average,Maximum `
  --region us-east-1
```

**2. Identificar requests lentas (5 minutos)**
```powershell
# Buscar logs de requests lentas
aws logs filter-log-events `
  --log-group-name /aws/lambda/cpau-ch2026-api-prod `
  --start-time (Get-Date).AddMinutes(-30).ToUniversalTime() `
  --filter-pattern "Duration" `
  --region us-east-1
```

Buscar:
- ¿Endpoint específico lento? (PDF, cálculos complejos)
- ¿Cold starts excesivos?
- ¿Queries DB tardando mucho?

**3. Analizar métricas correlacionadas**
- **Invocations:** ¿Tráfico aumentó significativamente?
- **ConcurrentExecutions:** ¿Muchas instancias simultáneas?
- **Throttles:** ¿Lambda limitando invocaciones?
- **DB Connections:** ¿Connection pool saturado?

**4. Mitigación según causa**
- **Cold starts:** Implementar warming (ping cada 5 min)
- **DB lenta:** Optimizar queries, agregar índices
- **PDF pesados:** Reducir complejidad templates
- **Memory:** Aumentar de 1024 MB a 2048 MB
- **Timeout inminente:** Aumentar timeout de 30s a 60s

**5. Optimización a largo plazo**
- Implementar Provisioned Concurrency
- Migrar a RDS Proxy (connection pooling)
- Cachear resultados frecuentes (Redis/ElastiCache)
- Optimizar código Node.js (profiling)

---

## 📈 Métricas Adicionales Monitoreadas

### CloudWatch Logs - Retención

```
Log Group:       /aws/lambda/cpau-ch2026-api-prod
Retención:       30 días
Storage Size:    ~variable según tráfico
Log Streams:     Uno por cada contenedor Lambda
```

**Qué se registra:**
- ✅ Requests entrantes (método, path, IP)
- ✅ Responses salientes (status code, duration)
- ✅ Errores y excepciones (stack traces)
- ✅ Logs custom del código (console.log, console.error)
- ✅ Métricas de Puppeteer (tiempo generación PDF)
- ✅ Queries DB ejecutadas (si logging habilitado)

### Métricas Lambda Disponibles (sin alarma configurada)

| Métrica | Descripción | Uso Recomendado |
|---------|-------------|-----------------|
| **Invocations** | Total de ejecuciones | Monitorear tráfico |
| **Throttles** | Invocaciones rechazadas | Detectar límites alcanzados |
| **ConcurrentExecutions** | Instancias ejecutando simultáneamente | Planificar escalado |
| **DeadLetterErrors** | Fallos enviando a DLQ | (No configurado en PROD) |
| **IteratorAge** | (Streams) N/A para HTTP | N/A |
| **ProvisionedConcurrencyInvocations** | (No configurado) | Futuro |

**Acceder a métricas:**
```
AWS Console → CloudWatch → Metrics → Lambda → By Function Name → cpau-ch2026-api-prod
```

---

## 🔍 Consultas CloudWatch Insights

### Query 1: Top 10 Errores Más Frecuentes

```sql
fields @timestamp, @message
| filter @message like /ERROR/ or @message like /Error/
| stats count() as error_count by @message
| sort error_count desc
| limit 10
```

### Query 2: Duración por Endpoint

```sql
fields @timestamp, @message, @duration
| filter @message like /api/
| parse @message /(?<endpoint>\/api\/[^\s]+)/
| stats avg(@duration) as avg_duration, max(@duration) as max_duration by endpoint
| sort avg_duration desc
```

### Query 3: Cold Starts

```sql
fields @timestamp, @message, @initDuration
| filter @type = "REPORT" and @initDuration > 0
| stats count() as cold_starts, avg(@initDuration) as avg_init_time
```

### Query 4: Error Rate por Hora

```sql
fields @timestamp
| filter @message like /ERROR/
| stats count() as errors by bin(1h)
```

**Ejecutar queries:**
```
AWS Console → CloudWatch → Logs → Insights → Select log group → Paste query → Run
```

---

## 🛠️ Comandos Útiles - AWS CLI

### Ver Estado de Alarmas

```powershell
# Ver todas las alarmas
aws cloudwatch describe-alarms --region us-east-1

# Ver alarmas específicas de Lambda PROD
aws cloudwatch describe-alarms `
  --alarm-names "CH2026-Prod-Lambda-Errors" "CH2026-Prod-Lambda-Duration" `
  --region us-east-1

# Ver solo estado (tabla resumida)
aws cloudwatch describe-alarms `
  --alarm-names "CH2026-Prod-Lambda-Errors" "CH2026-Prod-Lambda-Duration" `
  --query 'MetricAlarms[*].[AlarmName,StateValue,MetricName]' `
  --output table `
  --region us-east-1
```

### Ver Historial de Alarmas

```powershell
# Historial de cambios de estado (últimas 24h)
aws cloudwatch describe-alarm-history `
  --alarm-name "CH2026-Prod-Lambda-Errors" `
  --history-item-type StateUpdate `
  --start-date (Get-Date).AddDays(-1) `
  --region us-east-1
```

### Ver Métricas en Tiempo Real

```powershell
# Errores últimos 15 minutos
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Errors `
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod `
  --start-time (Get-Date).AddMinutes(-15).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --end-time (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --period 60 `
  --statistics Sum `
  --region us-east-1

# Duración promedio últimas 30 minutos
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Duration `
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod `
  --start-time (Get-Date).AddMinutes(-30).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --end-time (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss") `
  --period 300 `
  --statistics Average,Maximum `
  --region us-east-1
```

### Modificar Alarmas

```powershell
# Cambiar umbral de errores (10 → 20)
aws cloudwatch put-metric-alarm `
  --alarm-name "CH2026-Prod-Lambda-Errors" `
  --alarm-description "Alerta cuando Lambda PROD tiene más de 20 errores en 5 minutos" `
  --actions-enabled `
  --alarm-actions "arn:aws:sns:us-east-1:848685497128:CH2026-Prod-Alerts" `
  --metric-name Errors `
  --namespace AWS/Lambda `
  --statistic Sum `
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod `
  --period 300 `
  --evaluation-periods 1 `
  --threshold 20 `
  --comparison-operator GreaterThanThreshold `
  --region us-east-1

# Deshabilitar alarma temporalmente
aws cloudwatch disable-alarm-actions `
  --alarm-names "CH2026-Prod-Lambda-Errors" `
  --region us-east-1

# Re-habilitar alarma
aws cloudwatch enable-alarm-actions `
  --alarm-names "CH2026-Prod-Lambda-Errors" `
  --region us-east-1
```

### Ver Logs en Tiempo Real

```powershell
# Seguir logs en tiempo real (tail -f)
aws logs tail /aws/lambda/cpau-ch2026-api-prod --follow --region us-east-1

# Ver últimos 50 logs
aws logs tail /aws/lambda/cpau-ch2026-api-prod --since 30m --region us-east-1

# Filtrar solo errores
aws logs tail /aws/lambda/cpau-ch2026-api-prod --follow --filter-pattern "ERROR" --region us-east-1
```

---

## 📊 Dashboard CloudWatch (Futuro)

### Crear Dashboard Personalizado

**Métricas recomendadas para incluir:**

1. **Panel de Errores**
   - Errors (Sum por 5 min)
   - Error Rate % (Errors / Invocations * 100)

2. **Panel de Performance**
   - Duration Average (ms)
   - Duration Max (ms)
   - Cold Start Count

3. **Panel de Tráfico**
   - Invocations (Count)
   - Concurrent Executions
   - Throttles

4. **Panel de Base de Datos**
   - RDS CPU Utilization
   - RDS DatabaseConnections
   - RDS ReadLatency

5. **Panel de Costos (opcional)**
   - Invocations * $0.0000002 = Costo estimado
   - Duration sum * Memory = GB-seconds facturables

**Crear dashboard:**
```powershell
# Via AWS Console
# CloudWatch → Dashboards → Create dashboard → Add widgets
```

---

## 🎯 Mejores Prácticas

### 1. Revisar Alarmas Regularmente
- ✅ **Semanalmente:** Verificar que no hay falsos positivos
- ✅ **Mensualmente:** Ajustar umbrales según patrones de tráfico
- ✅ **Trimestralmente:** Agregar nuevas alarmas según necesidad

### 2. Documentar Incidentes
- ✅ Crear log de cada alarma disparada
- ✅ Documentar RCA (Root Cause Analysis)
- ✅ Actualizar runbooks con soluciones

### 3. Tunear Umbrales
- ⚠️ **Demasiado sensible:** Alarmas frecuentes → Fatiga de alertas
- ⚠️ **Poco sensible:** Problemas no detectados → Downtime
- ✅ **Balance:** Ajustar basándose en experiencia real

### 4. Múltiples Canales de Notificación
- Email: Para revisión no urgente
- SMS: Para alertas críticas fuera de horario
- Slack/Teams: Para equipo completo
- PagerDuty: Para on-call rotations

### 5. Alarmas Adicionales Recomendadas

**Para implementar en el futuro:**

```powershell
# Alarma: Throttles (Lambda rechazando requests)
aws cloudwatch put-metric-alarm `
  --alarm-name "CH2026-Prod-Lambda-Throttles" `
  --metric-name Throttles `
  --namespace AWS/Lambda `
  --statistic Sum `
  --dimensions Name=FunctionName,Value=cpau-ch2026-api-prod `
  --period 300 `
  --threshold 5 `
  --comparison-operator GreaterThanThreshold `
  --region us-east-1

# Alarma: RDS CPU alto
aws cloudwatch put-metric-alarm `
  --alarm-name "CH2026-Prod-RDS-CPU" `
  --metric-name CPUUtilization `
  --namespace AWS/RDS `
  --statistic Average `
  --dimensions Name=DBInstanceIdentifier,Value=gestur-qa `
  --period 300 `
  --threshold 80 `
  --comparison-operator GreaterThanThreshold `
  --region us-east-1

# Alarma: RDS Conexiones altas
aws cloudwatch put-metric-alarm `
  --alarm-name "CH2026-Prod-RDS-Connections" `
  --metric-name DatabaseConnections `
  --namespace AWS/RDS `
  --statistic Average `
  --dimensions Name=DBInstanceIdentifier,Value=gestur-qa `
  --period 300 `
  --threshold 90 `
  --comparison-operator GreaterThanThreshold `
  --region us-east-1
```

---

## 📞 Soporte y Contactos

### Responsable Técnico
```
Nombre:    Carlos Sanchez
Email:     csanchez@neosisweb.ar
Rol:       Arquitecto Backend / DevOps
```

### Escalamiento
```
Nivel 1:   csanchez@neosisweb.ar (email/SMS)
Nivel 2:   [Equipo técnico senior si aplica]
Nivel 3:   AWS Support (cuenta 848685497128)
```

### Recursos Útiles
```
CloudWatch Console:
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1

Lambda Console:
https://console.aws.amazon.com/lambda/home?region=us-east-1#/functions/cpau-ch2026-api-prod

Documentación AWS CloudWatch Alarms:
https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html
```

---

## 📝 Changelog

| Fecha | Cambio | Responsable |
|-------|--------|-------------|
| 24/07/2026 | Configuración inicial: 2 alarmas (Errors, Duration) | Carlos Sanchez |
| 24/07/2026 | SNS Topic creado y email confirmado | Carlos Sanchez |
| 24/07/2026 | Logs retention configurado (30 días) | Carlos Sanchez |

---

## ✅ Checklist de Verificación

### Alarmas Operativas
- [x] SNS Topic creado
- [x] Email suscrito y confirmado
- [x] Alarma Errors configurada
- [x] Alarma Duration configurada
- [x] Logs retention configurado (30 días)
- [x] Alarmas en estado OK o INSUFFICIENT_DATA (normal)

### Testing
- [ ] Simular error en Lambda y verificar email recibido
- [ ] Simular timeout y verificar alarma de duración
- [ ] Verificar que email llega en <2 minutos

### Documentación
- [x] Documento de alertas creado
- [x] Runbooks de respuesta documentados
- [x] Comandos CLI documentados

---

**Fin del Documento de Alertas**

_Generado: 24/07/2026_  
_Versión: 1.0_  
_Estado: Sistema de Alertas Activo y Operativo_
