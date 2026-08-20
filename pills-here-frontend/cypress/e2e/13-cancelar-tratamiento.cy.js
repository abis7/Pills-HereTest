// Área funcional: CANCELAR TRATAMIENTO
// Casos 43.0 - 44.0 e historia 19.0

describe("Cancelar tratamiento", () => {
  it("Caso 43.0: Cancelar un tratamiento activo | confirma y lo remueve de la lista", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".medico-tratamiento-card").should("have.length", 1);

      cy.stubAlertas();
      cy.get(".medico-tratamiento-icon-btn").eq(1).click();

      cy.get("@confirm").should("be.calledWith", "¿Seguro que deseas cancelar este tratamiento?");
      cy.get("@alert").should("be.calledWith", "Tratamiento cancelado correctamente");
      cy.get(".medico-tratamiento-card").should("have.length", 0);

      cy.cerrarSesionMedico();
    });
  });

  it("Historia 19.0 escenario 2: Cancelar sin confirmar | el tratamiento permanece sin cambios", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".medico-tratamiento-card").should("have.length", 1);

      cy.window().then((win) => {
        cy.stub(win, "confirm").returns(false).as("confirm");
        cy.stub(win, "alert").as("alert");
      });
      cy.get(".medico-tratamiento-icon-btn").eq(1).click();

      cy.get("@confirm").should("be.called");
      cy.get("@alert").should("not.be.called");
      cy.get(".medico-tratamiento-card").should("have.length", 1);

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 44.0: Cancelar un tratamiento inexistente | muestra error de operación", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        cy.request({
          method: "PUT",
          url: "http://localhost:8083/tratamientos/999999/cancelar",
          failOnStatusCode: false,
        }).then((respuesta) => {
          expect(respuesta.status).to.be.gte(400);
        });

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Historia 19.0 escenario 3: Eliminar tratamiento con dosis registradas | conserva el historial estadístico", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        const idDosis = respDetalle.body.medicamentos[0].idDosis;
        const hora = "23:00:00";

        cy.iniciarTratamientoApi([{ idDosis, horaInicioPaciente: hora }]).then((respInicio) => {
          expect(respInicio.status).to.eq(200);
        });

        cy.obtenerTomasApi(contexto.tratamiento.idTratamiento).then((respTomas) => {
          const tomas = respTomas.body;
          const primera = tomas.find((toma) => toma.estado === "PENDIENTE");
          if (primera) {
            cy.marcarTomadaApi(primera.idToma).then((respTomada) => {
              expect(respTomada.status).to.eq(200);
            });
          }
        });
      });

      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.stubAlertas();
      cy.get(".medico-tratamiento-icon-btn").eq(1).click();
      cy.get("@alert").should("be.calledWith", "Tratamiento cancelado correctamente");
      cy.get(".medico-tratamiento-card").should("have.length", 0);

      cy.get(".detalle-leyenda-item").should("have.length", 3);

      cy.cerrarSesionMedico();
    });
  });
});
