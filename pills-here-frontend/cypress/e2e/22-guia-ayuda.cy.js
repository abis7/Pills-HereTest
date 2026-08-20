// Área funcional: GUÍA DE USO
// Historias 6.0 y 14.0
//
// NOTA GENERAL: la guía de uso NO está implementada en la app. Existen
// botones de ayuda (.btn-ayuda-paciente y .btn-ayuda) pero NO tienen
// onClick, no abren ningún modal y no existe la condición de mostrarse
// automáticamente en el primer inicio de sesión. Por eso las pruebas
// 1, 3, 4 y 6 de esta área fallan por código de la app; la prueba 2 y 5
// pasan solo porque la guía no existe (documentan la ausencia).

describe("Guía de uso del sistema", () => {
  it("Historia 6.0 escenario 1: Primer inicio de sesión del paciente | muestra la guía automáticamente", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        // Inicio de sesión (primera vez)
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        // Acción / validación: la guía debería mostrarse automáticamente
        // Evidencia: no hay guía de uso en el primer inicio de sesión
        cy.screenshot("evidencia/22-h6-1-sin-guia-primer-login-paciente");

        let guiaVisible = false;
        cy.get("body", { timeout: 5000 }).then(($body) => {
          guiaVisible = $body.text().includes("Guía de uso");
        });

        // Cerrar sesión
        cy.cerrarSesionPaciente();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // La guía de uso no está implementada: no se muestra de forma
          // automática en el primer inicio de sesión
          // (requisito historia 6.0 escenario 1).
          expect(guiaVisible).to.eq(true);
        });
      });
    });
  });

  it("Historia 6.0 escenario 2: Inicios de sesión subsecuentes | no muestra la guía automáticamente", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        // Inicio de sesión (una vez previa simulada por el registro por API)
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        // Acción / validación: en inicios subsecuentes no debe abrirse sola
        cy.get("body", { timeout: 5000 }).then(($body) => {
          // NOTA: pasa solo porque la guía NO existe en la app; no hay
          // bandera de "guía vista" en localStorage (requisito historia
          // 6.0 escenario 2 no implementado).
          expect($body.text()).to.not.include("Guía de uso");
        });

        // Cerrar sesión
        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Historia 6.0 escenario 3: Consultar la guía desde el menú | abre la guía de uso", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-paciente");

        // Acción: clic en el botón de ayuda
        cy.get(".btn-ayuda-paciente").click();
        // Evidencia: el botón no abre ninguna guía
        cy.screenshot("evidencia/22-h6-3-ayuda-paciente-sin-guia");

        let guiaVisible = false;
        cy.get("body", { timeout: 5000 }).then(($body) => {
          guiaVisible = $body.text().includes("Guía de uso");
        });

        // Cerrar sesión
        cy.cerrarSesionPaciente();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // El botón .btn-ayuda-paciente no tiene onClick y no abre
          // ninguna guía (requisito historia 6.0 escenario 3).
          expect(guiaVisible).to.eq(true);
        });
      });
    });
  });

  it("Historia 14.0 escenario 1: Consultar la guía desde el menú del médico | muestra la ayuda", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        // Acción: clic en el botón de ayuda
        cy.get(".btn-ayuda").click();
        // Evidencia: el botón no abre ninguna guía
        cy.screenshot("evidencia/22-h14-1-ayuda-medico-sin-guia");

        let guiaVisible = false;
        cy.get("body", { timeout: 5000 }).then(($body) => {
          guiaVisible = $body.text().includes("Guía de uso");
        });

        // Cerrar sesión
        cy.cerrarSesionMedico();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // El botón .btn-ayuda no tiene onClick y no abre ninguna guía
          // (requisito historia 14.0 escenario 1).
          expect(guiaVisible).to.eq(true);
        });
      });
    });
  });

  it("Historia 14.0 escenario 2: Primer inicio de sesión del médico | muestra la guía automáticamente", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Inicio de sesión (primera vez)
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        // Acción / validación: la guía debería mostrarse automáticamente
        // Evidencia: no hay guía de uso en el primer inicio de sesión
        cy.screenshot("evidencia/22-h14-2-sin-guia-primer-login-medico");

        let guiaVisible = false;
        cy.get("body", { timeout: 5000 }).then(($body) => {
          guiaVisible = $body.text().includes("Guía de uso");
        });

        // Cerrar sesión
        cy.cerrarSesionMedico();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // La guía de uso no está implementada: no se muestra de forma
          // automática en el primer inicio de sesión del médico
          // (requisito historia 14.0 escenario 2).
          expect(guiaVisible).to.eq(true);
        });
      });
    });
  });

  it("Historia 14.0 escenario 3: Inicios de sesión posteriores del médico | no muestra la guía", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.url().should("include", "/inicio-medico");

        // Acción / validación: en inicios posteriores no debe abrirse sola
        cy.get("body", { timeout: 5000 }).then(($body) => {
          // NOTA: pasa solo porque la guía NO existe en la app (requisito
          // historia 14.0 escenario 3 no implementado).
          expect($body.text()).to.not.include("Guía de uso");
        });

        // Cerrar sesión
        cy.cerrarSesionMedico();
      });
    });
  });
});
