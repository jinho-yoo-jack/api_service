//#Add node.js Module
const approot   = require('app-root-path');
const helper    = require(`${approot}` + '/common/helper.js');
const ua_parser = require('ua-parser-js');
const url       = require('url');
const geoip     = require('geoip-lite');

module.exports = {
    parse : (body) => {
        //parse user-agent
        let r = ua_parser(body.navigation.navigatoer.useragent.string);
        body.navigation.navigatoer.os.string = r.os.name + ' ' + r.os.version;
        body.navigation.navigatoer.os.name = r.os.name || '_unknown_';
        body.navigation.navigatoer.browser.string = r.browser.name + ' ' + r.browser.version;
        body.navigation.navigatoer.browser.name = r.browser.name || '_unknown_';
        body.navigation.navigatoer.device.type = r.device.type || 'pc';
        if(body.navigation.navigatoer.device.type == 'pc'){
            body.navigation.navigatoer.device.type = 'desktop';
        }

        //set IP addr and GEO IP
        let geo = geoip.lookup(body.navigation.geoip.ip);
        body.navigation.geoip.location = geo && (geo.ll[0]+', '+geo.ll[1]) || null;
        body.navigation.geoip.country = geo && geo.country || '';
        body.navigation.geoip.region = geo && geo.region || '';
        body.navigation.geoip.city = geo && geo.city || '';

        //parse labels
        let types = ['location', 'referer'];
        for(let type in types){
            type = types[type];

            let url_parts = url.parse(body.navigation[type].uri, true);
            if((url_parts.protocol === null) || (url_parts.host === null) || (url_parts.pathname === null))
                continue;

            body.navigation[type].url = url_parts.protocol + '//' + url_parts.host + url_parts.pathname;
        }

    }
};




























