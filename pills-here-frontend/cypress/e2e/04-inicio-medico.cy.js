// Área funcional: PANTALLA PRINCIPAL DEL MÉDICO
// Casos 17.0 - 20.0 del suite de pruebas

describe("Pantalla principal del médico", () => {
  it("Caso 17.0: Dashboard con pacientes vinculados | muestra estadísticas y pacientes recientes", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.url().should("include", "/inicio-medico");

      cy.get(".encabezado-superior h1").should("contain", "Bienvenido Dr. Test Prueba Auto");
      cy.get(".resumen-card").should("have.length", 3);
      cy.get(".resumen-card.naranja h3").should("have.text", "1");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 18.0: Dashboard de un médico inexistente | no muestra datos ni rompe la página", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        cy.window().then((win) => {
          win.localStorage.setItem("idUsuario", "999999");
        });
        cy.visit("/inicio-medico");

        cy.get(".inicio-medico-page").should("be.visible");
        cy.get(".resumen-card").should("have.length", 3);

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 19.0: Paciente intenta acceder a la pantalla del médico | se bloquea el acceso", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        cy.visit("/inicio-medico");
        cy.url().should("eq", `${Cypress.config("baseUrl")}/inicio-paciente`);

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Caso 20.0: Médico sin tratamientos | los contadores se muestran en cero", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        cy.get(".resumen-card.naranja h3").should("have.text", "0");
        cy.get(".resumen-card.amarillo h3").should("have.text", "0");
        cy.get(".resumen-card.verde h3").should("have.text", "0");

        cy.cerrarSesionMedico();
      });
    });
  });
});
