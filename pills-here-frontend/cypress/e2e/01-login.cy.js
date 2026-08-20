// Área funcional: INICIAR SESIÓN
// Casos 1.0 - 6.0 del suite de pruebas y historias 2.0 y 8.0

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

    cy.wait("@loginUI").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.success).to.eq(false);
    });

    cy.get(".error-text.global-error").should("be.visible").and("contain", "Usuario no encontrado");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("idUsuario")).to.be.null;
      expect(win.localStorage.getItem("rol")).to.be.null;
    });
  });

  it("Caso 4.0: Login con contraseña incorrecta | muestra contraseña incorrecta y no abre sesión", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.visit("/");
        cy.get("form.login-form input[type=email]").type(datos.correo);
        cy.get("form.login-form input[type=password]").type("ContrasenaMala123!");
        cy.intercept("POST", "**/auth/login").as("loginUI");
        cy.get("form.login-form button[type=submit]").click();

        cy.wait("@loginUI").then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body.success).to.eq(false);
        });

        cy.get(".error-text.global-error").should("be.visible").and("contain", "Contraseña incorrecta");
        cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

        cy.window().then((win) => {
          expect(win.localStorage.getItem("idUsuario")).to.be.null;
        });
      });
    });
  });

  it("Caso 5.0: Login con campos vacíos | muestra campos obligatorios y no envía la petición", () => {
    cy.visit("/");
    cy.intercept("POST", "**/auth/login").as("loginUI");
    cy.get("form.login-form button[type=submit]").click();

    cy.get(".error-text").eq(0).should("contain", "El correo es obligatorio");
    cy.get(".error-text").eq(1).should("contain", "La contraseña es obligatoria");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("idUsuario")).to.be.null;
    });
  });

  it("Caso 6.0: Formato de correo inválido y contraseña corta | muestra alertas de validación", () => {
    cy.visit("/");
    cy.get("form.login-form input[type=email]").type("correo-sin-arroba");
    cy.get("form.login-form input[type=password]").type("123");
    cy.get("form.login-form button[type=submit]").click();

    cy.get(".error-text").eq(0).should("contain", "Ingresa un correo válido");
    cy.get(".error-text").eq(1).should("contain", "Debe tener al menos 6 caracteres");
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

    cy.window().then((win) => {
      expect(win.localStorage.getItem("idUsuario")).to.be.null;
    });
  });
});
