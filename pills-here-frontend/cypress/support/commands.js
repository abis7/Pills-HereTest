const API = "http://localhost:8083";

Cypress.Commands.add("datosPrueba", (rol) => {
  const ts = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  return {
    correo: `test.${rol.toLowerCase()}.${ts}@test.com`,
    contrasena: "Prueba123!",
    nombre: "Test",
    apellidoPaterno: "Prueba",
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
        cedulaProfesional: datos.cedulaProfesional ?? String(Date.now()).slice(-8),
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

// Captura de evidencia del estado de la acción ANTES de cerrar sesión
// (se usa en todos los tests que terminan con cerrar sesión para que la
// captura no sea la pantalla de login).
Cypress.Commands.add("capturarAntesDeCerrarSesion", () => {
  const nombreSpec = (Cypress.spec?.name || "spec").replace(/\.cy\.js$/, "");
  const titulo = (Cypress.currentTest?.title || "sin-nombre").slice(0, 120);
  cy.screenshot(`pruebas/${nombreSpec} -- ${titulo}`, {
    capture: "viewport",
    overwrite: false,
  });
});

Cypress.Commands.add("cerrarSesionMedico", () => {
  cy.capturarAntesDeCerrarSesion();
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
  cy.capturarAntesDeCerrarSesion();
  cy.visit("/perfil-paciente");
  cy.get(".perfil-paciente-cerrar-btn", { timeout: 10000 }).click();
  cy.url().should("include", "/");
  cy.get(".login-container").should("be.visible");
  cy.window().then((win) => {
    expect(win.localStorage.getItem("idUsuario")).to.be.null;
    expect(win.localStorage.getItem("idPaciente")).to.be.null;
  });
});

Cypress.Commands.add("crearAvisoApi", (payload) => {
  return cy
    .request({
      method: "POST",
      url: `${API}/avisos/crear`,
      body: payload,
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("buscarMedicamentosApi", (nombre) => {
  return cy
    .request({
      method: "GET",
      url: `${API}/medicamentos/buscar`,
      qs: { nombre },
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("iniciarTratamientoApi", (horarios) => {
  return cy
    .request({
      method: "PUT",
      url: `${API}/tratamientos/paciente/iniciar`,
      body: { horarios },
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("marcarTomadaApi", (idToma) => {
  return cy
    .request({
      method: "PUT",
      url: `${API}/tratamientos/tomas/${idToma}/tomada`,
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("obtenerTomasApi", (idTratamiento) => {
  return cy
    .request({
      method: "GET",
      url: `${API}/tratamientos/${idTratamiento}/medicacion`,
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("obtenerTratamientoApi", (idTratamiento) => {
  return cy
    .request({
      method: "GET",
      url: `${API}/tratamientos/${idTratamiento}`,
      failOnStatusCode: false,
    })
    .then((resp) => ({ body: resp.body, status: resp.status }));
});

Cypress.Commands.add("contextoMedicoPaciente", (opciones = {}) => {
  return cy.datosPrueba("MEDICO").then((dMed) =>
    cy.registrarMedicoApi(dMed).then(() =>
      cy.loginApi(dMed.correo, dMed.contrasena).then((loginMed) =>
        cy.datosPrueba("PACIENTE").then((dPac) =>
          cy.registrarPacienteApi(dPac).then((resPac) =>
            cy.loginApi(dPac.correo, dPac.contrasena).then((loginPac) => {
              const contexto = {
                medico: {
                  ...dMed,
                  idUsuario: loginMed.idUsuario,
                  idMedico: loginMed.idMedico,
                },
                paciente: {
                  ...dPac,
                  ...resPac,
                  idUsuario: loginPac.idUsuario,
                  idPaciente: loginPac.idPaciente,
                },
              };

              if (opciones.sinVincular) {
                return contexto;
              }

              return cy
                .vincularApi(contexto.medico.idUsuario, contexto.paciente.codigoPaciente)
                .then(() => contexto);
            })
          )
        )
      )
    )
  );
});

Cypress.Commands.add("contextoTratamiento", () => {
  return cy.contextoMedicoPaciente().then((contexto) =>
    cy
      .crearTratamientoApi({
        idPaciente: contexto.paciente.idPaciente,
        idMedico: contexto.medico.idMedico,
        diagnostico: "Diagnóstico de prueba",
        recomendaciones: "Tomar con agua",
        medicamentos: [
          {
            idMedicamento: 1,
            dosis: "1 tableta",
            intervaloHoras: 8,
            duracionDias: 7,
          },
        ],
      })
      .then((respTratamiento) =>
        cy
          .request({
            method: "GET",
            url: `${API}/tratamientos/paciente/${contexto.paciente.idPaciente}/todos`,
            failOnStatusCode: false,
          })
          .then((respLista) => {
            const lista = Array.isArray(respLista.body)
              ? respLista.body
              : [respLista.body];

            return {
              ...contexto,
              tratamiento: lista[lista.length - 1],
              statusCrear: respTratamiento.status,
            };
          })
      )
  );
});
