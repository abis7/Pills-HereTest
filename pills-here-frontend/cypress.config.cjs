module.exports = {
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    pageLoadTimeout: 60000,
    screenshotOnRunFailure: true,
    video: true,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },
};
