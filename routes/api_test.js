const rootpath = require('app-root-path');
const config   = require(`${rootpath}` + '/config/config');
const esClient    = require(`${rootpath}` + '/models/elasticsearch');
const esClient_RE = require(`${rootpath}` + '/models/elasticsearch_RE');
const es = require(`${rootpath}` + '/lib/elasticsearch_api');


let main = async () => {
    console.log('Before Async Call');
    let result = await es.aliasUpdate(esClient, 'test_alias','order');
    console.log(result);
    console.log('Afore Async Call');
}
main();