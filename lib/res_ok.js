module.exports = function(resultStatus, resultMessages,response) {
    let resultJSON = {};
    resultJSON['result_code'] = resultStatus;
    resultJSON['result_messages'] = resultMessages;

    if(response != null){
        resultJSON['result_action'] = response;
    }

    return resultJSON;
};
