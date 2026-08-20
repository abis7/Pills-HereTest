// Área funcional: REGISTRAR MÉDICO
// Casos 7.0 - 12.0 del suite de pruebas e historia 16.0
//
// Setup: se registra un médico base por API y se inicia sesión con él;
// la acción se ejecuta sobre el formulario de registro (/register).
// NOTA: los mensajes de error del backend se muestran en .register-error.

// Cédula profesional única de 8 dígitos (evita colisiones con datos
// de corridas anteriores en la base de datos).
const cedulaUnica = () =>
  `${String(Date.now()).slice(-6)}${String(Math.floor(Math.random() * 90) + 10)}`;

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
    cy.datosPrueba("MEDICO").then((datosBase) => {
      cy.registrarMedicoApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: registro de un nuevo médico desde la UI
        cy.datosPrueba("MEDICO").then((datos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Medico").click();
          llenarFormularioMedico(datos, cedulaUnica());
          cy.get(".create-account-button").click();

          cy.get(".register-success", { timeout: 10000 }).should("be.visible");

          // Se espera a que la app ejecute su redirección (ocurre ~1.5s
          // después del éxito) y se captura la URL para validarla al final
          // contra el requisito.
          let urlTrasRegistro = null;
          cy.location("pathname", { timeout: 10000 })
            .should("satisfy", (path) => path !== "/register")
            .then((path) => {
              urlTrasRegistro = `${Cypress.config("baseUrl")}${path}`;
            });

          // Evidencia: pantalla a la que la app redirige tras el registro
          cy.screenshot("evidencia/02-caso-7-redireccion-post-registro");

          // Cerrar sesión (sesión del médico base)
          cy.cerrarSesionMedico();

          // La cuenta recién creada debe poder iniciar sesión
          cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
            expect(respuesta.body.success).to.eq(true);
          });
          cy.url().should("include", "/inicio-medico");
          cy.cerrarSesionMedico();

          cy.then(() => {
            // FALLA POR CÓDIGO DE LA APP:
            // El requisito (historia 16.0 escenario 1 / caso 7.0 del suite)
            // indica que tras el registro el médico debe ser redirigido a la
            // pantalla de inicio de sesión. La app redirige a /inicio-medico
            // y además no inicia sesión (no guarda nada en localStorage).
            expect(urlTrasRegistro).to.eq(`${Cypress.config("baseUrl")}/`);
          });
        });
      });
    });
  });

  it("Caso 8.0: Registro con correo duplicado | muestra que el correo ya está registrado", () => {
    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: intentar registrar de nuevo el mismo correo
        cy.visit("/register");
        cy.get(".role-option").contains("Medico").click();
        llenarFormularioMedico(datos, cedulaUnica());
        cy.get(".create-account-button").click();

        // Validación
        cy.get(".register-error", { timeout: 10000 })
          .should("be.visible")
          .and("contain", "El correo ya está registrado");

        // Cerrar sesión
        cy.cerrarSesionMedico();
      });
    });
  });

  it("Caso 9.0: Registro con cédula duplicada | muestra que la cédula ya está registrada", () => {
    const cedula = cedulaUnica();

    cy.datosPrueba("MEDICO").then((datos) => {
      cy.registrarMedicoApi({ ...datos, cedulaProfesional: cedula }).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: registrar otro médico con la misma cédula
        cy.datosPrueba("MEDICO").then((nuevosDatos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Medico").click();
          llenarFormularioMedico(nuevosDatos, cedula);
          cy.get(".create-account-button").click();

          // Validación
          cy.get(".register-error", { timeout: 10000 })
            .should("be.visible")
            .and("contain", "La cédula profesional ya está registrada");

          // Cerrar sesión
          cy.cerrarSesionMedico();
        });
      });
    });
  });

  it("Caso 10.0: Registro con fecha de nacimiento vacía | muestra error de fecha", () => {
    cy.datosPrueba("MEDICO").then((datosBase) => {
      cy.registrarMedicoApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: envío sin fecha de nacimiento
        cy.datosPrueba("MEDICO").then((datos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Medico").click();
          llenarFormularioMedico(datos, cedulaUnica());
          cy.get('input[name="fechaNacimiento"]').clear();
          cy.get(".create-account-button").click();

          // Validación
          cy.get(".field-error").should("contain", "La fecha de nacimiento es obligatoria");
          cy.url().should("include", "/register");

          // Cerrar sesión
          cy.cerrarSesionMedico();
        });
      });
    });
  });

  it("Caso 11.0: Cédula con letras y contraseña corta | valida la cédula numérica y la longitud", () => {
    cy.datosPrueba("MEDICO").then((datosBase) => {
      cy.registrarMedicoApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: cédula con letras y contraseña corta
        cy.datosPrueba("MEDICO").then((datos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Medico").click();
          llenarFormularioMedico(datos, "abc123");
          cy.get('input[name="contrasena"]').clear().type("123");
          cy.get(".create-account-button").click();

          // Validación
          cy.get('input[name="cedulaProfesional"]').invoke("val").then((valor) => {
            expect(valor).to.not.match(/[a-zA-Z]/);
          });
          cy.get(".field-error").should("contain", "La contraseña debe tener al menos 6 caracteres");

          // Cerrar sesión
          cy.cerrarSesionMedico();
        });
      });
    });
  });

  it("Caso 12.0: Redirección tras registro exitoso | lleva a la pantalla de inicio de sesión", () => {
    cy.datosPrueba("MEDICO").then((datosBase) => {
      cy.registrarMedicoApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: registro exitoso de un médico nuevo
        cy.datosPrueba("MEDICO").then((datos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Medico").click();
          llenarFormularioMedico(datos, cedulaUnica());
          cy.get(".create-account-button").click();

          cy.get(".register-success", { timeout: 10000 }).should("be.visible");

          // Se espera a que la app ejecute su redirección y se captura la URL.
          let urlTrasRegistro = null;
          cy.location("pathname", { timeout: 10000 })
            .should("satisfy", (path) => path !== "/register")
            .then((path) => {
              urlTrasRegistro = `${Cypress.config("baseUrl")}${path}`;
            });

          // Evidencia: pantalla a la que la app redirige tras el registro
          cy.screenshot("evidencia/02-caso-12-redireccion-post-registro");

          // Cerrar sesión
          cy.cerrarSesionMedico();

          // La cuenta nueva debe poder iniciar sesión
          cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
          });
          cy.cerrarSesionMedico();

          cy.then(() => {
            // FALLA POR CÓDIGO DE LA APP:
            // El requisito (caso 12.0 del suite) pide redirigir a la
            // pantalla principal solicitando iniciar sesión. La app
            // redirige a /inicio-medico sin crear sesión.
            expect(urlTrasRegistro).to.eq(`${Cypress.config("baseUrl")}/`);
          });
        });
      });
    });
  });
});
