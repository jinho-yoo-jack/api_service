const configFile            = require('./config.json');
const run_mode              = configFile.run_mode;
const config                = configFile[run_mode];

module.exports = config;

