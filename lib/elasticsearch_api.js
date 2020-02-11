/*
    ELASTICSEARCH API for Node.js
    - elasticsearch 모듈 분리 및 매개변수로 전달 --> SE 및 RE 때문에
    - 검색 : [중분류][//중소분류][소분류]
    중분류 : cat, client, indices ...
    소분류 : insert, delete, update ...
 */
const rootpath = require('app-root-path');
const es = module.exports = {};
/*#################################################################################################################*/

// [cat][indices] : 마지막 index 확인
es.lastIndexCheck = (ELASTICSEARCH_MODEL, indexName) => {
    return esClient.cat.indices({
        index: indexName,
        format: 'json',
        s: 'index',
        h: 'index',
        v: true
    });
};


// [index] : index insert
es.indexInsert = (ELASTICSEARCH_MODEL, indexName, docType, docId, opType,bodyQuery) => {
    return ELASTICSEARCH_MODEL.index({
            index: indexName,
            type: docType,
            id: docId,
            op_type: opType,
            body: bodyQuery
            });
};

// [update] : index update
es.indexUpdate = (ELASTICSEARCH_MODEL, indexName, documentId, docType, s_query) => {
    return ELASTICSEARCH_MODEL.update({
            index : indexName,
            id    : documentId,
            type  : docType,
            body  : s_query
            });
};

// [client][reindex] : Copy From SE Index to RE Index
es.indexReIndexFromSeToRe = (ELASTICSEARCH_MODEL, openqryRE_ADDR, reIndexName, seIndexName) => {
    let queryString = {};
    let bodyQuery = null;
    if(seIndexName == null) seIndexName = reIndexName;
    if(openqryRE_ADDR != null && reIndexName != null){
        queryString['source'] = {
            "remote" : {
                "host" : openqryRE_ADDR
            },
            "index" : reIndexName
        };
        queryString['dest'] = {
            "index" : seIndexName
        };
        bodyQuery = queryString;
        // 여기서는 SE의 Elasticsearch API 모델 사용
        return ELASTICSEARCH_MODEL.client.reindex(bodyQuery);
    }
    else{
        return false;
    }
};

// [client][reindex] : 특정 인덱스 복사(reindexing)
es.indexReIndex = (ELASTICSEARCH_MODEL, indexName, newIndexName, argvType, ysDay, today) => {
    let bodyQuery = {};
    let body = null;
    if(newIndexName != null || ysDay != null){
        if(newIndexName != null && ysDay == null){
            bodyQuery['source'] = {
                "index" : indexName
            };
            bodyQuery['dest'] = {
                "index" : newIndexName
            };
        }
        else if(newIndexName == null && ysDay != null){
            bodyQuery['source'] = {
                "index" : indexName+argvType+ysDay
            };
            bodyQuery['dest'] = {
                "index" : indexName+argvType+today
            };
        }
        body = bodyQuery;
        return ELASTICSEARCH_MODEL.client.reindex(body);

    }
    else{
        console.log('newIndexName or ysDay and today 값 중 둘 중 하나는 필수 값.');
        return false;
    }

};


// [client][bulk] : bulk 타입으로 document insert in INDEX
/*  let bulkArray = [
                        { "index" : { "_index" : "test", "_id" : "1" } }
                        { "field1" : "value1" }
                        { "delete" : { "_index" : "test", "_id" : "2" } }
                        { "create" : { "_index" : "test", "_id" : "3" } }
                        { "field1" : "value3" }
                        { "update" : {"_id" : "1", "_index" : "test"} }
                        { "doc" : {"field2" : "value2"} }
                    ];
*/
es.indexBulkInsert = (ELASTICSEARCH_MODEL, bulkArray) => {
    return ELASTICSEARCH_MODEL.client.bulk({
        body: bulkArray
    });
};

// [client][indices][close] : index status change from OPEN to CLOSE
es.oldIndexClose = (ELASTICSEARCH_MODEL, indexName) => {
    return ELASTICSEARCH_MODEL.client.indices.close({
        index: indexName
    });
};



// [indices][exists] : index 존재여부 확인
es.indexCheck = (ELASTICSEARCH_MODEL, indexName) => {
    return ELASTICSEARCH_MODEL.indices.exists({
        index: indexName,
    });
};

// [indices][updateAliases] : Alias index update
es.aliasUpdate = (ELASTICSEARCH_MODEL, aliasName, lastIndexName) => {
    let s_query = {
        actions: [
            {"remove": {"index": "*", "alias": aliasName}},
            {"add": {"index": lastIndexName, "alias": aliasName}}
        ]
    };

    return ELASTICSEARCH_MODEL.indices.updateAliases({
        body: s_query
    });
};