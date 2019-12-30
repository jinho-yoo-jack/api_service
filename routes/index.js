const _express = require('express');
const _router = _express.Router();
const _request = require('request');

const config = require('../../../src/config');
const logger = require('../../../src/module/logger')(module);
const esclient = require('../../../src/module/esclient');

const querylog = require('../../../src/server/gateway/express/routes/querylog');
const LG_HOMEPAGE = 'https://www.lgchem.com'; // 운영 오픈주소
const BASIC_IMAGE = '/asset/images/common/company/thumb_dummy_detail.png'; // 이미지 url 없을 시 대체 이미지
const HIGHLIGHT_TAG = "<em class='point'>";

// http://127.0.0.1:19200/gateway/search
_router.post('/', function (req, res, next) {

    /************************************************************
     * get parameter
     ************************************************************/
    let language = req.body.language || 'kor'; // 언어 (KOR, ENG, CHN, POL, GER)
    let keyword = req.body.keyword || ''; // 검색어
    let category = req.body.category || 'all'; // 카테고리 (all, product, company, sustainability, recruit)
    let themaName = req.body.thema_name || undefined; // 테마 종류 (atoz, business, industry, life)
    let themaValue = req.body.thema_value || undefined; // 테마 값 (a,b,c...)
    let size = req.body.size || 3; // 한 페이지 게시물 수
    let from = req.body.from || 0; // 게시물 시작 번호

    // parameter 앞 뒤 공백 제거, 소문자로 변경
    let replaceStr = (arr) => {
        arr.forEach((val, idx, arr) => {
            if (val !== undefined && val !== '') {
                arr[idx] = val.replace(/(^\s*)|(\s*$)/g, '').toLowerCase();
            }
        });
        return arr;
    }
    let arr = [language, keyword, category, themaName, themaValue];
    [language, keyword, category, themaName, themaValue] = replaceStr(arr);

    // all 키워드 check
    if (keyword == '*') keyword = '';

    // 언어별 url parameter
    let urlParam = {
        "kor": "ko_KR",
        "eng": "en_GLOBAL",
        "chn": "zh_CN",
        "ger": "de_GER",
        "pol": "pl_POL",
        "jpn": "ja_JP"
    }

    /************************************************************
     * set search index
     ************************************************************/

        // search index (언어별+카테고리별)
    let index = language + '_' + category; //search index (ex. kor_all, kor_product, kor_company,
    // kor_sustainability, kor_recruit)
    let printIndex = category; // print index

    // multisearch index
    let indexProduct = language + '_product';
    let indexCompany = language + '_company';
    let indexSustainability = language + '_sustainability';
    let indexRecruit = language + '_recruit';
    let allCate = ['product', 'company', 'sustainability', 'recruit'];

    /************************************************************
     * set request body
     ************************************************************/

    let multiBody;
    let body = {
        query: {
            bool: {
                must: []
            }
        }
    };
    body.size = size;
    body.from = from;
    body._source = {
        excludes: [
            "attach_contents",
            "contents",
            "grade"
        ]
    };
    body.highlight = {
        number_of_fragments: 3,
        fragment_size: 150,
        fields: {
            ["title." + language]: {
                "no_match_size": 150
            },
            ["title.n"]: {
                "no_match_size": 150
            },
            ["product_title." + language]: {
                "no_match_size": 150
            },
            "product_title.n": {
                "no_match_size": 150
            },
            "grade.n": {},
            ["contents." + language]: {
                "no_match_size": 200,
                "number_of_fragments": 1
            },
            ["attach_title." + language]: {
                "number_of_fragments": 20
            },
            ["attach_contents*." + language]: {
                "fragment_size": 20,
                "number_of_fragments": 1
            },
            "category": {
                "no_match_size": 150
            },
            "regdate": {}
        }
    };
    // 키워드 검색
    if (keyword !== '') {
        body.query.bool.must.push(
            {
                simple_query_string: {
                    query: keyword,
                    default_operator: "AND",
                    fields: [
                        "title*",
                        "product_title*",
                        "contents*",
                        "attach_title*",
                        "attach_contents*",
                        "category",
                        "regdate",
                        "grade.n"
                    ]
                }
            }
        );
        // product 테마 검색
    } else if (keyword == '' && category === 'product' && themaName !== undefined && themaValue !== undefined) {
        body.query.bool.must.push(
            {
                term: {
                    ['thema_' + themaName]: {
                        value: themaValue
                    }
                }
            }
        );
        // 키워드 없을 시 결과 없음
    } else if (keyword == '') {
        body = {
            query: {
                bool: {
                    must_not: [
                        {
                            match_all: {}
                        }
                    ]
                }
            }
        };
    }

    /************************************************************
     * convert response
     ************************************************************/

        // error response
    let convertErrResp = () => {
            return resp = {
                total: 0,
                status: 500,
                items: []
            }
        }

    // multisearch response
    let convertMsearchResp = (resps) => {

        let result = {};
        result.allTotal = 0;
        result.language = language;
        resps.responses.forEach((resp, idx) => {
            if (resp.error !== undefined) {
                result[allCate[idx]] = convertErrResp(resp);
                return false;
            }
            result.allTotal += resp.hits.total;
            result[allCate[idx]] = convertResp(resp);
        });
        return result;
    }

    // search response
    let convertResp = (resp) => {

        let result = {};
        result.total = resp.hits.total;
        result.status = resp.status || 200;

        let items = [];
        let hits = resp.hits.hits;

        hits.forEach((val) => {

            let _source = val._source;
            let highlight = val.highlight;
            let item = {};
            let attachTitleObj = {}; // 첨부파일 목록

            let title = (highlight['title.' + language] === undefined) ? '' : highlight['title.' + language][0].replace(/<em>/g, HIGHLIGHT_TAG);
            item.title = title;

            // product 일 경우
            let tempTitleField = '';
            if (title == '') {
                tempTitleField = 'product_title';
            } else {
                tempTitleField = 'title';
            }


            let p_title1 = (highlight[tempTitleField + '.' + language] === undefined) ? '' : highlight[tempTitleField + '.' + language][0];
            let p_title2 = (highlight[tempTitleField + '.n'] === undefined) ? '' : highlight[tempTitleField + '.n'][0];

            let title1Cnt = p_title1.match(/<em>/g) || [];
            let title2Cnt = p_title2.match(/<em>/g) || [];
            // <em>태그 개수가 같다면 <em>태그 내 길이가 더 긴 것
            if (title1Cnt.length == title2Cnt.length) {
                let title1Str = p_title1.replace(/(^.*<em>)|(<\/em>.*$)/g, '') || '';
                let title2Str = p_title2.replace(/(^.*<em>)|(<\/em>.*$)/g, '') || '';
                if (title1Str.length > title2Str.length) {
                    let title = (highlight[tempTitleField + '.' + language] === undefined) ? '' : highlight[tempTitleField + '.' + language][0];
                    item.title = ConvertHtml(title).replace(/<em>/g, HIGHLIGHT_TAG);
                } else {
                    let title = (highlight[tempTitleField + '.n'] === undefined) ? '' : highlight[tempTitleField + '.n'][0];
                    item.title = ConvertHtml(title).replace(/<em>/g, HIGHLIGHT_TAG);
                }
                // <em>태그 개수가 다르다면 <em>태그 개수가 더 많은 것
            } else if (title2Cnt.length > title1Cnt.length) {
                let title = (highlight[tempTitleField + '.n'] === undefined) ? '' : highlight[tempTitleField + '.n'][0];
                item.title = ConvertHtml(title).replace(/<em>/g, HIGHLIGHT_TAG);
            } else {
                let title = (highlight[tempTitleField + '.' + language] === undefined) ? '' : highlight[tempTitleField + '.' + language][0];
                item.title = ConvertHtml(title).replace(/<em>/g, HIGHLIGHT_TAG);
            }

            // 내용
            let contents = (highlight['contents.' + language] === undefined) ? '' : highlight['contents.' + language][0];
            item.contents = ConvertHtml(contents).replace(/<em>/g, HIGHLIGHT_TAG);

            // grade - product만 있음
            let grade = (highlight['grade.n'] === undefined) ? [] : highlight['grade.n'];
            let gradeTxt = '';
            if (grade.length > 0) {
                grade.forEach((item, idx) => {
                    if (idx == (grade.length - 1)) {
                        gradeTxt += item.replace(/(^\s*)|(\s*$)/g, '');
                    } else {
                        gradeTxt += (item.replace(/(^\s*)|(\s*$)/g, '') + ', ');
                    }
                });
                item.grade = gradeTxt.replace(/<em>/g, HIGHLIGHT_TAG);
                ;
            } else {
                item.grade = '';
            }

            // 페이지 url - 생명과확 제외하고 앞에 LG화학 domain과 끝에 언어별 parameter 추가
            let pageurl = _source.pageurl || '';
            if (pageurl != '' && pageurl.indexOf('http') != 0) {
                pageurl = (LG_HOMEPAGE + pageurl + '?lang=' + urlParam[language]);
            }
            item.pageurl = pageurl;

            // 모바일 페이지 url - 생명과학만 별도로 있음
            let pageurlmobile = (_source.pageurlmobile == undefined) ? pageurl : _source.pageurlmobile;
            item.pageurlmobile = pageurlmobile;

            // 이미지 url - 생명과확 제외하고 LG화학 domain 추가
            let thumbnail = (_source.imgurl === undefined || _source.imgurl == '/' || _source.imgurl == '') ?
                LG_HOMEPAGE + BASIC_IMAGE : _source.imgurl;

            if (thumbnail != '' && thumbnail.indexOf('http') == -1) {
                thumbnail = (LG_HOMEPAGE + thumbnail);
            }
            item.thumbnail = thumbnail;

            // 모바일 이미지 url - product만 있음
            let imgurlmobile = (_source.imgurlmobile === undefined || _source.imgurlmobile == '/' || _source.imgurlmobile == '') ?
                LG_HOMEPAGE + BASIC_IMAGE : _source.imgurlmobile;
            if (_source.imgurl.indexOf('http') != -1) { // 생명과학
                imgurlmobile = _source.imgurl;
            } else if (imgurlmobile.indexOf('http') == -1) { // LG화학
                imgurlmobile = (LG_HOMEPAGE + imgurlmobile);
            }
            item.imgurlmobile = imgurlmobile;

            // 카테고리
            item.category = _source.category || '';

            // 이미지 title - product만 없음
            item.thumbnail_text = _source.thumbnail || '';

            // 날짜
            item.regdate = _source.regdate || '';

            // product 테마 종류
            if (category === 'product' && themaName !== undefined && themaValue !== undefined) {
                result[themaName] = _source[themaName];
            }

            /**
             * 검색된 첨부파일 확인
             */
            let searchIdx = new Map(); // 첨부파일 번호
            let printTitle = [];

            // 모든 첨부파일 제목 목록 - 배열 > 객체
            let attachTitleList = _source['attach_title'] || undefined;
            if (attachTitleList === undefined || attachTitleList.length === 0) {
                item.attach_title = null;
                items.push(item);
                return false;
            } else {
                attachTitleList.forEach((val, idx) => {
                    attachTitleObj[idx] = val.replace(idx + ':', '');
                    searchIdx.set(idx, idx);
                });
            }
            // 하이라이팅된 첨부파일 제목 목록
            let highlightAattachTitles = highlight['attach_title.' + language] || undefined;
            if (highlightAattachTitles !== undefined) {
                highlightAattachTitles.forEach((val, idx) => {
                    let key = Number(val.replace(/:.*/, ''));
                    searchIdx.delete(key);
                    printTitle.push(val.replace(/.*:/, '')); // 하이라이팅된 제목 추가
                });
            }
            // 하이라이팅된 첨부파일 내용 목록
            searchIdx.forEach((val, idx) => {
                let highlightAttachContents = highlight['attach_contents.c_' + idx + '.' + language] || undefined;
                if (highlightAttachContents !== undefined) {
                    printTitle.push(attachTitleList[idx].replace(/.*:/, ''));
                }
            });

            if (printTitle.length === 0) {
                item.attach_title = null;
            } else {
                item.attach_title = printTitle;
            }

            items.push(item);
        });
        result.items = items;
        return result;
    }

    // convert html tag
    function ConvertHtml(str) {
        html = {
            '"': '&quot;'
            , "'": '&apos;'
        };
        return str.replace(/["']/g, function (key) {
            return html[key];
        });
    }


    /************************************************************
     * send query to elasticsearch
     ************************************************************/

        // msearch
    let multiSearchElastic = function () {
            console.log('msearch-----\n', JSON.stringify(multiBody));

            esclient.search.msearch({
                body: multiBody

            }).then((resp) => {
                let result = convertMsearchResp(resp);
                res.send(result);

                // keyword logging
                if (keyword !== '') {
                    querylog.write(index, keyword, result.allTotal, '');
                }

            }, (err) => {
                res.status(err.statusCode).send(err.response);
                logger.error('elasticsearch error | ' + err.toString());
            });
        };

    // search
    let searchElastic = function () {
        console.log('search-----', index, '\n', JSON.stringify(body));

        esclient.search.search({
            index: index,
            body: body

        }).then((resp) => {
            let result = convertResp(resp);
            result.language = language;
            result.category = printIndex;

            res.send(result);

            // keyword logging
            if (keyword !== '') {
                querylog.write(index, keyword, resp.hits.total, resp.took);
            }

        }, function (err) {
            res.status(err.statusCode).send(err.response);
            logger.error('elasticsearch error | ' + err.toString());
        });
    };


    /************************************************************
     * 검색 조건
     ************************************************************/
    // 모든 카테고리 검색
    if (category === 'all') {

        multiBody = [
            {index: indexProduct},
            body,
            {index: indexCompany},
            body,
            {index: indexSustainability},
            body,
            {index: indexRecruit},
            body
        ];
        multiSearchElastic();

    } // 개별 카테고리 검색
    else {
        searchElastic();
    }
    ;

});

module.exports = _router;