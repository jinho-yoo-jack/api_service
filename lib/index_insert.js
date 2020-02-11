/*
    Insert API
    정의 : 지정된 Index 에 새로운 JSON Document 을 추가한다. 만약 JSON Document 가 이미 존재한다면,
          기존 Document 를 업데이트하고 version up 을 한다.
    형식 : PUT or Post /<index>/_doc/<_id>
    #Question : Template 에 정의 되어 있지 않은 Field 값이 들어오는 경우, 정의 되어 있는 값이 안들어오는 경우

 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');
const es = require(`${rootpath}`+'/lib/elasticsearch_api');

// #Typeof(fieldNames) => Array OR Value , Typeof(fieldValues) => Array OR Value
const insertIndexById = async (indexName, docType, docId, opType, fieldNames, fieldValues) => {
    let bodyQuery = {};
    if (typeof (fieldNames) == 'object') {
        fieldNames.forEach((val, idx) => {
            bodyQuery[val] = fieldValues[idx];
        });
    } else {
        bodyQuery[fieldNames] = fieldValues;
    }

    return await es(esClient,indexName, docType, docId, opType,bodyQuery);
};

module.exports = insertIndexById;