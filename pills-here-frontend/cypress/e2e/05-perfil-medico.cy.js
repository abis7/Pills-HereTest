// Área funcional: PERFIL DEL MÉDICO
// Casos 21.0 - 23.0 del suite de pruebas

describe("Perfil del médico", () => {
  it("Caso 21.0: Visualizar perfil de médico | muestra datos personales y consultorio", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.visit("/perfil-medico");
        cy.get(".perfil-medico-header h1").should("contain", "Perfil de Médico: Dr. Test Prueba Auto.");
        cy.get(".perfil-medico-info").should("contain", "Cardiología");
        cy.get(".perfil-medico-info").should("contain", datos.correo);
        cy.get(".perfil-medico-info").should("contain", "Número de Cédula Profesional:");
        cy.get(".perfil-medico-info").should("contain", "A-101");

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 22.0: Visualizar perfil de médico inexistente | muestra página no encontrada", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.window().then((win) => {
          win.localStorage.setItem("idMedico", "999999");
        });
        cy.visit("/perfil-medico");

        cy.contains("No se encontró el médico").should("be.visible");

        cy.window().then((win) => {
          win.localStorage.clear();
        });
        cy.visit("/");
        cy.get(".login-container").should("be.visible");
      });
    });
  });

  it("Caso 23.0: Cerrar sesión de médico | limpia la sesión y vuelve al login", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        cy.cerrarSesionMedico();
      });
    });
  });
});
