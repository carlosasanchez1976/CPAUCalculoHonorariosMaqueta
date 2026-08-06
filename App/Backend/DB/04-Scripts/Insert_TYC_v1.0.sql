-- =============================================
-- Script: Inserción inicial de Términos y Condiciones v1.0
-- SPEC: SPEC029-CALC-Términos y condiciones (TICKET-029-013)
-- Fecha: 2026-08-06
-- Descripción: Inserta el primer documento de TyC en la BD
-- =============================================

-- IMPORTANTE: Reemplazar @user_id con el ID de un usuario ADMIN válido
-- Ejemplo: Si el admin tiene user_id=1, cambiar @user_id por 1

SET @version = '1.0';
SET @user_id = 1; -- ⚠️ CAMBIAR ESTO por un user_id de ADMIN válido (ej: 1)
SET @activar = TRUE; -- TRUE = marcar como vigente y resetear usuarios

-- Contenido Markdown de los TyC
SET @contenido_md = '# Términos y Condiciones de Uso
## Calculadora de Honorarios del CPAU

**CPAU | Consejo Profesional de Arquitectura y Urbanismo**

---

## Contenido

1. Identificación del responsable
2. Objeto y ámbito de aplicación
3. Definiciones
4. Aceptación de los Términos
5. Usuarios habilitados y gratuidad
6. Autenticación y seguridad de la cuenta
7. Funcionalidades y disponibilidad
8. Información ingresada por el/la profesional
9. Metodología de cálculo
10. Carácter orientativo de los resultados
11. Documento PDF generado
12. Alcance de los honorarios y conceptos no incluidos
13. Obligaciones del usuario y datos de terceros
14. Protección de datos personales
15. Conservación y acceso a los registros
16. Infraestructura y medidas de seguridad
17. Usos prohibidos
18. Propiedad intelectual
19. Interrupciones, mantenimiento y modificaciones
20. Responsabilidad
21. Consultas, soporte y reclamos
22. Modificación de los Términos
23. Legislación aplicable y jurisdicción
24. Disposiciones generales
25. Texto de aceptación recomendado

---

## Lectura previa

El acceso y uso de la Calculadora requiere la lectura y aceptación de estos Términos y Condiciones. El resultado de la herramienta es orientativo y no sustituye el acuerdo contractual entre el/la profesional y su comitente.

---

## 1. Identificación del responsable

La Gerencia Técnica es el área institucional responsable de la administración funcional de la herramienta. Las consultas generales y de soporte podrán dirigirse a **calculadora@cpau.org**.

## 2. Objeto y ámbito de aplicación

Estos Términos y Condiciones regulan el acceso y uso de la aplicación web denominada "Calculadora de Honorarios del CPAU", en adelante, la "Calculadora", así como la generación y descarga de los documentos que resulten de su utilización.

La Calculadora es una herramienta de apoyo al ejercicio profesional. Su finalidad es facilitar una estimación de honorarios sugeridos para las tareas profesionales disponibles en cada versión de la aplicación, mediante la aplicación automatizada de criterios del Manual del Ejercicio Profesional de Arquitectura y Urbanismo —MEPAU— y de los datos ingresados por el/la profesional.

## 3. Definiciones

- **"CPAU"**: Consejo Profesional de Arquitectura y Urbanismo.
- **"Calculadora"**: aplicación web que procesa las variables ingresadas por el/la profesional y genera una estimación orientativa de honorarios.
- **"Usuario" o "profesional"**: profesional matriculado/a en el CPAU, con matrícula activa o vitalicia, que accede mediante su perfil profesional.
- **"MEPAU"**: Manual del Ejercicio Profesional de Arquitectura y Urbanismo, documento doctrinario del CPAU.
- **"A-115"**: documento "Honorarios sugeridos CPAU", 10.ª edición 2026, integrante del MEPAU.
- **"Cálculo"**: resultado estimativo producido por la Calculadora a partir de la información ingresada y de los parámetros vigentes.
- **"PDF"**: documento generado automáticamente por la Calculadora, que reproduce información ingresada por el/la profesional, parámetros de referencia y resultados.
- **"Comitente"**: persona humana o jurídica para la cual se prevé realizar una tarea profesional. El campo destinado a su identificación puede completarse con iniciales, siglas, una referencia interna o una denominación de fantasía.

## 4. Aceptación de los Términos

El uso de la Calculadora implica la aceptación de estos Términos y Condiciones y de la información de privacidad incluida en este documento.

La aceptación se instrumentará mediante una casilla de aceptación expresa al ingresar a la herramienta.

Cuando se introduzcan modificaciones sustanciales, el CPAU podrá requerir una nueva aceptación antes de permitir el uso de la Calculadora o la descarga de nuevos documentos.

## 5. Usuarios habilitados y gratuidad

La Calculadora es una herramienta gratuita y de acceso restringido a profesionales con matrícula activa o vitalicia en el CPAU.

El acceso se realiza mediante el usuario personal del Perfil Profesional disponible en www.cpau.org. No está permitido el acceso con credenciales de terceros ni el uso compartido de una misma cuenta por diferentes personas.

La disponibilidad gratuita de la Calculadora no implica la obligación del CPAU de mantener indefinidamente todas sus funciones, modalidades de cálculo o prestaciones, sin perjuicio del deber de informar los cambios relevantes conforme estos Términos.

## 6. Autenticación y seguridad de la cuenta

La Calculadora no recibe ni almacena la contraseña del Perfil Profesional. El sitio institucional valida la autenticación y transmite a la Calculadora los siguientes datos: nombre y apellido, número de matrícula y estado de matrícula.

El/la profesional es responsable de preservar la confidencialidad de sus credenciales, cerrar la sesión cuando utilice equipos compartidos y comunicar al CPAU cualquier acceso no autorizado, sospecha de compromiso de la cuenta o incidente de seguridad.

El CPAU podrá impedir o suspender el acceso cuando la matrícula deje de encontrarse activa o vitalicia, cuando existan indicios razonables de uso indebido, cuando resulte necesario proteger la seguridad del sistema o cuando lo exija una autoridad competente.

## 7. Funcionalidades y disponibilidad

La Calculadora permite seleccionar una tarea profesional disponible, ingresar las variables requeridas, revisar los datos, obtener una estimación de honorarios y generar un PDF. Las tareas habilitadas pueden variar según la versión de la herramienta.

La versión inicial contempla el cálculo para Proyecto y Dirección de obras de arquitectura y las tareas adicionales o especialidades que se encuentren expresamente disponibles. Las restantes categorías visibles como "en construcción" no forman parte del servicio hasta su habilitación efectiva.

El/la profesional no dispone, en esta versión, de un historial de cálculos ni de una función para recuperar, editar o volver a descargar cálculos anteriores.

## 8. Información ingresada por el/la profesional

El resultado depende de la información ingresada por el/la profesional, que puede comprender, entre otros datos: nombre del proyecto, referencia del comitente, ubicación, tipo de obra, destino o uso, plazo estimado, observaciones, superficie, costo por metro cuadrado, tipo de cambio y tareas profesionales seleccionadas.

El/la profesional debe revisar la integridad, exactitud, actualidad y pertinencia de la información antes de generar el cálculo y el PDF. El CPAU no verifica, certifica y/o acredita la existencia del proyecto, la identidad del comitente, la superficie, el monto de obra, el tipo de cambio ni ninguna otra variable declarada.

La superficie cubierta se computará al ciento por ciento. Los demás tipos de superficies deberán incorporarse, de acuerdo al criterio técnico del/de la profesional, para obtener una superficie total equivalente.

El costo por metro cuadrado deberá definirse en función de las características de la obra y de las referencias disponibles. El costo estimado de obra utilizado por la herramienta depende de la información proporcionada por el/la profesional.

## 9. Metodología de cálculo

La Calculadora aplica criterios del MEPAU y, para Proyecto y Dirección de obras de arquitectura, del documento A-115 "Honorarios sugeridos CPAU", 10.ª edición 2026.

Las fórmulas del A-115 se aplican en función del monto estimado de obra y del coeficiente K. El valor K se actualiza mensualmente de acuerdo con las variaciones del "Índice del costo de la construcción en el Gran Buenos Aires, nivel general" del INDEC y es publicado por el CPAU.

Cada cálculo utiliza el valor K vigente para el período identificado en la herramienta y en el PDF. Los documentos generados no se actualizan automáticamente cuando se publica un nuevo valor K.

Para Proyecto y Dirección, la metodología general distribuye los honorarios en un sesenta por ciento para Proyecto y un cuarenta por ciento para Dirección de obra. Las etapas y tareas adicionales se calculan de acuerdo con la selección realizada y con los criterios incorporados en la versión vigente de la Calculadora.

La Calculadora no consulta automáticamente cotizaciones de moneda extranjera. El tipo de cambio es ingresado exclusivamente por el/la profesional y la conversión a dólares estadounidenses se realiza a partir de ese dato.

La herramienta no aplica redondeos a los valores calculados. La forma de visualización podrá limitar la cantidad de decimales exhibidos conforme a la configuración técnica del sistema, sin alterar el valor utilizado para el cálculo.

## 10. Carácter orientativo de los resultados

Los importes obtenidos son honorarios profesionales sugeridos, de carácter estimativo, orientativo y no vinculante. Tienen por objeto brindar una referencia para que el/la profesional evalúe y acuerde sus honorarios con el comitente.

El cálculo no constituye una tarifa legal obligatoria, una regulación administrativa, una cotización formal, un presupuesto aceptado, un compromiso de contratación ni una determinación vinculante del CPAU.

El modo de pago, la moneda, los mecanismos de actualización, los plazos, los entregables, las responsabilidades y las restantes condiciones del encargo deberán ser acordados entre el/la profesional y el comitente. Se recomienda documentar el acuerdo mediante un contrato escrito.

Todo cambio en el alcance del encargo o en las variables utilizadas —incluidos superficie, destino, presupuesto, programa, documentación, plazo, tareas o condiciones de contratación— puede modificar los honorarios y requiere una nueva evaluación o cálculo.

## 11. Documento PDF generado

El PDF es un documento generado automáticamente a partir de la información ingresada por el/la profesional y de los parámetros configurados en la Calculadora.

El CPAU no verifica, certifica y/o acredita mediante el PDF la existencia del proyecto o de la obra, la identidad del comitente, la veracidad de los datos ingresados, las características técnicas, la superficie, el costo, el presupuesto, el tipo de cambio ni la efectiva contratación de las tareas.

El PDF no contiene una firma digital ni una firma electrónica del CPAU, salvo que en el futuro se implemente expresamente un mecanismo de validación identificado como tal.

El documento PDF generado no acredita la aceptación del comitente.

El/la profesional podrá presentar el PDF como referencia o incorporarlo a una propuesta o contrato bajo su responsabilidad. La incorporación del documento a un acuerdo entre profesional y comitente no convierte al CPAU en parte, garante, mediador ni responsable de esa relación contractual.

## 12. Alcance de los honorarios y conceptos no incluidos

El cálculo contempla únicamente las tareas profesionales expresamente seleccionadas y los alcances informados, por el/la profesional, en la Calculadora y en las notas anexas al PDF.

Salvo que la herramienta indique expresamente lo contrario, no se encuentran incluidos:

- El impuesto al valor agregado, cuando corresponda
- Impuestos, contribuciones o gravámenes que afecten la actividad profesional
- Gestiones municipales, trámites, derechos de construcción, tasas, sellados y derechos ante organismos públicos, consejos, empresas de servicios u otras entidades
- Gastos especiales necesarios para el cumplimiento del encargo
- Cálculo estructural, salvo que se encuentre seleccionado y expresamente incorporado
- Proyectos de instalaciones, salvo las especialidades seleccionadas y expresamente incorporadas
- Documentación y planos comerciales, renders, maquetas, animaciones, material audiovisual u otros productos no incluidos en la tarea seleccionada
- Interiorismo, paisaje, equipamiento no edilicio, mobiliario, iluminación, cortinas y otros elementos no habituales en obras ordinarias, salvo contratación expresa
- Cualquier tarea, prestación, responsabilidad o gasto no expresado en el cálculo

La documentación ejecutiva puede tener diferentes alcances y constituye una prestación específica. Sus entregables, nivel de detalle, coordinación, modalidad y responsabilidades deberán definirse en el contrato profesional.

La supervisión de obra constituye una tarea de acompañamiento para la interpretación del proyecto, siendo un rol no obligatorio. En ningún caso, puede reemplazar la intervención obligatoria de un/a Director/a de obra.

## 13. Obligaciones del usuario y datos de terceros

El/la profesional debe utilizar la Calculadora de buena fe, dentro de su finalidad institucional y conforme a la normativa profesional aplicable.

El campo "Comitente" no requiere consignar el nombre real. Puede utilizarse una sigla, inicial, referencia interna o denominación de fantasía.

No deben ingresar datos sensibles y/u ofensivos.

Cuando el/la profesional ingrese datos personales de terceras personas, declara que cuenta con una base legítima para hacerlo y que la información es adecuada, pertinente y limitada a la finalidad del cálculo. El/la profesional será responsable de informar a esas personas cuando corresponda.

## 14. Protección de datos personales

El CPAU tratará los datos personales de conformidad con la Ley 25.326 de Protección de los Datos Personales, su reglamentación y las normas complementarias aplicables.

La Calculadora recibe desde el Perfil Profesional el nombre y apellido, el número de matrícula y el estado de matrícula. Asimismo, procesa los datos ingresados por el/la profesional y el PDF generado como resultado del cálculo.

### Finalidades del tratamiento

Las finalidades del tratamiento son:

- Autenticar al usuario y verificar que se encuentre habilitado/a para utilizar la Calculadora
- Procesar las variables ingresadas y realizar el cálculo
- Generar el PDF correspondiente
- Conservar un registro de respaldo

Los datos no serán utilizados para finalidades incompatibles con las aquí informadas. Cualquier nueva finalidad que requiera el tratamiento de información adicional será comunicada de manera previa, clara y adecuada.

### Tecnologías utilizadas

Para el funcionamiento, la seguridad y el monitoreo técnico de la Calculadora se utilizan las siguientes tecnologías:

#### a) Autenticación y mantenimiento de la sesión

La Calculadora utiliza tokens JWT, almacenados en el localStorage del navegador, con la finalidad de mantener activa la sesión del usuario autenticado. Estos tokens contienen el identificador del usuario, su rol y su número de matrícula.

#### b) Monitoreo de infraestructura y registro de errores

Se utiliza Amazon CloudWatch Logs, servicio provisto por Amazon Web Services —AWS—, para registrar eventos del sistema, detectar errores técnicos y monitorear la disponibilidad y el rendimiento de la Calculadora.

La información tratada comprende registros de funcionamiento de la aplicación, métricas de rendimiento y datos vinculados con errores técnicos. Estos registros no contienen datos personales sensibles y se conservan durante un plazo de treinta (30) días.

#### c) Alertas del sistema

Se utiliza Amazon Simple Notification Service —Amazon SNS— para enviar alertas al equipo técnico ante incidentes críticos.

Estas notificaciones contienen métricas técnicas agregadas y no incluyen datos de los usuarios. Solo pueden acceder a ellas integrantes del personal técnico expresamente autorizados.

### Lo que NO se utiliza

La Calculadora no utiliza:

- Cookies de seguimiento o publicidad
- Google Analytics ni otras herramientas de analítica web
- reCAPTCHA ni otros servicios similares de prevención automatizada de accesos
- Servicios externos de registro de errores, tales como Sentry o Bugsnag

## 15. Conservación y acceso a los registros

Los datos ingresados se procesan temporalmente en el entorno operativo para realizar el cálculo y generar el PDF. Una vez finalizado el proceso, el cálculo no permanece disponible como registro consultable en la base operativa y no integra un historial accesible para el/la profesional.

Todos los datos ingresados y el PDF subsisten dentro de las copias de seguridad, con fines de respaldo y para atender, cuando resulte técnicamente posible y jurídicamente procedente, requerimientos judiciales o de autoridades competentes.

Los registros serán conservados durante 5 años. Las copias de seguridad se conservarán durante 5 años, salvo que exista una obligación legal, un requerimiento de autoridad o una controversia que justifique su preservación.

El CPAU puede acceder a la información cuando resulte necesario para las finalidades informadas. El programador o prestador técnico autorizado podrá acceder exclusivamente cuando sea indispensable para investigar o resolver un incidente técnico, bajo instrucciones del CPAU y sujeto a las obligaciones de confidencialidad correspondientes.

No existen otros proveedores con acceso operativo autorizado al contenido de los cálculos, sin perjuicio de la utilización de Amazon Web Services como proveedor de infraestructura tecnológica.

## 16. Infraestructura y medidas de seguridad

La infraestructura tecnológica de la Calculadora utiliza servicios de Amazon Web Services —AWS— y se encuentra implementada en una cuenta perteneciente al CPAU.

El procesamiento de la aplicación se realiza mediante AWS Lambda, bajo una arquitectura sin servidores —serverless—, y el acceso público al sistema se canaliza exclusivamente a través de Amazon API Gateway.

La persistencia de los datos se implementa mediante Amazon Relational Database Service —Amazon RDS— con motor MySQL. La base de datos se encuentra alojada en una red privada virtual —Virtual Private Cloud o VPC—, sin acceso directo desde internet, y únicamente puede ser accedida por recursos expresamente autorizados mediante reglas de seguridad y controles de red.

Las copias de seguridad de la base de datos se realizan diariamente de manera automatizada, se encuentran cifradas y son almacenadas en la misma región de AWS que el resto de la infraestructura.

La infraestructura de procesamiento, la base de datos y sus copias de seguridad se encuentran alojadas en la región us-east-1 de AWS, ubicada en el norte de Virginia, Estados Unidos de América.

En consecuencia, el uso de la Calculadora puede implicar una transferencia internacional de datos personales hacia Estados Unidos. Dicha transferencia será realizada de conformidad con la Ley 25.326 de Protección de los Datos Personales, su reglamentación y las normas complementarias aplicables.

AWS ofrece compromisos contractuales y medidas de protección para los datos tratados mediante sus servicios, incluidas cláusulas contractuales estándar, acuerdos de tratamiento de datos y medidas técnicas y organizativas de seguridad. La utilización de estos instrumentos se entenderá sin perjuicio de las obligaciones que correspondan al CPAU como responsable del tratamiento conforme a la normativa argentina.

AWS declara contar, asimismo, con certificaciones y auditorías internacionales en materia de seguridad de la información, entre ellas ISO 27001, SOC y PCI DSS. Estas certificaciones no sustituyen las obligaciones legales y de seguridad que corresponden al CPAU y a sus proveedores.

### Medidas de seguridad implementadas

El CPAU adopta medidas técnicas y organizativas razonables orientadas a preservar la confidencialidad, integridad, disponibilidad y resiliencia de la información. Entre las medidas implementadas se encuentran:

#### a) Cifrado de las comunicaciones

Las comunicaciones entre el navegador del usuario y la Calculadora se encuentran protegidas mediante protocolos SSL/TLS, con el objeto de evitar la lectura o alteración no autorizada de la información durante su transmisión.

#### b) Cifrado de la información almacenada

La base de datos y sus copias de seguridad se encuentran cifradas en reposo, de manera de reducir los riesgos asociados con un eventual acceso no autorizado a los sistemas de almacenamiento.

#### c) Autenticación y control de sesiones

El acceso está limitado a usuarios previamente validados mediante los sistemas del CPAU. La Calculadora utiliza tokens de sesión temporales, con una vigencia máxima de veinticuatro (24) horas, que permiten verificar la identidad y autorización del usuario en cada operación.

#### d) Aislamiento de la base de datos

La base de datos no posee acceso público desde internet. Se encuentra alojada dentro de una red privada y solamente puede ser accedida desde componentes autorizados del sistema mediante reglas específicas de seguridad.

#### e) Control de acceso por roles

Los permisos se asignan de acuerdo con el rol de cada usuario, diferenciando, entre otros, los accesos correspondientes a profesionales y administradores. Cada rol se encuentra limitado a las operaciones necesarias para el cumplimiento de sus funciones.

#### f) Protección frente a solicitudes automatizadas

La Calculadora aplica límites de frecuencia de peticiones —rate limiting— para mitigar intentos automatizados de acceso, abuso de los servicios o saturación de la infraestructura.

#### g) Registro, monitoreo y alertas

El sistema registra eventos técnicos, errores y métricas de rendimiento mediante Amazon CloudWatch Logs. Estos registros se conservan durante treinta (30) días.

Asimismo, se utilizan alertas automáticas para notificar al personal técnico autorizado ante errores críticos, tiempos de respuesta anormales o situaciones de indisponibilidad del servicio.

#### h) Gestión de vulnerabilidades y actualizaciones

Los componentes tecnológicos son sometidos a revisiones mensuales de vulnerabilidades conocidas. Las actualizaciones consideradas críticas son aplicadas, en condiciones normales, dentro de las cuarenta y ocho (48) horas posteriores a su identificación y evaluación.

#### i) Copias de seguridad y recuperación

Se realizan copias de seguridad automatizadas y diarias de la base de datos. Las copias se encuentran cifradas y almacenadas en la misma región de AWS.

Actualmente, las pruebas periódicas de restauración no se encuentran implementadas como un procedimiento regular. El CPAU procurará establecer un protocolo de verificación y restauración periódica de las copias de seguridad.

#### j) Protección de credenciales

Las contraseñas administradas directamente por la aplicación, cuando corresponda, no se almacenan en texto plano, sino mediante algoritmos criptográficos de hash irreversible, como bcrypt.

#### k) Gestión de incidentes

Ante la detección de errores críticos o incidentes de seguridad, el sistema genera alertas dirigidas al personal técnico autorizado para su análisis, contención y corrección. La respuesta dependerá de la naturaleza, gravedad y alcance del incidente detectado.

### Limitación de garantías

No obstante las medidas adoptadas, ningún sistema informático, mecanismo de almacenamiento o servicio conectado a internet puede garantizar una seguridad, continuidad o disponibilidad absolutas. El CPAU no será responsable por incidentes que resulten inevitables pese a la aplicación diligente de medidas razonables de seguridad, sin perjuicio de las responsabilidades que pudieran corresponderle conforme a la normativa aplicable.

## 17. Usos prohibidos

Queda prohibido:

- Utilizar credenciales ajenas, compartir la cuenta o permitir el acceso de terceros
- Falsear el estado de matrícula o suplantar la identidad de otra persona
- Introducir código malicioso, interferir con el funcionamiento, eludir controles de acceso o intentar obtener acceso no autorizado
- Automatizar consultas, realizar extracción masiva de datos, scraping o uso intensivo no autorizado
- Descompilar, realizar ingeniería inversa, alterar, copiar o reproducir el software, salvo los actos expresamente permitidos por normas imperativas
- Manipular el PDF, eliminar advertencias o presentar el documento de manera que induzca a creer que el CPAU certificó, aprobó o contrató el proyecto
- Utilizar las marcas, denominaciones o identidad visual del CPAU de manera engañosa
- Emplear la Calculadora para actividades ilícitas, fraudulentas, contrarias a la ética profesional o incompatibles con su finalidad

El CPAU podrá adoptar medidas razonables para investigar el uso indebido, preservar evidencia, restringir el acceso y efectuar las comunicaciones que correspondan a las autoridades o áreas institucionales competentes.

## 18. Propiedad intelectual

Las marcas, denominaciones, identidad visual, textos, notas, contenidos institucionales, documentación metodológica y demás materiales pertenecientes al CPAU se encuentran protegidos por la normativa aplicable en materia de propiedad intelectual, marcas y derechos de autor. Estos elementos no podrán ser reproducidos, modificados, distribuidos, comercializados ni utilizados fuera de los límites previstos en estos Términos sin la autorización previa y escrita del CPAU.

El acceso y uso de la Calculadora no concede al usuario ningún derecho de propiedad intelectual o industrial sobre la herramienta, su código, diseño, estructura, funcionamiento, contenidos o documentación. Tampoco otorga licencias para explotar, comercializar, sublicenciar, copiar, adaptar, descompilar, realizar ingeniería inversa o desarrollar productos derivados de la Calculadora, salvo autorización expresa y escrita del CPAU o en aquellos casos en que la legislación aplicable disponga lo contrario.

La titularidad de los derechos patrimoniales sobre el código fuente desarrollado específicamente para la Calculadora CH2026 corresponde al CPAU, de conformidad con el contrato de desarrollo de software celebrado con Neosisweb.

Asimismo, pertenecen al CPAU la documentación metodológica utilizada para el cálculo de honorarios, los criterios de cálculo, algoritmos, coeficientes, fórmulas, reglas de negocio y demás desarrollos conceptuales implementados específicamente en la Calculadora, sin perjuicio de los antecedentes normativos, fórmulas, conocimientos o elementos que sean de dominio público o pertenezcan legítimamente a terceros.

La infraestructura y la arquitectura técnica de la Calculadora incorporan medidas destinadas a limitar el acceso no autorizado al código fuente, a la lógica de negocio y a los sistemas internos. No obstante, estas medidas no implican una garantía absoluta frente a intentos de acceso, extracción, descompilación o ingeniería inversa.

### Componentes de código abierto

El código fuente utiliza componentes de software de terceros distribuidos bajo licencias de código abierto, principalmente licencias MIT y Apache License 2.0. Entre ellos se encuentran componentes para el funcionamiento del servidor, la conexión con bases de datos, la autenticación, el cifrado de credenciales, la validación de datos, la generación de documentos y la integración con los servicios de infraestructura.

Estos componentes podrán ser utilizados, reproducidos y modificados conforme a los términos de sus respectivas licencias. El CPAU y sus proveedores deberán respetar las obligaciones de atribución, conservación de avisos de derechos de autor, inclusión de textos de licencia y demás condiciones aplicables en cada caso.

La Calculadora no utiliza, según la información técnica disponible, componentes sujetos a licencias de tipo copyleft fuerte, como GPL o AGPL, que obliguen por sí mismas a distribuir públicamente el código fuente desarrollado específicamente para la herramienta.

### Servicios AWS

Los servicios AWS Lambda, API Gateway, Amazon RDS, Amazon CloudWatch y Amazon Route 53 son servicios propietarios provistos por Amazon Web Services y se encuentran sujetos a los términos contractuales, condiciones de servicio y licencias de AWS aplicables a la cuenta del CPAU. La utilización de estos servicios no transfiere al CPAU derechos de propiedad sobre la tecnología de AWS ni concede a AWS derechos de propiedad sobre el código fuente específico de la Calculadora, salvo los derechos operativos necesarios para prestar los servicios contratados.

### Derechos del usuario

El/la profesional conserva los derechos que pudieran corresponderle sobre la información y los contenidos que ingrese en la Calculadora. Al utilizar la herramienta, autoriza al CPAU a procesar, almacenar, reproducir técnicamente y utilizar dicha información exclusivamente en la medida necesaria para prestar el servicio y cumplir las finalidades indicadas en estos Términos.

El/la profesional declara que cuenta con derechos suficientes para ingresar y utilizar la información incorporada en la Calculadora y se compromete a no cargar contenidos que infrinjan derechos de propiedad intelectual, deberes de confidencialidad o derechos de terceros.

## 19. Interrupciones, mantenimiento y modificaciones de la herramienta

La Calculadora puede verse temporalmente interrumpida por mantenimiento, actualizaciones, fallas de conectividad, incidentes de seguridad, indisponibilidad de AWS u otras circunstancias técnicas, sin que ello pueda ser objeto de reclamo alguno al CPAU.

El CPAU podrá modificar la interfaz, las tareas disponibles, las fórmulas, los parámetros, el valor K, las notas aclaratorias y las funcionalidades, de acuerdo con la evolución del MEPAU, las decisiones institucionales y las necesidades técnicas.

Cuando resulte razonablemente posible, el CPAU informará las interrupciones programadas o cambios relevantes mediante la propia aplicación, el sitio institucional o los canales que considere adecuados.

El CPAU podrá suspender o discontinuar total o parcialmente la Calculadora. Esta decisión no modifica por sí misma los acuerdos profesionales celebrados entre usuarios y comitentes ni convierte al CPAU en custodio permanente de los documentos generados.

## 20. Responsabilidad

El/la profesional es responsable de los datos, criterios y parámetros que ingresa; de la selección de tareas; de la interpretación del resultado; y de verificar su adecuación al encargo concreto, la normativa vigente, su situación fiscal y las condiciones acordadas con el comitente.

El CPAU no responde por diferencias originadas en datos incorrectos, incompletos, desactualizados o ficticios; en cambios posteriores del proyecto; en un tipo de cambio ingresado por el usuario; en una selección inadecuada de tareas; ni en el uso del cálculo para finalidades distintas de las previstas.

La Calculadora no sustituye el criterio profesional, el MEPAU, el asesoramiento jurídico, tributario, contable o técnico, ni el análisis particular del encargo.

El CPAU no garantiza que el resultado sea aceptado por el comitente, por una autoridad administrativa, por un tribunal, por un perito, por una entidad financiera o por cualquier tercero.

El CPAU procurará mantener la herramienta en condiciones razonables de funcionamiento. No será responsable por interrupciones o demoras atribuibles exclusivamente a hechos de terceros, caídas generales del proveedor de infraestructura, fuerza mayor, caso fortuito o gestión inadecuada de credenciales por parte del usuario, siempre que haya adoptado las medidas que razonablemente le correspondan.

## 21. Consultas, soporte y reclamos

Las consultas funcionales y los reportes de errores podrán enviarse a **calculadora@cpau.org**. El usuario deberá proporcionar una descripción suficiente del incidente, evitando incluir contraseñas, datos sensibles o documentación confidencial.

El CPAU podrá solicitar datos adicionales cuando resulte necesario para verificar la identidad, localizar un registro o evitar el acceso indebido a información de terceros.

## 22. Modificación de los Términos

El CPAU podrá modificar estos Términos para reflejar cambios normativos, institucionales, metodológicos, funcionales o tecnológicos.

La versión vigente estará disponible en la Calculadora o en el sitio institucional. Cada versión indicará su fecha de vigencia. Los cambios sustanciales podrán requerir una nueva aceptación expresa.

## 23. Legislación aplicable y jurisdicción

Estos Términos se rigen por las leyes de la República Argentina, en particular por el Código Civil y Comercial de la Nación, la Ley 25.326 de Protección de los Datos Personales, su reglamentación, la normativa profesional aplicable y las demás normas que correspondan.

Toda controversia vinculada con la interpretación o aplicación de estos Términos será sometida a los tribunales ordinarios con competencia en la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero o jurisdicción que pudiera corresponder.

## 24. Disposiciones generales

Si alguna disposición fuera declarada inválida, ineficaz o inaplicable, las restantes conservarán su vigencia. La disposición afectada será interpretada o sustituida, en la medida permitida, de forma compatible con su finalidad.

La falta de ejercicio inmediato de un derecho por parte del CPAU no implica renuncia.

Los títulos y subtítulos se incorporan para facilitar la lectura y no limitan el alcance de las cláusulas.

Estos Términos, junto con las notas del cálculo, la información de privacidad y las condiciones generales aplicables al Perfil Profesional, conforman el marco de uso de la Calculadora.

---

**Versión:** 1.0  
**Fecha de vigencia:** 2026-08-05
';

-- Validar que se haya configurado el user_id
IF @user_id IS NULL THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = '⚠️ ERROR: Debes configurar @user_id con el ID de un usuario ADMIN válido';
END IF;

-- Llamar al stored procedure para insertar
CALL Terminos_Condiciones_Grabar(
    @version,
    @contenido_md,
    @user_id,
    @activar
);

-- Validar inserción
SELECT 
    tyc_id,
    version,
    vigente,
    fecha_vigencia,
    user_id,
    created_at,
    CHAR_LENGTH(contenido_md) as contenido_length
FROM Terminos_Condiciones
WHERE version = '1.0'
ORDER BY created_at DESC
LIMIT 1;

-- Validar que es el vigente
SELECT 
    tyc_id,
    version,
    vigente,
    fecha_vigencia
FROM Terminos_Condiciones
WHERE vigente = TRUE;

-- Contar usuarios con aceptación pendiente (debe ser TODOS)
SELECT 
    COUNT(*) as usuarios_pendientes,
    (SELECT COUNT(*) FROM Usuarios) as total_usuarios
FROM Usuarios
WHERE tyc_aceptado_fecha IS NULL;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
