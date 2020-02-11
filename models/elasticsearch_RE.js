/* Elasticsearch API Object Module */
const rootpath       = require('app-root-path');
const elasticsearch  = require('elasticsearch');
const config         = require(`${rootpath}`+'/config/config');

const elasticsearch_Client = new elasticsearch.Client({
    host           : config.ELASTIC_HOST_RE,
    requestTimeout : config.ELASTIC_TIMEOUT
});

module.exports = elasticsearch_Client;

