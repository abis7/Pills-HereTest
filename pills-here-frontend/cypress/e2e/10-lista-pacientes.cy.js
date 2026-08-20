// Área funcional: LISTA DE PACIENTES
// Casos 34.0 - 35.0 del suite de pruebas
//

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
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        // Acción: intentar acceder a la lista de pacientes siendo paciente
        cy.visit("/lista-pacientes");
        // Evidencia: el paciente puede ver la lista sin ser bloqueado
        cy.screenshot("evidencia/10-caso-35-paciente-ve-lista-pacientes");

        let urlTrasIntento = null;
        cy.url().then((url) => {
          urlTrasIntento = url;
        });

        // Cerrar sesión
        cy.cerrarSesionPaciente();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // No existe control de acceso por rol: un paciente puede abrir
          // /lista-pacientes y la app renderiza la tabla (vacía) sin
          // denegar el acceso ni redirigir (requisito caso 35.0).
          expect(urlTrasIntento).to.eq(`${Cypress.config("baseUrl")}/inicio-paciente`);
        });
      });
    });
  });
});
