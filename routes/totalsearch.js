// #Load app Dependencies
const app = require('express')();
const rootpath = require('app-root-path');
const { check,
        checkSchema,
        validationResult
      } = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');
const res_ok = require(`${rootpath}` + '/lib/res_ok');
const res_err = require(`${rootpath}` + '/lib/res_err');
const today = moment().format('YYYYMMDD');

// #Load app Middleware
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.all('URL', check() ,() => {}
/* I/F ID : SEARCH-0001  */
app.all('/', [
        check('keyword')
            .not()
            .isEmpty()
            .withMessage('Keyword is required!!!')
    ],
    async (req, res) => {
        // Request Params Check Validation
        let errors = validationResult(req).array();
        console.log(errors);

        // Request Params
        let keyword = req.body.keyword || req.query.keyword,
            start = req.body.page || req.query.page || 0,
            size = req.body.size || req.query.size || 0,
            sort = req.body.sort || req.query.sort,
            order = req.body.order || req.query.order,
            category = req.body.category || req.query.category,
            device = req.body.device || req.query.device || 'pc',
            devicdId = [];

        start = start != 0 ? start - 1 : 1;

        if(device == 'pc')  deviceId = ['01','03','05','07'];
        else if(device == 'app')  deviceId = ['01','04','06','07'];
        else  deviceId = ['01','02','05','06'];

        let size_map = new Map();
        size_map.set('card', 3);
        size_map.set('menu', 3);
        size_map.set('financial', 3);
        size_map.set('faq', 3);
        size_map.set('event', 6);
        size_map.set('notice', 3);
        size_map.set('etccontent', 3);
        size_map.set('help', 3);

        let source_map = new Map();
        source_map.set('card',['']);
        source_map.set('menu',['menu_name','full_menu_name','menu_url']);
        source_map.set('financial',['artsubject','fin_info','fin_loan','fin_bond','url']);
        source_map.set('faq',['title','contents']);
        source_map.set('event',['mob_wb_evt_nm','hpg_evt_cag_ccd','mob_wb_evt_std','mob_wb_evt_edd']);
        source_map.set('notice',['sbjt_nm','fst_cot_url_ar']);
        source_map.set('ectcontent',['artsubject','fst_cot_url_ar','url']);
        source_map.set('help',['artsubject,url']);


        let arr_category = [];

        if(category == "all" || category == null || category == "")
            category = "menu^card^financial^faq^notice^help^etccontent";
        if(category != null)
            arr_category = category.split



    }
)
;

module.exports = app;


















