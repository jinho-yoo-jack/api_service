const rootpath = require('app-root-path');

const openqrySE     = require(`${rootpath}`+'/models/elasticsearch');
const openqryRE     = require(`${rootpath}`+'/models/elasticsearch_RE');
const Elasticsearch = require(`${rootpath}` + '/lib/elasticsearch_model');
const logger        = require(`${rootpath}` + '/lib/logger')(module);

const main = async () => {
    const ES_SE = new Elasticsearch(openqrySE);
    const ES_RE = new Elasticsearch(openqryRE);


    /*
    let bodyQuery = {
        "query" : {
            "bool" : {
                "should" : [
                    {
                        "multi_match" : {
                            "query" : "President",
                            "fields" : ["Designation"]
                        }
                    }
                ]
            }
        }
    };
    await ES_SE.singleSearch('companydatabase', bodyQuery)
        .then((response) => {
            logger.info(response);
        })
        .catch((err) => {
            console.log('Fail :: %j', err);
        });

     */
};

main();

