// #Load app Dependencies
const app = require('express')();
const rootpath = require('app-root-path');
const {
    check,
    checkSchema,
    validationResult
} = require('express-validator');
const bodyParser = require('body-parser');
const jsonStream = require('JSONStream');
const moment = require('moment');

// #Common Module
const commons = require(`${rootpath}` + '/common/commons');
const res_ok = require(`${rootpath}` + '/lib/res_ok');
const res_err = require(`${rootpath}` + '/lib/res_err');

// #Elasticsearch Module
const openqrySE = require(`${rootpath}` + '/models/elasticsearch');
const openqryRE = require(`${rootpath}` + '/models/elasticsearch_RE');
const ES_SE = require(`${rootpath}` + '/lib/elasticsearch_api')(openqrySE);
const ES_RE = require(`${rootpath}` + '/lib/elasticsearch_api')(openqryRE);

// Global Variable
const today = moment().format('YYYYMMDD');

// #Load app Middleware
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// app.all('URL', check() ,() => {}
/* I/F ID : SEARCH-0001  */
app.all('/', [
        check('keyword')
            .not()
            .isEmpty()
            .withMessage('Keyword is required!!!')
    ],
    async (req, res) => {
        // Request Params Check Validation
        let errors = validationResult(req).array();
        console.log(errors);

        // Request Params
        let keyword = req.body.keyword || req.query.keyword,
            start = req.body.page || req.query.page || 0,
            size = req.body.size || req.query.size || 0,
            sort = req.body.sort || req.query.sort,
            order = req.body.order || req.query.order,
            category = req.body.category || req.query.category || 'all',
            device = req.body.device || req.query.device || 'pc',
            deviceId = [];

        start = start != 0 ? start - 1 : 1;

        if (device == 'pc') deviceId = ['01', '03', '05', '07'];
        else if (device == 'app') deviceId = ['01', '04', '06', '07'];
        else deviceId = ['01', '02', '05', '06'];

        let size_map = new Map();
        size_map.set('card', 3);
        size_map.set('menu', 3);
        size_map.set('financial', 3);
        size_map.set('faq', 3);
        size_map.set('event', 6);
        size_map.set('notice', 3);
        size_map.set('etccontent', 3);
        size_map.set('help', 3);

        let source_map = new Map();
        source_map.set('card', ['']);
        source_map.set('menu', ['menu_name', 'full_menu_name', 'menu_url']);
        source_map.set('financial', ['artsubject', 'fin_info', 'fin_loan', 'fin_bond', 'url']);
        source_map.set('faq', ['title', 'contents']);
        source_map.set('event', ['mob_wb_evt_nm', 'hpg_evt_cag_ccd', 'mob_wb_evt_std', 'mob_wb_evt_edd']);
        source_map.set('notice', ['sbjt_nm', 'fst_cot_url_ar']);
        source_map.set('ectcontent', ['artsubject', 'fst_cot_url_ar', 'url']);
        source_map.set('help', ['artsubject,url']);


        let arr_category = [];
        // category value =  all or null
        if (category == "all" || category == null || category == "")
            category = "menu^card^financial^faq^notice^help^etccontent";

        // category parameter isn`t null
        if (category != null) {
            arr_category = category.split("^");
        }

        // category parameter isn`t null and arr_category length is 1
        if (arr_category.length == 1 && size > 0) size_map.set(arr_category[0], size);

        // #1. Create Search Query By Category
        let query_map_by_cate = new Map();
        for (let cate in arr_category) {
            // Query Body
            let m_query = {};

            // Search Query Body
            let s_query = {
                "bool": {
                    "must": [
                        {
                            "bool": {
                                "must": [],
                                "should": []
                            }
                        }
                    ],
                    "should": [],
                    "filter": []
                }
            };
            // Title Search Query
            let title_query = {
                "multi_match": {
                    "query": keyword,
                    "fields": [
                        "search_title_exact^1000",
                        "search_title_keyword^800",
                        "search_title_kobrick^700",
                        "search_title_chosung^100",
                        "search_title_ngram^50",
                    ],
                    "type": "cross_fields",
                    "operator": "and"
                }
            };
            s_query.bool.must[0].bool.should.push(title_query);

            // Body Search Query
            let body_query = {
                "multi_match": {
                    "query": keyword,
                    "fields": [
                        "search_body_*^10"
                    ],
                    "operator": "and"
                }
            };
            s_query.bool.must[0].bool.should.push(body_query);

            // Highlight Query
            let s_highlight = {
                "fields": {
                    "search_title*": {},
                    "search_body*": {}
                }
            };


            // device Query
            let device_query = {
                "terms": {
                    "device_id": deviceId
                }
            };
            if (arr_category[cate] == 'menu') {
                s_query.bool.filter.push(device_query);
            }

            // Result Size Count by Category
            let sort_size = size_map.get(arr_category[cate]);
            m_query['size'] = sort_size;

            // Paging Query
            let paging_query = start * size_map.get(arr_category[cate]);
            m_query['size'] = paging_query;

            // _Source Query
            let source_query = source_map.get(arr_category[cate]);
            m_query['_source'] = source_query;

            // Sorting Query Only Card and Event
            let sort_range = {
                "range": {}
            };

            if (sort != null && (arr_category[cate] == 'event' || arr_category[cate] == 'card')) {
                if (arr_category[cate] == 'event') {
                    if (sort == 'now_event') sort_range.range['mob_wb_evt_edd'] = {'gte': today};
                    else if (sort == 'end_event') sort_range.range['mob_wb_evt_edd'] = {'lte': today};
                    else sort_range.range['mob_wb_evt_edd'] = {};
                    s_query.filter.push(sort_range);
                } else {
                    m_query['sort'] = [];
                    if (sort == 'date') m_query.sort.push({'open_date': 'desc'});
                    else if (sort == 'high_rate') m_query.sort.push({'pvafeat': 'desc'});
                    else if (sort == 'low_rate') m_query.sort.push({'pvafeat': 'asc'});
                }
            }
            // s_query merge to m_query
            m_query['query'] = s_query;

            //@console.log('All Query ::: %j', s_query);
            query_map_by_cate.set(arr_category[cate], m_query);
        }

        // #2. Search Action
        ES_SE.multiSearch(query_map_by_cate)
            .then((response) => {
                res.json(response);
            })
            .catch((error) => {
                res.json(error);
            });

        // #3. Search Result Convert --> jsonConvert
        //res.json(searchResult);


    });

module.exports = app;


















