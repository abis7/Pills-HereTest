// Área funcional: HISTORIAL CLÍNICO DEL PACIENTE
// Casos 27.0 - 28.0 y 47.0 del suite de pruebas

describe("Historial clínico", () => {
  it("Caso 27.0: Historial clínico con registros | muestra tratamientos ordenados por fecha", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/historial-clinico/${contexto.paciente.idPaciente}`);
      cy.get(".historial-info").should("contain", "Test Prueba Auto");
      cy.get(".historial-info").should("contain", contexto.paciente.codigoPaciente);
      cy.get(".historial-row").should("have.length.at.least", 1);
      cy.get(".historial-row").first().should("contain", "Diagnóstico de prueba");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 28.0: Historial de paciente inexistente | muestra página no encontrada", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: intentar ver el historial de un paciente inexistente
        cy.visit("/historial-clinico/999999");
        // Evidencia: la app muestra un error genérico, no "no encontrado"
        cy.screenshot("evidencia/07-caso-28-error-generico-historial");

        let mensajeVisible = false;
        let textoMostrado = "";
        cy.get("body", { timeout: 5000 }).then(($body) => {
          textoMostrado = $body.text().replace(/\s+/g, " ").trim();
          mensajeVisible = textoMostrado.includes("No se encontró el paciente");
        });

        // Cerrar sesión
        cy.cerrarSesionMedico();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // Para un paciente inexistente el backend lanza una excepción y
          // la vista muestra el error genérico "No se pudo cargar la
          // información del paciente." en lugar de un mensaje de página
          // no encontrada (requisito caso 28.0 del suite).
          expect(mensajeVisible).to.eq(true);
        });
      });
    });
  });

  it("Caso 47.0: Historial completo | muestra tratamientos activos, finalizados y cancelados", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.crearTratamientoApi({
        idPaciente: contexto.paciente.idPaciente,
        idMedico: contexto.medico.idMedico,
        diagnostico: "Segundo diagnóstico",
        recomendaciones: "Reposo",
        medicamentos: [
          { idMedicamento: 2, dosis: "1 cápsula", intervaloHoras: 12, duracionDias: 5 },
        ],
      }).then(() => {
        cy.crearTratamientoApi({
          idPaciente: contexto.paciente.idPaciente,
          idMedico: contexto.medico.idMedico,
          diagnostico: "Tratamiento a cancelar",
          recomendaciones: "Ninguna",
          medicamentos: [
            { idMedicamento: 3, dosis: "1 tableta", intervaloHoras: 24, duracionDias: 3 },
          ],
        }).then(() => {
          cy.request({
            method: "GET",
            url: `http://localhost:8083/tratamientos/paciente/${contexto.paciente.idPaciente}/todos`,
          }).then((respLista) => {
            const lista = Array.isArray(respLista.body) ? respLista.body : [respLista.body];
            const ultimo = lista[lista.length - 1];

            cy.request({
              method: "PUT",
              url: `http://localhost:8083/tratamientos/${ultimo.idTratamiento}/cancelar`,
              failOnStatusCode: false,
            }).then((respCancelar) => {
              expect(respCancelar.status).to.eq(200);
            });
          });
        });
      });

      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/historial-clinico/${contexto.paciente.idPaciente}`);
      cy.get(".historial-row").should("have.length", 3);
      cy.get(".historial-row").should("contain", "ACTIVO");
      cy.get(".historial-row").should("contain", "CANCELADO");

      cy.cerrarSesionMedico();
    });
  });
});
