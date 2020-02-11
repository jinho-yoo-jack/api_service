/*

 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const checkSortOrderByCount = async (keyword, arr_category, indexName) => {
    let result = [];
    let s_query = {
        "query" : {
            "match" : {
                "keyword" : keyword
            }
        }
    };
    await esClient.client.search({
        index : indexName,
        body  : s_query
    }).then((response) => {
        if(response.hits.total != 0){
            let hits = response.hits.hits;
            let cateId = null;
            hits.forEach((val,idx) => {
                let source = val._source;
                let cnt = source.cnt;
                cnt.forEach((value, index) => {
                    if(value.cnt*0.5 > 10000){
                        cateId = value.cate;
                    }
                });
            });
            if(cateId != null){
                result.push(cateId); // search result 가 없는 경우, Default 값으로 설정.
                result = result.concat(arr_category);
                // Remove Method Duplicate Value in Array
                [...new Set(result)];
                result.filter((item, index) =>
                    result.indexOf(item) === index);
                result.reduce((unique, item) =>
                    unique.includes(item) ? unique : [...unique, item], []);
            }
            else{
                result = arr_category; // search result 가 없는 경우, Default 값으로 설정.
            }
        }
        else {
            result = arr_category; // search result 가 없는 경우, Default 값으로 설정.
        }
    }).catch((error) => {
        result = arr_category; // search operating 하는 index 가 없는 경우, Default 값으로 설정.
    });

    return result;
};

module.exports = checkSortOrderByCount;