/*
    UPDATE Index Alias API
    정의 : Add or Remove index alias
    형식 : POST /_aliases
    설명 : aliasName 으로 설정된 모든 index 의 alias 를 삭제 후,
          lastIndexName 에 alias 를 aliasName 으로 Updating
 */
const rootpath = require('app-root-path');
const spawn = require("child_process").spawn;
const esClient = require(`${rootpath}` + '/models/elasticsearch');

const runLogstashAsPython = async (aliasName, lastIndexName) => {
    //const pythonProcess = spawn('python',["path/python.py", arg1, arg2, ...]);
    const pythonProcess = spawn('python3', ["/Users/jinokku/PycharmProjects/python-logstash-elasticsearch/run_logstash.py"]);
    console.log(pythonProcess);
};
runLogstashAsPython();
module.exports = runLogstashAsPython;