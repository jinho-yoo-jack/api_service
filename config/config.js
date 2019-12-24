/**
 * Created by ibricks on 2017-10-11.
 */
var approot = require('app-root-path');

var path      = require("path");
var env       = process.env.ENV || "dev";
var config    = require(approot + '/config/config.json')[env];


/******************************************
 * 수행 환경
 ******************************************/
console.log("*************** config *****************");
// console.log("* env " + env);
// console.log("* DB host " + config.host);
console.log("****************************************");

module.exports = config;

