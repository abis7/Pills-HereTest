// Área funcional: PANTALLA PRINCIPAL DEL PACIENTE Y NOTIFICACIONES
// Casos 24.0 - 26.0, 53.0 - 55.0 e historias 4.0 y 7.0

describe("Pantalla principal del paciente", () => {
  it("Caso 24.0: Pantalla principal del paciente | muestra bienvenida con su nombre", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        cy.get(".paciente-header h1").should("contain", "Bienvenido").and("contain", "Test Prueba Auto");
        cy.get(".paciente-card").should("have.length", 4);

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Caso 25.0: Pantalla principal de paciente inexistente | muestra página no encontrada", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.window().then((win) => {
          win.localStorage.setItem("idPaciente", "999999");
        });
        cy.visit("/inicio-paciente");

        cy.contains("No se encontró el paciente").should("be.visible");

        cy.window().then((win) => {
          win.localStorage.clear();
        });
        cy.visit("/");
        cy.get(".login-container").should("be.visible");
      });
    });
  });

  it("Caso 26.0: Médico intenta acceder a la pantalla del paciente | se bloquea el acceso", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        cy.visit("/inicio-paciente");
        cy.url().should("eq", `${Cypress.config("baseUrl")}/inicio-medico`);

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 53.0: Lista de avisos del médico | el paciente ve sus avisos en notificaciones", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.crearAvisoApi({
        idMedico: contexto.medico.idMedico,
        idPaciente: contexto.paciente.idPaciente,
        titulo: "Aviso importante",
        contenido: "Debes tomar tus medicamentos a tiempo",
        observaciones: "Revisión en una semana",
      }).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.url().should("include", "/inicio-paciente");

      cy.get(".paciente-icon-btn").first().click();
      cy.get(".paciente-notificaciones-panel").should("be.visible");
      cy.get(".paciente-notificaciones-panel").should("contain", "Debes tomar tus medicamentos a tiempo");

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 54.0: Alerta de medicamento próximo | muestra recordatorio cuando falta poco para la toma", () => {
    cy.contextoTratamiento().then((contexto) => {
      const fechaProxima = new Date(Date.now() + 10 * 60 * 1000);
      const hora = `${String(fechaProxima.getHours()).padStart(2, "0")}:${String(
        fechaProxima.getMinutes()
      ).padStart(2, "0")}:00`;

      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        const idDosis = respDetalle.body.medicamentos[0].idDosis;

        cy.iniciarTratamientoApi([{ idDosis, horaInicioPaciente: hora }]).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.url().should("include", "/inicio-paciente");

      cy.get(".paciente-icon-btn").first().click();
      cy.get(".paciente-notificaciones-panel").should("be.visible");
      cy.get(".notificacion-medicamento").should("contain", "Recordatorio de medicamento");

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 55.0: Notificaciones del médico | no muestra alertas de tomas", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.url().should("include", "/inicio-medico");

      cy.get(".btn-notificacion").should("be.visible");
      cy.get(".notificacion-medicamento").should("not.exist");

      cy.cerrarSesionMedico();
    });
  });

  it("Historia 7.0: Estadísticas personales sin tratamientos | muestra mensaje informativo", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        cy.get(".estadistica-info").should("contain", "Aún no hay estadísticas disponibles.");
        cy.get(".estadistica-footer").should("contain", "Cumplimiento: --");

        cy.cerrarSesionPaciente();
      });
    });
  });
});
