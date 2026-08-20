// Área funcional: EDITAR TRATAMIENTO
// Casos 45.0 - 46.0 e historia 18.0

describe("Editar tratamiento", () => {
  it("Caso 45.0: Modificar diagnóstico y dosis | guarda los cambios y actualiza lo visible", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/editar-tratamiento/${contexto.tratamiento.idTratamiento}`);
      cy.get(".editar-tratamiento-recomendaciones-input").clear().type("Nueva recomendación actualizada");
      cy.get(".crear-tratamiento-input-dosis").eq(0).clear().type("2 tabletas");

      cy.stubAlertas();
      cy.intercept("PUT", "**/tratamientos/**").as("actualizarTratamiento");
      cy.get(".editar-tratamiento-guardar-btn").click();

      cy.wait("@actualizarTratamiento").then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.get("@alert").should("be.calledWith", "Tratamiento actualizado correctamente");
      cy.url().should("include", `/detalle-paciente/${contexto.paciente.idPaciente}`);

      cy.cerrarSesionMedico();
    });
  });

  it("Caso 46.0: Editar un tratamiento que el paciente ya comenzó | guarda los cambios", () => {
    // NOTA: el suite de pruebas registra este caso como "No" porque el
    // requisito pide que al editar un tratamiento ya comenzado se reinicie
    // el progreso de dosis; la app solo guarda los cambios sin evidencia
    // de reiniciar el progreso. Aquí se valida la parte que sí existe
    // (guardado exitoso de un tratamiento en curso).
    cy.contextoTratamiento().then((contexto) => {
      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        const idDosis = respDetalle.body.medicamentos[0].idDosis;
        cy.iniciarTratamientoApi([{ idDosis, horaInicioPaciente: "23:00:00" }]).then((respInicio) => {
          expect(respInicio.status).to.eq(200);
        });
      });

      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      cy.visit(`/editar-tratamiento/${contexto.tratamiento.idTratamiento}`);
      cy.get(".editar-tratamiento-recomendaciones-input").clear().type("Esquema modificado");
      cy.get(".crear-tratamiento-input-dosis").eq(1).clear().type("6");

      cy.stubAlertas();
      cy.get(".editar-tratamiento-guardar-btn").click();
      cy.get("@alert").should("be.calledWith", "Tratamiento actualizado correctamente");

      cy.cerrarSesionMedico();
    });
  });

  it("Historia 18.0 escenario 2: Editar con campos obligatorios vacíos | muestra el campo obligatorio", () => {
    cy.contextoTratamiento().then((contexto) => {
      // Inicio de sesión
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: vaciar un campo obligatorio (dosis) y guardar
      cy.visit(`/editar-tratamiento/${contexto.tratamiento.idTratamiento}`);
      cy.get(".crear-tratamiento-input-dosis").eq(0).clear();

      cy.stubAlertas();
      cy.get(".editar-tratamiento-guardar-btn").click();
      // Evidencia: no se muestra mensaje de campo obligatorio
      cy.screenshot("evidencia/14-h18-2-sin-validacion-campos-vacios");

      let errorVisible = false;
      cy.get("body", { timeout: 5000 }).then(($body) => {
        errorVisible = $body.find(".field-error").length > 0;
      });

      // Cerrar sesión
      cy.cerrarSesionMedico();

      cy.then(() => {
        // FALLA POR CÓDIGO DE LA APP:
        // La vista de editar tratamiento NO valida campos obligatorios
        // vacíos (no renderiza .field-error) y envía el formulario igual
        // (requisito historia 18.0 escenario 2: "Este campo es obligatorio").
        expect(errorVisible).to.eq(true);
      });
    });
  });

  it("Historia 18.0 escenario 3: Cancelar la edición sin guardar | descarta los cambios", () => {
    cy.contextoTratamiento().then((contexto) => {
      cy.hacerLoginUI(contexto.medico.correo, contexto.medico.contrasena).then((respuesta) => {
        expect(respuesta.status).to.eq(200);
      });

      // Acción: entrar a editar desde el detalle del paciente (flujo real)
      cy.visit(`/detalle-paciente/${contexto.paciente.idPaciente}`);
      cy.get(".medico-tratamiento-icon-btn").eq(0).click();
      cy.url().should("include", `/editar-tratamiento/${contexto.tratamiento.idTratamiento}`);

      cy.get(".editar-tratamiento-recomendaciones-input").clear().type("Cambio que no debe guardarse");

      cy.get(".crear-tratamiento-back-btn").click();
      cy.url().should("include", `/detalle-paciente/${contexto.paciente.idPaciente}`);

      cy.obtenerTratamientoApi(contexto.tratamiento.idTratamiento).then((respDetalle) => {
        expect(respDetalle.body.notasMedicas).to.eq("Tomar con agua");
      });

      cy.cerrarSesionMedico();
    });
  });
});
