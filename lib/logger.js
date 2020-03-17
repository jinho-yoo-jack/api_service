const rootpath = require('app-root-path');
const _path = require('path');
const _mkdirp = require('mkdirp');
const _moment = require('moment');
const _winston = require('winston'),
    _winston_daily_rotate_file = require('winston-daily-rotate-file');

const config = require(`${rootpath}` + '/config/config.js');

const cusLevels = {
    levels : {
        info : 0,
        error : 1
    },
    colors : {
        info : 'black',
        error : 'red'
    }
};

_winston.addColors(cusLevels.colors);

// Create winston.logger instance for wholesale reconfigure
let logger = _winston.createLogger({
    // levels 는 config 파일에서 선택
    levels : cusLevels.levels,
    // Transports Log
    transports: [
        // # Setting Format Console Log
        new (_winston.transports.Console)({
            name: 'console',
            level: config.LOG_MODE == 'develop' ? 'error': 'info',
            colorize: true,
            showLevel: true,
            json: false,
            timestamp: true,
            format: _winston.format.printf(
                info => `${_moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')} [${info.level.toUpperCase()}] - ${info.message}`
            )

        })
    ]
});



// Constructor Function
function hooks(args) {
    //console.log('hooks ::: ',args);
    //console.log('hooks instanceof ::: ', this instanceof hooks);
    if (!(this instanceof hooks)) {
        return new hooks(args);
    }

    // find
    let path = args.filename.split(_path.sep);
    console.log('path ::: %j', path);

    let index = path.findIndex(function (p) {
        return p === 'src' || p === 'plugins';
    });
    console.log('index ::: ', index);

    let clazz = '';
    while (index < path.length) {
        if (clazz.length > 0) {
            clazz += '/';
        }

        clazz = clazz + path[index++];

    }
    console.log(clazz);
    this.clazz = clazz;

    return this;
};


hooks.prototype.log = function (level ,msg, callback) {
    logger.log(level,'[' + this.clazz + ']' + msg, callback);
};

hooks.prototype.info = function (msg, callback) {
    logger.info('[' + this.clazz + ']' + msg, callback);
};

hooks.prototype.error = function (msg, callback) {
    logger.error('[' + this.clazz + ']' + msg, callback);
};

module.exports = hooks;


















