    const http = require('http');
    const moment = require('moment');

    let readJSONResponse = (response) => {
        let responseData = '';
        response.on('error', (err) => {
            console.error(err.message);
            response.end(JSON.stringify({
                status: 500,
                error: err.message
            }));
        }).on('data', function (chunk) {
            responseData += chunk;
        });
        response.on('end', function () {
            // console.info("Return : " + JSON.parse(responseData).status);
            // console.log('Log transmission was successful');
        });
    }

    var validCheck = function (ObjType, ObjData) {
        if (ObjType.toLocaleLowerCase() === "Object".toLocaleLowerCase()) {
            if (Object.prototype.toString.call(ObjData).split(" ")[1].replace(']', '')
                .toLocaleLowerCase() === ObjType.toLocaleLowerCase()) {
                return true;
            } else {
                return false;
            }
        } else if (ObjType.toLocaleLowerCase() === "String".toLocaleLowerCase()) {
            if (Object.prototype.toString.call(ObjData).split(" ")[1].replace(']', '')
                .toLocaleLowerCase() === ObjType.toLocaleLowerCase()) {
                return true;
            } else {
                return false;
            }
        } else if (ObjType.toLocaleLowerCase() === "Array".toLocaleLowerCase()) {
            if (Object.prototype.toString.call(ObjData).split(" ")[1].replace(']', '')
                .toLocaleLowerCase() === ObjType.toLocaleLowerCase()) {
                return true;
            } else {
                return false;
            }
        } else if (ObjType.toLocaleLowerCase() === "Number".toLocaleLowerCase()) {
            if (Object.prototype.toString.call(ObjData).split(" ")[1].replace(']', '')
                .toLocaleLowerCase() === ObjType.toLocaleLowerCase()) {
                return true;
            } else {
                return false;
            }
        }
    }
    /*
        managerInfo : setManagerInfo return Value --> [Object]
        elsRequest : elasticsearch request query --> [Object]
        elsResponse : elasticsearch response --> [Object]
        keyword : Search query keyword --> [String]
        service : Search service name --> [String]
        refiner : What you want statistics for --> [Array]
    */
    var sendStatToManager = function (managerInfo, elsRequest, elsResponse, keyword, service, refiner) {
        // arguments 유효성 검사.
        if (validCheck("Object", managerInfo) == false) {
            console.error('[ERROR] 1st argument is invaild.');
            return;
        }
        if (validCheck("Object", elsRequest) == false) {
            console.error('[ERROR] 2nd argument is invaild.');
            return;
        }
        if (validCheck("Object", elsResponse) == false) {
            console.error('[ERROR] 3th argument is invaild.');
            return;
        }
        if (validCheck("String", keyword) == false) {
            console.error('[ERROR] 4th argument is invaild.');
            return;
        }
        if (validCheck("String", service) == false) {
            console.error('[ERROR] 5th argument is invaild.');
            return;
        }
        if (validCheck("array", refiner) == false) {
            console.error('[ERROR] 6th argument is invaild.');
            return;
        }

        var query = "";
        // 검색 키워드가 없을 경우 공백으로 입력.
        if (keyword != undefined && keyword != null) {
            query = keyword;
        } else {
            query = " ";
        }
        var req = http.request(managerInfo, readJSONResponse);
        var dataObj = {};
        dataObj.request = JSON.stringify(elsRequest);
        ;
        var resObj = {};
        if (elsResponse != null && elsResponse instanceof Object) {     // 검색 결과가 객체이고 필요한 항목만 추출하여 서버로 전송.
            resObj.took = elsResponse.took;
            resObj.total = elsResponse.hits.total;
        }
        dataObj.response = resObj;
        dataObj.query = query;
        dataObj.service = service;
        dataObj.refiner = refiner;
        dataObj.timestamp = moment().utc().toISOString();
        req.write(JSON.stringify(dataObj));
        req.end();
    }

    var setManagerInfo = function (manageIp, managePort) {
        var options = {
            hostname: manageIp,
            port: managePort,
            path: '/querylog',
            method: 'POST'
        };
        // console.log("Set server info : ", JSON.stringify(options, null, 2));
        return options;
    }

    module.exports.sendStatToManager = sendStatToManager;
    module.exports.setManagerInfo = setManagerInfo;

