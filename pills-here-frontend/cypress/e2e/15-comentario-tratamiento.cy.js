// Área funcional: AGREGAR COMENTARIO
// Caso 48.0 del suite de pruebas
//
// Estructura de cada prueba: inicio de sesión -> acción -> cerrar sesión.

describe("Comentario en tratamiento", () => {
  it("Caso 48.0: Agregar una nota o comentario al tratamiento | se guarda y queda visible", () => {
    cy.contextoTratamiento().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: buscar la opción de agregar comentario en el detalle
      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      // Evidencia: no existe UI de comentarios en el detalle
      cy.screenshot("evidencia/15-caso-48-sin-ui-comentarios");

      let uiComentarioVisible = false;
      cy.get("body", { timeout: 5000 }).then(($body) => {
        uiComentarioVisible =
          $body.text().includes("Agregar comentario") ||
          $body.find(".medico-tratamiento-card textarea").length > 0;
      });

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // No existe UI para agregar comentarios al tratamiento en la
        // vista de detalle del paciente: las funciones de comentarios
        // están definidas en el código pero nunca se renderizan
        // (requisito caso 48.0 del suite).
        expect(uiComentarioVisible).to.eq(true);
      });
    });
  });
});
