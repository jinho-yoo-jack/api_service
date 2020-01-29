/*
    UPDATE API
    정의 : 지정된 Index 에서 지정된 JSON Document 의 특정 Field 만 수정한다.
          After check parameters type, if type is "object(=array)", Execute If sentence, then Execute Else sentence.
          script_query 를 이용해서 update 하려는 fields 존재 여부 checking
    형식 : POST /<index>/_update/<_id>
    # Query 에는 script query 와 doc query 를 사용 할 수 있다.
 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const updateIndexById = (fieldName, fieldValue, indexName, docType, documentId) => {

    let script_query = "";
    let params = {};

    if (typeof (fieldName) == 'object') {
        fieldName.forEach((value, index) => {
            script_query += "if(ctx._source." + value + " != null) {ctx._source." + value + " = params." + fieldValue[index] + "}"
            params[value] = fieldValue[index];
        });
    }
    else{
        script_query += "if(ctx._source." + fieldName + " != null) {ctx._source." + fieldName + " = params." + fieldValue + "}"
        params[fieldName] = fieldValue;
    }


    let s_query = {
        "source" : script_query,
        "params" : params
    };
    return esClient.update({
        index : indexName,
        id    : documentId,
        type  : docType,
        body  : s_query
    });
};

module.exports = updateIndexById;