const configFile            = require('./config.json');
const elasticsearch         = require('elasticsearch');
const run_mode              = configFile.run_mode;
const config                = configFile[run_mode];
config['ELASTICSEARCH'] = new elasticsearch.Client({
    host: config.ELASTIC_HOST,
    requestTimeout: config.ELASTIC_TIMEOUT
});

module.exports = config;

