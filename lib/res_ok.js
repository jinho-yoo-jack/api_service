module.exports = function(req, body, elapsed) {
    elapsed = (elapsed !== undefined) ?  elapsed : {};
    if( req === undefined );
    else {
        // control
    }
    var ret = { "code": "0", "message": "OK"};

    if(body.message && body.message.result) body.message.result["status"] = ret;
//    for(var key in body) ret[key] = body[key];
//    return ret;
    return body;
};
