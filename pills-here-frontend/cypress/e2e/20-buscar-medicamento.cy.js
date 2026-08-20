// Área funcional: BUSCAR MEDICAMENTOS
// Casos 56.0 - 57.0 del suite de pruebas

describe("Buscar medicamentos", () => {
  it("Caso 56.0: Buscar medicamento con coincidencias | muestra las opciones sugeridas", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/crear-tratamiento/${contexto.paciente.idPaciente}`);
      cy.get('input[name="busquedaMedicamento"]').type("para");
      cy.get(".crear-tratamiento-sugerencias", { timeout: 10000 }).should("be.visible");
      cy.get(".crear-tratamiento-sugerencias li").should("contain", "Paracetamol");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 57.0: Buscar medicamento sin resultados | no muestra sugerencias", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/crear-tratamiento/${contexto.paciente.idPaciente}`);
      cy.get('input[name="busquedaMedicamento"]').type("zzzzzz");
      cy.wait(2000);
      cy.get(".crear-tratamiento-sugerencias").should("not.exist");

      cy.cerrarSesionMedico();
    });
  });
});
