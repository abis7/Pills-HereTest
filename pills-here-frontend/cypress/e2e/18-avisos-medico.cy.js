// Área funcional: CREAR AVISO PARA PACIENTE
// Casos 58.0 - 59.0 e historia 17.0

describe("Avisos del médico al paciente", () => {
  it("Caso 58.0: Enviar un aviso al paciente | queda visible en las notificaciones del paciente", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".detalle-aviso-input").type("Recordatorio de revisión");
      cy.get(".detalle-aviso-textarea").first().type("Por favor agenda tu cita de control");
      cy.get(".detalle-aviso-textarea").eq(1).type("A la brevedad posible");

      cy.stubAlertas();
      cy.intercept("POST", "**/avisos/crear").as("crearAviso");
      cy.get(".detalle-aviso-btn").click();

      cy.wait("@crearAviso").then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
      cy.get("@alert").should("be.calledWith", "Aviso enviado correctamente");

      cy.cerrarSesionMedico();

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.url().should("include", "/inicio-paciente");

      cy.get(".paciente-icon-btn").first().click();
      cy.get(".paciente-notificaciones-panel").should("contain", "Por favor agenda tu cita de control");

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 59.0: Leer el detalle completo de un aviso | abre el contenido del mensaje", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.crearAvisoApi({
        idMedico: contexto.medico.idMedico,
        idPaciente: contexto.paciente.idPaciente,
        titulo: "Título del aviso",
        contenido: "Contenido completo del aviso para el paciente",
        observaciones: "Observación adicional",
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/notas-paciente");
      cy.get(".nota-card").should("contain", "Título del aviso");
      cy.get(".nota-detalles-btn").first().click();

      cy.get(".nota-seleccionada").should("be.visible");
      cy.get(".nota-seleccionada h3").should("contain", "Título del aviso");
      cy.get(".nota-seleccionada .nota-texto").should("contain", "Contenido completo del aviso para el paciente");
      
      cy.get(".nota-medico").should("contain", "Dr. Test Prueba");
      cy.get(".nota-seleccionada").should("contain", "Observación adicional");

      cy.cerrarSesionPaciente();
    });
  });

  it("Historia 17.0 escenario 2: Enviar un aviso vacío | muestra que el aviso no puede estar vacío", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: enviar el aviso sin título ni contenido
      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.stubAlertas();
      cy.get(".detalle-aviso-btn").click();

      cy.get("@alert").should("be.calledWith", "Escribe el título y el aviso");

      // Cerrar sesión
      cy.cerrarSesionMedico();
    });
  });

  it("Historia 17.0 escenario 3: Editar un aviso ya enviado | actualiza el aviso y muestra 'Editado'", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.crearAvisoApi({
        idMedico: contexto.medico.idMedico,
        idPaciente: contexto.paciente.idPaciente,
        titulo: "Aviso a editar",
        contenido: "Contenido original",
        observaciones: "",
      });

      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: buscar la opción de editar sobre un aviso enviado
      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      // Evidencia: no existe opción de editar avisos
      cy.screenshot("evidencia/18-h17-3-sin-opcion-editar-aviso");

      let opcionEditarVisible = false;
      cy.get("body", { timeout: 5000 }).then(($body) => {
        opcionEditarVisible = $body.text().includes("Editar aviso") || $body.text().includes("Editado");
      });

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // No existe opción de editar avisos en la vista de detalle del
        // paciente (solo se pueden crear avisos nuevos), por lo que la
        // etiqueta "Editado" tampoco existe
        // (requisito historia 17.0 escenario 3).
        expect(opcionEditarVisible).to.eq(true);
      });
    });
  });
});
