// Área funcional: TRATAMIENTO ACTIVO
// Casos 41.0 - 42.0 e historia 5.0

describe("Tratamiento activo", () => {
  it("Caso 41.0: Visualizar tratamiento activo | muestra medicamento, dosis, frecuencia y duración", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/tratamientos-paciente");
      cy.get(".tratamiento-paciente-card").should("have.length.at.least", 1);
      cy.get(".tratamiento-paciente-card").should("contain", "Diagnóstico de prueba");

      cy.get(".tratamiento-paciente-ver-btn").first().click();
      cy.url().should("include", `/tratamiento-paciente/${contexto.tratamiento.idTratamiento}`);
      cy.get(".detalle-tratamiento-datos").should("contain", "Diagnostico: Diagnóstico de prueba");
      cy.get(".detalle-tratamiento-resumen").should("contain", "Paracetamol");
      cy.get(".detalle-tratamiento-resumen").should("contain", "1 tableta");
      cy.get(".detalle-tratamiento-resumen").should("contain", "cada 8 horas por 7 dias");
      cy.get(".detalle-tratamiento-resumen").should("contain", "Tomar con agua");

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 42.0: Paciente sin tratamiento activo | muestra mensaje de que no hay tratamientos", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.visit("/tratamientos-paciente");
        cy.get(".tratamiento-paciente-card").should("have.length", 0);
        cy.contains("Aún no tienes tratamientos asignados").should("be.visible");

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Historia 5.0 escenario 3: Ver detalle de un tratamiento específico | muestra ese tratamiento", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.crearTratamientoApi({
        idPaciente: contexto.paciente.idPaciente,
        idMedico: contexto.medico.idMedico,
        diagnostico: "Segundo diagnóstico activo",
        recomendaciones: "Reposo",
        medicamentos: [
          { idMedicamento: 2, dosis: "1 cápsula", intervaloHoras: 12, duracionDias: 5 },
        ],
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/tratamientos-paciente");
      cy.get(".tratamiento-paciente-card").should("have.length", 2);

      cy.get(".tratamiento-paciente-card")
        .contains("Segundo diagnóstico activo")
        .parents(".tratamiento-paciente-card")
        .find(".tratamiento-paciente-ver-btn")
        .click();

      cy.get(".detalle-tratamiento-datos").should("contain", "Segundo diagnóstico activo");

      cy.cerrarSesionPaciente();
    });
  });
});
