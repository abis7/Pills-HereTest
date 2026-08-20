// Área funcional: REGISTRAR PACIENTE
// Casos 13.0 - 16.0 del suite de pruebas e historia 3.0
//
// Setup: se registra un paciente base por API y se inicia sesión con él;
// la acción se ejecuta sobre el formulario de registro (/register).
// NOTA: el formulario de paciente NO renderiza .register-success; el éxito
// se valida con la redirección a /inicio-paciente y el código único
// guardado en localStorage (requisito casos 13.0 y 16.0).

const llenarFormularioPaciente = (datos) => {
  cy.get('input[name="nombre"]').type(datos.nombre);
  cy.get('input[name="apellidoPaterno"]').type(datos.apellidoPaterno);
  cy.get('input[name="apellidoMaterno"]').type(datos.apellidoMaterno);
  cy.get('input[name="fechaNacimiento"]').type(datos.fechaNacimiento);
  cy.get('select[name="sexo"]').select(datos.sexo);
  cy.get('select[name="tipoSangre"]').select("O+");
  cy.get('input[name="alergias"]').type("Penicilina");
  cy.get('input[name="correo"]').type(datos.correo);
  cy.get('input[name="contrasena"]').type(datos.contrasena);
};

describe("Registro de paciente", () => {
  it("Caso 13.0: Registro exitoso de un paciente | crea la cuenta y genera código único", () => {
    cy.datosPrueba("PACIENTE").then((datosBase) => {
      cy.registrarPacienteApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: registro de un paciente nuevo desde la UI
        cy.datosPrueba("PACIENTE").then((datos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Paciente").click();
          llenarFormularioPaciente(datos);
          cy.get(".create-account-button").click();

          // Validación: redirección al panel del paciente y código único
          cy.url().should("include", "/inicio-paciente", { timeout: 10000 });
          cy.window().then((win) => {
            expect(win.localStorage.getItem("codigoPaciente")).to.not.be.null;
          });

          // La cuenta recién creada debe poder iniciar sesión
          cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
            expect(respuesta.body.rol).to.eq("PACIENTE");
          });
          cy.url().should("include", "/inicio-paciente");

          // Cerrar sesión
          cy.cerrarSesionPaciente();
        });
      });
    });
  });

  it("Caso 14.0: Registro con correo duplicado | muestra que el correo ya está registrado", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: intentar registrar de nuevo el mismo correo
        cy.visit("/register");
        cy.get(".role-option").contains("Paciente").click();
        llenarFormularioPaciente(datos);
        cy.get(".create-account-button").click();

        // Validación
        cy.get(".register-error", { timeout: 10000 })
          .should("be.visible")
          .and("contain", "El correo ya está registrado");

        // Cerrar sesión
        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Caso 15.0: Códigos únicos | dos pacientes registrados obtienen códigos diferentes", () => {
    cy.datosPrueba("PACIENTE").then((datosBase) => {
      cy.registrarPacienteApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: registrar dos pacientes y comparar sus códigos
        let codigo1 = null;
        let codigo2 = null;

        cy.datosPrueba("PACIENTE").then((datos1) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Paciente").click();
          llenarFormularioPaciente(datos1);
          cy.get(".create-account-button").click();
          cy.url().should("include", "/inicio-paciente", { timeout: 10000 });

          cy.window().then((win) => {
            codigo1 = win.localStorage.getItem("codigoPaciente");
            expect(codigo1).to.not.be.null;
          });

          cy.datosPrueba("PACIENTE").then((datos2) => {
            cy.visit("/register");
            cy.get(".role-option").contains("Paciente").click();
            llenarFormularioPaciente(datos2);
            cy.get(".create-account-button").click();
            cy.url().should("include", "/inicio-paciente", { timeout: 10000 });

            cy.window().then((win) => {
              codigo2 = win.localStorage.getItem("codigoPaciente");
              expect(codigo2).to.not.be.null;
            });

            // La cuenta nueva debe poder iniciar sesión
            cy.hacerLoginUI(datos2.correo, datos2.contrasena).then((respuesta) => {
              expect(respuesta.status).to.eq(200);
            });

            // Cerrar sesión
            cy.cerrarSesionPaciente();

            cy.then(() => {
              expect(codigo1).to.not.eq(codigo2);
            });
          });
        });
      });
    });
  });

  it("Caso 16.0: Redirección tras registro exitoso de paciente | lleva al inicio del paciente", () => {
    cy.datosPrueba("PACIENTE").then((datosBase) => {
      cy.registrarPacienteApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: registro exitoso de un paciente nuevo
        cy.datosPrueba("PACIENTE").then((datos) => {
          cy.visit("/register");
          cy.get(".role-option").contains("Paciente").click();
          llenarFormularioPaciente(datos);
          cy.get(".create-account-button").click();

          // Validación: redirección directa a su pantalla principal
          cy.url().should("include", "/inicio-paciente", { timeout: 10000 });
          cy.get(".inicio-paciente-page").should("be.visible");

          // La cuenta nueva debe poder iniciar sesión
          cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
            expect(respuesta.status).to.eq(200);
          });

          // Cerrar sesión
          cy.cerrarSesionPaciente();
        });
      });
    });
  });

  it("Historia 3.0 escenario 4: Registro con campos obligatorios vacíos | muestra el campo obligatorio", () => {
    cy.datosPrueba("PACIENTE").then((datosBase) => {
      cy.registrarPacienteApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: enviar el formulario de paciente completamente vacío
        cy.visit("/register");
        cy.get(".role-option").contains("Paciente").click();
        cy.get(".create-account-button").click();

        // Validación
        cy.get(".field-error").eq(0).should("contain", "El nombre es obligatorio");
        cy.get(".field-error").should("contain", "El correo es obligatorio");
        cy.get(".field-error").should("contain", "La contraseña es obligatoria");
        cy.url().should("include", "/register");

        // Cerrar sesión
        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Historia 3.0 escenario 3: Las contraseñas no coinciden | muestra el mensaje de validación", () => {
    cy.datosPrueba("PACIENTE").then((datosBase) => {
      cy.registrarPacienteApi(datosBase).then(() => {
        // Inicio de sesión
        cy.hacerLoginUI(datosBase.correo, datosBase.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });

        // Acción: buscar el campo de confirmación de contraseña
        cy.visit("/register");
        cy.get(".role-option").contains("Paciente").click();
        // Evidencia: el formulario no tiene campo de confirmación
        cy.screenshot("evidencia/03-h3-3-sin-campo-confirmar-contrasena");

        let campoExiste = false;
        cy.get("body", { timeout: 5000 }).then(($body) => {
          campoExiste =
            $body.find('input[name="confirmarContrasena"]').length > 0;
        });

        // Cerrar sesión
        cy.cerrarSesionPaciente();

        cy.then(() => {
          // FALLA POR CÓDIGO DE LA APP:
          // El formulario de registro de paciente NO tiene campo de
          // confirmación de contraseña, por lo que la validación
          // "Las contraseñas no coinciden" (historia 3.0 escenario 3)
          // no existe en la app.
          expect(campoExiste).to.eq(true);
        });
      });
    });
  });
});
