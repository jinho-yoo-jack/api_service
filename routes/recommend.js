// #Load app Dependencies
const rootpath = require('app-root-path');
const moment = require('moment');

// #Common Module
const commons = require(`${rootpath}` + '/common/commons');

// #Elasticsearch Module
const elasticsearchSE = require(`${rootpath}` + '/models/elasticsearch');
const elasticsearchRE = require(`${rootpath}` + '/models/elasticsearch_RE');
const ES_SE = require(`${rootpath}` + '/lib/elasticsearch_api')(elasticsearchSE);
const ES_RE = require(`${rootpath}` + '/lib/elasticsearch_api')(elasticsearchRE);


// Global Variable
const today = moment(userDate).format('YYYY.MM.DD');
const ysday = moment(userDate).subtract(1, 'days').format('YYYY.MM.DD');
const rangeToday = moment(userDate).format('YYYYMMDD24');
const rangeBeforeSevenDay = moment(userDate).subtract(7, 'days').format('YYYYMMDD00');
const rangeBeforeMonthDay = moment(userDate).subtract(1, 'months').format('YYYYMMDD00');
const rangeBeforeNinetyDay = moment(userDate).subtract(90, 'days').format('YYYYMMDD00');


// User Parameters
let userDate = process.argv[2];
let recommendIndex = process.argv[3] || 'personal';
if (recommendIndex == 'personal') {
    recommendIndex = 'event-' + recommendIndex + '-*';
}
let userKeyListIndex = process.argv[4] || 'userid';
if (userKeyListIndex == 'userid') {
    userKeyListIndex = 'event-' + userKeyListIndex + '-' + today;
}


const script_query = {
    "source": "if(doc['YYYYMMDDHH'].value > " + rangeBeforeSevenDay + "){ doc['view_count].value * 2 } els if(doc['YYYYMMDDHH'].value >" + rangeBeforeMonthDay + " ) {doc['view_count'].value * 1} else doc['view_count'].value * 0.5"
};

// update Index
let bulkArray = [];

// Function Global Var
const pageSize = 1000;

// Batch JOB
/* I/F ID : RECOMMEND-0001  */

const searchKeyListByUserId = (startPage) => {
    let _index = 'v1-' + userKeyListIndex;
    let start = startPage || 0;
    if (start != 0) {
        start = start - 1;
    }
    let keyListBody = {
        "from": start * pageSize,
        "size": pageSize,
        "_source": "user_id"
    };
    return ES_RE.singleSearch(_index, keyListBody);
};

const aggsSearchByUserId = (userId) => {
    let _index = 'v1-' + recommendIndex;
    let bodyQuery = {
        "query": "",
        "aggs": ""
    };

    let searchQuery = {
        "bool": {
            "must": [],
            "should": [],
            "filter": []
        }
    };
    searchQuery.filter['term'] = {"user_id": userId};
    searchQuery.filter['range']['YYYYMMDDHH'] = {"gte": rangeBeforeNinetyDay, "lt": rangeToday};
    bodyQuery.query = searchQuery;

    let aggsQuery = {};
    for (let i = 0; i < 6; i++) {
        aggsQuery['cate_' + i] = {
            "terms": {
                "fields": "menuid_" + i + ".keyword",
                "size": 5000
            }
        };
        aggsQuery['cate_' + i].aggs = {};
        aggsQuery['cate_' + i].aggs['cate_' + i + '_sum'] = {};
        aggsQuery['cate_' + i].aggs['cate_' + i + '_sum']['sum'] = {'script': script_query};
    }
    bodyQuery.aggs = aggsQuery;


    return ES_RE.singleSearch(_index, bodyQuery);
};

const aggsConvertData = (aggsResponse) => {
    let result = {};
    let hits = aggsResponse.hits.hits[0]._source;
    let aggs = aggsResponse.aggregations;

    let user_id = hits.user_id;
    result['user_id'] = user_id;

    for (let i = 0; i < 5; i++) {
        let cate = aggs['cate_' + i];
        result['cate_' + i] = [];
        if (cate != null) {
            let buckets = cate.buckets;
            let rankMap = new Map();
            for (let j = 0; j < buckets.length; j++) {
                let key = buckets[j].key;
                let cate_sum = buckets[j]['cate_' + i + '_sum']['value'];
                rankMap.set(key + '^' + cate_sum, cate_sum);

            }
            const mapSort = new Map([...rankMap.entries()].sort((a, b) => b[1] - a[1]));
            for (menuId of mapSort) {
                if (menuId[0][0] != null) {
                    result['cate_' + i].push(menuId[0]);
                }
            }
        }
        else{
            return false;
        }
    }
}

const getAggsResultByUserId = (userId) => {
    let aggsResult = aggsSearchByUserId(userId);
    if (aggsResult.hits.total > 0 && aggsResult != null) {
        let result = aggsConvertData(aggsResult);
        let indexInfo = {
            "index" : {
                "_index" : "v1-result-topmenu-user-"+today,
                "_type" : "doc",
                "_id" : result.user_id
            }
        };
        bulkArray.push(indexInfo);
        bulkArray.push(result);

    } else {
        return false;
    }
}


const run = async () => {
    let srcIndex = "v1-result-topmenu-user-" + ysday;
    let dstIndex = "v1-result-topmenu-user-" + today;
    await ES_RE.indexReIndex(srcIndex, dstIndex);

    let startPage = 1;
    let lastPage = 1;
    do {
        let keyList = await searchKeyListByUserId(startPage);
        let resultTotal = keyList.hits.total;
        if (resultTotal % pageSize == 0) {
            lastPage = 1;
        } else {
            lastPage = parseInt(resultTotal / pageSize) + 1;
        }

        for(const userId of keyList){
            await getAggsResultByUserId(userId);
        }

        // Update Bulk
        ES_RE.indexBulkInsert(bulkArray);

        // Init Global Variable that`s bulkArray
        bulkArray = [];

        startPage++;
    } while (startPage < lastPage)
};

run();



























