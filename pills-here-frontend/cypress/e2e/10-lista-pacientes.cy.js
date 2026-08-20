// Área funcional: LISTA DE PACIENTES
// Casos 34.0 - 35.0 del suite de pruebas

describe("Lista de pacientes", () => {
  it("Caso 34.0: Listar pacientes vinculados | muestra la lista completa", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/lista-pacientes");
      cy.get(".lista-tabla-row").should("have.length", 1);
      cy.get(".lista-tabla-row").should("contain", "Test Prueba Auto");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 35.0: Usuario no médico accede a la lista | no muestra pacientes y deniega el acceso", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        cy.visit("/lista-pacientes");
        cy.url().should("eq", `${Cypress.config("baseUrl")}/inicio-paciente`);

        cy.cerrarSesionPaciente();
      });
    });
  });
});
