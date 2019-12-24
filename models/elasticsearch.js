const approot = require('app-root-path');
const config  = require(approot + '/config/config');

// elasticsearch
const elasticsearch  = require('elasticsearch');

const elasticsearch_Client_1 = new elasticsearch.Client({
    host: ["localhost:9200"],
    requestTimeout: 1600000
});

const elasticsearch_Client_2 = new elasticsearch.Client({
    host: ["192.168.0.40:9200","192.168.0.51:9200","192.168.0.52:9200"],
    requestTimeout: 1600000
});

const models = {};
models.client1 = elasticsearch_Client_1;
//models.client2 = elasticsearch_Client_2;

module.exports = models;

