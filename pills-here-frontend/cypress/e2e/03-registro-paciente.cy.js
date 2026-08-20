// Área funcional: REGISTRAR PACIENTE
// Casos 13.0 - 16.0 del suite de pruebas e historia 3.0

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
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.visit("/register");
      cy.get(".role-option").contains("Paciente").click();
      llenarFormularioPaciente(datos);
      cy.get(".create-account-button").click();

      cy.get(".register-success", { timeout: 10000 }).should("be.visible");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("codigoPaciente")).to.not.be.null;
      });
      cy.url().should("include", "/inicio-paciente", { timeout: 10000 });

      cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
        expect(respuesta.body.rol).to.eq("PACIENTE");
      });
      cy.url().should("include", "/inicio-paciente");

      cy.cerrarSesionPaciente();
    });
  });

  it("Caso 14.0: Registro con correo duplicado | muestra que el correo ya está registrado", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.registrarPacienteApi(datos).then(() => {
        cy.visit("/register");
        cy.get(".role-option").contains("Paciente").click();
        llenarFormularioPaciente(datos);
        cy.get(".create-account-button").click();

        cy.get(".register-error", { timeout: 10000 })
          .should("be.visible")
          .and("contain", "El correo ya está registrado");

        cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Caso 15.0: Códigos únicos | dos pacientes registrados obtienen códigos diferentes", () => {
    let codigo1 = null;

    cy.datosPrueba("PACIENTE").then((datos1) => {
      cy.visit("/register");
      cy.get(".role-option").contains("Paciente").click();
      llenarFormularioPaciente(datos1);
      cy.get(".create-account-button").click();
      cy.get(".register-success", { timeout: 10000 }).should("be.visible");

      cy.window().then((win) => {
        codigo1 = win.localStorage.getItem("codigoPaciente");
        expect(codigo1).to.not.be.null;
      });

      cy.clearLocalStorage();
      cy.datosPrueba("PACIENTE").then((datos2) => {
        cy.visit("/register");
        cy.get(".role-option").contains("Paciente").click();
        llenarFormularioPaciente(datos2);
        cy.get(".create-account-button").click();
        cy.get(".register-success", { timeout: 10000 }).should("be.visible");

        cy.window().then((win) => {
          const codigo2 = win.localStorage.getItem("codigoPaciente");
          expect(codigo2).to.not.be.null;
          expect(codigo1).to.not.eq(codigo2);
        });

        cy.hacerLoginUI(datos2.correo, datos2.contrasena).then((respuesta) => {
          expect(respuesta.status).to.eq(200);
        });
        cy.cerrarSesionPaciente();
      });
    });
  });

  it("Caso 16.0: Redirección tras registro exitoso de paciente | lleva al inicio del paciente", () => {
    cy.datosPrueba("PACIENTE").then((datos) => {
      cy.visit("/register");
      cy.get(".role-option").contains("Paciente").click();
      llenarFormularioPaciente(datos);
      cy.get(".create-account-button").click();

      cy.get(".register-success", { timeout: 10000 }).should("be.visible");
      cy.url().should("include", "/inicio-paciente", { timeout: 10000 });
      cy.get(".inicio-paciente-page").should("be.visible");

      cy.hacerLoginUI(datos.correo, datos.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });
      cy.cerrarSesionPaciente();
    });
  });
});
