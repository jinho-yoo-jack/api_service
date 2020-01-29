/*
    Insert API
    정의 : 지정된 Index 에 새로운 JSON Document 을 추가한다. 만약 JSON Document 가 이미 존재한다면,
          기존 Document 를 업데이트하고 version up 을 한다.
    형식 : PUT or Post /<index>/_doc/<_id>
    #Question : Template 에 정의 되어 있지 않은 Field 값이 들어오는 경우, 정의 되어 있는 값이 안들어오는 경우

 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

// #Typeof(fieldNames) => Array OR Value , Typeof(fieldValues) => Array OR Value
const insertIndexById = (indexName, docType, docId, opType, fieldNames, fieldValues) => {
    let body_query = {};
    if (typeof (fieldNames) == 'object') {
        fieldNames.forEach((val, idx) => {
            body_query[val] = fieldValues[idx];
        });
    } else {
        body_query[fieldNames] = fieldValues;
    }

    return esClient.index({
            index   : indexName,
            id      : docId,
            type    : docType,
            op_type : opType,
            body: body_query
           }).then((response) => {
               return response;
           }).catch((error) => {
               return error;
           });
};

module.exports = insertIndexById;