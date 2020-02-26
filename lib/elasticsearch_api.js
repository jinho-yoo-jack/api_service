/*
    ELASTICSEARCH API for Node.js
   - Elasticsearch API Object
   - parameters : openquery TYPE SE(Search) or RE(Recommend)
 */
const esAPI = (openqueryType) => {
    let ELASTICSEARCH_MODEL = openqueryType;

    return {
        // [cat][indices] : 마지막 index 확인
        lastIndexCheck: (indexName) => {
            return ELASTICSEARCH_MODEL.cat.indices({
                index: indexName,
                format: 'json',
                s: 'index',
                h: 'index',
                v: true
            });
        },

        // [index] : index insert
        indexInsert: (indexName, docType, docId, opType, bodyQuery) => {
            return this.ELASTICSEARCH_MODEL.client.index({
                index: indexName,
                type: docType,
                id: docId,
                op_type: opType,
                body: bodyQuery
            });
        },

        // [update] : index update all document
        indexUpdate: (indexName, documentId, docType, s_query) => {
            return ELASTICSEARCH_MODEL.client.update({
                index: indexName,
                id: documentId,
                type: docType,
                body: s_query
            });
        },

        // [client][update] : 특정 필드의 값만 update
        // fieldsMap => new Map(); fieldsMap.set('fieldsName','fieldsValue');
        updateFieldValueById : (fieldsMap, indexName, docType, documentId) => {
            let script_query = "";
            let params = {};

            for(let [key, value] of fieldsMap){
                params[key] = value;
                script_query += "if(ctx._source."+key+" !=null){ctx._source."+key+"=params."+key+"}";
            }

            let search_query = {
                "script" : {
                    "source" : script_query,
                    "params" : params
                }
            };
            return this.indexUpdate(indexName,documentId,docType,search_query);

        },

        // [client][reindex] : Copy From SE Index to RE Index
        indexReIndexFromSeToRe: (openqryRE_ADDR, reIndexName, seIndexName) => {
            let queryString = {};
            let bodyQuery = null;
            if (seIndexName == null) seIndexName = reIndexName;
            if (openqryRE_ADDR != null && reIndexName != null) {
                queryString['source'] = {
                    "remote": {
                        "host": openqryRE_ADDR
                    },
                    "index": reIndexName
                };
                queryString['dest'] = {
                    "index": seIndexName
                };
                bodyQuery = queryString;
                // 여기서는 SE의 Elasticsearch API 모델 사용
                return ELASTICSEARCH_MODEL.client.reindex(bodyQuery);
            } else {
                return false;
            }
        },

        // [client][indices][close] : Index Status Change from Open to Close
        idxStatChgClose: (oldIndexName) => {
            if (oldIndexName != null) {
                return ELASTICSEARCH_MODEL.client.indices.close({
                    index: oldIndexName
                });
            } else {
                console.log('oldIndexName 필수 값');
            }

        },

        // [client][reindex] : 특정 인덱스 복사(reindexing)
        indexReIndex: (indexName, newIndexName) => {
            let bodyQuery = {};
            if (indexName != null && newIndexName != null) {
                bodyQuery['source'] = {
                    "index": indexName
                };
                bodyQuery['dest'] = {
                    "index": newIndexName
                };

                return ELASTICSEARCH_MODEL.client.reindex(bodyQuery);

            } else {
                console.log('newIndexName or ysDay and today 값 중 둘 중 하나는 필수 값.');
                return false;
            }

        },

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
        indexBulkInsert: (bulkArray) => {
            return ELASTICSEARCH_MODEL.client.bulk({
                body: bulkArray
            });
        },

        // [client][indices][close] : index status change from OPEN to CLOSE
        oldIndexClose: (indexName) => {
            return ELASTICSEARCH_MODEL.client.indices.close({
                index: indexName
            });
        },

        // [indices][exists] : index 존재여부 확인
        indexCheck: (indexName) => {
            return ELASTICSEARCH_MODEL.indices.exists({
                index: indexName,
            });
        },

        // [indices][updateAliases] : Alias index update
        aliasUpdate: (aliasName, lastIndexName) => {
            let bodyQuery = {
                actions: [
                    {
                        "remove": {
                            "index": "*", "alias": aliasName
                        }
                    },
                    {
                        "add": {
                            "index": lastIndexName, "alias": aliasName
                        }
                    }
                ]
            };

            return ELASTICSEARCH_MODEL.indices.updateAliases({
                body: bodyQuery
            });
        },

        // [client][search] : Single Index/Body Search
        singleSearch: (_index, _bodyQuery) => {
            return ELASTICSEARCH_MODEL.search({
                index: _index,
                body: _bodyQuery
            })

        },

        // [client][msearch] : Multi Index/Body Search
        // [{"index" : "INDEX_ONE"},{"FIELDS1" : "VALUE1"}, ... ]
        multiSearch: (mapIndexQuery) => {
            let multiBody = [];
            for (let [key, value] of mapIndexQuery) {
                let _index = {'index': 'v1-' + key};
                let _body = value;

                multiBody.push(_index);
                multiBody.push(_body);
            }

            return ELASTICSEARCH_MODEL.msearch({
                headers: {"content-type": "application/json"},
                body: multiBody
            });

        }
    }

};

module.exports = esAPI;