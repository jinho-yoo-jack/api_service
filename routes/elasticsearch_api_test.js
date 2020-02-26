const rootpath = require('app-root-path');
const JSONStream = require('JSONStream');

const openqrySE = require(`${rootpath}`+'/models/elasticsearch');
const openqryRE = require(`${rootpath}`+'/models/elasticsearch_RE');
const ES_SE = require(`${rootpath}` + '/lib/elasticsearch_api')(openqrySE);
const ES_RE = require(`${rootpath}` + '/lib/elasticsearch_api')(openqryRE);

const main = async () => {
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
            console.log('After parser ::: %j', response);
        })
        .catch((err) => {
            console.log('Fail :: %j', err);
        });
};

main();

