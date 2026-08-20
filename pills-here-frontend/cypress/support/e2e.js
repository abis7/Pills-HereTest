import "./commands";

// Error benigno de FullCalendar (ResizeObserver loop) que Cypress trata
// como excepción no controlada de la app. Se ignora para que las pruebas
// del calendario no fallen por este error ajeno a los requisitos.
Cypress.on("uncaught:exception", (err) => {
  if (err && err.message && err.message.includes("ResizeObserver loop")) {
    return false;
  }
  return true;
});
