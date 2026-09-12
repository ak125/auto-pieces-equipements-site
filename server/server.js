// Compatibility entry point. Historical OBD prototype: docs/archives/prototype-obd.md.
const app = require('../server-simple.js');
module.exports = app;
if (require.main === module) app.startServer();
