// Área funcional: DETALLE DEL PACIENTE (MÉDICO)
// Casos 32.0 - 33.0, 36.0 e historia 10.0

describe("Detalle del paciente", () => {
  it("Caso 32.0: Ficha técnica de paciente válido | muestra datos personales y clínicos", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".detalle-info-box").should("contain", "Test Prueba Auto");
      cy.get(".detalle-info-box").should("contain", "Edad:");
      cy.get(".detalle-info-box").should("contain", "Sexo: Femenino");
      cy.get(".detalle-info-box").should("contain", "Tipo de sangre: O+");
      cy.get(".detalle-sin-tratamientos-card").should("contain", "Este paciente aún no tiene tratamientos");
      cy.get(".detalle-crear-btn").should("be.visible");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 33.0: Detalle de paciente inexistente | muestra página no encontrada", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.visit("/detalle-paciente/999999");
        cy.contains("No se encontró el paciente").should("be.visible");

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 36.0: Registrar consulta al abrir el detalle desde la lista | navega al detalle", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/lista-pacientes");
      cy.intercept("POST", "**/medico-paciente/registrar-consulta/**").as("consulta");
      cy.get(".lista-nombre-btn").first().click();

      cy.wait("@consulta", { timeout: 15000 }).then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 201]);
      });
      cy.url().should("include", `/detalle-paciente/${contexto.paciente.idPaciente}`);

      cy.cerrarSesionMedico();
    });
  });

  it("Historia 10.0 escenario 2: Búsqueda de paciente por nombre | filtra la lista en tiempo real", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/lista-pacientes");
      cy.get(".lista-search-box input").type("Test Prueba Auto");
      cy.get(".lista-tabla-row").should("have.length", 1);
      cy.get(".lista-tabla-row").should("contain", "Test Prueba Auto");

      cy.get(".lista-search-box input").clear().type("NoExisteNadie");
      cy.get(".lista-tabla-row").should("have.length", 0);

      cy.cerrarSesionMedico();
    });
  });
});
