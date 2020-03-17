//#Export Module Node.js
const rootpath = require('app-root-path');
const app = require('express')();
const validator = require('express-validator');
const res_ok = require(`${rootpath}` + '/lib/res_ok');
const res_err = require(`${rootpath}` + '/lib/res_err');
const bodyParser = require('body-parser');

//#Export Function Elasticsearch API
const updateIndexById = require(`${rootpath}` + '/lib/updateIndexById');
const insertIndexById = require(`${rootpath}` + '/lib/insertIndexById');
const deleteIndexById = require(`${rootpath}` + '/lib/deleteIndexById');

// #Definition Middleware
app.use(validator());
app.use(bodyParser.urlencoded({extended: false}));

/* I/F ID : INDEX-0001  */
app.all('/', async (req, res) => {

    let actionFlag = req.body.iud || req.query.iud || null;
    if (actionFlag == null) {
        res.status(401).send(res_err(req, 401, 'iud is not null'));
    }
    let _index = req.body.index || req.query.index || null;
    let _docType = req.body.type || req.query.type || 'doc';
    let _docId = req.body.pk || req.query.pk || null;
    let _opType = req.body.opType || req.query.opType || 'index';
    let fields = req.body.fields || req.query.fields || null;
    if (fields != null) {
        fields = fields.split(String.fromCharCode(0x01));
    }
    let values = req.body.values || req.query.values || null;
    if (values != null) {
        values = values.split(String.fromCharCode(0x01));
    }
    // Check Valid Request Parameter
    let result = null;
    if (actionFlag == 'u') {
        if (fields == null || values == null) {
            res.status(401).send(res_err(req, 401, '필수 값 NULL, Update 동작 시, fields,values 필수 값'));
        } else if (fields != null && values != null) {
            if (fields.length != values.length) {
                res.status(401).send(res_err(req, 401, '필수 값 NULL, Update 동작 시, fields,values 길이 상이'));
            }
            else {
                result = await updateIndexById(fields, values, _index, _docType, _docId);
                let success = result._shards.successful || 0;
                if(success > 0) {
                    let search_reponse = searchIndexById(_index, _docType);
                    if(search_reponse.hits != undefined)
                        res.send(res_ok(200,'Document Update Success',source));
                    else
                        res.send(res_ok(200,'Document Update Fail',source));
                }
                else {
                    res.status(401).send(res_err(req, 401, '잘못된 Parameter 입니다. 파라미터를 확인해주세요.'));
                }
            }

        }
    }
    else if (actionFlag == 'i') {
        result = await insertIndexById(_index, _docType, _docId, _opType, fields, values);
        let success = result._shards.successful || 0;
        if(success > 0) {
            let search_reponse = searchIndexById(_index, _docType, _docId);
            if(search_reponse.hits != undefined)
                res.send(res_ok(200,'Document Update Success',source));
            else
                res.send(res_ok(200,'Document Update Fail',source));
        }
        else {
            res.status(401).send(res_err(req, 401, '잘못된 Parameter 입니다. 파라미터를 확인해주세요.'));
        }
    }
    else if (actionFlag == 'd') {
        result = await deleteIndexById(_index, _docId, _docType);
        if(result._shards.successful != undefined && result._shards.successful >= 1){
            res.send(res_ok(200,'Document Delete Success',result));
        }
        else{
            res.json(res_ok(401,'Document Delete Fail',result));
        }
    }



});
async function searchIndexById(_index, _docType, _docId){
    let search_query = {
        "query" : {
            "match" : {
                "_id" : _docId
            }
        }
    };
    return await esClient.search({
        index : _index,
        type  : _docType,
        body  : search_query
    });

};
module.exports = app;


















