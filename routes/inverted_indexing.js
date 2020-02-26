const rootpath = require('app-root-path');
const fs = require('fs');
const moment = require('moment');

let main = () => {

    fs.readFile(`${rootpath}` + '/doc/input.small', 'utf8', (err, data) => {
        if (err) throw err.toString();
        let startTime = new Date().getTime();
        // Dataset is (Keyword, [{document_num : num, frequency : num} ... ]);
        let resultMap = new Map();
        let regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi;
        let sentences = data.toString().split("\n");
        for (i in sentences) {

            // 1. 특수문자 치환 및 공백기준으로 자른다.
            // ex) "What?  What  is is is it" ==> "What What is is is it" ==> "what","what","is","is","it"
            let sentence = sentences[i].replace(regExp, ' ').toLowerCase().split(' ').filter(Boolean);
            // 2. Document ID 설정
            let doc_id = sentence[i - i];
            sentence.splice(0, 1);
            for (let i in sentence) {
                let word = sentence[i];
                if (resultMap.get(word) != undefined) {
                    if (resultMap.get(word).has(doc_id)) {
                        let mapValue = resultMap.get(word).get(doc_id) + 1;
                        resultMap.get(word).set(doc_id, mapValue);
                    } else {
                        resultMap.get(word).set(doc_id, 1);
                    }
                } else {
                    resultMap.set(word, new Map().set(doc_id, 1));
                }
            }
            //resultMap.forEach((value, key) => {
            //    console.log('key ::: ',key);
            //    console.log('value ::: ', value);
            //});

        }

        resultMap = new Map([...resultMap.entries()].sort());
        let result = "";
        resultMap.forEach((value, key) => {
            // key is word
            // value is Map(doc_id, value)
            let word = key;
            let docMap = value;
            
            docMap.forEach((key, value) => {
                result += word+' '+key+' '+value;
            });
            result +="\n";

        });

        fs.writeFile(`${rootpath}` + '/doc/jinho.output.big', result ,(err,data) => {
            if(err) console.log(err);
            console.log(data);

        });

        let endTime = new Date().getTime();
        console.log(endTime - startTime);
    });
}
main();