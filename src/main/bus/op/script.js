const bh = require('../bufferhelp');
const opcodes = require('./opcodes');


var opcode;
var value;
var verify;
var bytes_;
var OP_LITERAL = 0x1ff;
var _tokens = [];
var _expand_verify;
function Tokenizer(pk_script, expand_verify = false) {
    _expand_verify = expand_verify;

    this._script=_process(pk_script);
}

// 76b8230000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00b7ac
// OP_DUP OP_HASH512 0000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00 OP_HASHVERIFY OP_CHECKSIG
function _process(str_script) {
    var script = bh.hexStrToBuffer(str_script);
    while (script.length > 0) {
        // console.log('script:', script, script.slice(0, 1)); s
        opcode = ORD(script.slice(0, 1))
        bytes_ = script.slice(0, 1);
        script = script.slice(1);
        value = null;
        verify = false;

        if (opcode == opcodes.OP_0) {
            value = 0;
            opcode = OP_LITERAL;
        } else if (opcode >= 1 && opcode <= 78) {
            var length = opcode;
            if (opcode >= opcodes.OP_PUSHDATA1 && opcode <= opcodes.OP_PUSHDATA4) {
                var iTmp = opcode - opcodes.OP_PUSHDATA1;
                var op_length = [1, 2, 4][iTmp];
                //todo
            }
            var sTmp = script.slice(0, length);
            value = bh.bufToStr(sTmp);
            bytes_ = Buffer.concat([bytes_, sTmp]);
            script = script.slice(length)
            // if (value.length != length) {
            //     throw 'not enought script for literal';
            // }
            opcode = OP_LITERAL;
        } else if (opcode == OP_LITERAL) {
            opcode = OP_LITERAL;
            value = -1;
        } else if (opcode == opcodes.OP_TRUE) {
            opcode = OP_LITERAL;
            value = 1;
        } else if (opcode >= opcodes.OP_1 && opcode <= opcodes.OP_16) {
            opcode = OP_LITERAL;
            // value = 0;
        } else if (_expand_verify && opcode in _Verify) {
            opcode = _Verify[opcode];
            verify = true;
        }
        _tokens.push([opcode, bytes_, value]);
        if (verify) {
            _tokens.push(opcodes.OP_VERIFY, Buffer(0), null);
        }
    }
    // console.log('_tokens:', _tokens);
    var output = [];
    for (k1 in _tokens) {
        var t = _tokens[k1];
        if (t[0] == OP_LITERAL) {
            output.push(t[2]);
        } else {
            if (t[1]) {
                var s = opcodes.get_opcode_name(t[0]);
                output.push(s);
            }
        }
    }
    var s = '';
    for (var i = 0; i < output.length; i++) {
        if (i < output.length - 1) {
            s += output[i] + ' ';
        } else {
            s += output[i];
        }
    }
    return s;
}

var _Verify = {
    0x88: opcodes.OP_EQUAL,
    0x9d: opcodes.OP_NUMEQUAL,
    0xad: opcodes.OP_CHECKSIG,
    0xaf: opcodes.OP_CHECKMULTISIG
    // opcodes.OP_EQUALVERIFY: opcodes.OP_EQUAL,
    // opcodes.OP_NUMEQUALVERIFY: opcodes.OP_NUMEQUAL,
    // opcodes.OP_CHECKSIGVERIFY: opcodes.OP_CHECKSIG,
    // opcodes.OP_CHECKMULTISIGVERIFY: opcodes.OP_CHECKMULTISIG,
}

function ORD(ch) {
    return bh.bufToNumer(ch);
}
// var s = '76b8230000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00b7ac';
// var t = new Tokenizer(s)._script;
// console.log('t:',t);