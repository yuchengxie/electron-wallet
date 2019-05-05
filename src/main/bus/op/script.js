const bh = require('../bufferhelp');
const opcodes = require('./opcodes');


var opcode;
var value;
var verify;
var bytes_;
var OP_LITERAL = 0x1ff;

function Tokenizer(pk_script, expand_verify = false) {
    this._expand_verify = expand_verify;
    this._tokens = [];
    _process(pk_script);
}

function _process(str_script) {
    var script = bh.hexStrToBuffer(str_script);
    while (script) {
        opcode = ORD(script.slice(0, 1))
        bytes_ = script.slice(1);
        value = null;
        verify = false;

        if (opcode == opcodes.OP_0) {
            value = 0;
            opcode = OP_LITERAL;
        } else if (opcode >= 1 && opcode <= 78) {
            var length = opcode;
            if (opcodes.OP_PUSHDATA1 <= opcode <= opcodes.OP_PUSHDATA4) {

            }
        } else if (opcode == opcodes.OP_LITERAL) {
            opcode = OP_LITERAL;
            value = -1;
        } else if (opcode == opcodes.OP_TRUE) {
            opcode = OP_LITERAL;
            value = 1;
        } else if (opcode >= opcodes.OP_1 && opcodes.OP_16) {
            opcode = OP_LITERAL;
            // value = 0;
        } else if (this.expand_verify && opcode in _Verify) {
            opcode = _Verify[opcode];
            verify = true;
        }

        this._tokens.push((opcode, bytes_, value));
        if (verify) {
            this._tokens.push(opcodes.OP_VERIFY, Buffer(0), null);
        }
    }
}

var _Verify = {
    // opcodes.OP_EQUALVERIFY: opcodes.OP_EQUAL,
    // opcodes.OP_NUMEQUALVERIFY: opcodes.OP_NUMEQUAL,
    // opcodes.OP_CHECKSIGVERIFY: opcodes.OP_CHECKSIG,
    // opcodes.OP_CHECKMULTISIGVERIFY: opcodes.OP_CHECKMULTISIG,
}

function ORD(ch) {
    return bh.bufToNumer(ch);
}

var s = '76b8230000e5c7b20d5b5037f86e9861cd8795be42e8093c61bd36256a2b5a22df6508a8ba00b7ac';
_process(s);