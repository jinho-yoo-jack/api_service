/*
    Delete API
    정의 : 지정된 Index 에서 JSON Document 을 삭제한다.
    형식 : DELETE /<index>/_doc/<_id>

 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const deleteIndexById = (indexName, documentId, typeName) => {
    return esClient.delete({
                index : indexName,
                id    : documentId,
                type  : typeName
            });
};

module.exports = deleteIndexById;
