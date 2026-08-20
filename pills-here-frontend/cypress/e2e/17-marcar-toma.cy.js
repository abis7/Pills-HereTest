// Área funcional: MARCAR TOMA COMO TOMADA
// Casos 50.0 - 52.0 e historia 1.0

describe("Marcar dosis como tomada", () => {
  it("Caso 50.0: Marcar una dosis pendiente como tomada | la registra y prepara la siguiente", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        const idDosis = respDetalle.body.medicamentos[0].idDosis;
        cy.iniciarTratamientoApi([{ idDosis, horaInicioPaciente: "23:00:00" }]).then((respInicio) => {
          expect(respInicio.status).to.eq(200);
        });
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/tratamiento-paciente/${contexto.tratamiento.idTratamiento}`);
      cy.get(".registro-card", { timeout: 10000 }).should("have.length.at.least", 1);
      cy.get(".registro-card").first().find("button").should("contain", "Marcar como tomada");

      cy.intercept("PUT", "**/tratamientos/tomas/**/tomada").as("marcarTomada");
      cy.get(".registro-card").first().find("button").click();

      cy.wait("@marcarTomada").then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.get(".registro-card").first().find("button").should("be.disabled");

      cy.get(".detalle-tratamiento-tabs button").contains("Tomadas").click();
      cy.get(".registro-card").should("have.length.at.least", 1);

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 51.0: Marcar una dosis que ya fue tomada | bloquea la acción y evita duplicados", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        const idDosis = respDetalle.body.medicamentos[0].idDosis;
        cy.iniciarTratamientoApi([{ idDosis, horaInicioPaciente: "23:00:00" }]).then(() => {
          cy.obtenerTomasApi(contexto.tratamiento.idTratamiento).then((respTomas) => {
            const primera = respTomas.body.find((toma) => toma.estado === "PENDIENTE");
            cy.marcarTomadaApi(primera.idToma).then((respTomada) => {
              expect(respTomada.status).to.eq(200);
            });
          });
        });
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/tratamiento-paciente/${contexto.tratamiento.idTratamiento}`);
      cy.get(".detalle-tratamiento-tabs button").contains("Tomadas").click();
      cy.get(".registro-card").first().find("button.tomada").should("be.disabled");

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 52.0: Dosis vencidas | el sistema las marca automáticamente como omitidas", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        const idDosis = respDetalle.body.medicamentos[0].idDosis;
        const fechaProxima = new Date(Date.now() + 2 * 60 * 1000);
        const hora = `${String(fechaProxima.getHours()).padStart(2, "0")}:${String(
          fechaProxima.getMinutes()
        ).padStart(2, "0")}:00`;

        cy.iniciarTratamientoApi([{ idDosis, horaInicioPaciente: hora }]).then((respInicio) => {
          expect(respInicio.status).to.eq(200);
        });
      });

      cy.hacerLoginUI(contexto.paciente.correo, contexto.paciente.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.wait(3 * 60 * 1000);

      cy.visit(`/tratamiento-paciente/${contexto.tratamiento.idTratamiento}`);
      cy.get(".detalle-tratamiento-tabs button").contains("Omitidas").click();
      cy.get(".registro-card").should("have.length.at.least", 1);
      cy.get(".registro-card").first().find("button.omitida").should("be.disabled");

      cy.cerrarSesionPaciente();
    });
  });
});
