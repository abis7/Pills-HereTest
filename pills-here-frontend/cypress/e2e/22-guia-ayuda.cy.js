// Área funcional: GUÍA DE USO
// Historias 6.0 y 14.0

describe("Guía de uso del sistema", () => {
  it("Historia 6.0 escenario 1: Primer inicio de sesión del paciente | muestra la guía automáticamente", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        cy.contains("Guía de uso").should("be.visible");

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Historia 6.0 escenario 3: Consultar la guía desde el menú | abre la guía de uso", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        cy.get(".btn-ayuda-paciente").click();
        cy.contains("Guía de uso").should("be.visible");

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Historia 14.0 escenario 1: Consultar la guía desde el menú del médico | muestra la ayuda", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        cy.get(".btn-ayuda").click();
        cy.contains("Guía de uso").should("be.visible");

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Historia 14.0 escenario 2: Primer inicio de sesión del médico | muestra la guía automáticamente", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        cy.contains("Guía de uso").should("be.visible");

        cy.cerrarSesionMedico();
      });
    });
  });
});
