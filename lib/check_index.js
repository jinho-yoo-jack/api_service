/*
    Check Last Index API
    정의 : 지정된 Index 이름으로 마지막으로 색인된 index 를 찾는 API
    형식 : GET _cat/indices/<index>?s=index
    RETURN TYPE = Array Index

 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const checkExistIndex = (indexName) => {
    return esClient.indices.exists({
        index : indexName,
    }).then((response) => {
        console.log(response);
    }).catch((error) => {
        return error;
    })
};


module.exports = checkExistIndex;