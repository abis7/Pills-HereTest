const API = "http://localhost:8083";

Cypress.Commands.add("datosPrueba", (rol) => {
  const ts = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    correo: `e2e.${rol.toLowerCase()}.${ts}@test.com`,
    contrasena: "Prueba123!",
    nombre: "E2E",
    apellidoPaterno: "Test",
    apellidoMaterno: "Auto",
    fechaNacimiento: "1995-06-15",
    sexo: "Femenino",
  };
});

Cypress.Commands.add("registrarPacienteApi", (datos) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/auth/register-paciente`,
      body: {
        ...datos,
        tipoSangre: "O+",
        alergias: "Penicilina",
      },
      failOnStatusCode: false,
    })
    .then((resp) => ({
      ...resp.body,
      status: resp.status,
      correo: datos.correo,
      contrasena: datos.contrasena,
    }));
});

Cypress.Commands.add("registrarMedicoApi", (datos) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/auth/register-medico`,
      body: {
        ...datos,
        cedulaProfesional: String(Date.now()).slice(-8),
        especialidad: "Cardiología",
        consultorio: "A-101",
      },
      failOnStatusCode: false,
    })
    .then((resp) => ({
      ...resp.body,
      status: resp.status,
      correo: datos.correo,
      contrasena: datos.contrasena,
    }));
});

Cypress.Commands.add("loginApi", (correo, contrasena) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/auth/login`,
      body: { correo, contrasena },
      failOnStatusCode: false,
    })
    .then((resp) => ({ ...resp.body, status: resp.status }));
});

Cypress.Commands.add("vincularApi", (idUsuarioMedico, codigoPaciente) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/medico-paciente/vincular`,
      body: { idUsuarioMedico, codigoPaciente },
      failOnStatusCode: false,
    })
    .then((resp) => ({ ...resp.body, status: resp.status }));
});

Cypress.Commands.add("crearTratamientoApi", (payload) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/tratamientos/crear`,
      body: payload,
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("sembrarSesion", (datosSesion) => {
  cy.visit("/", {
    onBeforeLoad(win) {
      Object.entries(datosSesion).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          win.localStorage.setItem(k, String(v));
        }
      });
    },
  });
});

Cypress.Commands.add("hacerLoginUI", (correo, contrasena) => {
  cy.visit("/");
  cy.get("form.login-form input[type=email]").type(correo);
  cy.get("form.login-form input[type=password]").type(contrasena);
  cy.intercept("POST", "**/auth/login").as("loginUI");
  cy.get("form.login-form button[type=submit]").click();
  return cy.wait("@loginUI").then((interception) => ({
    body: interception.response.body,
    status: interception.response.statusCode,
  }));
});

Cypress.Commands.add("stubAlertas", () => {
  cy.window().then((win) => {
    cy.stub(win, "alert").as("alert");
    cy.stub(win, "confirm").returns(true).as("confirm");
  });
});

Cypress.Commands.add("cerrarSesionMedico", () => {
  cy.visit("/perfil-medico");
  cy.get(".perfil-medico-cerrar-btn", { timeout: 10000 }).click();
  cy.url().should("include", "/");
  cy.get(".login-container").should("be.visible");
  cy.window().then((win) => {
    expect(win.localStorage.getItem("idUsuario")).to.be.null;
    expect(win.localStorage.getItem("idMedico")).to.be.null;
  });
});

Cypress.Commands.add("cerrarSesionPaciente", () => {
  cy.visit("/perfil-paciente");
  cy.get(".perfil-paciente-cerrar-btn", { timeout: 10000 }).click();
  cy.url().should("include", "/");
  cy.get(".login-container").should("be.visible");
  cy.window().then((win) => {
    expect(win.localStorage.getItem("idUsuario")).to.be.null;
    expect(win.localStorage.getItem("idPaciente")).to.be.null;
  });
});
