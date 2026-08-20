// Área funcional: NOTAS DEL MÉDICO (VISTA DEL PACIENTE)

describe("Notas del médico para el paciente", () => {
  it("Notas sin avisos | muestra el mensaje de que no hay notas recientes", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.visit("/notas-paciente");
        cy.get(".notas-vacio").should("be.visible");
        cy.get(".nota-card").should("have.length", 0);

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Notas con avisos del médico | muestra la lista de notas", () => {
    cy.contextoMedicoPaciente().then((contexto) => {
      cy.crearAvisoApi({
        idMedico: contexto.medico.idMedico,
        idPaciente: contexto.paciente.idPaciente,
        titulo: "Primera nota",
        contenido: "Contenido de la primera nota",
        observaciones: "",
      });
      cy.crearAvisoApi({
        idMedico: contexto.medico.idMedico,
        idPaciente: contexto.paciente.idPaciente,
        titulo: "Segunda nota",
        contenido: "Contenido de la segunda nota",
        observaciones: "",
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/notas-paciente");
      cy.get(".nota-card").should("have.length", 2);
      cy.get(".nota-card").first().should("contain", "Segunda nota");

      cy.cerrarSesionPaciente();
    });
  });
});
