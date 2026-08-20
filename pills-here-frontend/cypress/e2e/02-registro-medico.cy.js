// Área funcional: REGISTRAR MÉDICO
// Casos 7.0 - 12.0 del suite de pruebas e historia 16.0

const llenarFormularioMedico = (datos, cedula) => {
  cy.get('input[name="nombre"]').type(datos.nombre);
  cy.get('input[name="apellidoPaterno"]').type(datos.apellidoPaterno);
  cy.get('input[name="apellidoMaterno"]').type(datos.apellidoMaterno);
  cy.get('input[name="fechaNacimiento"]').type(datos.fechaNacimiento);
  cy.get('select[name="sexo"]').select(datos.sexo);
  cy.get('input[name="cedulaProfesional"]').type(cedula);
  cy.get('select[name="especialidad"]').select("Cardiología");
  cy.get('input[name="consultorio"]').type("A-101");
  cy.get('input[name="correo"]').type(datos.correo);
  cy.get('input[name="contrasena"]').type(datos.contrasena);
};

describe("Registro de médico", () => {
  it("Caso 7.0: Registro exitoso de un médico | crea la cuenta y permite iniciar sesión", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      const cedula = String(Date.now()).slice(-8);

      cy.visit("/register");
      cy.get(".role-option").contains("Medico").click();
      llenarFormularioMedico(datos, cedula);
      cy.get(".create-account-button").click();

      cy.get(".register-success", { timeout: 10000 }).should("be.visible");
      cy.url().should("include", "/inicio-medico", { timeout: 10000 });

      cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
        expect(respuesta.body.success).to.eq(true);
      });
      cy.url().should("include", "/inicio-medico");

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 8.0: Registro con correo duplicado | muestra que el correo ya está registrado", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        cy.visit("/register");
        cy.get(".role-option").contains("Medico").click();
        llenarFormularioMedico(datos, String(Date.now()).slice(-8));
        cy.get(".create-account-button").click();

        cy.get(".register-error", { timeout: 10000 })
          .should("be.visible")
          .and("contain", "El correo ya está registrado");

        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 9.0: Registro con cédula duplicada | muestra que la cédula ya está registrada", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      const cedula = String(Date.now()).slice(-8);
      cy.registrarMedicoApi({ ...datos, cedulaProfesional: cedula }).then(() => {
        cy.datosPrueba("MEDICO").then((nuevosDatos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Medico").click();
          llenarFormularioMedico(nuevosDatos, cedula);
          cy.get(".create-account-button").click();

          cy.get(".register-error", { timeout: 10000 })
            .should("be.visible")
            .and("contain", "La cédula profesional ya está registrada");

          cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
          });
          cy.cerrarSesionMedico();
        });
      });
    });
  });

  it("Caso 10.0: Registro con fecha de nacimiento inválida o vacía | muestra error de fecha", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.visit("/register");
      cy.get(".role-option").contains("Medico").click();
      llenarFormularioMedico(datos, String(Date.now()).slice(-8));
      cy.get('input[name="fechaNacimiento"]').clear();
      cy.get(".create-account-button").click();

      cy.get(".field-error").should("contain", "La fecha de nacimiento es obligatoria");
      cy.url().should("include", "/register");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("idUsuario")).to.be.null;
      });
    });
  });

  it("Caso 11.0: Cédula con letras y contraseña corta | valida la cédula numérica y la longitud", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.visit("/register");
      cy.get(".role-option").contains("Medico").click();
      llenarFormularioMedico(datos, "abc123");
      cy.get('input[name="contrasena"]').clear().type("123");
      cy.get(".create-account-button").click();

      cy.get('input[name="cedulaProfesional"]').invoke("val").then((valor) => {
        expect(valor).to.not.match(/[a-zA-Z]/);
      });
      cy.get(".field-error").should("contain", "La contraseña debe tener al menos 6 caracteres");

      cy.window().then((win) => {
        expect(win.localStorage.getItem("idUsuario")).to.be.null;
      });
    });
  });

  it("Caso 12.0: Redirección tras registro exitoso | lleva al inicio del médico", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.visit("/register");
      cy.get(".role-option").contains("Medico").click();
      llenarFormularioMedico(datos, String(Date.now()).slice(-8));
      cy.get(".create-account-button").click();

      cy.get(".register-success", { timeout: 10000 }).should("be.visible");
      cy.url().should("include", "/inicio-medico", { timeout: 10000 });
      cy.get(".inicio-medico-page").should("be.visible");

      cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.cerrarSesionMedico();
    });
  });
});
