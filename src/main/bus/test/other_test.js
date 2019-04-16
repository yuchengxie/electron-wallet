function global_binary_func(msg, buf, prot, arrayLen) {

    if (prot == undefined) {
        prot = this.__proto__;
    }

    // if (typeof arrayLen == 'number') {
    //     var bRet = [];
    //     for (var i = 0; i < arrayLen; i++) {
    //         var tmp = global_parse_func(buf, offset, prot);
    //         offset = tmp[0];
    //         bRet.push(tmp[1]);
    //     }
    //     return [offset, bRet];
    // }
    if (typeof arrayLen == 'number') {
        for (var i = 0; i < arrayLen; i++) {
            var m = msg[i];
            var ret = global_binary_func(m, buf, prot);
            buf = Buffer.concat([buf, ret]);
        }
        return buf;
    }
    // if (typeof arrayLen == 'number') {
    //     if (prot.getFmt != undefined) {
    //         fmt = prot.getFmt();
    //         for (var i = 0; i < arrayLen; i++) {
    //             var m = msg[i];
    //             for (var j = 0; j < fmt.length; j++) {
    //                 fmt2 = fmt[j];
    //                 var attrName = fmt2[0];
    //                 var attrType = fmt2[1];
    //                 var v = m[attrName];
    //                 var ret = global_binary_func(v, buf, attrType);
    //                 buf = Buffer.concat([buf, ret]);
    //             }
    //         }
    //     } else {
    //         fmt = prot;
    //         for (var i = 0; i < arrayLen; i++) {
    //             var m = msg[i];
    //             var fmt2 = fmt.split('[')[0];
    //             var ret = global_binary_func(m, buf, fmt2);
    //             buf = Buffer.concat([buf, ret]);
    //         }
    //     }

    //     return buf;
    // }

    var fmt;
    if (typeof (prot) == 'string') {
        fmt = prot;
    } else {
        if (prot.getFmt == undefined) {
            fmt = gFormat['S'];
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
                        ret = global_binary_func(msg, buf, 'S');
                        buf = Buffer.concat([buf, ret]);
                    }
                } else if (arrayLen.split('_')[0].includes('arr')) {
                    var v = arrayLen.split('_')[1];
                    return global_binary_func(v, buf, 'V');
                }
            } else { //fixed length arr/str
                var b = fmt.split('[');
                if (b[0] == 'VS') { //str
                    var len = msg.length;
                    //str - length
                    var retv = global_binary_func(len, buf, 'V');
                    //str - content
                    var rets = global_binary_func(msg, buf, 'S')
                    return Buffer.concat([retv, rets]);
                } else { //arr

                }
            }
        } else {
            //standard
            if (fmt == 'I') {
                return toBufLE(msg, false, 4);
            }
            if (fmt == 'V') {
                // var len = msg.length;
                return toBuf(msg, false, 1);
            }
            if (fmt == 'S') {
                return new Buffer(msg);
            }
            if (fmt == 'q') {
                return toBufLE(msg, false, 8);
            }
            if (fmt == 'H') {
                return toBufLE(msg, false, 2);
            }
        }
    } else if (isArray(fmt)) {
        var subObj = new bindMsg(prot);
        for (var i = 0, item; item = fmt[i]; i++) {
            var attrName = item[0], attrType = item[1];
            var v = msg[attrName];
            if (attrName == 'sig_raw') {
                var a = 1;
            }
            if (isArray(v)) {
                var ret = global_binary_func.apply(subObj, [v, buf, attrType, 'arr_' + v.length]);//返回[buf];
                buf = Buffer.concat([buf, ret]);
                var fmt2 = gFormat[attrName];
                if (fmt2 == undefined) {
                    buf = global_binary_func.apply(subObj, [v, buf, attrType, v.length]);
                } else {
                    buf = global_binary_func.apply(subObj, [v, buf, fmt2, v.length]);
                }

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
    return buf;
}


function toBufLE(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex).reverse();
    if (b1.length > len) throw 'toBufLE out of range';
    for (var i = 0; i < b1.length; i++) {
        b0[i] = b1[i];
    }
    return b0;
}

function toBuf(num, isHex, len) {
    var b0 = new Buffer(len);
    var b1 = numToBuf(num, isHex);
    for (var i = 0; i < b1.length; i++) {
        b0[i] = b1[i];
    }
    return b0;
}


