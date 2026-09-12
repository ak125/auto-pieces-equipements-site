// Compatibility entry point. Historical MCP prototype: docs/archives/prototype-mcp.md.
const app = require('./server-simple.js');
module.exports = app;
if (require.main === module) app.startServer();
