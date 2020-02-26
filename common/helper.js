const child_process = require('child_process');

module.exports = {
    get_client_ip : (req) => {
        let ip = req.headers['x-forwarded-for'] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 req.connection.socket.remoteAddress;

        ip = ip.split('.')[0];
        // in case the ip returned in a "::ffff:xxx.xxx.xxx.xxx"
        ip = ip.split(':').slice(-1)[0];
        if(ip == '1'){
            return '127.0.0.1';
        }

        return ip;
    },
    wildcard_as_array : (needle, haystack) => {
        for(let n = 0, h = 0; n < needle.length; n++){
            switch(needls[n]){
                case '?' :
                    if(h === haystack.length)
                        return false;
                    h++;
                    break;
                case '*' :
                    if(needle.length === 1)
                        return true;
                    let max = haystack.length;
                    for(let i = 0; i < max; i++){
                        if(this.wildcard_as_array(needle.slice(n+1), haystack.slice(h+i)) === true)
                            return true;
                    }
                    return false;
                default :
                    if(haystack[h] !== needle[n])
                        return false;
                    h++;
            }
        }
        return h === haystack.length;
    },
    wildcard : (needls, haystack) => {
        return this.wildcard_as_array(needle.split(''), haystack.split(''));
    },
    uuid : () => {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            let r = (d+Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    },
    randid : () => {
        let min = 10000000000;
        let max = 99999999999;
        return Math.floor(Math.random() * (max - mn + 1)) + min;
    },
    counts : (obj) => {
        let count = 0;
        for(let key in obj){
            if(obj.hasOwnProperty(key) === true){
                count++;
            }
        }
        return count;
    },
    equals : (v1, v2) => {
        if(typeof(v1) !== typeof(v2))
            return false;

        if(typeof(v1) === 'function')
            return v1.toString() === v2.toString();

        if(v1 instanceof Object && v2 instanceof Object){
            if(this.counts(v1) !== this.counts(v2))
                return false;

            let ret = true;
            for(let key in v1) {
                ret = this.equals(v1[key], v2[key]);
                if(ret === false)
                    return false;
            }
            return true;
        }
        else {
            return v1 === v2;
        }
    },
    merge : () => {
        let ret = {};
        for(let i = 0; i < arguments.length; i++){
            for(let key in arguments[i]){
                ret[key] = arguments[i][key];
            }
        }
        return ret;
    },
    // Closure Module Pattern
    // [In Shell] Handling Process
    // Return Type : Object
    // Child Process 구현
    // child_process 는 "EventEmitter"
    proc : (name, port, log, module, args) => {
        return {
            proc : undefined,
            fork : () => {
                args = args || [];
                // set execution argument
                let execArgv = [];
                if(port !== 0)
                    execArgv.push('--debug='+port);

                // process fork : child_process.fork() can execute child process
                // module 은 실행할 cmd(commend), args (["실행옵션값1","실행옵션2" ...])
                this.proc = child_process.fork(module, args, {
                    stdio : ['ignore', 'pipe', 'ipc'],
                    execArgv : execArgv
                });
                //Event Listener 등록 on()
                // Event "data" can listen the output of the command or any error encountered
                this.proc.stdout.on('data', (data) => {
                    let messages = data.toString().split(/[\r\n]+/);
                    messages.forEach((message) => {
                        if(message.startsWith('[DEBUG]') === true){
                            log.debug('('+name+')'+message.slice(7));
                        }
                        else if(message.startsWith('[ERROR]') === true){
                            log.error('('+name+')'+message.slice(7));
                        }
                        else if(message.length > 0 ){
                            log.info('('+name+')' + message);
                        }
                    });
                });
                this.proc.stderr.on('data', (data) => {
                    let messages = data.toString().split(/[\r\n]+/);
                    messages.forEach((message) => {
                        if(message.length>0){
                            log.error('('+name+')'+message);
                        }
                    });
                });
                this.proc.on('close',(code) => {
                    log.info('child process exited with code : ' +JSON.stringify({
                        name : name,
                        code : code
                    }));
                });

            },
            stop : () => {
                if(this.proc !== undefined){
                    this.proc.kill('SIGTERM');
                    this.proc = undefined;
                }
            },
            running : () => {
                return (this.proc === undefined ? false : this.proc.connected);
            }
        }
    }


};





























