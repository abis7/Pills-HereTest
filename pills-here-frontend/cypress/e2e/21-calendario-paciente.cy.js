// Área funcional: CALENDARIO DE MEDICACIÓN DEL PACIENTE

describe("Calendario de medicación", () => {
  it("Calendario con tratamientos | muestra las barras de los días con medicación", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit("/calendario-paciente");
      cy.get(".calendario-paciente-header h1").should("contain", "Calendario de Medicación");
      // NOTA: FullCalendar renderiza con clases con hash
      // por lo que no existe la clase .fc; se valida el wrapper estable.
      cy.get(".calendario-wrapper", { timeout: 15000 }).should("be.visible");
      cy.get(".barra-tratamiento-calendario", { timeout: 10000 }).should("have.length.at.least", 1);

      cy.cerrarSesionPaciente();
    });
  });

  it("Calendario sin tratamientos | muestra el calendario vacío", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.visit("/calendario-paciente");
        // NOTA: se valida el wrapper estable (FullCalendar usa clases hash).
        cy.get(".calendario-wrapper", { timeout: 15000 }).should("be.visible");
        cy.get(".barra-tratamiento-calendario").should("have.length", 0);

        cy.cerrarSesionPaciente();
      });
    });
  });
});
