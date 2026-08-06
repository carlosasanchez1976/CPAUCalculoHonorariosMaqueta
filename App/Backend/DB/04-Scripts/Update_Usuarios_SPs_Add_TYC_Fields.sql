-- =============================================
-- Script: Actualización SPs de Usuarios - Agregar campos TyC
-- SPEC: SPEC029-CALC-Términos y condiciones (FIX POST-IMPLEMENTACIÓN)
-- Fecha: 2026-08-06
-- Descripción: Agrega los campos de TyC a los SPs de consulta de Usuarios
--              para que el endpoint de login devuelva el estado de aceptación
-- =============================================

-- IMPORTANTE: Los SPs originales de Usuarios no incluían los campos:
-- - tyc_aceptado_fecha
-- - tyc_version_aceptada  
-- - tyc_id_aceptado
--
-- Esta actualización es necesaria para que el login devuelva el estado
-- de aceptación de TyC y el frontend pueda mostrar el modal si corresponde.
-- =============================================

-- =============================================
-- 1. Usuarios_Buscar_X_Id_Matricula
-- =============================================
DROP PROCEDURE IF EXISTS Usuarios_Buscar_X_Id_Matricula;

DELIMITER $$
CREATE PROCEDURE `Usuarios_Buscar_X_Id_Matricula`(
    IN p_id_matricula NUMERIC(10,0)
)
BEGIN
    SELECT
        user_id,
        user_mail,
        user_nombre,
        user_apellido,
        username_web,
        matricula,
        id_matricula,
        tipo_matricula,
        rol,
        baja_fecha,
        fec_ult_act,
        tyc_aceptado_fecha,
        tyc_version_aceptada,
        tyc_id_aceptado
    FROM Usuarios
    WHERE id_matricula = p_id_matricula
      AND (baja_fecha IS NULL OR baja_fecha > NOW());
END$$
DELIMITER ;

-- =============================================
-- 2. Usuarios_Buscar
-- =============================================
DROP PROCEDURE IF EXISTS Usuarios_Buscar;

DELIMITER $$
CREATE PROCEDURE `Usuarios_Buscar`
(
	IN p_user_id int
)

BEGIN

	SELECT
		`Usuarios`.`user_id`,
		`Usuarios`.`user_nombre`,
		`Usuarios`.`user_apellido`,
		`Usuarios`.`fec_ult_act`,
		`Usuarios`.`baja_fecha`,
        `Usuarios`.`user_mail`,
        Usuarios.rol,
		`Usuarios`.`password`,
		`Usuarios`.`modi_user_id`,
		`Usuarios`.`username_web`,
		`Usuarios`.`matricula`,
		`Usuarios`.`id_matricula`,
		`Usuarios`.`tipo_matricula`,
		`Usuarios`.`tyc_aceptado_fecha`,
		`Usuarios`.`tyc_version_aceptada`,
		`Usuarios`.`tyc_id_aceptado`
	FROM
		`Usuarios`
	WHERE
		Usuarios.user_id = p_user_id;


END$$
DELIMITER ;

-- =============================================
-- 3. Usuarios_Buscar_X_Email
-- =============================================
DROP PROCEDURE IF EXISTS Usuarios_Buscar_X_Email;

DELIMITER $$
CREATE PROCEDURE `Usuarios_Buscar_X_Email`
(
	IN p_user_mail varchar(150)
)

BEGIN

	SELECT
		`Usuarios`.`user_id`,
		`Usuarios`.`user_nombre`,
		`Usuarios`.`user_apellido`,
		`Usuarios`.`fec_ult_act`,
		`Usuarios`.`baja_fecha`,
        `Usuarios`.`user_mail`,
        Usuarios.rol,
		`Usuarios`.`password`,
		`Usuarios`.`modi_user_id`,
		`Usuarios`.`username_web`,
		`Usuarios`.`matricula`,
		`Usuarios`.`id_matricula`,
		`Usuarios`.`tipo_matricula`,
		`Usuarios`.`tyc_aceptado_fecha`,
		`Usuarios`.`tyc_version_aceptada`,
		`Usuarios`.`tyc_id_aceptado`
	FROM
		`Usuarios`
	WHERE
		Usuarios.user_mail = p_user_mail;


END$$
DELIMITER ;

-- =============================================
-- 4. Usuarios_Listar
-- =============================================
DELIMITER $$

DROP PROCEDURE IF EXISTS Usuarios_Listar$$

CREATE PROCEDURE Usuarios_Listar()
BEGIN
    SELECT 
        user_id,
        user_mail,
        user_nombre,
        user_apellido,
        rol,
        baja_fecha,
        modi_user_id,
        fec_ult_act,
        username_web,
        matricula,
        id_matricula,
        tipo_matricula,
        tyc_aceptado_fecha,
        tyc_version_aceptada,
        tyc_id_aceptado
    FROM Usuarios
    WHERE baja_fecha IS NULL
    ORDER BY user_apellido, user_nombre;
END$$

DELIMITER ;

-- =============================================
-- Validación
-- =============================================

-- Verificar que los SPs se actualizaron correctamente
SELECT 
    'SPs actualizados correctamente' as status,
    COUNT(*) as sp_count
FROM information_schema.routines 
WHERE routine_schema = DATABASE()
  AND routine_type = 'PROCEDURE'
  AND routine_name IN (
      'Usuarios_Buscar',
      'Usuarios_Buscar_X_Email',
      'Usuarios_Buscar_X_Id_Matricula',
      'Usuarios_Listar'
  );

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
