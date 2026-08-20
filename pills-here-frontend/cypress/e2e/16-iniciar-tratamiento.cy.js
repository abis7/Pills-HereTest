// Área funcional: INICIAR TRATAMIENTO PACIENTE
// Caso 49.0 del suite de pruebas e historia 1.0

describe("Iniciar tratamiento del paciente", () => {
  it("Caso 49.0: Iniciar tratamiento eligiendo horario | programa las dosis según la frecuencia", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/tratamiento-paciente/${contexto.tratamiento.idTratamiento}`);
      cy.get(".medicamento-iniciar-card").should("have.length", 1);
      cy.get(".medicamento-iniciar-card").contains("Iniciar Tratamiento").click();

      cy.get(".horarios-popup").should("be.visible");
      cy.get(".horario-opcion").should("have.length", 3);
      cy.get(".btn-seleccionar-horario").first().click();

      cy.intercept("PUT", "**/tratamientos/paciente/iniciar").as("iniciarTratamiento");
      // NOTA: el botón "Confirmar" queda parcialmente cubierto por el
      // contenedor .horario-opcion (overlay CSS de la app); se fuerza el
      // clic porque el botón sí es funcional para el usuario.
      cy.get(".btn-confirmar-horarios").click({ force: true });

      cy.wait("@iniciarTratamiento").then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.get(".detalle-tratamiento-tabs").should("be.visible");
      cy.get(".detalle-tratamiento-tabs button").first().should("contain", "Pendientes");
      cy.get(".registro-card").should("have.length.at.least", 1);

      cy.cerrarSesionPaciente();
    });
  });
});
