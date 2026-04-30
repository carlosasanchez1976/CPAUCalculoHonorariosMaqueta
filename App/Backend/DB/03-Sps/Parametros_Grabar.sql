DELIMITER $$
CREATE PROCEDURE Parametros_Grabar(
    IN p_parametro_id INT,
    IN p_nombre VARCHAR(100),
    IN p_tipo VARCHAR(20),
    IN p_valor TEXT,
    IN p_descripcion TEXT,
    IN p_user_id INT
) 
BEGIN

    IF p_parametro_id IS NULL THEN
        BEGIN

            INSERT INTO Parametros (nombre, tipo, valor, descripcion, user_id)
            VALUES (p_nombre, p_tipo, p_valor, p_descripcion, p_user_id);
            
            SET p_parametro_id := LAST_INSERT_ID();
        END;
        ELSE
            UPDATE Parametros
            SET 
                nombre = p_nombre,
                tipo = p_tipo,
                valor = p_valor,
                descripcion = p_descripcion,
                user_id = p_user_id
            WHERE parametro_id = p_parametro_id;
    END IF;


    INSERT INTO Parametros_Historico (parametro_id, nombre, tipo, valor, descripcion, user_id)
    VALUES (p_parametro_id, p_nombre, p_tipo, p_valor, p_descripcion, p_user_id);

    SELECT p_parametro_id AS parametro_id;

END$$

DELIMITER ;