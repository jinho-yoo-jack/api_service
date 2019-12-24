/**
 * Created by ibricks on 2019-10-14.
 */
// approot
let approot = require('app-root-path');

// express
let app = require('express')();
let validator = require('express-validator');

// response
let res_ok = require(approot + '/lib/res_ok');
let res_err = require(approot + '/lib/res_err');

// elasticsearch
let elasticsearch = require(approot + '/models/elasticsearch');

// config
let config = require(approot + '/config/config');

// moment
let moment = require('moment');

// md5
let md5 = require('md5');

let bodyParser = require('body-parser');

// fs
let fs = require('fs');

//http
let http = require('http');
//request
let request = require('request');

// req validator
app.use(validator());

app.use(bodyParser.urlencoded({extended: false}));

// http://.../
app.all('/', function (req, res, next) {
    console.log("start");
    res.status(403).send();
});

/*
	팟케스트 검색
 */
app.all('/cast', function (req, res, next) {
    console.log("cast search START");
    let s_body = {};
    let q = req.body['q'] || req.query['q'] || '';
    let start = req.body['start'] || req.query['start'] || 1;
    let size = req.body['size'] || req.query['size'] || 20;
    let sort = req.body['sort'] || req.query['sort'] || "last_release_date+desc";
    let filter_last_release_date = req.body['filter.last_release_date'] || req.query['filter.last_release_date'] ||
        "[2010-01-01T00:00:00,2030-01-01T00:00:00]";
    let q_option = req.body['q_option'] || req.query['q_option'] || "and,default_idx";
    let return_fields = req.body['return'] || req.query['return'] || "msrl,+cast_srl,+cast_name,+artist_name," +
        "+last_release_date,+release_date,+track_cnt,+search_word,+crt_dt";
    let arr_return_fields = [];
    let arr_filter_last_release_date = [];
    let arr_sort = [];

    if (return_fields != null) {
        arr_return_fields = replace_split(return_fields);
    }
    if (filter_last_release_date != null) {
        arr_filter_last_release_date = replace_split(filter_last_release_date);
    }
    if (sort != null) {
        arr_sort = replace_split_plus(sort);
    }

    let body = {};
    let elapsed = {};

    var wf_search = function () {
        var requery = {
            "bool": {
                "must": []
            }
        };

        if (arr_filter_last_release_date != null && arr_filter_last_release_date.length == 2) {
            requery.bool['filter'] = {
                "range": {
                    "last_release_date": {
                        "gte": arr_filter_last_release_date[0],
                        "lte": arr_filter_last_release_date[1],
                        "format": "yyyy-MM-dd'T'HH:mm:ss"
                    }
                }
            }
        }

        if (q != '') {
            var search_word = q.replace(/\//g, '\\/');
            requery.bool.must.push({ // requery.bool.must.push START
                "bool": {
                    "should": [
                        {
                            "multi_match": {
                                "fields": [
                                    "cast_name.keyword",
                                    "artist_name.keyword"
                                ],
                                "query": search_word,
                                "type": "cross_fields",
                                "analyzer": "keyword_analyzer",
                                "operator": "and"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": [
                                    "cast_name.pattern",
                                    "artist_name.pattern"
                                ],
                                "query": search_word,
                                "type": "cross_fields",
                                "analyzer": "pattern_analyzer",
                                "operator": "and"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": [
                                    "cast_name.token",
                                    "artist_name.token"
                                ],
                                "query": search_word,
                                "type": "cross_fields",
                                "analyzer": "standard_analyzer",
                                "operator": "and"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": [
                                    "cast_name.korean",
                                    "artist_name.korean"
                                ],
                                "query": search_word,
                                "analyzer": "kobrick_search",
                                "operator": "and"
                            }
                        }
                    ]
                }
            });
        }

        s_body = {
            "size": size,
            "from": (start - 1),
            "query": requery,
            "sort": []
        };

        if (sort != null && sort == "last_release_date+desc") {
            s_body.sort.push({"last_release_date": "desc"});
            s_body.sort.push("_score");
        }

        console.log("QUERY: %j", s_body);

        return elasticsearch.client1.search({
            index: "v1-podcast",
            type: "_doc",
            body: s_body,
            searchType: "dfs_query_then_fetch"
        });
    }
    // Search results 가공
    var sendresult = function (resp) {
        console.log(resp);
        // elapsed time

        var message = {};
        var meta = {};
        var result = {};
        var termList = {};
        var term = [];
        var nclickUrlPrefix = {};
        var itemList = {};
        var item = [];

        var resp = resp[0];
        var total = resp.hits.total;

        let rank = (start - 1) + 1;

        if (total > 0) {
            for (var hit in resp.hits.hits) {
                var item_list = {};
                hit = resp.hits.hits[hit];

                item_list["rank"] = rank + "";
                rank++;
                item_list["docId"] = hit._id + "";
                item_list["relevance"] = hit._score + "";

                for (var fields in arr_return_fields) {
                    item_list[arr_return_fields[fields]] = hit._source[arr_return_fields[fields]] + "";
                    if (hit._source[arr_return_fields[fields]] == null) item_list[arr_return_fields[fields]] = "0";
                }

                item.push(item_list);

            }
        }

        let querylog_post = {
            uri: 'http://localhost:19200/gateway/_querylog',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            json: {
                "index": "v1-podcast",
                "query": q,
                "total": resp.hits.total,
                "took": resp.took
            }
        };
        request(querylog_post);


        meta["timezone"] = "+0900";
        meta["sas_version"] = "1.3.72";

        message.meta = meta;

        result["start"] = start + "";
        result["query"] = q + "";

        term.push(q);
        termList["term"] = term;
        result["termList"] = termList;

        result["total"] = total + "";
        result["itemCount"] = item.length + "";

        nclickUrlPrefix["url"] = null;
        nclickUrlPrefix["param"] = null;
        result["nclickUrlPrefix"] = nclickUrlPrefix;

        itemList["item"] = item;
        result["itemList"] = itemList;

        message["result"] = result;

        body.message = message;

        res.send(res_ok(req, body, elapsed));
    };

    // -- error handler: send error
    var errhandler = function (err) {
        res.status(500).send(res_err(req, 500, err.message));
    };

    //----- run workflow
    Promise
        .all([wf_search()])
        .then(sendresult)
        .catch(errhandler);
});

/*
	에피소드 검색
 */
app.all('/episode', function (req, res, next) {
    console.log("cast search START");
    let s_body = {};
    let q = req.body['q'] || req.query['q'] || '';
    let start = req.body['start'] || req.query['start'] || 1;
    let size = req.body['size'] || req.query['size'] || 20;
    let sort = req.body['sort'] || req.query['sort'] || "last_release_date+desc";
    let filter_last_release_date = req.body['filter.last_release_date'] || req.query['filter.last_release_date'] ||
        "[2010-01-01T00:00:00,2030-01-01T00:00:00]";
    let q_option = req.body['q_option'] || req.query['q_option'] || "and,default_idx";
    let return_fields = req.body['return'] || req.query['return'] || "msrl,+cast_srl,+episode_srl,+item_title," +
        "+item_pub_date,+crt_dt";
    let arr_return_fields = [];
    let arr_filter_last_release_date = [];

    if (return_fields != null) {
        arr_return_fields = replace_split(return_fields);
    }
    if (filter_last_release_date != null) {
        arr_filter_last_release_date = replace_split(filter_last_release_date);
    }

    let body = {};
    let elapsed = {};

    var wf_search = function () {
        var requery = {
            "bool": {
                "must": []
            }
        }

        if (q != '') {
            var search_word = q.replace(/\//g, '\\/');
            requery.bool.must.push({ // requery.bool.must.push START
                "bool": {
                    "should": [
                        {
                            "multi_match": {
                                "fields": [
                                    "item_author.keyword",
                                    "item_title.keyword"
                                ],
                                "query": search_word,
                                "type": "cross_fields",
                                "analyzer": "keyword_analyzer",
                                "operator": "and"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": [
                                    "item_author.pattern",
                                    "item_title.pattern"
                                ],
                                "query": search_word,
                                "type": "cross_fields",
                                "analyzer": "pattern_analyzer",
                                "operator": "and"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": [
                                    "item_author.token",
                                    "item_title.token"
                                ],
                                "query": search_word,
                                "type": "cross_fields",
                                "analyzer": "standard_analyzer",
                                "operator": "and"
                            }
                        },
                        {
                            "multi_match": {
                                "fields": [
                                    "item_author.korean",
                                    "item_title.korean"
                                ],
                                "query": search_word,
                                "analyzer": "kobrick_search",
                                "operator": "and"
                            }
                        }
                    ]
                }
            });
        }

        s_body = {
            "size": size,
            "from": (start - 1),
            "query": requery,
            "sort": []
        };

        if (sort != null && sort == "last_release_date+desc") {
            s_body.sort.push({"item_pub_date": "desc"});
            s_body.sort.push("_score");
        }

        console.log("QUERY: %j", s_body);

        return elasticsearch.client1.search({
            index: "v1-episode",
            type: "_doc",
            body: s_body,
            searchType: "dfs_query_then_fetch"
        });
    }
    var sendresult = function (resp) {
        // elapsed time

        var message = {};
        var meta = {};
        var result = {};
        var termList = {};
        var term = [];
        var nclickUrlPrefix = {};
        var itemList = {};
        var item = [];

        var resp = resp[0];
        var total = resp.hits.total;

        let rank = (start - 1) + 1;

        if (total > 0) {
            for (var hit in resp.hits.hits) {
                var item_list = {};
                hit = resp.hits.hits[hit];

                item_list["rank"] = rank + "";
                rank++;
                item_list["docId"] = hit._id + "";
                item_list["relevance"] = hit._score + "";

                for (var fields in arr_return_fields) {
                    item_list[arr_return_fields[fields]] = hit._source[arr_return_fields[fields]] + "";
                    if (hit._source[arr_return_fields[fields]] == null) item_list[arr_return_fields[fields]] = "0";
                }

                item.push(item_list);

            }
        }
        let querylog_post = {
            uri: 'http://localhost:19200/gateway/_querylog',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            json: {
                "index": "v1-episode",
                "query": q,
                "total": resp.hits.total,
                "took": resp.took
            }
        };
        request(querylog_post);

        meta["timezone"] = "+0900";
        meta["sas_version"] = "1.3.72";

        message.meta = meta;

        result["start"] = start + "";
        result["query"] = q + "";

        term.push(q);
        termList["term"] = term;
        result["termList"] = termList;

        result["total"] = total + "";
        result["itemCount"] = item.length + "";

        nclickUrlPrefix["url"] = null;
        nclickUrlPrefix["param"] = null;
        result["nclickUrlPrefix"] = nclickUrlPrefix;

        itemList["item"] = item;
        result["itemList"] = itemList;

        message["result"] = result;

        body.message = message;

        res.send(res_ok(req, body, elapsed));
    };

    // -- error handler: send error
    var errhandler = function (err) {
        res.status(500).send(res_err(req, 500, err.message));
    };

    //----- run workflow
    Promise
        .all([wf_search()])
        .then(sendresult)
        .catch(errhandler);
});


/*
	자동완성
 */
app.all('/autocomplete', function (req, res, next) {
    console.log("autocomplete search START");
    let s_body = {};
    let q = req.body['query'] || req.query['query'] || '';
    let start = req.body['start'] || req.query['start'] || 1;
    let size = req.body['size'] || req.query['size'] || 10;
    let title = req.body['title'] || req.query['title'] || "cast,episode";
    let arr_title = [];

    let resp_cast;
    let resp_episode;

    if (title != null) {
        arr_title = replace_split(decodeURI(title));
    }

    let body = {};
    let elapsed = {};

    let searchCnt = 0;

    var wf_search = function () {
        var requery = {
            "bool": {
                "must": []
            }
        }

        if (q != '') {
            var search_word = q.replace(/\//g, '\\/');
            requery.bool.must.push({ // requery.bool.must.push START
                "multi_match": {
                    "fields": [
                        "keyword.autocomplete^50",
                        "keyword.keyword^100",
                        "keyword.prefix^200"
                    ],
                    "query": search_word,
                    "operator": "AND"
                }
            });
        }

        //ES 검색 쿼리 실행
        if (arr_title.length > 0) {
            for (var label in arr_title) {
                requery.bool['filter'] = {
                    "term": {
                        "label": arr_title[label]
                    }
                }
                var str_label = arr_title[label];

                s_body = {
                    "size": size,
                    "from": (start - 1) * size,
                    "query": requery
                };

                console.log("QUERY: %j", s_body);

                searchCnt++;
                elasticsearch.client1.search({
                    index: "v1-autocomplete",
                    type: "doc",
                    body: s_body
                }).then(function (resp) {
                    if (resp.hits.hits[0]._source.label == "cast") resp_cast = resp;
                    if (resp.hits.hits[0]._source.label == "episode") resp_episode = resp;
                    var srchTotal = resp.hits.total;
                    if (searchCnt % arr_title.length == 0) {
                        //if(searchCnt%arr_title.length == 0 && searchCnt >0){
                        return Promise.race([sendresult()]);
                    }
                });
            }
        } else {
            res.send(res_err(req, 500, "ERROR."));
        }
    }

    var sendresult = function (resp) {
        // elapsed time

        var collection = [];
        var item = [];
        var query = [];

        var total = 0;

        var rank = 0;

        if (arr_title.length > 0) {
            for (var label in arr_title) {
                if (arr_title[label] == "cast" && resp_cast != null) {
                    resp = resp_cast;
                    total = resp_cast.hits.total;
                } else if (arr_title[label] == "episode" && resp_episode != null) {
                    resp = resp_episode;
                    total = resp_episode.hits.total;
                }

                if (total > 0) {
                    var item = {};
                    item["index"] = rank;
                    item["title"] = arr_title[label];
                    var items = [];

                    for (var hit in resp.hits.hits) {
                        hit = resp.hits.hits[hit];
                        var item_list = [];
                        item_list.push(hit._source["keyword"]);
                        items.push(item_list);
                    }
                    item["items"] = items;
                    collection.push(item);
                    rank++;
                }
            }
        }
        let querylog_post = {
            uri: 'http://localhost:19200/gateway/_querylog',
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            json: {
                "index": "v1-autocomplete",
                "query": q,
                "total": resp.hits.total,
                "took": resp.took
            }
        };
        request(querylog_post);

        query.push(q + "");
        body["query"] = query;
        body["ver"] = "1.0";
        body["collections"] = collection;

        res.send(res_ok(req, body, elapsed));

    };

    // -- error handler: send error
    var errhandler = function (err) {
        res.status(500).send(res_err(req, 500, err.message));
    };

    //----- run workflow
    Promise
        .all([wf_search()])
        .catch(errhandler);
});

module.exports = app;

function replace_split(str) {
    var arr = [];

    if (str != "" && str != undefined) {
        str = str.replace(/([\[\]']+)|(^\s*)|(\s*$)|(\+)/gi, "");
        arr = str.split(",");
    }

    return arr;
}

function replace_split_plus(str) {
    var arr = [];

    if (str != "" && str != undefined) {
        str = str.replace(/([\[\]']+)|(^\s*)|(\s*$)/gi, "");
        arr = str.split("+");
    }

    return arr;
}
