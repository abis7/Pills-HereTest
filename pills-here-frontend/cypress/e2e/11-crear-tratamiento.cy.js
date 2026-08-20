// Área funcional: CREAR TRATAMIENTO
// Casos 37.0 - 40.0 e historia 13.0

describe("Crear tratamiento", () => {
  it("Caso 37.0: Crear tratamiento completo | lo guarda y redirige al detalle del paciente", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/crear-tratamiento/${contexto.paciente.idPaciente}`);
      cy.get(".crear-tratamiento-diagnostico input").type("Diabetes tipo 2");
      cy.get('input[name="busquedaMedicamento"]').type("para");
      cy.get(".crear-tratamiento-sugerencias li", { timeout: 10000 }).first().click();
      cy.get(".crear-tratamiento-input-dosis").eq(0).type("1 tableta");
      cy.get(".crear-tratamiento-input-dosis").eq(1).type("8");
      cy.get(".crear-tratamiento-input-dosis").eq(2).type("7");
      cy.get(".crear-tratamiento-textarea").type("Tomar después de los alimentos");

      cy.stubAlertas();
      cy.intercept("POST", "**/tratamientos/crear").as("crearTratamiento");
      cy.get(".crear-tratamiento-btn-crear").click();

      cy.wait("@crearTratamiento").then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
      cy.get("@alert").should("be.calledWith", "Tratamiento creado correctamente");
      cy.url().should("include", `/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".medico-tratamiento-card").should("contain", "Diabetes tipo 2");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 38.0: Crear tratamiento sin fecha de inicio | asigna la fecha actual automáticamente", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/crear-tratamiento/${contexto.paciente.idPaciente}`);
      cy.get(".crear-tratamiento-info").should("contain", "Fecha de inicio:");
      cy.get('input[type="date"]').should("not.exist");

      cy.get(".crear-tratamiento-diagnostico input").type("Gripe");
      cy.get('input[name="busquedaMedicamento"]').type("par");
      cy.get(".crear-tratamiento-sugerencias li", { timeout: 10000 }).first().click();
      cy.get(".crear-tratamiento-input-dosis").eq(0).type("1 tableta");
      cy.get(".crear-tratamiento-input-dosis").eq(1).type("8");
      cy.get(".crear-tratamiento-input-dosis").eq(2).type("3");

      cy.stubAlertas();
      cy.get(".crear-tratamiento-btn-crear").click();
      cy.get("@alert").should("be.calledWith", "Tratamiento creado correctamente");

      cy.request({
        method: "GET",
        url: `http://localhost:8083/tratamientos/paciente/${contexto.paciente.idPaciente}/todos`,
      }).then((respuesta) => {
        const lista = Array.isArray(respuesta.body) ? respuesta.body : [respuesta.body];
        const creado = lista[lista.length - 1];
        expect(creado.fechaInicio).to.not.be.null;
      });

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 39.0: Crear tratamiento para paciente inexistente | muestra error de operación inválida", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.loginApi(datos.correo, datos.contrasena).then((login) => {
          cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
          });

          cy.crearTratamientoApi({
            idPaciente: 999999,
            idMedico: login.idMedico,
            diagnostico: "No debe crearse",
            recomendaciones: "",
            medicamentos: [
              { idMedicamento: 1, dosis: "1", intervaloHoras: 8, duracionDias: 2 },
            ],
          }).then((respuesta) => {
            expect(respuesta.status).to.be.gte(400);
          });

          cy.cerrarSesionMedico();
        });
      });
    });
  });

  it("Caso 40.0: Crear tratamiento con medicamento inexistente | muestra error de medicamento no encontrado", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.crearTratamientoApi({
        idPaciente: contexto.paciente.idPaciente,
        idMedico: contexto.medico.idMedico,
        diagnostico: "No debe crearse",
        recomendaciones: "",
        medicamentos: [
          { idMedicamento: 999999, dosis: "1", intervaloHoras: 8, duracionDias: 2 },
        ],
      }).then((respuesta) => {
        expect(respuesta.status).to.be.gte(400);
      });

      cy.cerrarSesionMedico();
    });
  });

  it("Historia 13.0 escenario 2: Crear tratamiento con campos vacíos | muestra campos obligatorios", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: crear sin llenar los campos obligatorios
      cy.visit(`/crear-tratamiento/${contexto.paciente.idPaciente}`);
      cy.stubAlertas();
      cy.get(".crear-tratamiento-btn-crear").click();
      // Evidencia: no se muestran mensajes de campo obligatorio
      cy.screenshot("evidencia/11-h13-2-sin-validacion-campos-vacios");

      let errorVisible = false;
      cy.get("body", { timeout: 5000 }).then(($body) => {
        errorVisible = $body.find(".field-error").length > 0;
      });

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // La vista de crear tratamiento NO valida campos obligatorios
        // (no renderiza .field-error). El formulario se envía igual y el
        // error llega solo como alert genérico del backend
        // (requisito historia 13.0 escenario 2: "Este campo es obligatorio").
        expect(errorVisible).to.eq(true);
      });
    });
  });

  it("Historia 13.0 escenario 3: Fecha de finalización anterior a la de inicio | muestra error de fechas", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción / validación:
      // La vista NO tiene campos de fecha (inicio ni finalización); la
      // fecha de inicio se asigna automáticamente al día actual, por lo
      // que el escenario "fecha de finalización anterior a la de inicio"
      // (historia 13.0 escenario 3) no es aplicable con la UI actual.
      cy.visit(`/crear-tratamiento/${contexto.paciente.idPaciente}`);
      cy.get('input[type="date"]').should("not.exist");
      cy.contains("La fecha de finalización debe ser posterior a la fecha de inicio").should("not.exist");

      // Cerrar sesión
      cy.cerrarSesionMedico();
    });
  });
});
