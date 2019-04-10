const gFormat=require('./format')
const sha256 = require('js-sha256');

const magic = Buffer.from([0xf9, 0x6e, 0x62, 0x74]);

function bindMsg(prot) {
    function Msg() {
        this.parse = global_parse_func;
        this.binary = global_binary_func;
    }
    Msg.prototype = prot;
    var obj = new Msg();
    return obj;
}

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}

function global_binary_func(msg, buf, prot, arrayLen) {
    if (prot == undefined) {
        prot = this.__proto__;
    }
    if (typeof arrayLen == 'number') {
        if (prot.getFmt != undefined) {
            fmt = prot.getFmt();
            for (var i = 0; i < arrayLen; i++) {
                m = msg[i];
                for (var j = 0; j < fmt.length; j++) {
                    fmt2 = fmt[j];
                    attrName = fmt2[0];
                    attrType = fmt2[1];
                    v = m[attrName];
                    ret = global_binary_func(v, buf, attrType);
                    buf = Buffer.concat([buf, ret]);
                }
            }
            return buf;
        }
    }

    var fmt;
    if (typeof (prot) == 'string') {
        fmt = prot;
    } else {
        if (prot.getFmt == undefined) {
            fmt = gFormat('S');
        } else {
            fmt = prot.getFmt();
        }
    }

    if (typeof (fmt) == 'string') {
        if (fmt[fmt.length - 1] == ']') {
            if (fmt[fmt.length - 2] == '[' && typeof (arrayLen) == 'string') {//var length arr/str
                var ft = fmt.slice(0, fmt.length - 2);
                if (arrayLen.split('_')[0].includes('str')) {
                    var ret = global_binary_func(msg, buf, 'V')//ret value map buf
                    buf = Buffer.concat([buf, ret]);
                    if (ft == 'VS') {// var-len-str
                        return global_binary_func(msg, buf, 'S');
                    }
                } else if (arrayLen.split('_')[0].includes('arr')) {
                    var v = arrayLen.split('_')[1];
                    return global_binary_func(v, buf, 'V');
                }
            } else { //fixed length arr/str
                var b = fmt.split('[');
                if (b[0] == 'S') { //str
                } else { //arr
                }
            }
        } else {
            //standard
            if (fmt == 'I') {
                return toBufEndian(msg, false, 4);
            }
            if (fmt == 'V') {
                var len = msg.length;
                return toBufEndian(len, false, 1);
            }
            if (fmt == 'S') {
                var b1 = new Buffer(msg);
                var b2 = Buffer.concat([buf, b1]);
                return b2;
            }
            if (fmt == 'q') {
                return toBufEndian(msg, false, 8);
            }
        }
    } else if (isArray(fmt)) {
        var subObj = new bindMsg(prot);
        for (var i = 0, item; item = fmt[i]; i++) {
            var attrName = item[0], attrType = item[1];
            var v = msg[attrName];
            if (isArray(v)) {
                var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'arr_' + v.length]);//返回[buf];
                buf = Buffer.concat([buf, ret]);
                var f = gFormat[attrName];
                buf = global_binary_func.apply(subObj, [v, buf, f, v.length]);
            } else {
                // v = msg[attrName];
                if (typeof (v) == 'string') {
                    var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'str_' + v.length]);//返回[buf];
                    buf = ret;
                } else {
                    var ret = global_binary_func.apply(subObj, [v, buf, attrType]);//返回[buf];
                    buf = Buffer.concat([buf, ret]);
                }
            }
        }
    }
    console.log('binary buf:', buf, buf.length);
    return buf;
}



function global_parse_func(buf, offset, prot, arrayLen) {//return [offset,value]

    if (prot == undefined) {
        prot = this.__proto__;
    }

    if (typeof arrayLen == 'number') {
        var bRet = [];
        for (var i = 0; i < arrayLen; i++) {
            var tmp = global_parse_func(buf, offset, prot);
            offset = tmp[0];
            bRet.push(tmp[1]); 
        }
        return [offset, bRet];
    }

    var fmt;

    if (typeof (prot) === 'string') {
        fmt = prot;
    } else {
        if (prot.getFmt == undefined) {
            fmt = gFormat['S'];//specical
        } else { // array
            fmt = prot.getFmt();
        }
    }

    // if fmt is string or prot is array
    if (typeof (fmt) === 'string') {
        if (fmt[fmt.length - 1] == ']') {
            if (fmt[fmt.length - 2] == '[') {// 'fmt_name[]' means var-len-array
                var ft = fmt.slice(0, fmt.length - 2);
                var fmt2 = gFormat[fmt.slice(0, fmt.length - 2)];
                var ret = global_parse_func(buf, offset, 'V');// ret = [new_offset,result]
                var subArrayLen = ret[1];
                offset = ret[0];
                if (ft == 'VS') {// var-len-str
                    return global_parse_func(buf, offset, 'S', 'strlen_' + subArrayLen);
                } else {
                    return global_parse_func(buf, offset, fmt2, subArrayLen);
                }
            }
            else {// 'fmt_name[n]' means fix length array
                var b = fmt.split('[');
                if (b[0] == 'S') {// fix length str
                    strlen = parseInt(b[1].split(']')[0]);
                    return global_parse_func(buf, offset, 'S', 'strlen_' + strlen);
                } else {
                    var subArrayLen = parseInt(b[1].split(']')[0]);
                    var fmt2 = gFormat[b[0]];
                    return global_parse_func(buf, offset, fmt2, subArrayLen);
                }
            }
        }
        else {
            return standard(buf, fmt, offset, arrayLen);
        }
    } else if (isArray(fmt)) {
        var subObj = new bindMsg(prot);
        for (var i = 0, item; item = fmt[i]; i++) {
            var attrName = item[0], attrType = item[1];
            var ret = global_parse_func.apply(subObj, [buf, offset, attrType]);
            offset = ret[0];
            subObj[attrName] = ret[1];
        }
        return [offset, subObj];
    }
}

function standard(buf, fmt, offset, arrayLen) {//standard format
    if (fmt == 'V') {
        return [offset + 1, bufToNumer(buf.slice(offset, offset + 1))];
    }
    if (fmt == 'I') {
        return [offset + 4, bufToNumer(buf.slice(offset, offset + 4).reverse())];
    }
    if (fmt == 'q') {
        return [offset + 8, bufToNumer(buf.slice(offset, offset + 8).reverse())];
    }
    if (fmt == 'S') {   //fixed-len-str
        var len = parseInt(arrayLen.split('_')[1]);
        return [offset + len, (buf.slice(offset, offset + len)).toString('latin1')];
    }
}

function bufToNumer(buf) {
    var t = 0;
    for (var i = 0; i < buf.length; i++) {
        t += parseInt(buf[i], 10) * Math.pow(256, buf.length - i - 1);
    }
    return t;
}
function numToBuf(num, isHex) {
    isHex == undefined ? false : isHex;
    var s = '';
    if (!isHex) {
        s = num.toString(16);
    }
    if ((s.length) % 2 != 0) {
        s = '0' + s;
    }
    return new Buffer.from(s, 'hex');
}

function toBufEndian(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex);
    for (var i = 0; i < b1.length; i++) {
        b0[i] = b1[i];
    }
    return b0;
}

function toBuffer(hex) {
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    }))
    var buffer = typedArray.buffer
    buffer = Buffer.from(buffer);
    return buffer;
}

function strip(buf) {
    var arr = [];
    for (var i = 0; i < buf.length; i++) {
        arr.push(buf[i]);
    }
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == 0x00) {
            arr.splice(i, 1);
        } else {
            break;
        }
    }
    return Buffer.from(arr);
}

function g_parse(data) {
    if (data.slice(0, 4).equals(magic) != 1) {
        throw Error('bad magic number');
    }
    var buf = data.slice(16, 20);
    var value = bufToNumer(buf);
    var buf = Buffer.allocUnsafe(4);
    buf.writeUInt32LE(value, 0);
    var v2 = bufToNumer(buf);
    var payload = data.slice(24, 24 + v2);
    //check the checksum
    var checksum = toBuffer(sha256(toBuffer(sha256(payload)))).slice(0, 4);
    if (data.slice(20, 24).compare(checksum) != 0) {
        throw Error('bad checksum');
    }
    var command = data.slice(4, 16);
    var stripCommand = strip(command);
    var msg_type = stripCommand.toString('latin1');
    console.log('> msg_type:', msg_type, msg_type.length);
    return payload;
}


function parseInfo(payload) {
    console.log('payload:', payload, payload.length);
    var msg = new bindMsg(gFormat.info);
    return msg.parse(payload, 0);
}

function parseUtxo(payload) {
    console.log('payload:', payload, payload.length);
    var msg = new bindMsg(gFormat.utxo);
    return msg.parse(payload, 0);
}

module.exports = {
    bindMsg,g_parse, parseInfo, parseUtxo
}