/*
    Check Last Index API
    정의 : 지정된 Index 이름으로 마지막으로 색인된 index 를 찾는 API
    형식 : GET _cat/indices/<index>?s=index
    RETURN TYPE = Array Index

 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const checkLastIndex = async (indexName) => {
    return await esClient.cat.indices({
        index  : indexName,
        format : 'json',
        s      : 'index',
        h      : 'index',
        v      : true
    });
};
/* Error 처리는 함수 호출 하는 부분에서 적용 */
module.exports = checkLastIndex;