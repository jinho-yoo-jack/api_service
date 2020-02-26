/*
    ELASTICSEARCH API for Node.js
    - elasticsearch 모듈 분리 및 매개변수로 전달 --> SE 및 RE 때문에
    - 검색 : [중분류][//중소분류][소분류]
    중분류 : cat, client, indices ...
    소분류 : insert, delete, update ...
 */
const rootpath = require('app-root-path');
const commons = module.exports = {};
/*#################################################################################################################*/

// jsonQuery

//
commons.replace_split = (str, delimiter) => {
    let arr = [];
    if(str != "" && str != undefined){
        str = str.replace(/([\[\]']+)|(^\s*)|(s\*$)|(\+)/gi, "");
        arr = str.split(delimiter);
    }
    return arr;
};

// String str 앞뒤공백제거
commons.regxp_trim = (str) => {
    let result = str;
    result = result.replace(/(^\s*)|(\s*$)/, "");
    return result;
};

// 날짜형식 변경
commons.chgDateFrm = (strDate) => {
    let result = null;
    let string_date = strDate;
    let strLeng = 0;

    if(typeof(string_date) == 'number')
        string_date = string_date.toString();

    if(string_date != null){
        strLeng = string_date.length;
        let yyyy, mm, dd;
        if(strLeng == 8){
            yyyy = string_date.substring(0,4);
            mm   = string_date.substring(4,5);
            mm   = "0" + mm;
            dd   = string_date.substring(5,strLeng);
        }
    }
}
