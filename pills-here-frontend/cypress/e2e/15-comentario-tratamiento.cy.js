// Área funcional: AGREGAR COMENTARIO
// Caso 48.0 del suite de pruebas

describe("Comentario en tratamiento", () => {
  it("Caso 48.0: Agregar una nota o comentario al tratamiento | se guarda y queda visible", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.contains("Agregar comentario").should("be.visible");

      cy.get(".medico-tratamiento-card textarea, .detalle-tratamientos-panel textarea").type("Revisar tolerancia al medicamento");
      cy.contains("Agregar comentario").click();

      cy.get(".medico-tratamiento-card").should("contain", "Revisar tolerancia al medicamento");

      cy.cerrarSesionMedico();
    });
  });
});
