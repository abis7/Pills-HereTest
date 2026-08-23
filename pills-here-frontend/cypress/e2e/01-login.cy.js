// Área funcional: INICIAR SESIÓN
// Casos 1.0 - 6.0 del suite de pruebas y historias 2.0, 6.0 y 8.0
//
// Estructura de cada prueba: inicio de sesión, acción, cerrar sesión.
// En las pruebas negativas no llega a crearse una sesión, por lo que el
// "cierre" se valida confirmando que no quedó sesión activa (localStorage
// vacío) y que la app permanece en la pantalla de login.

describe("Iniciar sesión", () => {
  it("Caso 1.0: Login exitoso de un médico | redirige al panel del médico", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
          expect(respuesta.body.success).to.eq(true);
          expect(respuesta.body.rol).to.eq("MEDICO");
        });
        cy.url().should("include", "/inicio-medico");
        cy.window().then((win) => {
          expect(win.localStorage.getItem("idUsuario")).to.not.be.null;
          expect(win.localStorage.getItem("idMedico")).to.not.be.null;
        });
        cy.get(".inicio-medico-page").should("be.visible");

        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 2.0: Login exitoso de un paciente | redirige al panel del paciente", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
          expect(respuesta.body.success).to.eq(true);
          expect(respuesta.body.rol).to.eq("PACIENTE");
        });
        cy.url().should("include", "/inicio-paciente");
        cy.window().then((win) => {
          expect(win.localStorage.getItem("idUsuario")).to.not.be.null;
          expect(win.localStorage.getItem("idPaciente")).to.not.be.null;
        });
        cy.get(".inicio-paciente-page").should("be.visible");

        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Caso 3.0: Login con correo inexistente | muestra usuario no encontrado y no abre sesión", () => {
    const correoInexistente = `test.inexistente.${Date.now()}@test.com`;

    cy.visit("/");
    cy.get("form.login-form input[type=email]").type(correoInexistente);
    cy.get("form.login-form input[type=password]").type("Prueba123!");
    cy.intercept("POST", "**/auth/login").as("loginUI");
    cy.get("form.login-form button[type=submit]").click();

    // Validación
    // NOTA: el backend responde HTTP 400 (badRequest) con el DTO de login
    // cuando las credenciales son inválidas; la UI muestra el mensaje
    // devuelto en el body (mensaje) dentro de .error-text.global-error.
    cy.wait("@loginUI").then((interception) => {
      expect(interception.response.statusCode).to.eq(400);
      expect(interception.response.body.success).to.eq(false);
      expect(interception.response.body.mensaje).to.eq("Usuario no encontrado");
    });

    cy.get(".error-text.global-error").should("be.visible").and("contain", "Usuario no encontrado");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    // Evidencia: el mensaje de error se muestra y no se abre sesión
    cy.screenshot("pruebas/01-login -- Caso 3.0 login correo inexistente");

    // Cierre (prueba negativa): no quedó sesión activa y seguimos en login
    cy.window().then((win) => {
      expect(win.localStorage.getItem("idUsuario")).to.be.null;
      expect(win.localStorage.getItem("rol")).to.be.null;
    });
    cy.get(".login-container").should("be.visible");
  });

  it("Caso 4.0: Login con contraseña incorrecta | muestra contraseña incorrecta y no abre sesión", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Acción: intento de inicio de sesión con contraseña incorrecta
        cy.visit("/");
        cy.get("form.login-form input[type=email]").type(datos.correo);
        cy.get("form.login-form input[type=password]").type("ContrasenaMala123!");
        cy.intercept("POST", "**/auth/login").as("loginUI");
        cy.get("form.login-form button[type=submit]").click();

        // Validación
        cy.wait("@loginUI").then((interception) => {
          expect(interception.response.statusCode).to.eq(400);
          expect(interception.response.body.success).to.eq(false);
          expect(interception.response.body.mensaje).to.eq("Contraseña incorrecta");
        });

        cy.get(".error-text.global-error").should("be.visible").and("contain", "Contraseña incorrecta");
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
        // Evidencia: el mensaje de error se muestra y no se abre sesión
        cy.screenshot("pruebas/01-login -- Caso 4.0 login contrasena incorrecta");

        cy.window().then((win) => {
          expect(win.localStorage.getItem("idUsuario")).to.be.null;
        });
        cy.get(".login-container").should("be.visible");
      });
    });
  });

  it("Caso 5.0: Login con campos vacíos | muestra campos obligatorios y no envía la petición", () => {
    // Acción: envío del formulario vacío
    cy.visit("/");
    cy.intercept("POST", "**/auth/login").as("loginUI");
    cy.get("form.login-form button[type=submit]").click();

    // Validación
    cy.get(".error-text").eq(0).should("contain", "El correo es obligatorio");
    cy.get(".error-text").eq(1).should("contain", "La contraseña es obligatoria");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
    // Evidencia: los mensajes de campo obligatorio se muestran
    cy.screenshot("pruebas/01-login -- Caso 5.0 login campos vacios");

    // Cierre (prueba negativa): no quedó sesión activa y seguimos en login
    cy.window().then((win) => {
      expect(win.localStorage.getItem("idUsuario")).to.be.null;
    });
    cy.get(".login-container").should("be.visible");
  });


});
