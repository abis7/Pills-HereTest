// Área funcional: VINCULAR PACIENTE
// Casos 29.0 - 31.0 e historia 15.0

describe("Vincular paciente", () => {
  it("Caso 29.0: Vincular con código válido | vincula al paciente y abre su detalle", () => {
    cy.contextoMedicoPaciente({ sinVincular: true }).then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/nuevo-paciente");
      cy.get(".nuevo-paciente-input").type(contexto.paciente.codigoPaciente);
      cy.intercept("POST", "**/medico-paciente/vincular").as("vincular");
      cy.get(".nuevo-paciente-btn").click();

      cy.wait("@vincular").then((interception) => {
        expect(interception.response.body.success).to.eq(true);
      });
      cy.url().should("include", `/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".detalle-info-box").should("contain", "Test Prueba Auto");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 30.0: Vincular con código inexistente | muestra mensaje de código inválido", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.visit("/nuevo-paciente");
        cy.get(".nuevo-paciente-input").type("CODIGO-INVALIDO-999");
        cy.get(".nuevo-paciente-btn").click();

        cy.get(".nuevo-paciente-error", { timeout: 10000 }).should("be.visible");
        cy.url().should("include", "/nuevo-paciente");

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 31.0: Vincular paciente ya vinculado | muestra que ya está vinculado", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/nuevo-paciente");
      cy.get(".nuevo-paciente-input").type(contexto.paciente.codigoPaciente);
      cy.get(".nuevo-paciente-btn").click();

      cy.get(".nuevo-paciente-error", { timeout: 10000 })
        .should("be.visible")
        .and("contain", "ya está vinculado");

      cy.cerrarSesionMedico();
    });
  });

  it("Historia 15.0 escenario 4: Vincular varios pacientes consecutivos | actualiza la lista", () => {
    cy.contextoMedicoPaciente({ sinVincular: true }).then((contexto) => {
      cy.datosPrueba("PACIENTE").then((datos2) => {
        cy.registrarPacienteApi(datos2).then((paciente2) => {
          cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
          });

          cy.visit("/nuevo-paciente");
          cy.get(".nuevo-paciente-input").type(contexto.paciente.codigoPaciente);
          cy.get(".nuevo-paciente-btn").click();
          cy.url().should("include", "/detalle-paciente");

          cy.visit("/nuevo-paciente");
          cy.get(".nuevo-paciente-input").type(paciente2.codigoPaciente);
          cy.get(".nuevo-paciente-btn").click();
          cy.url().should("include", "/detalle-paciente");

          cy.visit("/lista-pacientes");
          cy.get(".lista-tabla-row").should("have.length", 2);

          cy.cerrarSesionMedico();
        });
      });
    });
  });
});
