// Elasticsearch Class based Prototype
class Elasticsearch {
    // Static Public Fields
    static classField = 'TEST';

    // Constructor
    constructor(_openqueryType) {
        this.ELASTICSEARCH_MODEL = _openqueryType;
    };

    // [client][search] : Single Index/Body Search
    singleSearch(_indexName, _bodyQuery) {
        return this.ELASTICSEARCH_MODEL.search({
            index: _indexName,
            body: _bodyQuery
        });
    };

    // [client][msearch] : Multi Index/Body Search
    // _mapIndexQuery => Type is Map, _mapIndexQuery.set('indexName','bodyQuery');
    // [{"index" : "INDEX_ONE"},{"FIELDS1" : "VALUE1"}, ... ]
    multiSearch(_mapIndexQuery, _delimiterStr) {
        let multiBody = [];
        for (let [indexName, queryBody] of _mapIndexQuery) {
            let _index = {'index': _delimiterStr + indexName};
            let _body = queryBody;

            multiBody.push(_index);
            multiBody.push(_body);
        }

        return this.ELASTICSEARCH_MODEL.msearch({
            headers: {"content-type": "application/json"},
            body: multiBody
        });

    };
    // #[client]
    // [client][indices][close] : index status change from OPEN to CLOSE
    oldIndexClose(indexName) {
        return ELASTICSEARCH_MODEL.client.indices.close({
            index: indexName
        });
    };

    // #[indices]
    // [indices][exists] : Check Exists Index
    indexCheck(indexName) {
        return ELASTICSEARCH_MODEL.indices.exists({
            index: indexName,
        });
    };

    // [indices][updateAliases] : Alias index update
    aliasUpdate(_aliasName, _lastIndexName) {
        let updateQuery = {
            actions: [
                {
                    "remove": {
                        "index": "*", "alias": _aliasName
                    }
                },
                {
                    "add": {
                        "index": _lastIndexName, "alias": _aliasName
                    }
                }
            ]
        };

        return this.ELASTICSEARCH_MODEL.indices.updateAliases({
            body: updateQuery
        });
    };


    // [cat][indices] : Check Last Index
    lastIndexCheck(_indexName) {
        return this.ELASTICSEARCH_MODEL.cat.indices({
            index: _indexName,
            format: 'json',
            s: 'index',
            h: 'index',
            v: true
        });
    };
}

module.exports = Elasticsearch;