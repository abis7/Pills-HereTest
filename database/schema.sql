-- public.medicamento definition

-- Drop table

-- DROP TABLE public.medicamento;

CREATE TABLE public.medicamento (
	id_medicamento serial4 NOT NULL,
	nombre varchar(100) NOT NULL,
	presentacion varchar(100) NULL,
	concentracion varchar(50) NULL,
	via_administracion varchar(50) NULL,
	descripcion text NULL,
	CONSTRAINT medicamento_pkey PRIMARY KEY (id_medicamento)
);


-- public.usuario definition

-- Drop table

-- DROP TABLE public.usuario;

CREATE TABLE public.usuario (
	id_usuario serial4 NOT NULL,
	correo varchar(100) NOT NULL,
	contrasena varchar(255) NOT NULL,
	telefono varchar(20) NULL,
	rol varchar(20) NOT NULL,
	fecha_registro date NOT NULL,
	CONSTRAINT usuario_correo_key UNIQUE (correo),
	CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario),
	CONSTRAINT usuario_rol_check CHECK (((rol)::text = ANY ((ARRAY['MEDICO'::character varying, 'PACIENTE'::character varying])::text[])))
);


-- public.medico definition

-- Drop table

-- DROP TABLE public.medico;

CREATE TABLE public.medico (
	id_medico serial4 NOT NULL,
	id_usuario int4 NOT NULL,
	nombre varchar(100) NOT NULL,
	apellido_paterno varchar(100) NOT NULL,
	apellido_materno varchar(100) NULL,
	cedula_profesional varchar(50) NOT NULL,
	especialidad varchar(100) NOT NULL,
	consultorio varchar(100) NULL,
	fecha_alta date NOT NULL,
	fecha_nacimiento date NULL,
	sexo varchar(20) NULL,
	CONSTRAINT medico_cedula_profesional_key UNIQUE (cedula_profesional),
	CONSTRAINT medico_id_usuario_key UNIQUE (id_usuario),
	CONSTRAINT medico_pkey PRIMARY KEY (id_medico),
	CONSTRAINT medico_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);


-- public.paciente definition

-- Drop table

-- DROP TABLE public.paciente;

CREATE TABLE public.paciente (
	id_paciente serial4 NOT NULL,
	id_usuario int4 NOT NULL,
	codigo_paciente varchar(50) NOT NULL,
	nombre varchar(100) NOT NULL,
	apellido_paterno varchar(100) NOT NULL,
	apellido_materno varchar(100) NULL,
	fecha_nacimiento date NOT NULL,
	sexo varchar(20) NOT NULL,
	tipo_sangre varchar(10) NULL,
	alergias text NULL,
	CONSTRAINT paciente_codigo_paciente_key UNIQUE (codigo_paciente),
	CONSTRAINT paciente_id_usuario_key UNIQUE (id_usuario),
	CONSTRAINT paciente_pkey PRIMARY KEY (id_paciente),
	CONSTRAINT paciente_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario)
);


-- public.tratamiento definition

-- Drop table

-- DROP TABLE public.tratamiento;

CREATE TABLE public.tratamiento (
	id_tratamiento serial4 NOT NULL,
	id_medico int4 NOT NULL,
	id_paciente int4 NOT NULL,
	nombre_tratamiento varchar(100) NOT NULL,
	diagnostico text NULL,
	fecha_inicio date NOT NULL,
	fecha_fin date NULL,
	estado varchar(30) NOT NULL,
	receta_medica text NULL,
	notas_medicas text NULL,
	fecha_inicio_real date NULL,
	CONSTRAINT tratamiento_pkey PRIMARY KEY (id_tratamiento),
	CONSTRAINT tratamiento_id_medico_fkey FOREIGN KEY (id_medico) REFERENCES public.medico(id_medico),
	CONSTRAINT tratamiento_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.paciente(id_paciente)
);


-- public.aviso definition

-- Drop table

-- DROP TABLE public.aviso;

CREATE TABLE public.aviso (
	id_aviso serial4 NOT NULL,
	id_medico int4 NOT NULL,
	titulo varchar(100) NOT NULL,
	contenido text NOT NULL,
	fecha_publicacion timestamp NOT NULL,
	estado varchar(20) NOT NULL,
	observaciones text NULL,
	id_paciente int4 NULL,
	CONSTRAINT aviso_estado_check CHECK (((estado)::text = ANY ((ARRAY['ACTIVO'::character varying, 'INACTIVO'::character varying])::text[]))),
	CONSTRAINT aviso_pkey PRIMARY KEY (id_aviso),
	CONSTRAINT aviso_id_medico_fkey FOREIGN KEY (id_medico) REFERENCES public.medico(id_medico),
	CONSTRAINT fk_aviso_paciente FOREIGN KEY (id_paciente) REFERENCES public.paciente(id_paciente)
);


-- public.dosis definition

-- Drop table

-- DROP TABLE public.dosis;

CREATE TABLE public.dosis (
	id_dosis serial4 NOT NULL,
	id_tratamiento int4 NOT NULL,
	id_medicamento int4 NOT NULL,
	cantidad varchar(50) NOT NULL,
	frecuencia varchar(50) NOT NULL,
	hora_programada time NOT NULL,
	duracion int4 NOT NULL,
	intervalo_horas int4 NULL,
	hora_inicio_paciente time NULL,
	tratamiento_iniciado bool DEFAULT false NULL,
	duracion_dias int4 DEFAULT 1 NOT NULL,
	CONSTRAINT dosis_pkey PRIMARY KEY (id_dosis),
	CONSTRAINT dosis_id_medicamento_fkey FOREIGN KEY (id_medicamento) REFERENCES public.medicamento(id_medicamento),
	CONSTRAINT dosis_id_tratamiento_fkey FOREIGN KEY (id_tratamiento) REFERENCES public.tratamiento(id_tratamiento)
);


-- public.estadistica_paciente definition

-- Drop table

-- DROP TABLE public.estadistica_paciente;

CREATE TABLE public.estadistica_paciente (
	id_estadistica_paciente serial4 NOT NULL,
	id_paciente int4 NOT NULL,
	total_dosis int4 DEFAULT 0 NOT NULL,
	dosis_tomadas int4 DEFAULT 0 NOT NULL,
	dosis_pendientes int4 DEFAULT 0 NOT NULL,
	dosis_omitidas int4 DEFAULT 0 NOT NULL,
	porcentaje_cumplimiento numeric(5, 2) DEFAULT 0.00 NOT NULL,
	fecha_calculo date NOT NULL,
	CONSTRAINT estadistica_paciente_id_paciente_key UNIQUE (id_paciente),
	CONSTRAINT estadistica_paciente_pkey PRIMARY KEY (id_estadistica_paciente),
	CONSTRAINT estadistica_paciente_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.paciente(id_paciente)
);


-- public.estadistica_tratamiento definition

-- Drop table

-- DROP TABLE public.estadistica_tratamiento;

CREATE TABLE public.estadistica_tratamiento (
	id_estadistica serial4 NOT NULL,
	id_tratamiento int4 NOT NULL,
	total_dosis int4 DEFAULT 0 NOT NULL,
	dosis_tomadas int4 DEFAULT 0 NOT NULL,
	dosis_omitidas int4 DEFAULT 0 NOT NULL,
	porcentaje_cumplimiento numeric(5, 2) DEFAULT 0.00 NOT NULL,
	fecha_calculo date NOT NULL,
	dosis_pendientes int4 DEFAULT 0 NOT NULL,
	CONSTRAINT estadistica_tratamiento_id_tratamiento_key UNIQUE (id_tratamiento),
	CONSTRAINT estadistica_tratamiento_pkey PRIMARY KEY (id_estadistica),
	CONSTRAINT estadistica_tratamiento_id_tratamiento_fkey FOREIGN KEY (id_tratamiento) REFERENCES public.tratamiento(id_tratamiento)
);


-- public.historial_clinico definition

-- Drop table

-- DROP TABLE public.historial_clinico;

CREATE TABLE public.historial_clinico (
	id_historial serial4 NOT NULL,
	id_paciente int4 NOT NULL,
	id_tratamiento int4 NULL,
	fecha date NOT NULL,
	descripcion text NOT NULL,
	observaciones text NULL,
	CONSTRAINT historial_clinico_pkey PRIMARY KEY (id_historial),
	CONSTRAINT historial_clinico_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.paciente(id_paciente),
	CONSTRAINT historial_clinico_id_tratamiento_fkey FOREIGN KEY (id_tratamiento) REFERENCES public.tratamiento(id_tratamiento)
);


-- public.medico_paciente definition

-- Drop table

-- DROP TABLE public.medico_paciente;

CREATE TABLE public.medico_paciente (
	id_medico_paciente serial4 NOT NULL,
	id_medico int4 NOT NULL,
	id_paciente int4 NOT NULL,
	fecha_vinculacion date NOT NULL,
	fecha_ultima_consulta timestamp NULL,
	CONSTRAINT medico_paciente_id_medico_id_paciente_key UNIQUE (id_medico, id_paciente),
	CONSTRAINT medico_paciente_pkey PRIMARY KEY (id_medico_paciente),
	CONSTRAINT medico_paciente_id_medico_fkey FOREIGN KEY (id_medico) REFERENCES public.medico(id_medico),
	CONSTRAINT medico_paciente_id_paciente_fkey FOREIGN KEY (id_paciente) REFERENCES public.paciente(id_paciente)
);


-- public.toma_medicamento definition

-- Drop table

-- DROP TABLE public.toma_medicamento;

CREATE TABLE public.toma_medicamento (
	id_toma serial4 NOT NULL,
	id_dosis int4 NOT NULL,
	fecha_hora_programada timestamp NOT NULL,
	fecha_hora_tomada timestamp NULL,
	estado varchar(20) NOT NULL,
	CONSTRAINT toma_medicamento_pkey PRIMARY KEY (id_toma),
	CONSTRAINT fk_toma_dosis FOREIGN KEY (id_dosis) REFERENCES public.dosis(id_dosis)
);


-- public.calendario_medicacion definition

-- Drop table

-- DROP TABLE public.calendario_medicacion;

CREATE TABLE public.calendario_medicacion (
	id_calendario serial4 NOT NULL,
	id_dosis int4 NOT NULL,
	fecha date NOT NULL,
	hora time NOT NULL,
	estado varchar(30) NOT NULL,
	observaciones text NULL,
	CONSTRAINT calendario_medicacion_estado_check CHECK (((estado)::text = ANY ((ARRAY['PENDIENTE'::character varying, 'TOMADA'::character varying, 'OMITIDA'::character varying])::text[]))),
	CONSTRAINT calendario_medicacion_pkey PRIMARY KEY (id_calendario),
	CONSTRAINT calendario_medicacion_id_dosis_fkey FOREIGN KEY (id_dosis) REFERENCES public.dosis(id_dosis)
);


-- public.notificacion definition

-- Drop table

-- DROP TABLE public.notificacion;

CREATE TABLE public.notificacion (
	id_notificacion serial4 NOT NULL,
	id_calendario int4 NOT NULL,
	titulo varchar(100) NOT NULL,
	mensaje text NOT NULL,
	fecha_envio timestamp NOT NULL,
	tipo varchar(30) NOT NULL,
	estado varchar(30) NOT NULL,
	CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion),
	CONSTRAINT notificacion_id_calendario_fkey FOREIGN KEY (id_calendario) REFERENCES public.calendario_medicacion(id_calendario)
);