
function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
}

var txns = {
    getFmt: function () {
        return 'txn[]';
    }
}


var txn = {
    getFmt: function () {
        return [
            ['value', 'I'],
            ['pk_script', str(2)]
        ];
    }
}

var varstr = {
    getFmt: function () {
        return 'VS[]';
    }
}

var str = (n) => {
    return 'S[' + n + ']';
}

var test1 = {
    getFmt: function () {
        return [
            ['txns', 'txn[]'],
            ['version', str(2)]
        ];
    }
}

var found = {
    getFmt: function () {
        return [
            ['uock', 'q'],
            ['value', 'q'],
            ['height', 'I'],
        ]
    }
}

var founds = {
    getFmt: function () {
        return 'found[]';
    }
}

var info = {
    getFmt: function () {
        return [
            ['link_no', 'I'],
            ['timestamp', 'I'],
            ['account', varstr],
            ['search', 'I'],
            ['found', founds],
        ];
    }
}

var gFormat = {
    'I': null,
    'txns': txns,
    'txn': txn,
    'VS': varstr,
    'S': str(3),
    'test1': test1,

    'found': found,
    'founds': founds,
    'info': info,
}

function bindMsg(prot) {
    function Msg() {
        this.parse = global_parse_func;
        this.binary = global_binary_func;
    }
    Msg.prototype = prot;
    var obj = new Msg();
    return obj;
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
    console.log('binary buf:',buf,buf.length);
    return buf;
}

//binary测试
// 00 00 00 00 5f b8 ac 5c 36 31 31 31 38 4d 69 35 58 78 71 6d 71 54 42 70 37 54 6e 50 51 64 31 48 6b 
// 39 58 59 61 67 4a 51 70 44 63 5a 75 36 45 69 47 45 ...
var m = {
    link_no: 1,
    timestamp: 1554798165,
    account: '1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV',
    search: 1024,
    found: [
        {
            uock: 111,
            value: 222,
            height: 333
        }
    ]
}
console.log(m);
var buf = new Buffer(0);
msg = new bindMsg(gFormat.info);
var b = msg.binary(m, buf);
// msg = new bindMsg(gFormat.info);
// var b = msg.parse(payload, 0);
// console.log('b:', b);


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
        len = parseInt(arrayLen.split('_')[1]);
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



// console.log('b:', b);
// var msg = {
//     link_no: 0,
//     timestamp: 1554798165,
//     account: '1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV',
//     search: 1024,
//     found: {
//         uock: 111,
//         value: 222,
//         height: 333,
//     }
// }

//parse测试
// var testBuf = Buffer('\x02\x11\x00\x00\x00\x11\x00\x00\x00');
// var testBuf = Buffer.from('02020101010101010100102a040201030502030203aa0d01001020304050607070201000000001010101020202', 'hex');
// console.log(testBuf, testBuf.length);
//测试数组
// var msg = new bindMsg(gFormat.txns)
// console.log(msg);
// var b = msg.parse(testBuf, 0);
// console.log(b);
//测试固定长度字符串
// var msg = new bindMsg(gFormat.S);
// var b = msg.parse(testBuf, 0);
// console.log(msg);
// console.log(b);
//测试变长字符串
// var msg = new bindMsg(gFormat.S);
// var b = msg.parse(testBuf, 0);
// console.log(b);
//测试一个对象
// msg = new bindMsg(gFormat.test1);
// var b = msg.parse(testBuf, 0);
// console.log('b:', b);
//测试info

// var dhttp = require('dhttp');
// var URL = 'http://raw0.nb-chain.net/txn/state/account?addr=1118Mi5XxqmqTBp7TnPQd1Hk9XYagJQpDcZu6EiGE1VbXHAw9iZGPV&uock=0&uock2=0';
// dhttp({
//     method: 'GET',
//     url: URL,
// }, function (err, res) {
//     if (err) throw err;
//     buf = res.body;
//     //测试info
//     payload = buf.slice(24);
//     console.log('payload:', payload, payload.length);
//     msg = new bindMsg(gFormat.info);
//     var b = msg.parse(payload, 0);
//     console.log('b:', b);
// })
