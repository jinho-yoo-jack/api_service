// #Load app Dependencies
const app = require('express')();
const rootpath = require('app-root-path');
const { check,
        checkSchema,
        validationResult} = require('express-validator');
const bodyParser = require('body-parser');
const moment = require('moment');

const res_ok = require(`${rootpath}` + '/lib/res_ok');
const res_err = require(`${rootpath}` + '/lib/res_err');

const today = moment().format('YYYYMMDD');

// #Load app Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
            start = req.body.page || req.query.page,
            size = req.body.size || req.query.size,
            sort = req.body.sort || req.query.sort,
            order = req.body.order || req.query.order,
            category = req.body.category || req.query.category;

        size = size != null ? size - 1 : 1;

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
        source_map.set('menu',[''])

    }
)
;

module.exports = app;


















