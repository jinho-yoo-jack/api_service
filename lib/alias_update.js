/*
    UPDATE Index Alias API
    정의 : Add or Remove index alias
    형식 : POST /_aliases
    설명 : aliasName 으로 설정된 모든 index 의 alias 를 삭제 후,
          lastIndexName 에 alias 를 aliasName 으로 Updating
 */
const rootpath = require('app-root-path');
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const updateAliasByIndex = async (aliasName, lastIndexName) => {
    let s_query = {
        actions : [
            {"remove" : {"index" : "*",           "alias" : aliasName}},
            {"add"    : {"index" : lastIndexName, "alias" : aliasName}}
        ]
    };
    return await esClient.client.indices.updateAliases({
        body  : s_query
    });
};

module.exports = updateAliasByIndex;