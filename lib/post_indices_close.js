/*
    [Module]
    Change Status for CLOSE to Last Indices API
    정의 : 지정된 Index 이름으로 과거 index 상태 CLOSE 설정
    형식 : POST DELETE /<index>
 */
const rootpath = require('app-root-path');
const elasticSE = require(`${rootpath}` + '/models/elasticsearch');
const elasticRE = require(`${rootpath}` + '/models/elasticsearch_RE');
const esApi = require(`${rootpath}` + '/lib/elasticsearch_api');

const postIndicesClose = async (indexName, Counting) => {
    if(indexName == null){
        console.log('indexName is Undefined');
        return false;
    }
    if(Counting == null){
        Counting = 20;
    }
    // Return Type = [{"index" : "INDEX_NAME_DATE"}, {"index" : "INDEX_NAME_DATE"} ... ]
    let idxArray = await esApi.indexCheck(indexName);
    let idxLength = idxArray.length;

    if(idxLength >= Counting){
        for (let item of idxArray) {
            // item is {"index" : "INDEX_NAME_DATE"}
            let result = await esApi.oldIndexClose(elasticSE, item.index);
            console.log('RESPONSE RESULT ::: %j' ,result);
        }
    }
};

module.exports = postIndicesClose;
