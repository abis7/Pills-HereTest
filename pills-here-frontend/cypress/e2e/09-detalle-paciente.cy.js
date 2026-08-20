// Área funcional: DETALLE DEL PACIENTE (MÉDICO)
// Casos 32.0 - 33.0, 36.0 e historia 10.0
//

describe("Detalle del paciente", () => {
  it("Caso 32.0: Ficha técnica de paciente válido | muestra datos personales y clínicos", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción / validación
      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".detalle-info-box").should("contain", "Test Prueba Auto");
      cy.get(".detalle-info-box").should("contain", "Edad:");
      cy.get(".detalle-info-box").should("contain", "Sexo: Femenino");
      cy.get(".detalle-info-box").should("contain", "Tipo de sangre: O+");
      cy.get(".detalle-sin-tratamientos-card").should("contain", "Este paciente aún no tiene tratamientos");
      cy.get(".detalle-crear-btn").should("be.visible");

      // Cerrar sesión
      cy.cerrarSesionMedico();
    });
  });

  it("Caso 33.0: Detalle de paciente inexistente | muestra página no encontrada", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: intentar abrir el detalle de un paciente inexistente
        cy.visit("/detalle-paciente/999999");
        // Evidencia: la vista queda colgada en "Cargando paciente..."
        cy.screenshot("evidencia/09-caso-33-paciente-inexistente-cargando");

        let mensajeVisible = false;
        cy.get("body", { timeout: 5000 }).then(($body) => {
          mensajeVisible = $body.text().includes("No se encontró el paciente");
        });

        // Cerrar sesión
        cy.cerrarSesionMedico();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // Para un id de paciente inexistente la vista queda colgada en
          // "Cargando paciente..." indefinidamente y nunca muestra un
          // mensaje de "página no encontrada" (requisito caso 33.0).
          expect(mensajeVisible).to.eq(true);
        });
      });
    });
  });

  it("Caso 36.0: Registrar consulta al acceder al detalle del paciente desde la lista", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: abrir el detalle desde la lista de pacientes
      let consultaRegistrada = false;
      cy.intercept("POST", "**/medico-paciente/registrar-consulta/**", () => {
        consultaRegistrada = true;
      }).as("consulta");

      cy.visit("/lista-pacientes");
      cy.get(".lista-nombre-btn").first().click();

      // La navegación al detalle sí ocurre
      cy.url().should("include", `/detalle-paciente/${contexto.paciente.idPaciente}`);

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // Al abrir el detalle desde la lista NO se registra la consulta
        // médica: el frontend no realiza ninguna llamada POST a
        // registrar-consulta (requisito caso 36.0 del suite).
        expect(consultaRegistrada).to.eq(true);
      });
    });
  });

  it("Historia 10.0 escenario 2: Búsqueda de paciente por nombre | filtra la lista en tiempo real", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: escribir en el buscador de la lista
      cy.visit("/lista-pacientes");
      cy.get(".lista-search-box input").type("Test Prueba Auto");
      cy.get(".lista-tabla-row").should("have.length", 1);
      cy.get(".lista-tabla-row").should("contain", "Test Prueba Auto");

      cy.get(".lista-search-box input").clear().type("NoExisteNadie");
      // Evidencia: el buscador no filtra; las filas siguen visibles
      cy.screenshot("evidencia/09-h10-2-buscador-sin-filtrar");

      let filasAlBuscar = -1;
      cy.get(".lista-tabla-row").then(($filas) => {
        filasAlBuscar = $filas.length;
      });

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // El buscador de la lista de pacientes es solo visual: NO filtra la
        // lista en tiempo real (al escribir "NoExisteNadie" las filas se
        // siguen mostrando), requisito historia 10.0 escenario 2.
        expect(filasAlBuscar).to.eq(0);
      });
    });
  });

  it("Historia 10.0 escenario 3: Paciente recién registrado sin historial clínico | muestra mensaje y habilita editar historial", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: abrir la ficha de un paciente sin historial clínico
      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      // Evidencia: no hay mensaje de antecedentes ni botón de editar
      cy.screenshot("evidencia/09-h10-3-sin-mensaje-antecedentes");

      let mensajeVisible = false;
      cy.get("body", { timeout: 5000 }).then(($body) => {
        mensajeVisible = $body.text().includes("Sin antecedentes clínicos registrados");
      });

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // En la sección de datos clínicos NO se muestra el mensaje
        // "Sin antecedentes clínicos registrados" ni existe un botón
        // "Editar historial clínico" (requisito historia 10.0 escenario 3).
        expect(mensajeVisible).to.eq(true);
      });
    });
  });
});
