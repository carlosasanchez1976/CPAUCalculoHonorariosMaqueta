select
		U.user_nombre,
        U.user_apellido,
        U.tipo_matricula,
        U.matricula,
        U.id_matricula,
        (select count(C.usuario_id) from Calculos C where C.usuario_id = U.user_id) as cant_calculos_realizados
	from
		Usuarios U
	where
		U.user_id in (select distinct(usuario_id) from Calculos)
	order by
		cant_calculos_realizados desc,
		U.user_apellido,
        U.user_nombre